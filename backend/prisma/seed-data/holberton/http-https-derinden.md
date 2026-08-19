# Room: HTTP/HTTPS Dərindən

**Path:** Web Application Hacking
**Module:** Web Fundamentals
**Çətinlik:** Beginner
**Təxmini vaxt:** 1.5 saat

## Room haqqında

Web tətbiqlərinə hücum etməzdən əvvəl onların "dilini" — HTTP protokolunu — dərindən bilmək lazımdır. Bu room-da HTTP request/response strukturu, metodlar, header-lər, cookie/session mexanizmi və HTTPS-in TLS ilə necə təhlükəsizləşdirildiyini öyrənəcəksiniz. Web hacking-in demək olar bütün zəiflikləri (SQLi, XSS, CSRF) məhz HTTP-nin yanlış başa düşülməsi və ya düzgün tətbiq edilməməsindən doğulur.

## Öyrənmə nəticələri

- HTTP request/response strukturu və əsas metodları (GET/POST/PUT/DELETE) izah etmək
- Əsas header-lərin (Host, Content-Type, Cookie, Authorization) funksiyalarını bilmək
- Cookie və session mexanizminin necə işlədiyini başa düşmək
- HTTPS-in TLS handshake və şifrələmə ilə trafiki necə qoruduğunu izah etmək

## Task 1 — HTTP Request/Response Strukturu

HTTP (HyperText Transfer Protocol) — web-in fundamental protokoludur: client (browser) sorğu (request) göndərir, server cavab (response) qaytarır. Hər ikisi mətn əsaslıdır və üç hissədən ibarətdir: sətir (request line / status line), header-lər və (opsional) body.

Tipik bir HTTP request:

```http
GET /login.php HTTP/1.1
Host: 10.10.10.5
User-Agent: Mozilla/5.0
Accept: text/html
Cookie: session=abc123

```

İlk sətir üç hissəyə bölünür: **metod** (`GET`), **yol** (`/login.php`) və **versiya** (`HTTP/1.1`). Sonrakı sətirlər `Ad: Dəyər` formatında header-lərdir. Boş sətir body-nin başlanğıcını bildirir — GET sorğularında adətən body olmur.

Server-in cavabı isə status line ilə başlayar:

```http
HTTP/1.1 200 OK
Content-Type: text/html
Content-Length: 1256

<html>...
```

Status kodları üç qrupa bölünür ki, bunları tanımaq pentest-də gündəlik vərdikdir:

| Qrup | Məna | Nümunə |
|---|---|---|
| 1xx | İnformasiya | 101 Switching Protocols |
| 2xx | Uğur | 200 OK, 201 Created |
| 3xx | Yönləndirmə | 301, 302 Found |
| 4xx | Client xətası | 401, 403, 404 |
| 5xx | Server xətası | 500 Internal Server Error |

Pentest baxımından ən "danışqan" kodlar: `200` (uğur), `301/302` (yönləndirmə — bəzən gizli yollara işarə edir), `401` (autentifikasiya tələb olunur — brute-force hədəfi), `403` (qadağan — bypass cəhdi üçün namizəd), `404` (yoxdur), `500` (server xətası — input-un server-i sındırdığının işarəsi, məsələn SQLi testində).

Bu strukturu öz gözlərinizlə görmək üçün curl istifadə olunur:

```bash
curl -v http://10.10.10.5
```

`-v` (verbose) rejimi göndərilən request-i və alınan response-u tam şəkildə göstərir. Browser-in DevTools-unun (F12 → Network tab) etdiyi də məhz budur — amma curl ilə gördüyünüz şey "xam" trafikdir və heç nə gizlədilmir.

Raw HTTP-ni əl ilə yazmaq (nc ilə, servis enumeration room-da göstərilən kimi) də mümkündür — bu, protokolun heç bir sehr deyil, sadə mətn mübadiləsi olduğuna əmin olmağın ən yaxşı yoludur.

**Sual 1**
HTTP request-in üç əsas hissəsini sadalayin və request line-in tərkibini izah edin.

**Sual 2**
401, 403 və 500 status kodları pentest kontekstində nəyə işarə edə bilər?

