# Room: CSRF

**Path:** Web Application Hacking
**Module:** OWASP Top 10
**Çətinlik:** Easy
**Təxmini vaxt:** 1 saat

## Room haqqında

CSRF (Cross-Site Request Forgery) — "görünməz əmr" hücumudur: qurban öz hesabı ilə saytda olarkən, başqa bir səhifə onun adına istənməyən sorğu göndərir — parol dəyişir, pul köçürür, email yeniləyir. Bu room-da CSRF-in işləmə mexanizmini, tipik ssenarilərini,Same Origin Policy ilə münasibətini və CSRF token-in qoruyucu rolunu öyrənəcəksiniz.

## Öyrənmə nəticələri

- CSRF-in işləmə prinsipini (browser-in cookie-ləri avtomatik göndərməsi) izah etmək
- Tipik CSRF ssenarisini (parol dəyişmə, email yeniləmə) qurmaq
- CSRF-in Şərtlərini və hansı sorğuların qorunmalı olduğunu müəyyən etmək
- CSRF token, SameSite cookie və digər müdafiə təbəqələrini izah etmək

## Task 1 — CSRF Necə İşləyir: Browser-in Yaddaşı

Təməl mexanizm: browser, hansısa sayt üçün saxladığı cookie-ləri, **həmin sayta gedən hər sorğuya avtomatik əlavə edir** — sorğunu kim başlatdığından asılı olmayaraq. Bu, HTTP protokolunun dizaynıdır: cookie "bu domain-ə aiddir" yox, "bu domain-ə gedən sorğuda göndərilir".

CSRF ssenarisi addım-addım:

1. Qurban `bank.az` saytında daxil olub — sessiya cookie-si browser-də.
2. Quran eyni browser-də (başqa tabda) attacker-in səhifəsini açır — `evil.com`.
3. `evil.com`-də gizli form var:

```html
<form action="https://bank.az/transfer" method="POST">
  <input type="hidden" name="to" value="attacker_iban">
  <input type="hidden" name="amount" value="1000">
</form>
<script>document.forms[0].submit()</script>
```

4. Səhifə açılan kimi form avtomatik submit olunur → sorğu `bank.az`-a gedir → browser **bank.az-ın cookie-sini avtomatik əlavə edir** → server sorğunu qurbanın legitim sorğu kimi qəbul edir.
5. Qurban heç nə görməyib — səhifədə görünən heç nə yoxdur (hidden input-lar, avtomatik submit).

Şərtlər: qurban hədəf saytda aktiv sessiyada olmalı, hərəkət (transfer, parol dəyişmə) yalnız cookie ilə identifikasiya olunmalı, attacker sorğunun parametrlərini bilməli (guessable və ya aşkar). 

Adın izahı: "Cross-Site" — sorğu başqa saytdan gəlir; "Request Forgery" — sorğu saxtalaşdırılır (qurbanın adına). CSRF-i XSS-dən fərqləndirin: XSS-də attacker-in kodu hədəf saytda icra olunur; CSRF-də heç bir kod hədəf saytda işləmir — yalnız **sorğu** qurbanın identifikatoru ilə göndərilir. XSS = kod icrası, CSRF = əmr saxtakarlığı.

GET-based CSRF daha sadədir (təsəvvür edin: parol dəyişmə `GET /changepass?new=X` ilə işləyirsə — bir şəkil tag-i `<img src="https://site/changepass?new=hacked123">` browser-də açılan kimi sorğu gedir). Müasir tətbiqlərdə dəyişən əməliyyatlar POST ilə getsə də, POST CSRF-dən qorunmur — yuxarıdakı avtomatik-submit form məhz POST-dur.

**Sual 1**
CSRF-in arxasındakı fundamental browser davranışı nədir?

**Sual 2.**
XSS və CSRF arasındakı konseptual fərqi izah edin.

**Sual 3.**
CSRF-in reallaşması üçün hansı şərtlər lazımdır?

## Task 2 — Ssenarilər: Parol, Email, Status Dəyişmə

Real dünyada CSRF-in ən çox zərbə endiyi yerlər — **hesab ələ keçirmə yolları**:

**Ssenari 1 — Email dəyişmə:** `POST /account/email` sorğusu CSRF qoruması olmadan işləyir. Attacker qurbanın email-ini öz email-inə dəyişir → "parolu unutdum" axını ilə reset link-i özünə gəlir → hesab tam ələ keçir. Eyni ssenari telefon nömrəsi (SMS MFA) üçün — MFA-nı öz nömrəsinə yönləndirir.

**Ssenari 2 — Parol dəyişmə:** `POST /account/password` — qurbanın parolu attacker-in parolu ilə əvəz olunur. Current password tələb olunursa, CSRF qismən dayanır; amma bəzi tətbiqlər "məlum cihazlardan" bu yoxlamanı buraxır.

**Ssenari 3 — Admin panel-də hərəkətlər:** admin üçün CSRF daha dağıdıcıdır: yeni admin yaratmaq, icazələri dəyişmək — bir açıq səhifə kifayətdir ki, "admını öz əli ilə" bu əməliyyatı etmiş sayasınız.

