# Room: IDOR (Insecure Direct Object Reference)

**Path:** Web Application Hacking
**Module:** OWASP Top 10
**Çətinlik:** Easy
**Təxmini vaxt:** 1 saat

## Room haqqında

IDOR — giriş yoxlamasının unudulduğu yerdə yaranan, anlamaq ən asan, amma real dünyada ən çox rast gəlinən zəifliklərdən biridir: URL-də və ya parametrdə obyekt identifikatorunu dəyişməklə başqasının məlumatına çatırsınız. Bu room-da IDOR-un təbiətini, URL/parametr manipulyasiyası nümunələrini və access control-un (server tərəfli avtorizasiya) rolunu öyrənəcəksiniz.

## Öyrənmə nəticələri

- IDOR-un tərifini və authentication/authorization fərqinə yerləşdirmək
- URL və parametr manipulyasiyası ilə IDOR tapmağın metodologiyasını tətbiq etmək
- IDOR-un API, cookie və fayl yükləmə kimi müxtəlif səthlərini tanımaq
- Server tərəfli access control-un düzgün qurulmasını izah etmək

## Task 1 — IDOR Nədir: İdentifikator Etibarsızdır

**IDOR (Insecure Direct Object Reference)** — tətbiq istifadəçinin göstərdiyi obyekt identifikatoruna (ID) güvənir, amma **bu istifadəçinin həmin obyektə icazəsi olub-olmadığını yoxlamır**.

Klassik ssenari. Sizin profil səhifəniz:

```
GET /profile?user_id=1024
```

Sizin user_id = 1024. Maraq verirsiniz: `user_id=1025` nə göstərəcək? Dəyişdirirsiniz — və başqa istifadəçinin profilini (ad, email, ünvan...) görürsünüz. Server "gözlənilən" identifikatoru qaytardı, kimin soruşduğunu isə yoxlamadı. Bu, IDOR-dur.

Zəif kodun məntiqi (konseptual):

```python
def profile(request):
    user = User.objects.get(id=request.GET['user_id'])  # sadəcə göstərilən ID-ni götürür
    return render(user)
```

Çatışmayan hissə — yoxlama: `if user != request.user and not request.user.is_admin: deny`.

IDOR-un kökündə iki yanlış güvən dayanır:

1. **"İdentifikatoru yalnız sahibi bilir"** — güman. Amma ID-lər (rəqəmli, username, UUID) tahmin/tədqiq edilə bilər: ardıcıl rəqəmlər (1024 → 1025), username-lər, digər endpoint-lərdən sızan ID-lər.
2. **"İstifadəçi interfeysi yalnız öz linklərini göstərir"** — UI-da "Mənim sifarişlərim" düyməsi yalnız sizin sifarişlərinizə link verir. Amma server üçün UI heç nə demək deyil — sorğu birbaşa gələ bilər. Bu, arxitektura room-undakı "client-a etibar etmə" prinsipinin tam təzahürüdür.

Nəticə etibarilə IDOR — **broken access control** ailəsinin ən çox görünən üzvüdür və OWASP Top 10-da birinci yerə çıxan kateqoriyanın ("Broken Access Control") əsas səbəbi kimi göstərilir. Onu xüsusilə "sərfəli" edən: istismar üçün xüsusi alət lazım deyil — browser (və ya Burp) kifayətdir, heç bir "hacker magic" yoxdur.

**Sual 1**
IDOR-un tərifini bir cümlədə verin.

**Sual 2.**
IDOR-un arxasındakı iki yanlış güvə hansılardır?

**Sual 3.**
IDOR hansı OWASP kateqoriyasına aiddir?

## Task 2 — Tapmaq: Identifikatorları İzləmək

IDOR axtarışı sistematik müşahidədir. Addımlar:

**1. Identifikatorların xəritəsi.** Tətbiqdə obyektə istinad edən hər şeyi qeyd et: URL parametrləri (`?user_id=`, `?doc=`, `?invoice=`), path hissələri (`/api/users/5/orders/12`), POST body, hətta cookie. Hər identifikator mümkün IDOR nöqtəsidir.

**2. Öz obyektlərinlə baseline.** İki test hesabı yaradın (A və B). A hesabı ilə öz resurslarınızı açın — normal davranışı qeyd edin. Bu, "fərqi" görmək üçün müqayisə bazasıdır.

**3. Digər identifikatora keçid.** B hesabının obyekt ID-sini A sessiyası ilə açmağa çalışın:

```
GET /api/orders/102   (A sessiyası, amma order 102 — B-yə məxsusdur)
```

Cavab B-nin datasıdırsa — IDOR təsdiqləndi. 403/404 alınırsa — yoxlama var (yaxşı əlamət).

**4. İdentifikator fəzəsını araşdırmaq.** Rəqəmlər ardıcıldırsa (1, 2, 3...) — bütün obyektlər sıra ilə çıxarıla bilər (mass enumeration). UUID-lər təsadüfi olsa da, başqa endpoint-lərdən (şərhlər, sharing link-lər) sızma ehtimalı var.