**Sual 3**
curl-in `-v` flag-i nə verir və bunu bilmək niyə vacibdir?

## Task 2 — HTTP Metodları

Metod — sorğunun "niyyətini" bildirir. Ən çox rast gəlinənlər:

- **GET** — resursu oxumaq. Parametrlər URL-də gedir: `/search?q=test`. Body yoxdur. Bu, "görünən" metoddur — tarixçədə, bookmark-larda, log-larda qalır.
- **POST** — server-də dəyişiklik/create etmək. Parametrlər body-də gedir: login formaları, fayl yükləmələri. Body-nin `Content-Type`-ı formadır (məs. `application/x-www-form-urlencoded` və ya `multipart/form-data`).
- **PUT** — resursu yaradmaq/yeniləmək (API-lərdə).
- **DELETE** — resursu silmək (API-lərdə).
- **PATCH** — resursun bir hissəsini dəyişmək.
- **HEAD** — GET kimi, amma body-siz — yalnız header-lər. Mövcudluq yoxlaması üçün.
- **OPTIONS** — server-in hansı metodları dəstəklədiyini soruşur. Cavabda `Allow:` header-i gəlir.

Pentest baxımından metodlar niyə vacibdir? Bir neçə səbəb:

1. **Zəifliyin növü metodla bağlıdır.** GET ilə gedən parametrlər referer/log-lara düşür, POST isə CSRF qorunmasında fərqli davranır.
2. **OPTIONS ilə hücum səthi aşkarlanır.** `curl -X OPTIONS` cavabında `PUT, DELETE` görünsə — bu API tətbiqidir və daha çox test nöqtəsi var deməkdir.
3. **PUT metodu açıq qalıbsa** — birbaşa fayl yazmaq (webshell) imkanı ola bilər. Bu, security misconfiguration-un klassik nümunəsidir.
4. **Metod manipulyasiyası** — bəzən `DELETE`-i auth yoxlamasından keçmək üçün `_method=DELETE` parametri ilə əvəz etmək mümkündür.

İdle test nümunəsi — OPTIONS sorğusu:

```bash
curl -X OPTIONS -v http://10.10.10.5/
```

Cavabda `Allow: GET, POST, HEAD, OPTIONS` kimi sətir görülür. Sadə saytlar üçün bu normaldır; `PUT` və ya `TRACE` görünsə — qeyd edib araşdırmağa dəyər (TRACE — XST hücumu ilə tarixən əlaqələnir).

REST API-lərdə metodlar semantik rol daşıyır: `GET /users/5` — oxu, `PUT /users/5` — yenilə, `DELETE /users/5` — sil. Burada vacib məqam: **auth yoxlaması hər metod üçün ayrıca edilməlidir**. Adi istifadəçi `GET /admin`-ə 403 alırsa, `POST /admin` və ya `DELETE`-də də 403 almalıdır — keçilməyən metod qalmamalıdır.

**Sual 1**
GET və POST-un əsas fərqlərini (parametrlərin yeri daxil olmaqla) izah edin.

**Sual 2**
OPTIONS metodu pentest-də hansı məlumatı verir?

**Sual 3**
PUT metodunun zəif konfiqurasiyada hansı risk yaratdığını izah edin.

## Task 3 — Header-lər: Sorğunun "Meta-Məlumatı"

Header-lər — request və response-un parametrləridir: kim göndərir, nə gözləyir, nə qəbul edir. Onlar zəiflik aşkarlamanın həm mənbəyi, həm də hədəfidir.

Əsas request header-ləri:

| Header | Mənası | Pentest əhəmiyyəti |
|---|---|---|
| `Host` | Hansı sayt (virtual hosting) | Vhost enumeration |
| `User-Agent` | Client proqramı | Log poisoning, bypass |
| `Cookie` | Sessiya məlumatı | Session hücumları |
| `Authorization` | Credential (Basic/Bearer) | Token oğurluğu hədəfi |
| `Referer` | Hansı səhifədən gəldi | CSRF, açıq URL-lər |
| `Content-Type` | Body formatı | İstismar üçün vacib (upload bypass) |

