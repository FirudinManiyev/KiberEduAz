# Room: Servis Enumeration

**Path:** Red Team Fundamentals
**Module:** Recon & Enumeration
**Çətinlik:** Beginner
**Təxmini vaxt:** 1.5 saat

## Room haqqında

Port skanında "80/tcp open http" görmək yalnız başlanğıcdır — əsl sual odur: bu servisin arxasında nə var, hansı versiyadır, hansı konfiqurasiya xüsusiyyətləri daşıyır? Bu room-da servis enumeration-un ümumi prinsiplərini — banner grabbing, versiya aşkarlama və ən çox rast gəlinən servis-lərdən (SMB, FTP, HTTP) əlavə məlumat çıxarma texnikalarını — öyrənəcəksiniz. Recon "hansı qapılar açıqdır" sualına cavab verirdisə, enumeration "qapının arxasında nə var" sualına cavab verir.

## Öyrənmə nəticələri

- Enumeration-un recon-dan fərqini və pentest axınındakı yerini izah etmək
- Banner grabbing texnikası ilə servis məlumatı əldə etmək
- SMB, FTP və HTTP servis-lərində əlavə məlumat çıxarma üsullarını bilmək
- Hər servis üçün "hansı məlumat axtarılır" düşünmə modelini qurmaq

## Task 1 — Enumeration Nədir və Niyə Kritikdir?

Enumeration — açıq servis-lərlə "söhbət edərək" onlardan maksimum məlumat çıxarmaqdır. Recon passiv/aktiv mərhələdə portları tapırdısa, enumeration hər tapılmış portun arxasındakı servislə davamlı, məqsədli dialoq qurur: "Sən kimsən? Hansı versiyasansan? Nə təklif edirsən? Kimlərə açıqsan?"

Niyə bu qədər vacibdir? Çünki exploit-lər portlara yox, konkret servis versiyalarına və konfiqurasiyalara bağlıdır. "445 portu açıqdır" — məlumatdır. "SMBv1 işləyir" — zəiflik ehtimalıdır (EthernalBlue ailəsi). "Anonymous SMB login icazəlidir" — birbaşa istismar-yönlü tapıntıdır.

Enumeration-da axtarılan məlumat kateqoriyaları:

| Kateqoriya | Nümunə | Niyə dəyərlidir |
|---|---|---|
| Versiya/məhsul | vsftpd 2.3.4 | CVE axtarışı üçün açar |
| Konfiqurasiya | Anonymous login allowed | Birbaşa giriş imkanı |
| İstifadəçi/şəxslər | İstifadəçi adları, qruplar | Brute-force hədəfləri |
| Paylaşılan resurslar | Fayl paylaşım lining | Həssas məlumat |
| Daxili detal | Host adı, domain, MAC | AD mühiti aşkarlama |

Enumeration metodologiyasının özəyi — hər servis üçün sual siyahısı. İstənilən servis-lə rastlaşanda üç standart sual: (1) Bu nədir? (banner/versiya) (2) Nə təklif edir? (funksiyalar, paylaşım­lar) (3) Kimə icazə verir? (autentifikasiya səviyyələri).

Bir də vacib psixoloji məqam: enumeration səbir tələb edir. Yeni başlayanlar ilk port skanından dərhal exploit axtarmağa tələsirlər — bu, "həllər axtarmaqdan əvvəl problemi başa düşməmək" xəstəliyidir. Professional axın: hər açıq servisi sənədləşdir, hər birindən maksimum məlumat al, yalnız sonra istismara keç. CTF həllərində də fərq məhz buradadır: "enum, enum, enum" — community-də məşhur tövsiyədir.

Bu room-da üç ən məşhur servis (SMB, FTP, HTTP) üzrə bu modeli tətbiq edəcəyik, amma əvvəlcə hamının ortaq texnikası — banner grabbing.

**Sual 1**
Enumeration-un recon-dan fərqi nədir — hansı suallara cavab verir?

**Sual 2**
Niyə "port açıqdır" məlumatı exploit üçün kifayət etmir?

**Sual 3**
Enumeration-da axtarılan məlumat kateqoriyalarından üçünü sadalayın.