**Ssenari 4 — "Zərərsiz" görünənlər:** status/ayar dəyişmələri, abunəliklər, "məni xatırla" aktivləşdirmələri — kiçik görünən əməliyyatlar da zəncirdə istifadə olunur (məs. email dəyişmədən əvvəl notification söndürmək).

Yoxlama (lab mühitində, öz iki hesabınızla): hədəf sorğunu Burp ilə tutun → CSRF token sahəsini görün → token-i çıxarıb sorğunu göndərin → 200 alınırsa qoruma yoxdur. Və ya sorğunu başqa "origin" simulyasiyası ilə (Referer/Origin başlığını dəyişərək) yoxlayın — server origin yoxlayırsa, dəyişilmiş Origin ilə rədd olunmalıdır.

Testdə nəzərə alınan suallar:

- Token tələb olunurmu? Hər sorğuda yox, "yalnız login-dən sonra ilk sorğuda"?
- Token real yoxlanılır? (heç bir random string göndərilib sınanır)
- Token sessiyaya bağlıdır? (başqa istifadəçinin token-i keçirmi)
- Method dəyişmə (POST→GET) qorumanı aşağı salır?
- SameSite cookie varmı?

CSRF zəifliyinin severity-si hərəkətin nəticəsinə görə: email/parol dəyişmə — High; status dəyişmə — Low/Medium. Ən mühüm amil: bir dəfəlik/zərərli əməliyyatların qorunması.

**Sual 1**
Email dəyişmə CSRF-i niyə hesab ələ keçirmə yolu sayılır?

**Sual 2.**
CSRF token-in yoxlanılmasını test etmək üçün hansı sınaqlar edilir?

**Sual 3.**
Hansı əməliyyatlar CSRF qorunmasına mütləq ehtiyac duyur?

## Task 3 — Müdafiə Təbəqələri: Token, SameSite, Origin

**CSRF token — əsas müdafiə.** Server hər sessiya/form üçün unikal, proqnozlaşdırıla bilməyən token generasiya edir, form-da gizli sahə kimi qoyur. Sorğu gələndə token-i yoxlayır: uyğun gəlmirsə — rədd. Attacker token-i bilmir (o, qurbanın səhifəsində olur, Same Origin Policy ilə attacker-in səhifəsi onu oxuya bilmir) → saxta sorğu keçmir.

Token-in düzgünlük qaydaları:

- Sessiya/istifadəçi ilə bağlanmalı (ümumi "qlobal" token zəifdir).
- Kifayət qədər random (təxmin olunmaz).
- Hər həssas sorğuda yoxlanmalı — sadəcə "form-da var" kifayət deyil, **server-side doğrulama** olmalıdır.
- Token-i qısamüddətli/one-time etmək əlavə qoruma verir (amma UX balansı).

**SameSite cookie attribute-u** — müasir browser-lərin təbii qoruması: `SameSite=Lax` (default artıq bir çox browser-də) cross-site sorğularda cookie-nin göndərilməsini məhdudlaşdırır (Lax: top-level navigation GET-lər üçün icazə verir, POST üçün yox). `Strict` daha sərt. Bu, əksər klasik CSRF-i avtomatik dayandırır — amma **tam etibar edilməməli**: köhnə browser-lər, subdomain manipulyasiyaları, GET-based hərəkətlər (Lax altında) hələ də mümkün sahələrdir.

**Origin/Referer yoxlaması** — server gələn sorğunun mənşəyini yoxlayır. Cross-site form-dan gələn sorğuda `Origin: https://evil.com` olacaq. Bu qoruma köməkçidir, amma birincil müdafiə kimi tövsiyə olunmur (header-lər bəzi ssenarilərdə yoxdur/silinir).

**Re-authentication / təsdiq** — kritik əməliyyatlar üçün (böyük transfer, parol dəyişmə) cari parolun tələbi və ya ikinci faktor təsdiqi — CSRF-i funksional olaraq qırır (attacker təsdiq məlumatını bilmir).

**CORS-un CSRF qoruması OLMADIĞI** — vacib anlaşılmazlıq: CORS (Access-Control-Allow-Origin) browser-in **cavab oxumağını** idarə edir; sorğunun **göndərilməsini** yox. Yəni CORS qapalı olsa belə, "simple request" (form POST kimi) göndərilir — cavab oxunulmasa da, əməliyyat icra olunub. CSRF-in qarşısı CORS ilə alınmır.

Müasir yanaşmanın xülasəsi: **SameSite=Strict/Lax (bütün sessiya cookie-ləri) + CSRF token (həssas əməliyyatlarda) + kritik əməliyyatlarda təsdiq.** Bu üçlük praktiki olaraq CSRF-i aradan qaldırır.

**Sual 1**
CSRF token niyə işləyir — attacker onu niyə əldə edə bilmir?

**Sual 2.**
SameSite=Lax nə edir və nəyi əhatə etmir?

