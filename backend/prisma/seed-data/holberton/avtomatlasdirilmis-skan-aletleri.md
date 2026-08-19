# Room: Avtomatlaşdırılmış Skan Alətləri

**Path:** Web Application Hacking
**Module:** Web Exploitation Alətləri
**Çətinlik:** Easy
**Təxmini vaxt:** 1.5 saat

## Room haqqında

Avtomatik skanerlər — DAST (Dynamic Application Security Testing) alətləri — tətbiqi minlərlə avtomatik sorğu ilə yoxlayıb bilinən zəiflik pattern-lərini axtarır. Bu room-da OWASP ZAP-ın əsas funksiyaları, avtomatik skanın üstünlük və məhdudiyyətləri və manual testlə birgə istifadəsinin niyə vacib olduğu öyrənilir. Əsas dərs: skaner güclü başlanğıcdır, amma heç vaxt kifayət deyil.

## Öyrənmə nəticələri

- OWASP ZAP-ın əsas funksiyalarını (spider, active scan, proxy) tanımaq
- Avtomatik skanın üstünlüklərini və real dəyərini müəyyən etmək
- Skanerin məhdudiyyətlərini (business logic, blind zones, false positives) izah etmək
- Skan + manual test kombinasiyasının düzgün metodologiyasını qurmaq

## Task 1 — OWASP ZAP: Pulsuz Açıq Mənbəli DAST

**OWASP ZAP (Zed Attack Proxy)** — OWASP-ın dəstəklədiyi, pulsuz, açıq mənbəli web tətbiq skaneridir. Burp Suite kimi proxy əsaslıdır, amma güclü daxili avtomatik skan funksiyaları ilə gəlir.

ZAP-ın əsas komponentləri:

- **Proxy:** Burp kimi trafik tutur — browser-i ona yönləndirib tətbiqi gəzirsiniz.
- **Spider (traditional/AJAX):** saytın link-lərini izləyib səth xəritəsini çıxarır (content discovery).
- **Active Scan:** tapılmış nöqtələrə avtomatik zəiflik testləri göndərir (SQLi, XSS pattern-ləri, header yoxlamaları...).
- **Passive Scan:** trafiki heç nə göndərmədən analiz edir (header-lər, form-lar, cookie attribute-ları) — təhlükəsiz tərəf.
- **Alerts:** tapıntılar siyahısı — risk səviyyəsi, yer, sübut ilə.
- **Report:** tapıntıların HTML/PDF/MD hesabatı.

ZAP-da tipik ilk iş axını (Quick Start):

1. ZAP-ı başladın, browser-i proxy-yə yönəldin (default `127.0.0.1:8080`, Burp işləmirsa).
2. **Manual explore:** tətbiqdə gəzin — login olun, form-ları açın. ZAP trafiki qeyd edir, passive scan işləyir, sessiya konteksti yaranır (authenticated scanning üçün vacib!).
3. **Spider:** səthi avtomatik gəzdirin.
4. **Active Scan:** hədəf URL-lər üzrə başladın.
5. **Alerts-in təhlili:** hər tapıntını sübutu ilə yoxlayın (növbəti task-lar).

Burp ilə müqayisə: ZAP pulsuzdur və skaner daxildir (Burp-da scanner yalnız Pro-da); Burp isə manual test axınında (Repeater gücü, extension ekosistemi) daha yetkindir. Peşəkar real combo: ZAP sürətli skan üçün, Burp dərin manual test üçün — amma öyrənmə mərhələsində ZAP tək başına da tam dərs kifayətidir.

**Sual 1**
ZAP-ın Passive və Active Scan fərqi nədir?

**Sual 2.**
Authenticated skan üçün "manual explore" addımı nə üçün vacibdir?

**Sual 3.**
ZAP və Burp Suite-in birgə istifadə rolunu izah edin.

## Task 2 — Avtomatik Skanın Gücü: Sürət və Örtük

Avtomatik skanerlərin real dəyəri üç yerə toplanır:

**1. Səth örtüyü (coverage).** Skaner minlərlə parametri, header-i, cookie-ni yoxlayır — insanın əl ilə bütün nöqtələri xatırlaması mümkün deyil. "Hər form-da hər növdən test" — skaner üçün trivial, insan üçün günlər.

**2. Bilinən pattern-lərin sürətli tapılması.** SQL error pattern-i, reflected input, missing header-lər, köhnə library versiyaları — skaner imza və davranış bazaları ilə bunları avtomatik tanıyır. Xüsusilə təkrarlanan zəifliklər (eyni xəta 20 form-da) skaner üçün asan tapıntıdır.