Əsas response header-ləri və təhlükəsizlik əlaqələri:

- **`Set-Cookie`** — server cookie verir. Burada `HttpOnly` (JavaScript-in cookie-ni oxumasını qadağan edir — XSS-dən qoruyur) və `Secure` (yalnız HTTPS-də göndər) flag-ləri axtarılır. Yoxdursa — tapıntı.
- **`Content-Security-Policy` (CSP)** — hansı mənbələrdən skript yüklənə bilər. Zəif/olmayan CSP — XSS istismarını asanlaşdırır.
- **`X-Frame-Options`** — clickjacking-dən qoruyur.
- **`Access-Control-Allow-Origin`** — CORS. Səhv konfiqurasiya (`*` + credential) — məlumat oğurluğu.
- **`Strict-Transport-Security` (HSTS)** — HTTPS məcburlaşdırır.

Header-ləri yoxlamaq üçün sadə yoxlama:

```bash
curl -I http://10.10.10.5
```

Bu, yalnız header-ləri qaytarır (`-I` = HEAD sorğusu). Burada security header-lərin olmaması özü-özünə "critic" olmasa da, hesabatda qeyd olunur və attack surface-i genişləndirir.

Bir vacib konsept: **header-lər istifadəçi tərəfindən dəyişdirilə bilər.** Client-in göndərdiyi hər şey — User-Agent, Referer, Cookie, hətta `X-Forwarded-For` — server üçün "etibarsız input"dur. Tətbiq `X-Forwarded-For`-a əsaslanaraq IP yoxlaması edirsə, bu header-in saxtalaşdırılması bypass verir. "Client-a etibar etmə" prinsipi — bütün web təhlükəsizliyinin təməl qaydasıdır.

**Sual 1**
`Set-Cookie` header-indəki `HttpOnly` və `Secure` flag-ləri nədən qoruyur?

**Sual 2**
Hansı security header-lərin olmaması hesabatda qeyd olunur (üç nümunə)?

**Sual 3**
"Header-lər istifadəçi tərəfindən dəyişdirilə bilər" ifadəsi hansı təhlükəsizlik prinsipinə gedib çıxır?

## Task 4 — Cookie və Session Mexanizmi

HTTP "stateless" protokoldur — hər sorğu müstəqildir, server əvvəlki sorğunu xatırlamır. Buna baxmayaraq sayt sizi "xatırlayır" — bunu **session** mexanizmi həll edir.

İşləmə axını:

1. İstifadəçi login edir (POST /login).
2. Server credential-ları yoxlayır, sessiya yaradır (server tərəfdə məlumat saxlayır) və unikal `session ID` qaytarır — `Set-Cookie: PHPSESSID=abc123...` sətri ilə.
3. Browser bu cookie-ni saxlayır və bundan sonra **hər sorğu ilə** göndərir: `Cookie: PHPSESSID=abc123...`
4. Server gələn ID-yə baxıb kimin kim olduğunu müəyyən edir.

Kritik nəticə: **sessiya ID = istifadəçinin kimliyi.** Şifrəni bilmək lazım deyil — sessiya cookie-sini əldə etmək kifayətdir. Buna görə sessiya hücumları mövcuddur:

- **Session hijacking** — başqasının cookie-sini oğurlayıb öz browser-inə qoymaq. Oğurluq yolları: XSS (cookie `HttpOnly` deyilsə), şəbəkə sniffing (HTTP-də cookie açıq gedir), log-lardan.
- **Session fixation** — attacker qurbanın cookie-sini əvvəlcədən təyin edir (məs. link ilə), qurban login edir, attacker həmin cookie ilə daxil olur. Qorunma: login-dən sonra sessiya ID yenilənməlidir.
- **Zəif sessiya ID-lər** — proqnozlaşdırıla bilən və ya qısa ID-lər brute-force edilə bilər.

Sessiya tokeninin keyfiyyət meyarları: uzun olmalı (128+ bit entropy), random olmalı, login/logout ətrafında yenilənməli, cookie attribute-ları düzgün olmalıdır (`HttpOnly`, `Secure`, `SameSite`).