## Task 2 — Banner Grabbing: Servisin Özünü Tanıtması

Banner — servis qoşulanda özünü təqdim edən mətn parçasıdır. Köhnə günlərin internet mədəniyyətindən qalan bu vərdiş bu gün də çox servis-də yaşayır: qoşulanda versiya, məhsul və bəzən əlavə detal göndərilir.

Ən sadə banner grabbing — Netcat (`nc`) ilə:

```bash
nc 10.10.10.5 21
```

Qoşulan kimi FTP servisi cavab verir:

```
220 (vsFTPd 2.3.4)
```

Bir sətir — amma nə qədər güclü: servisin növü (vsFTPd) və dəqiq versiyası (2.3.4) artıq bilinir. (Bu konkret nümunə tarixən məşhur backdoor hadisəsi ilə tanınır — searchsploit-də bu versiyanı axtaranda nə tapacağınızı təsəvvür edin.)

Digər üsullar:

- **Nmap banner NSE script-i:** `nmap --script banner -p 21,22,80 10.10.10.5` — bir neçə portdan eyni anda banner toplayır.
- **Nmap `-sV`:** artıq tanıdığımız versiya aşkarlama da mahiyyətcə inkişaf etmiş banner grabbingdir — sadə bannerin özünü yox, sorğu-cavab "imzasını" analiz edir.
- **Telnet/openssl:** `telnet 10.10.10.5 25` (SMTP), HTTPS üçün `openssl s_client -connect 10.10.10.5:443`.

Qeyd: hər servis banner göndərmir. Modern web server-lər (və bir çox konfiqurasiyalar) banner-i gizlədir və ya dəyişdirir — bu özü də məlumatdır (admin konfiqurasiya etmiş deməkdir). Belə halda sorğu əsaslı üsullar (`-sV`, HTTP header yoxlaması) işə düşür.

HTTP üçün banner yoxlaması — raw sorğu:

```bash
nc 10.10.10.5 80
GET / HTTP/1.1
Host: 10.10.10.5

```

(sondakı boş sətir vacibdir — HTTP sorğunun bitməsini bildirir). Cavabın header hissəsində `Server: Apache/2.4.18 (Ubuntu)` və bəzən `X-Powered-By: PHP/7.0` kimi sətirlər görünür — texnologiya stack-inin ilk xəritəsi.

Banner grabbing nə verir? Exploit axtarışının açar sözünü. Növbəti addım həmişə eynidir: tapılan məhsul+versiyanı public exploit bazalarında (searchsploit, CVE databazaları) yoxlamaq. Amma diqqət: versiya köhnə olsa da, yamaqlanmış ola bilər — versiya məlumatı həmişə exploit yazısından əvvəl sınaq ilə təsdiqlənməlidir (bunu exploitation module-larında görəcəyik).

**Sual 1**
Banner nədir və nc ilə necə əldə olunur?

**Sual 2.**
Servis banner göndərmirsə, hansı alternativ üsullar işə düşür?

**Sual 3.**
`Server:` header-indən öyrənilən məlumat növbəti hansı addımla istifadə olunur?

## Task 3 — SMB Enumeration: Windows-ın "Ürəyi"

SMB (Server Message Block) — Windows şəbəkələrində fayl/printer paylaşımının əsas protokoludur, 445 portunda işləyir. Korporativ mühitlərin demək olar hamısında mövcuddur və zəif konfiqurasiyası tarixən ən məhsuldar hücum vektorlarından biri olub.

SMB-də axtarılanlar: paylaşım qovluqları (shares), istifadəçi siyahıları, versiya və konfiqurasiya xüsusiyyətləri.

Əsas alətlər:

```bash
nmap -p 445 --script smb-os-discovery 10.10.10.5
```

Bu NSE script-i OS və domain məlumatını çıxarır (hədəf Windows 10 mu, domainə üzvdürmü?).

**SMB paylaşım siyahısı — smbclient:**

```bash
smbclient -L //10.10.10.5 -N
```

`-L` = siyahı, `-N` = null sessiya (parolsuz). Nəticədə paylaşım adları görünür: `IPC$`, `ADMIN$`, `C$` (inzibati paylaşım­lar) və ya xüsusi adlar (`share`, `backup`...). Parolsuz siyahı alınmasının özü tapıntıdır — qonaq giriyi konfiqurasiya icazəsidir.

