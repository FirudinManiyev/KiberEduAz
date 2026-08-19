# Room: Broken Authentication

**Path:** Web Application Hacking
**Module:** OWASP Top 10
**Çətinlik:** Easy
**Təxmini vaxt:** 1.5 saat

## Room haqqında

Autentifikasiya — tətbiqin "qapısından keçmə" mexanizmidir və bu qapı səhv qurulduqda, bütün digər müdafiələr mənasızlaşır. Bu room-da zəif sessiya idarəetməsini, brute-force-a açıq login formalarını, credential stuffing hücumlarını və MFA-nın rolu nu öyrənəcəksiniz. "Kimliyini sübut edə bilməyən hər kəs daxil ola bilər" — broken authentication-un mahiyyəti budur.

## Öyrənmə nəticələri

- Autentifikasiya (auth) və avtorizasiyanın (access control) fərqini ayırd etmək
- Zəif sessiya idarəetməsinin klassik xətalarını sadalamaq
- Brute-force və credential stuffing hücumlarını və onlardan qorunmanı izah etmək
- MFA-nın təhlükəsizlik dəyərini və bypass variantlarının konseptini bilmək

## Task 1 — Auth Nədir və Harada Sınır

**Autentifikasiya (authentication)** — "sən kimsən?" sualına cavabdır: identifikasiya (username/email) + sübut (parol, token, biometriya). **Avtorizasiya (authorization/access control)** — "nəyə icazən var?" sualıdır. Bu ikisini qarışdırmaq klassik səhvdir: IDOR avtorizasiya zəifliyidir, bu room isə autentifikasiya haqqındadır.

Autentifikasiya zənciri bir neçə nöqtədə sınxa bilər:

1. **Parol siyasəti** — `123456` qəbul edən sistem first line-dan çoxdur.
2. **Login prosesi** — brute-force-a açıqdırmı? Xəta mesajları istifadəçi adının mövcudluğunu "xəbər verirmi" (username enumeration)?
3. **Sessiya idarəetməsi** — token-lər random-dırmı, logout-dan sonra ölürmü, login-də yenilənirmi?
4. **Parol bərpası (recovery)** — "gizli sual" cavabları sosial media-dan tapıla bilərmi? Reset token-ləri təxmin oluna bilərmi?
5. **Yadda saxlama (remember me)** — parol cookie-də plaintext gedirmi?

Username enumeration — login xətalarının fərqli olması: "istifadəçi mövcud deyil" vs "parol yanlışdır". Attacker yalnız istifadəçi adlarını toplamaqla valid hesablar siyahısı qurur (bu, sonra brute-force üçün hədəf siyahısıdır). Düzgün yaklaşım: hər iki halda eyni ümumi mesaj — "yanlış istifadəçi adı və ya parol".

Parol saxlama da auth-un parçasıdır: plaintext yox (hətta admin belə oxuya bilməməlidir), MD5/SHA1 yox (sürətli crack olunur) — bcrypt/argon2 kimi yavaş, salt-lı hash alqoritmləri. Zəif saxlama DB sızmış halda parolların da sızməsi deməkdir.

Bir də qeyd: authentication zəifliyi "istismar etmək lazımdır" yox, çox vaxt ** müşahidə etməklə** tapılır — cavab davranışlarını (mesajlar, cookie-lər, redirect-lər) müqayisə edərək. Bu room-da əksər tapıntılar "test və müşahidə" tiplidir.

**Sual 1**
Authentication və authorization arasındakı fərqi nümunə ilə izah edin.

**Sual 2**
Username enumeration nədir və necə qarşısı alınır?

**Sual 3**
Parolların düzgün saxlanması üçün hansı tələblər var?

## Task 2 — Brute-Force və Credential Stuffing