**SameSite** attribute-u daha yeni qorunma təbəqəsidir: `Strict` və ya `Lax` dəyərləri cookie-nin digər saytlardan gələn sorğularla göndərilməsini məhdudlaşdırır — bu, CSRF-ə qarşı təbii müdafiədir (CSRF room-da bunun ətraflısını görəcəyik).

Pentest-də cookie-lərin yoxlanılacaq tərəfləri: token formatı (təxminən hardansa — serial, timestamp?), logout-dan sonra köhnə cookie ilə giriş işləyirmi, `HttpOnly`/`Secure` varmı, bir hesabdan çox sessiya yaratmaq mümkündürmü. Bunlar hamısı authentication təhlükəsizliyinin əsasını təşkil edir.

**Sual 1**
HTTP-nin stateless olmasına baxmayaraq saytın istifadəçini necə "xatırladığını" izah edin.

**Sual 2**
Session hijacking nədir və hansı yollarla həyata keçirilir?

**Sual 3**
`SameSite` attribute-u hansı hücum növünə qarşı qoruma yaradır?

## Task 5 — HTTPS və TLS: Şifrələmə Təbəqəsi

HTTPS = HTTP + TLS (Transport Layer Security). HTTP-nin özü şifrələməmir — şəbəkədə oxunan mətn kimi gedir. TLS bu trafiki şifrələyir və server-in kimliyini sübut edir.

**TLS handshake (sadələşdirilmiş):**

1. Client server-ə qoşulur və "hello" göndərir — dəstəklədiyi şifrələmə alqoritmləri (cipher suite-lər) ilə.
2. Server **certificate** (sertifikat) göndərir — öz public key-i və kimliyi ilə.
3. Client sertifikatın etibarlılığını yoxlayır: onu imzalayan CA (Certificate Authority) etibarlıdırmı? Domain uyğundurmu? Vaxtı keçməyibmi?
4. Tərəflər session key-i razılaşdırır (asimmetrik şifrələmə ilə mübadilə, sonra simmetrik açarla davam).
5. Artıq bütün HTTP trafiki bu simmetrik açarla şifrələnir.

Nəticədə şəbəkədəki attacker (məs. eyni Wi-Fi-dakı) yalnız şifrələnmiş məlumat görür — cookie-lər, parollar, məzmun gizli qalır.

Pentest baxımından kritik anlar:

- **Mixed content** — HTTPS səhifədə HTTP-dən yüklənən resurslar (skript, şəkil). Bu resurslar manipulyasiya oluna bilər və səhifənin təhlükəsizliyini zəiflədir.
- **Etibarsız sertifikat** — browser xəbərdarlığı göstərəndə istifadəçinin "Proceed" vurması mitm hücumuna qapı açır.
- **SSL/TLS zəif versiyalar** — köhnə TLS 1.0/1.1, zəif cipher-lər (export, RC4) hesabatda tapıntıdır.
- **HSTS-un olmaması** — istifadəçi ilk dəfə HTTP ilə qoşulanda downgrade/redirect hücumu mümkündür.

TLS-i yoxlamaq üçün:

```bash
openssl s_client -connect 10.10.10.5:443
```

Çıxışda sertifikat məlumatı (kim, hansı vaxta qədər, hansı CA), dəstəklənən versiya görünür. Testpage saytlarında (məs. ssllabs) bu avtomatik analiz olunur.

Buradan web hacking kontekstinə əsas mesaj: HTTPS şifrələmə **məxfilik** verir, amma **tətbiq təhlükəsizliyi** vermir. SQLi, XSS, IDOR — hamısı HTTPS altında da eynilə işləyir, çünki onlar tətbiq məntiqindəki xətalardır, şəbəkədəki dinləmədən yox. "Saytımızda HTTPS var, təhlükəsizik" — ən çox rast gəlinən səhv təsəvvürlərdən biridir.

**Sual 1**
TLS handshake-də sertifikatın rolu nədir və client onda nəyi yoxlayır?

**Sual 2**
Mixed content nədir və hansı risk yaradır?

**Sual 3**
HTTPS-in tətbiq səviyyəli zəiflikləri (SQLi, XSS) qarşısını niyə almır?