**Sual 3.**
CORS-un CSRF ilə bağlı olan anlaşılmazlıq nədir?

## Task 4 — CSRF + XSS = Tam Müdafiə Pozuntusu

Qısa, amma vacib kompozisiya taskı: **CSRF qoruması XSS ilə bypass olunur.**

Məntiq: CSRF token-i qoruyan şey — attacker-in token-i bilməməsidir (SOP sayəsində). Amma XSS varsa, attacker-in kodu **hədəf saytın öz origin-ində** işləyir: DOM-dan token-i oxuyur (`document.querySelector('[name=csrf]').value`), sorğunu həmin saytdan göndərir. Token yoxlamanı keçir — çünki "hər şey yerlidir".

Praktik nəticələr:

- Yaxşı CSRF müdafiəsi olan sistemdə tapılmış XSS — sadə "skript icrası" yox, avtorizasiya sərhədinin tam keçilməsi deməkdir. Severity bir səviyyə yuxarı qiymətləndirilir.
- Müdafiə tərtibatçısının dərsi: təbəqələr bir-birini gücləndirir, amma hər biri düzgün qurulmalıdır. "CSRF token var, XSS-i nəzərə almayaq" — yanlış hesab.
- CSRF token-in DOM-da olması zəruri olaraq "gizli" saxlanıla bilməz — bu normaldır; onu qoruyan XSS-in olmamasıdır.

Bu əlaqə həm də audit metodologiyasında əks olunur: XSS tapılanda növbəti sual — "bu origin-də hansı həssas əməliyyatlar CSRF token arxasındadır?" — çünki indi onların hamısı istismar oluna bilər.

Bir əlavə qeyd — CSRF-in "qohumu" olan bölgə: **cross-site scripting-in özü də SOP tərəfindən məhdudlaşır** — XSS yalnız həmin origin-in resurslarına çatır. Buna görə bütün bu hücumlar (XSS, CSRF) "browser-də origin etibarının" pozulması ailəsindən hesab olunur: browser hansısa origin-ə etibar edir; zəiflik bu etibarı birbaşa (XSS — kod icrası) və ya dolayı (CSRF — istifadəçinin identifikatoru ilə sorğu) istismar edir.

**Sual 1**
XSS CSRF qorumasını niyə və necə aşır?

**Sual 2.**
"CSRF token var" deyə XSS-i az qiymətləndirmək nə üçün səhvdir?

**Sual 3.**
XSS və CSRF-in ortaq ailə izahı nədir?

## Task 5 — CSRF Test Metodologiyası və Module Xülasəsi

CSRF testi (lab/öz tətbiqinizdə) sistemli şəkildə:

1. **Həssas əməliyyatların siyahısı:** parol/email dəyişmə, köçürmə, silmə, admin əməliyyatları — hamısı CSRF test namizədidir.
2. **Sorğunun təhlili (Burp):** token varmı? Token sessiyaya bağlıdırmı? GET/POST fərqi varmı? Origin/Referer yoxlanılır?
3. **Token yoxlama sınaqları:** token-i silib göndər; dəyişdirib göndər; başqa sessiyanın token-i ilə göndər; boş göndər. Hər halda 200/dəyişiklik alınırsa — qoruma yoxdur.
4. **Cross-site simulyasiya:** HTML faylında (lokalda saxlanmış) avtomatik-submit form qur, öz sessiyanla (başqa tabda hədəf saytda) aç — əməliyyat keçirsə, zəiflik təsdiqlənir.
5. **SameSite yoxlaması:** cookie attribute-u (`Set-Cookie`-də) — `SameSite` yoxdursa/sıfırdırsa, qeydə alınır.

Sübut: saxta səhifə kodu + nəticə ekranı (dəyişən email/parol və s.). Remediation: CSRF token (server-side yoxlamalı), SameSite cookie, kritik əməliyyatlarda re-auth.

Bu module (OWASP Top 10 seriyasının bu hissəsi) üzrə indiyə qədər keçdiklərimizin xəritəsi:

- **SQLi** — backend↔database sərhədi pozuldu
- **XSS** — input-un browser-də kod olması
- **IDOR** — avtorizasiya yoxlamasının olmaması
- **Misconfiguration** — quraşdırma/parametr qapıları
- **CSRF** — browser-in cookie avtomatizmi

Hər biri fərqli qatdadır, amma hamısı eyni sualı verir: **server nəyə etibar edir?** Etibar edilən hər şey (input, identifikator, cookie, konfiqurasiya) — yoxlanılmalı və ya neytrallaşdırılmalıdır. Bu, web təhlükəsizliyinin dayanıqlı modelidir.

Növbəti module — Web Exploitation Alətləri — bu tapıntıları daha sürətli və sistemli tapmağın alətlərini (Burp Suite dərinləşməsi, avtomatik skanerlər) öyrədəcək.

**Sual 1**
CSRF testində "token-i silib göndərmə" sınağı nəyi göstərir?

**Sual 2.**
SameSite attribute-unun yoxlanması harada aparılır?

**Sual 3.**
OWASP room-larının ortaq sualı nədir?