**Brute-force** — parolu sınama-yanlış-sınama ilə tapmaq. Mümkün variantların astronomik olmasına baxmayaraq, real sistemlərdə işləyir, çünki insanlar proqnozlaşdırıla bilən parollar seçir: `parol123`, `Summer2024!`, şirkət adı + il. Hücum alətləri (hydra, burp intruder) wordlist-lərlə işləyir:

```bash
hydra -l admin -P /usr/share/wordlists/rockyou.txt 10.10.10.5 http-post-form "/login:user=^USER^&pass=^PASS^:incorrect"
```

Bu əmr login formasına user üçün `admin`, parollar üçün rockyou wordlist-i göndərir və "incorrect" mətninin yoxluğunu (yəni uğuru) axtarır.

**Credential stuffing** — brute-force-un real dünyada daha təhlükəli qohumu. Məntiq: insanlar eyni parolu bir çox saytda istifadə edir. Başqa saytdan sızmış credential cütlüyü (breach-dən public olan milyonlarla siyahı var) bu saytın login formasında sınaqdan keçirilir. Parol "zəif" olmaya bilər — sadəcə **başqa yerdə sızmışdır**. Bu hücum üçün: böyük hazır siyahı + avtomatik sınaq = yüksək uğur şansı.

Bu ikisinin müdafiəsi fərqlidir. Brute-force-a qarşı:

- **Rate limiting** — IP/hesab üzrə uğursuz cəhdləri məhdudlaşdırır (məs. 5 cəhd → 15 dəq blok).
- **Hesab kilidi (lockout)** — amma ehtiyatlı: permanent lockout DoS vectoru olur (hər kəsi kilidləmək); müvəqqəti/müntəzəm (exponential delay) daha yaxşıdır.
- **Strong parol siyasəti** — wordlist-lərdə olmayan parollar.
- **CAPTCHA** — avtomatikləşdirməni baha edir (tam dayandırmır).

Credential stuffing-ə qarşı əlavə olaraq:

- **MFA** — parol sızsə belə ikinci faktor qapını bağlayır (ən effektiv tədbir).
- **Parol leaked-check** — istifadəçinin parolunun bilinən breach siyahılarında olub-olmamasını yoxlamaq (haveibeenpwned API kimi) və qadağan etmək.
- **Anomaliya aşkarlama** — qeyri-adi girişlər (fərqli ölkə, çox IP-dən eyni hesab).

Pentest kontekstində: brute-force testi ROE ilə məhdudlaşır — real sistemdə aggressiv sınaq hesabı kilidləyə və client üçün insident yarada bilər. Adətən "rate limit varmı?" sualına 5-10 sınaq ilə cavab tapılır (6-cı cəhddə blok/captcha gəlirsə — müdafiə var, tapıntı yox). Lab mühitində isə tam hücum sərbəstdir.

**Sual 1**
Brute-force və credential stuffing arasındakı konseptual fərq nədir?

**Sual 2**
Hesab kilidi (account lockout) hansı əks-təsir riski daşıyır?

**Sual 3**
Credential stuffing-ə qarşı ən effektiv müdafiə hansıdır və niyə?

## Task 3 — Zəif Sessiya İdarəetməsi

Login uğurlu olanda parolun vəzifəsi bitir — bundan sonra hər şey **sessiya token-inin** (cookie) üstündə durur. HTTP fundamental olaraq stateless-dır; sessiya token-i istifadəçinin kimliyinin "daşıyıcısı"dır. Ona görə token = parolun müvəqqəti ekvivalentidir.

Zəif sessiya idarəetməsinin klassik xətaları:

1. **Proqnozlaşdırıla bilən token-lər.** `session=ali`, `sessid=1001` və ya timestamp-əsaslı ID-lər — bir hesabı görüb qonşu hesabı "hesablayımaq" olar. Düzgün token: kriptoqrafik random (minimum 128 bit entropy).
2. **Login ətrafında token yenilənməsi.** Sessiya fixation üçün şərait yaradır: login-dən əvvəl və sonra eyni token qalırsa, attacker qurbanın "login-ə qədər" token-ini oğurlayıb gözləyir.
3. **Logout işləmir.** Logout düyməsi token-i browser-də silir, amma server tərəfdən token "ölür" — sadəcə köhnə cookie-ni geri qoyaraq daxil olmaq olar. Server-side logout məcburidir.
4. **Sessiya heç vaxt bitmir.** Həftələr əvvəl oğurlanmış token hələ də işləyir. Idle timeout + mütləq ömür (absolute timeout) olmalıdır.
5. **Cookie attribute-ları yoxdur.** `HttpOnly` yoxdursa XSS ilə oğurlanır; `Secure` yoxdursa açıq HTTP-də sniffing ilə oxunur; `SameSite` yoxdursa CSRF şəraiti asanlaşır.

Test yanaşması (lab mühitində):

1. Login ol, cookie-ni qeyd et (`document.cookie` və ya Burp).
2. Login-out et, köhnə cookie-ni geri qoy — işləyirsə? Tapıntı.
3. İki hesabla (özünüzün iki test hesabı) token strukturlarını müqayisə et — oxşarlıq/pattern varmı?
4. Cookie-ni başqa browser-də aç — session hijacking simulyasiyası.

Yadda saxlamaqla əlaqəli bir əlavə: "Remember me" funksiyası token-i uzadır — bu, rahatlıq/təhlükəsizlik traid-offudur və uzun ömürlü token-lərin value-riskini artırır.

JWT (JSON Web Token) — modern sessiya/token formatıdır: `header.payload.signature`. Öz spesifik xətaları var: `alg: none` qəbulu, zəif secret ilə imzalanmış HS256-ın brute-force-u, sensitive data-nın payload-da plaintext saxlanması (JWT base64-dir, şifrəli deyil), token-in ləğv edilə bilməməsi (logout-un "serverdə öldürülməsi" çətin). Detalları API təhlükəsizliyi mövzularına aiddir, amma əsas mesaj: yeni format köhnə problemləri tam həll etmir.

**Sual 1**
Niyə "sessiya token-i = müvəqqəti parol" hesab edilir?

**Sual 2**
"Logout işləmir" zəifliyi necə aşkarlanır və nə ilə təhlükəlidir?

**Sual 3**
JWT ilə bağlı klassik xətalardan üçünü sadalayın.

## Task 4 — MFA: İkinci Qapı və Onun Kənarları

**MFA (Multi-Factor Authentication)** — bir faktorun (parol) əvəzinə bir neçə müstəqil faktor: bildiyiniz şey (parol), malik olduğunuz şey (telefon, token), olduqunuz şey (biometriya). Parol sızmış olsa belə, attacker-in ikinci faktora da ehtiyacı var — bu, credential stuffing və brute-force riskini praktiki olaraq sıfırlayır.

Faktor növləri və gücləri:

| Faktor | Nümunə | Zəif tərəfi |
|---|---|---|
| SMS kod | Mətn mesajı | SIM swap, interceptor, phishing |
| TOTP app | Google Authenticator | Phishing-dən qorumur (real-time relay) |
| Hardware key | YubiKey/FIDO2 | Phishing-ə qarşı ən güclü |
| Email kod | Reset link | Email hesabı sızmışsa ineffective |

MFA bypass variantları (konseptual, müdafiəçilik üçün bilinməli):

- **MFA fatigue / bombing** — login bildirişlərini ard-arda göndərmək; qurban "Allow"-u səhvən basır (real hadisələrdə Uber hack belə olub).
- **Real-time phishing / proxy** — attacker phishing saytı ilə kodu real vaxtda ötürüyor (Evilginx tipli alətlər).
- **Remember device bypass** — "bu cihaza etibar et" flaqının oğurlanması MFA-nı keçir.
- **Recovery axını zəifliyi** — MFA güclü, amma parol recovery MFA tələb etmir → ən zəif halqa oradadır.
- **SIM swap** — telefon nömrəsini sosial mühəndisliklə özünə keçirmək, SMS kodları almaq.

