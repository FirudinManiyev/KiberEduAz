# Room: SQL Injection

**Path:** Web Application Hacking
**Module:** OWASP Top 10
**Çətinlik:** Easy
**Təxmini vaxt:** 2 saat

## Room haqqında

SQL Injection (SQLi) — web tətbiqlərinin ən köhnə və ən dağıdıcı zəifliklərindən biridir: istifadəçi input-u SQL sorğusunun içinə birbaşa qatıldıqda, attacker sorğunun məntiqini dəyişə bilir. Bu room-da SQLi-nin işləmə mexanizmini, in-band/blind/union-based növlərini, sadə zəif koddakı nümunələri və parametrized query həll yolunu öyrənəcəksiniz.

## Öyrənmə nəticələri

- SQLi-nin yaranma səbəbini (string concatenation) kod səviyyəsində izah etmək
- In-band (error/union-based), blind və time-based SQLi növlərini ayırd etmək
- Sadə input manipulyasiyası ilə sorğu məntiqinin necə dəyişdiyini izləmək
- Parametrized query (prepared statement) niyə təməl həll yolu olduğunu izah etmək

## Task 1 — SQLi Necə Yaranır: String Concatation Xəstəliyi

Təsəvvür edin: login formu var, backend PHP-də belə kod yazılıb:

```php
$query = "SELECT * FROM users WHERE username='" . $_POST['user'] . "' AND password='" . $_POST['pass'] . "'";
```

Normal istifadəçi `ali` / `sifre123` göndərirsə, yaranan SQL:

```sql
SELECT * FROM users WHERE username='ali' AND password='sifre123'
```

Heç bir problem yoxdur. Amma attacker `admin'--` göndərirsə:

```sql
SELECT * FROM users WHERE username='admin'--' AND password='...'
```

`--` SQL-də comment-dir — sətrin qalan hissəsi işlənmir. **Parol yoxlaması tamamilə yoxa çıxdı.** Sorğu "admin istifadəçisi varmı?" sorğusuna çevrildi. Nəticə cavabı boş deyilsə, login keçir — parol bilinmədən.

Burada problem nədir? İstifadəçi input-u **string concatenation** (sətir birləşdirmə) ilə SQL-in içinə düzəldilir. Input isə hər şey ola bilər: tək dırnaq, `--`, `OR`, `UNION` — SQL-in öz sintaksisi. Nəticədə istifadəçi data kimi yox, **kod kimi** icra olunur.

SQLi-nin əsas "kərpici" olan bir neçə konstruksiya:

- `'` — string-i bağlayır (sintaksis xətası → error-based aşkarlama)
- `OR 1=1` — həmişə true olan şərt (auth bypass, bütün record-ları çəkmə)
- `--` və ya `#` — qalan hissəni comment-ləşdirir
- `;` — bəzi mühitlərdə ikinci sorğu (stacked query)
- `UNION SELECT` — başqa sorğunun nəticəsini əlavə edir

Test üçün ənənəvi ilk addım — tək dırnaq göndərmək: `ali'`. Səhifədə SQL error görünsə (`MySQL syntax error...`), backend-in input-u sorğuya birbaşa qatdığı deməkdir. Error-un özü də məlumat verir: DB növü (MySQL/PostgreSQL/MSSQL), bəzən sorğunun bir hissəsi.

Niyə bu qədər ciddidir? Çünki DB — tətbiqin "xəzinəsidir": istifadəçi cədvəlləri (parol hash-ləri), kredit kartları, şəxsi məlumatlar. SQLi ilə attacker bu cədvəlləri oxuya, bəzi hallarda fayl yazmaqla RCE-yə qədər gedə bilər. OWASP Top 10-da illərdir ilk onluqdadır — köhnə olsa da, kiçik tətbiqlərdə hələ də çox yayğındır.

**Sual 1**
Vulnerable koddakı əsas xəta nədir — izah edin.

**Sual 2**
`admin'--` input-unun login sorğusuna təsirini izah edin.

**Sual 3**
SQLi testində ilk sınaq kimi tək dırnaq (`'`) göndərilməsi nəyi göstərir?

## Task 2 — In-Band SQLi: Error-Based və UNION-Based