Anonim paylaşım qovluğuna baxmaq:

```bash
smbclient //10.10.10.5/backup -N
```

Daxil olunca `ls`, `get fayl.txt` kimi FTP-yə bənzər komandalarla fayllar yoxlanılır/endirilir. "Backup" adlı paylaşımın parolsuz olması — lab-larda klassik ilk flag/yolkəsən tapıntıdır.

**enum4linux** — SMB enumeration-un "çoxalətli" kombinatı: istifadəçi siyahısı, qruplar, paylaşım­lar, parol siyasəti bir əmrdə:

```bash
enum4linux -a 10.10.10.5
```

Nəticəsində `users` bölməsində istifadəçi adları çıxa bilər — bunlar SSH/brute-force hədəfləri siyahısına düşür.

Real dünyada nə vacibdir: SMB versiyası (SMBv1 = köhnə və təhlükəli), null sessiya icazəsi, qonaq paylaşım­ları. Hər üçü enumeration-da yoxlanılır və hesabatda "konfiqurasiya zəifliyi" kimi qeyd olunur — istismara ehtiyac olmadan tapıntıdır.

Linux tərəfdə: Samba (Linux-un SMB implementasiyası) da eyni portda işləyir və eyni alətlərlə enumerate olunur — amma versiya zəifliyi fərqli ailədən olur.

**Sual 1**
SMB Enumeration-da hansı üç məlumat axtarılır?

**Sual 2**
`smbclient -L //IP -N` əmrində `-N` nə edir və nəticənin alınması nə deməkdir?

**Sual 3**
enum4linux hansı məlumatları bir əmrdə toplayır?

## Task 4 — FTP Enumeration: Anonim Giriş və Xəritələmə

FTP (File Transfer Protocol, port 21) — köhnə, amma hələ də çox rast gəlinən fayl transfer protokolu. Onun iki klassik zəif tərəfi var: şifrələnməmiş olması (credential-lar şəbəkədə açıq gedir) və tez-tez açıq qoyulan anonim girişi.

FTP-də axtarılanlar:

1. **Versiya (banner)** — `nc 10.10.10.5 21` ilə dərhal görünür.
2. **Anonim giriş** — `anonymous` istifadəçi adı və boş/hər hansı parolla giriş cəhdi.
3. **Qovluq məzmunu** — daxil olandan sonra `ls` ilə nələr var: konfiqurasiya faylları, backup-lar, read-me faylları.
4. **Yazma icazəsi** — `put test.txt` cəhdi: yazıla bilən FTP = gələcəkdə webshell yükləmə şansı (web root ilə üst-üstə düşürsə).

Anonim giriş sınanması:

```bash
ftp 10.10.10.5
Name: anonymous
Password: (boş və ya test@)
```

`230 Login successful` görünsə — anonim giriş açıqdır. Bu, özü-özünə həmişə "kritic" deyil (ümumiyyətlə, public download server-lərində bilərəkdən açılır), amma nə oxunub-yazıla bildiyi həlledicidir: anonim + yazma = yüksək risk; anonim + həssas fayllar = data exposure.

Daxil olduqdan sonra əsas komandalar: `ls` (siyahı), `cd qovluq` (keçid), `get fayl` (endirmə), `put fayl` (yükləmə), `binary` (binar transfer rejimi).

Tapılan fayllarla nə edilir? Hər fayl potensial məlumat mənbəyidir: `.conf` fayllarında parol/hostname, `.bak` fayllarda köhnə konfiqurasiya, `.txt` readme-lərdə istifadəçi adları. Bunlar öz maşınıza endirilir (`get`) və yoxlanılır.

FTP enumeration-un Nmap alternativi:

```bash
nmap --script ftp-anon,ftp-syst -p 21 10.10.10.5
```

`ftp-anon` anonim girişi avtomatik yoxlayır, `ftp-syst` sistem məlumatını çıxarır.