Nümunələr müxtəlif formalarda gəlir:

| Səth | Nümunə | Nəyi dəyişmək olar |
|---|---|---|
| URL query | `/download?file=report_mine.pdf` | `file=report_admin.pdf` |
| Path | `/invoices/1052` | `/invoices/1053` |
| JSON body | `{"account": "ACC-001"}` | `{"account": "ACC-002"}` |
| Cookie | `account_id=88` | `account_id=89` |
| Referrer-əsas | "hansı səhifədən gəldin" yoxlaması | Referrer-i saxtalaşdırmaq |

Marqlı bir nüans: bəzi tətbiqlər POST-da yoxlama edib GET-də unudur (və ya əksinə), və ya HTML interfeysdə qoruyub API-da açıq buraxır (`/api/v1/...`). Buna görə **eyni funksiyanın bütün yollarını** test etmək lazımdır — UI-dan göründüyü kimi deyil.

Başqa tipikə diqqət: "chaining". Tapa bilmədiyiniz ID-lər başqa zəifliklə tapılır: user enumeration (auth room-dan), sızan JS-də endpoint-lər, səhv mesajlarındakı ID-lər. Zəifliklər bir-birini qidalandırır.

**Sual 1**
IDOR testində iki test hesabı nə üçün lazımdır?

**Sual 2.**
UI-da qorunan, amma API-da açıq qalan funksiya nə ilə bağlıdır?

**Sual 3.**
UUID istifadə olunanda IDOR imkanı tam yoxdurmu — izah edin.

## Task 3 — Təsir: Məlumat Oğurluğundan İmtiyaz Artımına

IDOR-un təsiri obyektin nə olduğundan asılıdır:

- **Məlumat açılışı (information disclosure):** başqasının profili, sifarişləri, tibbi qeydləri. Kütləvi halda — bütün istifadəçilərin datasının sıradan çıxarılması (ID-lər ardıcıldırsa, sadə loop ilə).
- **Funksional təsir:** IDOR yalnız "oxuma" deyil — `POST /api/orders/1052/cancel` başqasının sifarişini ləğv edir, `PUT` dəyişdirir, `DELETE` silir. Write əməliyyatlarında ziyan birbaşadır.
- **İmtiyaz artımı (privilege escalation):** `role=user` parametrini `role=admin` etmək, admin-only endpoint-lərin ID-lərini çağırmaq. Horizontal (eyni səviyyə, başqa istifadəçi) ilə vertical (yuxarı səviyyə) fərqi: horizontal IDOR — başqa istifadəçinin datası; vertical — admin resursuna giriş.

Real hadisələrin əksəriyyəti məhz IDOR ailəsindən olub: şəxsi məlumatların toplu sızməsi (sifarişlər, şəkillər, mesajlar) adətən "URL-dəki ID-ni dəyişdim" qədər sadə hərəkətlə baş verib. Buna görə də bu zəiflik "boring" görünəndən çox ciddidir — təsir birbaşa GDPR/məxfilik pozuntusuna çevrilir.

Hesabatda IDOR-un severity hesablanması: oxunan data nə qədər həssasdır (ad mı, tibbi qeyd mi?) + write imkanı varmı + enumeration asanlığı. "Başqa istifadəçinin sifarişini görmək" Medium; "bütün istifadəçilərin şəxsi məlumatını ardıcıl çəkmək" Critical-a qədər.

Mühüm etik məqam: IDOR sübutu üçün **bir başqa istifadəçinin (öz ikinci hesabınızın) datasını oxumaq kifayətdir.** Real başqa istifadəçilərin datasını toplu çıxarmaq — artıq zərər vurmaqdır, sübut yox. Hesabatda yazılır: "IDOR mövcuddur, kütləvi istismar mümkündür (ID ardıcılldır)" — bunu göstərmək üçün 2-3 obyekt kifayətdir.

**Sual 1**
Horizontal və vertical access control fərqini izah edin.

**Sual 2.**
Write əməliyyatlarında IDOR nə ilə nəticələnir?

**Sual 3.**
IDOR sübutunda etik hədd haradadır?

## Task 4 — Müdafiə: Server Tərəfli Access Control

IDOR-un mövcudluğu bir cümlə ilə yekunlaşır: **server, sorğu sahibinin həmin obyektə icazəsini yoxlamır.** Müdafiə də bir cümlədir: hər obyekt girişində yoxlama.

Düzgün yanaşmalar:

1. **Deny by default:** hər resurs qapalıdır, icazə açıq şəkildə verilir. Yoxlama olmayan endpoint olmamalıdır.
2. **Sahiblik yoxlaması (ownership check):** obyekt çəkiləndə filter birbaşa sahibi ilə: `WHERE id = %s AND owner_id = request.user.id`. Sorğu səviyyəsində yoxlama — kodda yaddan çıxmayan ən etibarlı formdur.
3. **Rol əsaslı yoxlama (RBAC):** admin resurslarına giriş üçün rol tələbi — attribute/flag yox (client-dan gələ bilər), server tərəfli yoxlama.
4. **Mapping əsaslı identifikatorlar:** tətbiq daxilində istifadəçiə görünən ID-ləri (məs. sıra nömrəsi) ayrı, daxili açarlarla (random UUID) əvəz etmək. Amma bu, əlavə təbəqədir — **tək başına müdafiə deyil** (UUID də sıza bilər).
5. **Avtomatik testlər:** access control testləri CI-da iki istifadəçi sessiyası ilə aparılan inteqrasiya testləri kimi. İnsan unudur, test yadına salır.

Niyə "gizli ID" (security by obscurity) həll deyil? Çünki identifikatorlar həmişə sızma potensialı daşıyır: log-larda, email link-lərində, paylaşım URL-lərində, digər API cavablarında. Bir dəfə sızan ID sistemi bütün "gizliliyi" məhv edir. Əksinə, düzgün access control olan sistemdə ID-lərin bilinməsi heç bir fayda vermir — `user_id=1025` sorğuşu hər kəs göndərə bilər, cavabı yalnız səlahiyyətli olan alar.

Bu, IDOR-un müdafiə fəlsəfəsidir: **identifikatoru gizlətmək yox, identifikatora çıxışı yoxlamaq.**

Tərtibatçıların tipik etirazı: "bizim UI-da başqa istifadəçinin linki yoxdur". Cavab UI haqqında deyil — server haqqındadır: hər endpoint-i yoxlamağa ehtiyac var (UI-dan keçməsələr də). Bu, "hücum səthi = UI-dakı görünən funksiyalar deyil, server-in qəbul etdiyi bütün sorğular" dərsidir.

**Sual 1**
"Ownership check-in sorğu səviyyəsində" olması nə deməkdir?

**Sual 2.**
UUID-yə keçid niyə tək başına müdafiə deyil?

**Sual 3.**
"Gizli ID" yanaşmasının (security by obscurity) mahiyyəti nədir?

## Task 5 — Praktiki Məşq: IDOR Test Axını

İndi bilikləri tam axına yığaq. Təsəvvür edin: onlayn mağaza tətbiqi, sizdə iki hesab var (A: ali, B: bənən... əslində A və B). Test axını:

**Addım 1 — Səthin xəritəsi (proxy ilə):** Burp Suite-i işə salın, A hesabı ilə tətbiqi gəzin: profil, sifarişlər, "download invoice", şəkil yükləmə. Proxy tarixçəsində identifikator daşıyan hər sorğu qeydə alınır:

```
GET /api/user/204
GET /api/orders?user=204
GET /files/invoice_204_05.pdf
```

**Addım 2 — B hesabının identifikatoru:** B ilə daxil olun, onun ID-sini qeyd edin (məs. 205).

**Addım 3 — Əvəzetmə sınaqları (A sessiyası ilə):**

```
GET /api/user/205        → B-nin profilini göstərirsə: IDOR (read)
GET /api/orders?user=205 → B-nin sifarişləri: IDOR (read)
GET /files/invoice_205_05.pdf → fayl səthində IDOR
POST /api/orders/991/cancel (B-nin sifarişi) → IDOR (write)
```

Hər sınaqda nəzərə alınacaq cavablar: 200 + data (IDOR), 403 (yoxlama var — yaxşı), 404 (obyekt "gizlədilir" — amma B sessiyası ilə 200 gəlirsə, davranış fərqi aşkarlanmalı), redirect to login.

**Addım 4 — Enumeration mümkünlüyü:** ID ardıcıllığı (204, 205...) və rate limit yoxlaması — kütləvi çıxarışın asanlığı hesabatda göstərilir.

**Addım 5 — Sübut və hesabat:** screenshot-lar (A sessiyası + B-nin datası), Burp request/response cütlüyü. Tapıntı: "User ID parametri owner yoxlaması olmadan istifadə olunur — istənilən istifadəçi başqa istifadəçinin məlumatını oxuya/dəyişə bilər". Remediation: sorğu səviyyəli ownership check nümunə kodla.

Bu axını real lab-larda məşq etmək üçün: OWASP Juice Shop (IDOR tapıntıları var), PortSwigger Academy-in access control lab-ları (ən sistemli), TryHackMe IDOR room-ları.

Module bağlanarkən: IDOR — "sadə" zəifliyin ağılsızlıq hesab edilməməsinin dərsidir. Onu tapmaq üçün genius olmaq lazım deyil — **sistematik olmaq** lazımdır: hər identifikatoru görmək, hər yolu sınamaq, heç bir client tərəfli güvəni qəbul etməmək. Bu vərdiş bütün access control təhlükəsizliyinin təməlidir.

**Sual 1**
Burp Proxy tarixçəsi IDOR testində hansı addımı yerinə yetirir?

**Sual 2.**
403 və "B sessiyasında 200, A sessiyasında 404" cavablarının fərqli mənası nədir?

**Sual 3.**
IDOR hesabatında remediation bölməsi nə ehtiva edir?