**3. Regression/davamlılıq.** CI/CD pipeline-na qoşulmuş DAST hər release-də avtomatik yoxlama edir — yeni dəyişiklik köhnə zəifliyi qaytarmadığını davamlı təsdiqləyir. Bu, "bir dəfə pentest, əbədi təhlükəsizlik" yanlış modelini aradan qaldırır.

ZAP Active Scan-in əhatə etdiyi əsas ailələr (siyahı konseptual): SQL injection pattern-ləri, XSS (reflected), path traversal, header təhlükəsizliyi (CSP, HSTS...), cookie attribute-ları, directory listing/backup fayllar (fuzzing), external redirect, TLS konfiqurasiya (passive), vulnerability qeydləri (server versiyalarına görə).

Praktik nümunə — ZAP-la quick scan (CLI, tez üçün):

```bash
zap-baseline.py -t http://10.10.10.5
```

Baseline scan — yalnız passive (hücum etmədən), ən sürətli ilk baxış. Tam active scan isə GUI-də və ya `zap-full-scan.py` ilə — amma yalnız icazəli hədəfdə!

CI/CD inteqrasiyası da ZAP-ın güclü tərəfidir: Docker image-ləri, pipeline addımları kimi hazır formalar. "Hər deploy-da avtomatik DAST" — DevSecOps-un standart praktikasına çevrilir.

Yekun güc formulu: skaner = **sürət × təkrarlananlıq × davamlılıq**. Bu üçüsü insanın zəif tərəfləridir — buna görə skaner peşəkar prosesdə yerini tutub. Amma... növbəti task-da "amma" var.

**Sual 1**
Avtomatik skanın üç əsas dəyəri nədir?

**Sual 2.**
Baseline scan nə ilə fərqlənir?

**Sual 3.**
DAST-ın CI/CD-də rolu nə deməkdir?

## Task 3 — Məhdudiyyətlər: Skaner Bilmədikləri

Skanerin edə bilmədikləri — bu task peşəkar anlayışın əsasıdır.

**1. Business logic zəiflikləri.** "100 AZN-liq məhsulu -50 AZN-ə satın almaq", "kuponu 1000 dəfə istifadə", "checkout addımlarını ötürmək" — bu zəifliklər tətbiqin **mənasından** asılıdır. Skaner tətbiqin məqsədini bilmir; o, yalnız texniki pattern görür. Business logic testi — daima insan işidir.

**2. Multi-step ssenarilər.** Skaner bir sorğunu sınayır; amma bir çox zəiflik sorğular zəncirində yaşayır: "1-ci addımda token al, 2-ci addımda onu dəyişdirilmiş formada göndər". Wizard-lər, multi-page form-lar — skanerin kor zonaları.

**3. IDOR və access control.** Skaner "iki istifadəçi kontekstində müqayisə" apara bilmir (bəzi xüsusi konfiqurasiyalar istisna olmaqla). Kimin nəyə icazəsi var — domain biliyi tələb edir.

**4. Stored zəifliklərin bir hissəsi.** Yüklənən payload yalnız admin baxışında partlayırsa, skaner onu heç vaxt görmür.

**5. False positives/negatives.** Skaner "SQL error-a bənzər mətn" görüb SQLi bildirir (false positive — yanlış xəbərdarlıq), və ya yeni/ekzotik zəifliyi tanımır (false negative — buraxılmış tapıntı). Hər alert — təsdiq tələb edir.

**6. Authentifikasiya kompleksliyi.** MFA, captcha, anti-bot — skaneri yolundan salır. Həddindən artıq login cəhdi hesabları kilidləyə bilər (skaner "parol sınağı" kimi görünür).

**7. Qiymətləndirmə konteksti.** Skaner severity-ni texniki pattern-ə görə verir; real təsir (bu məlumat bu şirkət üçün nə deməkdir) — insanın qiymətləndirməsidir.

Bütün bunların nəticəsi — **sırf skaner əsaslı pentest yoxdur.** OWASP-un özü (WSTG — Web Security Testing Guide) manual testiq metodologiyasıdır; skanerlər orada " yardımçı alət" kimi yer alır. Real sifarişlərdə "sadəcə skaner hesabatı" göndərən "pentest firmaları" professional minimumdan kənar sayılır.

**Sual 1**
Business logic zəiflikləri nə üçün yalnız insan tapır?

**Sual 2.**
False positive və false negative nə deməkdir?

**Sual 3.**
Skaner access control zəifliklərini (IDOR) niyə buraxır?

## Task 4 — Düzgün Kombinasiya: Skan + Manual Metodologiya

Skaner və manual testin düzgün kombinasiyası — hər birinin güclü tərəfini işə salır.

**Addım 1 — Kəşfiyyat (manual + skaner birgə):** ZAP proxy kimi, tətbiqi manual gəzin (login, form-lar, API) — tarixçə həm insan, həm spider üçün səth xəritəsi qurur. Bura hələ hücum deyil.