Bir konseptual əlaqə: FTP tapıntıları digər servis-lərlə birləşdirilir. Məsələn: FTP-dən `users.txt` tapıldı → SSH port 22 açıqdır → tapılan adlarla SSH brute-force hədəfi. Enumeration tək-tək servis-lərlə yox, onların kəsişməsində dəyər yaradır — bu, "flag-yönümlü düşünmə"nin əsasıdır.

**Sual 1**
FTP-də yazma icazəsi (writable) hansı risk yaradır?

**Sual 2**
Anonim giriş nə vaxt normal, nə vaxt tapıntı hesab olunur?

**Sual 3.**
FTP-də tapılan fayllar digər hansı servisin hədəfinə çevrilə bilər — nümunə ilə izah edin.

## Task 5 — HTTP Enumeration: Web Server-in Söyişənilməsi

HTTP (80/443) — müasir pentest-lərin ən geniş səthi. Web server-in enumeration-u bir neçə istiqamətdə gedir.

**Texnologiya aşkarlama.** Header-lərdən başlayır (`Server:`, `X-Powered-By:` — Task 2-də gördük), amma dərinləşmək olur: `whatweb` aləti səhifəni analiz edib stack-i tanıyır:

```bash
whatweb 10.10.10.5
```

Nəticə nümunəsi: `Apache[2.4.18], PHP[7.0.33], WordPress[5.8], JQuery`. Bu sətir artıq exploitation planının skeletidir: WordPress var → wpscan; PHP var → PHP-specific zəifliklər.

**Qovluq və fayl kəşfi (content discovery).** Web server-də görünən səhifələrdən başqa, link-lənməmiş gizli məzmun olur: `/admin`, `/backup`, `/uploads`, `.git` qovluğu, `robots.txt`. Bunları tapmaq üçün wordlist-əsaslı skan:

```bash
gobuster dir -u http://10.10.10.5 -w /usr/share/wordlists/dirb/common.txt
```

Gobuster wordlist-dəki hər adı URL kimi sınayır və mövcud olanları (200/301/401 cavablarını) göstərir. `robots.txt` isə ən sadə ilk baxışdır — orada `Disallow` yazılmış yollar, təsadüfən, axtarılan gizli qovluqların siyahısıdır.

** CMS/-aplikasiya səviyyəsi.** WordPress, Joomla kimi sistemlərdə versiya, plugin siyahısı, istifadəçi adları (`/wp-json/wp/v2/users` kimi endpoint-lərlə) enumeration mövzusudur. Ümumi prinsip: CMS aşkarlananda onun üçün xüsusi alət axtarılır (WordPress → wpscan).

HTTP-də axtarılanların xülasəsi:

| Nə axtarılır | Necə | Dəyəri |
|---|---|---|
| Server/framework versiya | Header, whatweb | CVE axtarışı |
| Gizli qovluqlar | gobuster, robots.txt | Admin panel, backup |
| CMS + plugin-lər | whatweb, wpscan | Bilinən zəifliklər |
| Səhifə məzmununda ipucları | Səhifəni oxu, comment-lər | İstifadəçi adı, daxili info |

Səhifə comment-lərini unutmayın: HTML-də qalan `<!-- TODO: admin panel köçürüləcək -->` tipli qeydlər, səhifə mətnində keçən email/istifadəçi adları — passiv dəyər daşıyır. Bütün bunlar qeyd faylınıza yazılır: hər tapıntı = potensial yol.

Bu module-u bağlayarkən ümumi mənzərə: recon (passiv + aktiv) hədəfin xəritəsini çıxartdı, enumeration isə hər açıq qapının arasındakını işıqlandırdı. Əlinizdə indi versiyalar, konfiqurasiya tapıntıları, istifadəçi adları və gizli qovluqlar var. Növbəti path-lərdən biri — Web Application Hacking — məhz HTTP tapıntılarının dərininə gedəcək.

**Sual 1**
whatweb hansı məlumatı verir və bu məlumat hansı addım üçün istifadə olunur?

**Sual 2.**
Gizli qovluq aşkarlaması (content discovery) nəyə əsaslanır və robots.txt niyə ilk baxış üçün əlverişlidir?

**Sual 3**
CMS aşkarlananda (məs. WordPress) enumeration hansı istiqamətə gedir?
