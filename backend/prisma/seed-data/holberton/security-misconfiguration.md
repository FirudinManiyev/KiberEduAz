# Room: Security Misconfiguration

**Path:** Web Application Hacking
**Module:** OWASP Top 10
**Çətinlik:** Easy
**Təxmini vaxt:** 1 saat

## Room haqqında

Ən təmiz kod belə yanlış konfiqurasiya üzərində işləsə, qapılar açıq qalır: default parollar, debug rejimləri, lazımsız servislər, icazəsiz cloud bucket-lər. Bu room-da security misconfiguration-un ən yayğın formalarını — default credential-lar, açıq debug, lazımsız açıq servislər və düzgün konfiqurasiya idarəetməsini öyrənəcəksiniz. Bu zəifliklər "exploit yazmaq" tələb etmir — sadəcə diqqətli baxmaq.

## Öyrənmə nəticələri

- Default credential-ların riskini və yoxlama metodunu bilmək
- Açıq debug rejimlərinin hansı məlumatları sızdırdığını izah etmək
- Lazımsız açıq servislərin və directory listing-in hücum səthinə təsirini qiymətləndirmək
- Düzgün konfiqurasiya praktikalarını (hardening, environment ayrımı) sadalamaq

## Task 1 — Default Credential-lar: "Quraşdır, İşlət, Unut"

Hər hazır sistem — admin paneli, database, router, CMS — quraşdırılarkən ilkin credential-lar gətirir: `admin:admin`, `root:boş`, `admin:password`. Bu cütlüklər istehsalçı sənədlərində, DefaultCreds cheat-sheet-lərdə, search engine-lərdə hamıya açıqdır. Problem: sistemlərin əhəmiyyətli hissəsi quraşdırıldığı kimi qalır.

Klassik mənzərə: şirkətdə yeni tətbiq qurulur → inzibatçı panel açıq qalır (`/admin`) → default parol dəyişilmir → aylar sonra hər kəs, internetdən `admin:admin` ilə daxil olur.

Yoxlama axını (pentest-də):

1. **Panel aşkarlama:** enumeration zamanı `/admin`, `/manager` (Tomcat), `/phpmyadmin`, `:8080` portu (Jenkins/Tomcat management) kimi yerlər qeydə alınır.
2. **Default cütlük sınağı:** bir neçə bilinən kombinasiya (admin:admin, admin:password, root:root) — amma rate limit nəzərə alınmaqla.
3. **Məhsul + versiya əsaslı axtarış:** banner-də "Apache Tomcat 9" görünüşü → Tomcat-in default credential məntiqi (tomcat-users.xml) araşdırılır.

Default credential anlayışı təkcə parollar deyil: default API açarları (AWS `AKIA...` pattern-ləri), default community string-lər (SNMP `public`), default token-lər. Cloud dünyasında buna bənzər qohum: **açıq qalan cloud storage** — public S3 bucket, autentifikasiyasız MongoDB/Redis (tarixən böyük data sızmaları məhz bunlarla olub).

Müdafiə sadə və sistemlidir:

- Quraşdırma zamanı ilk giriş məcburi parol dəyişməsinə gətirilməli (müasir sistemlər edir).
- Deployment checklist-lərində "default credential dəyişildi" addımı olmalıdır.
- İnternal alətlər (phpMyAdmin, Redis) internetə açıq olmamalı — yalnız localhost/internal network.
- Secret-lər kodda/git-də yox, idarəetmə sistemlərində (secret manager) saxlanmalıdır.

Bir əlaqəli qeyd: default credential tapıntısı adətən **Critical** qiymətləndirilir, çünki bir addımda tam idarəetmə (admin access) verir — aradakı bütün mərhələləri (recon → enumeration → exploitation) sıçrayışla keçir.

**Sual 1**
Default credential riski niyə bu qədər yüksək qiymətləndirilir?