**In-band** — eyni kanaldan həm hücum edilir, həm nəticə alınır (ən rahat növ). İki alt növü var.

**Error-based SQLi:** DB-nin xəta mesajlarından məlumat daşıyıcı kimi istifadə olunur. Məqsəd xətanı qəsdən yaradıb cavabında data görməkdir. Məsələn MySQL-də:

```
' AND EXTRACTVALUE(1, CONCAT(0x7e, (SELECT database()))) --
```

Xəta mesajında `XPATH syntax error: '~shopdb'` kimi sətir görünür — cari database adı `shopdb`-dir. Beləliklə, xəta "nəqliyyat vasitəsi"nə çevrilir.

**UNION-based SQLi:** ən güclü in-band texnika. `UNION` operatoru iki SELECT-in nəticəsini birləşdirir — yəni öz sorğunuzu original sorğunun nəticəsinə "qoşursunuz" və səhifədə görünür.

Addım-addım klassik axın (məhsul axtarış səhifəsində `?id=1` parametri təsəvvür edin):

1. **Sütun sayını tapmaq** — `ORDER BY` ilə: `?id=1 ORDER BY 1--`, `?id=1 ORDER BY 2--`... hər artırmada səhifə işləyir, bir nöqtədə xəta verir. Xəta `ORDER BY 4`-də baş verirsə — 3 sütun var.
2. **UNION-ı qurmaq:** `?id=1 UNION SELECT 1,2,3--`. Səhifədə hansı sütunların göstərildiyi görünür (məs. 2-ci və 3-cü yerlərə data çəkilə bilir).
3. **DB məlumatı çəkmək:** `?id=1 UNION SELECT 1,database(),version()--` → cari DB adı və versiya.
4. **Cədvəlləri tapmaq:** information_schema-dan: `UNION SELECT 1,table_name,3 FROM information_schema.tables WHERE table_schema='shopdb'--`.
5. **Data çıxarmaq:** `UNION SELECT 1,username,password FROM users--`.

Bu axın əl ilə uzun olsa da, məntiqi bərkdir: hər addımda DB haqqında bir az daha çox məlumat. Alətlər (sqlmap) bu prosesi avtomatlaşdırır — amma əl ilə başa düşmək lazımdır, çünki alət yalnız "harada zəiflik var"ı biləndən sonra işləyir.

Mühüm məhdudiyyət: UNION-based yalnız original sorğunun nəticəsi səhifədə göstəriləndə işləyir. Nəticə görünmürsə (sadə exists yoxlaması kimi) — blind SQLi ərazisinə keçirik.

**Sual 1**
In-band SQLi nə deməkdir?

**Sual 2**
UNION-based SQLi-də ORDER BY ilə sütun sayını tapmaq necə işləyir?

**Sual 3**
UNION-based texnikanın hansı şəraitdə işləməyəcəyini izah edin.

## Task 3 — Blind və Time-Based SQLi: Görünməyən Cavablar

**Blind SQLi** — zəiflik var, amma data birbaşa səhifəyə çıxmır. Yalnız "bəli/xeyr" mümkündür: sorğunun nəticəsinə görə səhifə fərqli davranır (məhsul göstərilir/göstərilmir, redirect/var-yox).

Klassik nümunə — boolean-based blind:

```
?id=1 AND 1=1--   → səhifə normal
?id=1 AND 1=2--   → səhifə fərqli (məhsul yoxdur)
```

Fərq varsa — input SQL-də icra olunur deməkdir. İndi suallar ikili (bəli/xeyr) formatda verilir:

```
?id=1 AND (SELECT SUBSTRING(username,1,1) FROM users LIMIT 1)='a'--
```

İstifadəçi adının birinci hərfi 'a'-dırmı? Səhifə "bəli" deyirsə — hərf tapıldı. Sonra ikinci hərf, üçüncü... Hər hərf ayrıca sorğu. Əl ilə dəhşətli, avtomatlaşdırılmış alətlə (sqlmap) real vaxtda mümkün.

**Time-based blind** — ən ağır hal: səhifədə heç bir vizual fərq yoxdur. Yeganə kanal — **zaman**:

```
?id=1 AND IF(1=1, SLEEP(5), 0)--
```

Şərt true-dursa cavab 5 saniyə gecikir, false-dursa dərhal. Cavab vaxtını ölçməklə yenə bəli/xeyr kanalı qurulur. Bu texnika həmçinin zəifliyin mövcudluğunu sübut etmək üçün də istifadə olunur (sleep effekti — icranın sübutu).

Blind SQLi-dən əsas dərs: **"data görsənmir" ≠ "təhlükəsizdir"**. Zəiflik sadəcə istismar metodunu dəyişir, təsirini yox.

Bir əlaqəli anlayış — **second-order SQLi**: input bazaya "təmiz" yazılır, amma sonradan başqa yerdə (məs. profil səhifəsində istifadəçi adı sorğuya qatılaraq) oxunarkən zəhərli olur. Bu, input-un yalnız "gəldiyi yerdə" yox, "istifadə olunduğu hər yerdə" təhlükə olduğunu göstərir.

Blind istismarın praktik dəyəri haqqında realist qeyd: karakterlər üzrə bəli/xeyr sorğuları minlərlə request deməkdir — bu, log-larda görünür və WAF-lar tərəfindən tutula bilər. Amma müdafiəçilər üçün dərk edilməli həqiqət: blind olsa da, data (parol hash-ləri daxil) tamamilə çıxarıla bilər.

**Sual 1**
Blind SQLi adi SQLi-dən nə ilə fərqlənir?

**Sual 2**
Boolean-based blind SQLi ilə istifadəçi adının birinci hərfi necə tapılır?

**Sual 3**
Time-based SQLi nə vaxt lazım olur və niyə?

## Task 4 — Müdafiə: Parametrized Query Niyə Təməl Həlldir

SQLi-nin təməl həlli — **parametrized query** (prepared statement). Fərq məntiqdədir: input SQL mətninə heç vaxt qatılmır.

Zəif üsul (concatenation):

```python
query = "SELECT * FROM users WHERE username='" + user + "' AND password='" + pw + "'"
```

Təhlükəsiz üsul (parametrlər):

```python
cursor.execute("SELECT * FROM users WHERE username=%s AND password=%s", (user, pw))
```

Nə baş verir? SQL strukturu və data **ayrı-ayrı** gedir. Əvvəlcə sorğu "skeleti" DB-yə parse olunur və tərtib edilir (compile), sonra parametrlər yalnız **data kimi** bağlanır (bind). Nəticədə `' OR 1=1--` göndərilsə belə, bu, sadəcə "username sahəsinin dəyəri" kimi müqayisə olunur — heç vaxt kod kimi icra olunmur. SQL-injection sintaksisdən asılıdır; parametrləmə isə sintaksisə girişi bağlayır.

Bu hər dildə eyni konseptlə mövcuddur: PHP PDO (prepared statements), Java PreparedStatement, C# SqlCommand parameters, Node.js parameterized queries. ORM-lər (Django ORM, Hibernate) da default olaraq parametrlənmiş sorğu yaradır — amma ORM içərisinə raw SQL yazılanda zəiflik qayıda bilər.

Niyə "filtrasiya" kifayət etmir? Qara siyahı (blacklist) yanaşması — `'`, `OR`, `UNION` sözlərini silmək — tarixən müvəqqəti həll olub:

- bypass üsulları sonsuzdur: böyük/kiçik hərf (`oR`), encoding (`%27`, URL/unicode), comment-lərlə parçalama (`UN/**/ION`), alternativ sintaksis.
- Filter özü funksionallığı pozur: adı `O'Riley` olan istifadəçi login ola bilmir.
- DB-lərin fərqli dialektləri var — universal qara siyahı mövcud deyil.

Digər müdafiə təbəqələri (əlavə, amma əsas yox):

- **Least privilege DB user:** tətbiqin DB istifadəçisi yalnız lazımi cədvəllərə/əməliyyatlara icazəli olmalıdır (root ilə qoşulmaq qadağan). SQLi olsa belə, `DROP` və ya fayl yazma (`INTO OUTFILE`) icazəsi olmur.
- **WAF:** ümumi pattern-ləri tutur, amma bypass oluna bilər — son müdafiə xətti kimi.
- **Error handling:** DB xəta mesajlarının istifadəçiyə göstərilməməsi (error-based-i çətinləşdirir, amma blind-i dayandırmır).
- **Output encoding:** olmasa da, bu zəifliyin əsas qəddarcasına müdafiəsi kifayət edir.