MFA-nın düzgün tətbiqi: bütün istifadəçilər üçün məcburi (opsional yox), TOTP/hardware üstünlüklə, recovery axını da MFA-li, "remember device" müddəti məhdud.

Parçası kimi bir anlayış — **passwordless auth** (passkeys/WebAuthn): parolu tamamilə aradan qaldıran istiqamətdir. Phishing-resistant olması onu uzun müddətli həllə çevirir.

Pentest baxımından MFA testi: MFA-nın hansı mərhələdə gəldiyi (login formundan əvvəl/sonra — username enumeration MFA-dan əvvəlbaşlayırsa hələ işləyir), recovery axını, remember-device token-lərinin davranışı, MFA kodunun brute-force-a açıqlığı (6 rəqəmli kodun rate limit-i).

**Sual 1**
MFA hansı hücum növlərinə qarşı ən effektiv dir?

**Sual 2**
MFA fatigue hücumu nədir?

**Sual 3**
MFA sistemində ən çox nəzərə alınmayan (unudulan) zəif halqa hansıdır?

## Task 5 — Auth Testində Metodologiya və Hesabat

Real sistemlərdə auth testi sistematik yanaşma tələb edir. Checklist yanaşması:

**Login səthi:**
- [ ] Xəta mesajları eynidır (enumeration yoxdur)?
- [ ] Rate limit / lockout var? (bir neçə uğursuz cəhdlə sınanır)
- [ ] Default credential-lar (`admin:admin`) işləmir?
- [ ] Parol siyasəti zəif parolu qəbul etmir?

**Sessiya:**
- [ ] Token random-dır (pattern yoxdur)?
- [ ] Login-də token yenilənir?
- [ ] Logout-dan sonra köhnə token ölür?
- [ ] Cookie-də HttpOnly/Secure/SameSite var?
- [ ] Sessiya timeout-u var?

**Recovery:**
- [ ] Reset token-i random və vaxtla məhdud?
- [ ] Reset cavabları enumeration vermir?
- [ ] Gizli suallar sosial məlumatla tapıla bilər?

**MFA (varsa):**
- [ ] Recovery axını MFA tələb edir?
- [ ] Kod cəhdləri limitlidir?

Hər "xeyr" cavabı bir tapıntıdır. Tapıntının severity qiymətləndirməsi kontekstdən asılıdır: username enumeration özü adətən Low-dur (məlumat), amma rate limit olmayan login + zəif parol siyasəti kombinasiyası High olur (hesab ələ keçirilə bilər). Session fixation — High (birbaşa hesab ələ keçirmə).

Hesabatda hər tapıntıya sübut: screenshot (fərqli xəta mesajları), Burp request/response cütlüyü (token davranışı), vaxt ölçmələri (rate limit sınağı). Remediation isə konkret olmalıdır: "authentication-i yaxşılaşdırın" yox — "uğursuz cəhdləri IP+hesab üzrə limitləyin (məs. 5 cəhd/15 dəq), eyni xəta mesajından istifadə edin, bcrypt ilə hash saxlayın".

Bir son söz — didaktik: bu room-un bir neçə tapıntısı (token davranışı, cookie attribute-ları) HTTP/HTTPS room-un bilikləri üzərində quruldu. Web təhlükəsizliyi belədir — hər mövzu əvvəlkinin davamıdır, vahid şəbəkə.

**Sual 1**
Auth testində login səthi üçün hansı dörd yoxlama aparılır?

**Sual 2**
Rate limit-in olmaması hansı severity daşıya bilər və nəyə bağlıdır?

**Sual 3**
"Düzgün remediation" nümunəsi necə görünür — pis nümunə ilə müqayisə edin.