**Sual 2.**
Cloud dünyasında default credential-a bənzər hansı problemlər var?

**Sual 3.**
Müdafiə üçün hansı üç tədbir sadalaya bilərsiniz?

## Task 2 — Açıq Debug Rejimləri və Error Handling

Tərtibatçılar xəta ayıqlayarkən tətbiqi "verbose" rejimə keçirirlər: tam stack trace, daxili yollar, SQL sorğuları, environment dəyişənləri. Debug rejimi production-da qalırsa — bu, hücumçuya pulsuz kəşfiyyat olur.

Nümunə — zəif tətbiqdə olmayan səhifə açılanda cavab:

```
Traceback (most recent call last):
  File "/var/www/app/views.py", line 45, in get_order
    order = Order.objects.get(id=request.GET['id'])
  File "/usr/lib/python3/dist-packages/django/db/models/manager.py", ...
Exception Type: DoesNotExist at /order
```

Bu bir ekranda nələr var: **texnologiya stack-i** (Python/Django + dəqiq versiya izləri), **fayl sistemi strukturu** (`/var/www/app/`), **framework internal-ları**, bəzən **DATABASE_URL və secret-lər** (bəzi debug səhifələri — Django-nun debug page-i environment dəyişənlərini göstərmir, amma bir çox custom debug çapları göstərir).

Başqa formalar:

- **Verbose SQL xətaları** — SQLi room-da gördük: DB növü, bəzən sorğu fraqmenti.
- **Stack trace-in JS-də** — frontend xətaları source map-lərlə birlikdə minify-ın altındakı kodu açır.
- **`X-Powered-By`, `Server:` header-ləri** — texnologiya elanı (aşağı risk, amma recon-a kömək).
- **Debug endpoint-lər** — `/debug`, `/actuator` (Spring Boot — env, heapdump, credential-ları göstərə bilər), `/trace`. Spring Boot Actuator-un açıq `heapdump`-u real hadisələrdə parolları üzə çıxarıb.

Risk dəyəri: debug çıxışları özü-özünə "giriş" vermir, amma **hücum planını hazırlayır** — daxili struktur, texnologiya versiyaları (CVE axtarışı üçün), secret-lər (birbaşa giriş). Buna görə severity.contextdən asılıdır: stack trace — Low/Informational; secret sızan debug endpoint — Critical.

Müdafiə:

- Environment ayrımı: development-də debug var, production-da məcburi off (framework-lərdə `DEBUG=False`, `NODE_ENV=production`).
- Global error handler: istifadəçiyə ümumi səhifə ("Xəta baş verdi, ID: xyz"), detal yalnız log-da (log-lar server-də, monitorinqdə).
- Deployment pipeline-da debug flag yoxlanışı (avtomatik test).
- Gereksiz aktuator/debug route-lar production-da söndürülməli.

**Sual 1**
Debug stack trace hansı üç məlumat kateqoriyasını sızdırır?

**Sual 2.**
Spring Boot Actuator nə üçün təhlükəli ola bilər?

**Sual 3.**
Düzgün error handling praktikası necə görünür?

## Task 3 — Lazımsız Açıq Servislər və Features

Prinsip: **işləməyən hər şey — hücum səthidir.** Amma real sistemlərdə tez-tez əksinə olur: "bəlkə lazım olar" deyə Everything açıq qalır.

Klassik nümunələr:

1. **Directory listing açıqdır.** Web server qovluğu siyahısını göstərir: `/backup/` açılanda bütün fayllar görünür — `.sql` dump, `.zip` arxiv, `.env` faylı. Axtarış alətlərinin (gobuster) tapa bilmədiyi gizli faylları server özü elan edir.
2. **Backup və köhnə fayllar.** `index.php.bak`, `web.config.old`, `.git/` qovluğu production-da. `.git` açıqdırsa — bütün source code tarixi ilə endirilə bilir (alətlər: git-dumper); `.env` faylında DB parolları, API açarları.
3. **Köhnə/test subdomain-lər.** `test.example.com`, `dev.example.com` — passiv recon (crt.sh) onları tapır; onlarda production-dan zəif test versiyaları, saxta data-lar, açıq panellər olur.
4. **Lazımsız HTTP metodları.** OPTIONS-da PUT, TRACE görünürsə — fayl yazma/məlumat əks etmə imkanları.
5. **Administration interfeysləri external.** Management portları (Tomcat manager, Jenkins, IPMI) internetə baxmalı deyil — yalnız VPN/internal.
6. **Sample/test səhifələr.** Quraşdırma ilə gələn nümunə səhifələr (`/examples/`, test.php) — bəziləri RCE verir.

Bu kateqoriyanın ortaq cəhdi: heç biri "exploit" deyil — **aradakı qapıların sayı artır**. Hər açıq qapı özü kiçik risk daşıyır və bir çoxu birgə böyük şəkil yaradır (məs.: directory listing + backup faylı = source code + parollar).

Cloud/davamlı deployment dövrünün yeni üzvləri: açıq qalan CI/CD panelləri, exposed Docker API (2375 — host-da root RCE deməkdir), konfiqurasiyasız obyekt storage-lər. Şablon eynidir: quraşdırıldı → default → unuduldu.

Müdafiə — konfiqurasiya gigiyenası:

- Quraşdırma-time minimallaşdırma: yalnız lazımi modullar, sample-lər silinir.
- Web serverdə directory listing off; backup faylların pattern-ləri deployment-də avtomatik silinir.
- `.git`, `.env` kimi həssas fayllara web-dən çıxış qadağası (nginx `location ~ /\. { deny all; }`).
- Attack surface review — hər böyük deploy-dan əvvəl "nə açıqdır?" audit-i.

**Sual 1**
Directory listing hansı halda təhlükəli məlumata gətirir?

**Sual 2.**
Production-da qalan `.git` qovluğu nə verir?

**Sual 3.**
"İşləməyən hər şey hücum səthidir" prinsipini iki nümunə ilə izah edin.

## Task 4 — Düzgün Konfiqurasiya İdarəetməsi: Sistemli Yanaşma

Yuxarıdakı problemlərin kökündə bir prosesual xəstəlik var: konfiqurasiya **vaxt keçdikcə dağılır** (configuration drift). Server qurulanda təhlükəsiz idi; iki il ərzində patch-lər tətbiq olundu, debug açıldı, test üçün port açıldı, heç kim bağlamadı. Buna görə müdafiə — bir dəfəlik hərəkət yox, idarəetmə sistemi qurmaqdır.

**Hardening checklist-lər.** Hər texnologiya üçün sənələşdirilmiş minimum təhlükəsizlik konfiqurasiyası: CIS Benchmarks (OS, server, database üçün), vendor-un öz security guide-ları. Quraşdırmadan sonra yoxlanılır: lazımsız servis söndürülüb, default dəyişilib, logging açılıb.

**Environment ayrımı.** Development / Test / Staging / Production — fərqli mühitlər, fərqli secret-lər, fərqli çıxış səviyyələri. Ən çox görülən tənzimsizliklərdən biri: production-a inkişaf mühitinin konfiqurasiyasının (debug=on, saxta auth) köçürülməsi. Bunun qarşısı infrastructure-as-code ilə alınır: konfiqurasiya faylları mühitə görə parametrlənir.

**Infrastructure as Code (IaC) və version control.** Server-lər əl ilə yox, kodla (Ansible, Terraform) qurulur: hər dəyişiklik review olunur, audit izi qalır, "necə qurulub" sualının cavabı bir yerdədir. Drift avtomatik yoxlanıla bilər.