Yekun formula: **input validation (məntiq üçün) + parameterized query (SQL üçün) + least privilege (ziyanı azaltmaq üçün).** Amma parameterized query olmayan heç bir digər tədbir zəifliyi aradan qaldırmır.

**Sual 1**
Parametrized query SQLi-ni niyə tam kəsir — mexanizmini izah edin.

**Sual 2**
Blacklist filtrasiyası nə üçün etibarsız həlldir (iki səbəb)?

**Sual 3**
Least privilege DB user SQLi baş verdikdə nəyi azaldır?

## Task 5 — Alətlər və Etik İstismar Praktikası

Real pentest-də əl ilə hər şey etmək mümkün deyil — amma alətlər də əl biliyi olmadan işləmir. İki alət xüsusilə vacibdir.

**sqlmap** — ən məşhur avtomatik SQLi aləti. Əsas axını:

```bash
# Zəiflik şübhəsi olan parametri göstər
sqlmap -u "http://10.10.10.5/product.php?id=1" --batch

# DB-ləri, cədvəlləri, datanı çək
sqlmap -u "..." --dbs
sqlmap -u "..." -D shopdb --tables
sqlmap -u "..." -D shopdb -T users --dump
```

`--batch` susmaya görə suallara avtomatik cavab verir. sqlmap zəiflik növünü (in-band/blind/time) özü təyin edir və uyğun texnikanı seçir. POST/cookie/header parametrlərini də test edir (`-r request.txt` Burp-dan saxlanmış sorğu ilə).

Lakin vacib peşəkar qayda: **sqlmap-ı yalnız zəifliyə əminlik yarandıqdan sonra işə salın.** Səbəblər:

1. Agressiv trafik yaradır — WAF/log sistemləri dərhal görür (noise).
2. Həqiqi zəiflik olmadan işlədilərsə vaxt itirir və client-in şübhəsini artırır.
3. Hansı parametrin "canlı" olduğunu əl ilə tapmaq həmişə daha dəqiqdir.

**Manual testinq alətləri** — Burp Suite (sorğuları tutub parametrləri dəyişmək, Repeater ilə təkrarlamaq) və sadə curl. Manual testin üstünlüyü: alətin görmədiyi məntiqi görürsünüz (məs. parametr yalnız POST-da, yaxud yalnız JSON body-də oxunur).

**İstismarın etik çərçivəsi** (bu curriculum boyu təkrarlanan mesaj):

- Yalnız yazılı icazə (ROE — Rules of Engagement) olan hədəfdə.
- Lab mühitlərində (TryHackMe, HTB, öz qurduğunuz DVWA) azad şəkildə.
- Real sistemdə data oxumaq (`--dump`) minimum zəruriyyət qədər — sübut üçün bir-iki record kifayətdir, bütün bazanı endirmək artıq zərərdir.
- Tapıntı hesabatda: yer (URL/parametr), növ, sübut (screenshot/kod parçası), təsir, remediation (parameterized query + nümunə kod).

Özünü sınamaq üçün qanuni mühitlər: DVWA, SQLi-labs, TryHackMe SQLi room-ları. Öz maşınızda qurmaq ən yaxşısıdır — zəif kodu oxuyub hər variantı (error/union/blind) eyni kod üzərində görmək olar.

Bu room-da əsas götürüləcək dünyagörüşü: SQLi — "istanı`n daxilində danışmaq"dır; müdafiə isə dilin quruluşunu (prepared statement) dəyişməkdir, danışanı susdurmaq (filtrasiya) yox.

**Sual 1**
sqlmap nə edir və hansı ardıcıllıqla istifadə olunmalıdır?

**Sual 2**
sqlmap-ı zəiflik təsdiqlənməmiş işə salmaq nə üçün səhvdir?

**Sual 3**
SQLi tapıntısının hesabatda göstəriləcək elementlərini sadalayın.