**Addım 2 — Avtomatik pasiv mərhələ:** Passive scan + baseline: header-lər, cookie attribute-ları, texnologiya aşkarlama. Risksiz, sürətli, "asan ucalar" (low-hanging fruit) siyahısı.

**Addım 3 — Manual dərin test:** Əvvəlki module-larda öyrənilənlər Burp ilə: hər canlı nöqtə üzrə kontekst analizi (SQLi, XSS, IDOR, CSRF, upload). Business logic ssenariləri (qiymət, axın, limit testləri). Burada insan beyni skanerin bilmədiklərini edir.

**Addım 4 — Hədəfli avtomatiklaşdırma:** Əl ilə zəiflik aşkarlanan parametrlərdə variation-lar (Intruder ilə), geniş enumeration (user ID seriyası) — yalnız artıq "canlı" bilinən nöqtələrdə.

**Addım 5 — Full active scan (seçici):** Bütün tətbiq üzrə ZAP/Burp Scanner —Regression təsəvvürü və əskik normalar üçün. Lab/rozı razılaşma ilə.

**Addım 6 — Tapıntıların təsdiqi:** Hər alert manual yoxlanılır: sübut request/response, real istismar mümkünlüyü, severity düzəlişi. False positive-lər silinir — hesabata keçmir.

Bu metodologiyanın əsas qanunu: **skaner "nəhəng gözlər", insan "dərin beyin".** Skanerin tapıntıları başlanğıc hipotezlərdir; onları doğrulamaq, dərinləşdirmək və kontekstləşdirmək insan işidir.

Nəticənin hesabata təsiri də vacibdir: "Skaner 47 alert verdi" — hesabat deyil. Hesabat — təsdiqlənmiş, kontekstləşdirilmiş, remediation-lu tapıntılar toplusudur. Tool output ≠ pentest report — bu fərq client qarşısında professional etibarın əsasıdır.

**Sual 1**
Altı addımlıq kombinə metodologiyanın məntiqi nədir?

**Sual 2.**
"Hədəqli avtomatiklaşdırma" nə deməkdir və nə üçün tam skandan əvvəl gəlir?

**Sual 3.**
"Tool output ≠ pentest report" nəyi ifadə edir?

## Task 5 — Praktika və Module Yekunu

Praktik məşq (öz lab mühitinizdə — məs. OWASP Juice Shop və ya DVWA):

1. **Quraşdır:** Juice Shop (`docker run --rm -p 3000:3000 bkimminich/juice-shop`) — bilinən zəifliklərlə dolu qanuni hədəf.
2. **ZAP ilə gəz:** Proxy qurul, manual explore (ana səhifə, login, məhsullar, sebet).
3. **Spider + Passive:** səth xəritəsi, ilk alert-lər (header-lər, cookie-lər).
4. **Active Scan:** Juice Shop üzrə (öz lab-ındadır — icazə var).
5. **Alertlərin təhlili:** hansıları realdır? Hansıları business logicdir ki, skaner görmür (məs. Juice Shop-dəki skor manipulyasiyası)?
6. **Burp ilə dərinləş:** skanerin tapdığı bir reflected XSS-i Repeater-da kontekst ilə təsdiq et; skanerin tapa bilmədiyi bir IDOR-u əl ilə tap.

Bu məşqin dərsi: **eyni tətbiqdə skaner və insan fərqli tapıntılar verir** — və tam mənzərə ikisinin birləşməsidir.

Module-un yekun xəritəsi (Web Exploitation Alətləri):

- **Burp Suite** — manual testin mərkəzi: Proxy, Intercept, Repeater (dərin manipulyasiya).
- **ZAP** — pulsuz DAST: spider, passive/active scan, CI/CD inteqrasiyası.
- **Kombinasiya prinsipi** — skaner genişlik, insan dərinlik; alert-lər hipotez, insan təsdiq.

Path-in bütün gedişi ilə əlaqə: Web Application Hacking mövzusunda HTTP əsaslarından OWASP zəifliklərinə və alətlərə qədər bütöv dövr tamamlandı. Növbəti path — Network & Infrastructure Security — web-in arxasındakı infrastrukturaya keçir: FTP/SMB/SSH istismarı, Metasploit, zəiflik skanlaması. Web-də öyrənilən hər anlayış (recon, enumeration, exploit, müdafiə) orada da davam edəcək — sadəcə səth dəyişir.

**Sual 1**
Juice Shop məşqində skaner ilə insanın fərqli tapıntıları nəyi göstərir?

**Sual 2.**
ZAP-ın CI/CD-dəki rolu ilə Burp-un rolu arasındakı fərqi izah edin.

**Sual 3.**
Web module-u Network module-una hansı anlayışları ötürür?