**Automatik skanlar.** Konfiqurasiya yoxlamaları davamlı olaraq: Docker image skanları, cloud konfiqurasiya auditləri (məs. exposed bucket-a qarşı), SSL/TLS yoxlaması, security header mövcudluğu. Bu, sonrakı module-larda görəcəyimiz vulnerability assessment-in bir parçasıdır.

**Secret management.** Parollar/açarlar kodda, konfiqurasiya fayllarında, environment-də səpələnməməli: HashiCorp Vault, cloud secret manager-lər, minimum — fayl sisteminin gizli, encrypt olunmuş yeri. Development üçün saxta secret-lər, production üçün real — qarışmaması üçün aydın ayrılıq.

Pentest tərəfindən baxanda: security misconfiguration tapıntılarının çoxu **skanerdən yox, diqqətli enumeration-dan** çıxır — headers, davranış, qovluqlar, portlar. Bu room-da öyrənilən göz — "normal olmayan nə var?" sualı — ən dəyərli alətdir. Yaxşı pentester fərqi görür: Listing varmı, xəta mesajı çoxdanimı, yönləndirmə qəribədirmi.

**Sual 1**
Configuration drift nədir və niyə qaçınılmazdır?

**Sual 2.**
Environment ayrımının məqsədi nədir və ən çox görülən pozuntusu hansıdır?

**Sual 3.**
Secret management-in düzgün praktikasını izah edin.

## Task 5 — Bütün Bunlar Birlikdə: Skenarli Nümunə

Qısa ssenari ilə module-un mövzularını bir araya yığaq (lab-məntiqli, reallıqdan tanışan): hədəf — `http://10.10.10.60`.

**Səhnə 1 — Recon:** Nmap: 80 (HTTP), 8080 (HTTP-alternativ), 3306 (MySQL external!). Gobuster: `/admin`, `/backup/` (directory listing açıqdır), `.git/` qovluğu.

**Səhnə 2 — Misconfiguration tapıntıları sırayla:**

1. `/backup/` listing-də `db_dump.sql` və `app.config.bak` — ikincisində DB parolu: `root:Str0ngP@ss` (production parolu backup-da plaintext).
2. `.git/` — git-dumper ilə source: tətbiq Django, `settings.py`-də `DEBUG = True` production-da. Xəta səhifələri tam stack trace + environment verir.
3. Port 3306 xaricə açıqdır — tapılan parolla birbaşa qoşulmaq mümkündür (external DB = konfiqurasiya xətası ayrıca).
4. `:8080`-də Tomcat manager, `tomcat:s3cret` default credential işləyir — WAR yerləşdirmə ilə server-də kod icrası.

**Nəticə:** heç bir "0-day" yox idi — dörd ayrı-ayrı kiçik konfiqurasiya xətası zənciri RCE-yə gətirdi. Bu, security misconfiguration-un dərsidir: **zəifliklər toplanır.**

Hesabatda hər tapıntı ayrıca sənədləşir (yol + sübut + severity + remediation), amma "zəncir" də ayrıca göstərilir — client üçün əsas dərslərdən biri məhz birləşmə təsiridir: tək-tək "informational" görünən tapıntılar birgə kritik nəticə verir.

Yekun: bu room-da öyrənilənlər — default credential-lar, debug sızıntıları, lazımsız açıq şeylər, konfiqurasiya idarəetməsi — hamısı eyni kökdən qidalanır: **təhlükəsizlik quraşdırmanın sonrası deyil, prosesin özüdür.** Növbəti OWASP room-larında kod səviyyəli zəifliklərə qayıdacağıq, amma unutmayın: kod təmiz, konfiqurasiya kirli olanda — qapı yenə açıqdır.

**Sual 1**
Ssenaridə dörd ayrı tapıntı hansı ardıcıllıqla zəncirə çevrildi?

**Sual 2.**
"Zəifliklər toplanır" nə deməkdir və hesabatda necə əks olunur?

**Sual 3.**
Ssenarinin hansı addımı kod zəifliyi yox, təmizən konfiqurasiya xətası idi?
