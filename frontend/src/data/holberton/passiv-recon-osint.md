# Room: Passiv Recon (OSINT Əsasları)

**Path:** Red Team Fundamentals
**Module:** Recon & Enumeration
**Çətinlik:** Beginner
**Təxmini vaxt:** 1.5 saat

## Room haqqında

Bu room-da hücumun ilk və ən "səssiz" mərhələsini — passiv recon-u öyrənəcəksiniz. Passiv recon-un mahiyyəti ondadır ki, hədəflə heç bir birbaşa texniki əlaqə qurmadan, yalnız açıq mənbələrdən (public sources) məlumat toplanır. Hədəf sistemin loglarında sizin fəaliyyətinizə dair heç bir iz qalmır. Google Dorking, WHOIS sorğuları və subdomain aşkarlama ilə praktik tanış olacaqsınız.

## Öyrənmə nəticələri

- Passiv recon ilə aktiv recon arasındakı fərqi izah etmək
- Google Dorking ilə axtarış mühərribindən "kəşfiyyat aləti" kimi istifadə etmək
- WHOIS vasitəsilə domain məlumatlarını əldə etmək
- crt.sh kimi alətlərlə subdomain aşkarlamaq
- Toplanan məlumatların növbəti mərhələlər üçün nə qədər dəyərli olduğunu dərk etmək

## Task 1 — Passiv Recon Nədir və Niyə Birinci Addımdır?

Passiv recon — hədəflə birbaşa əlaqə saxlamadan məlumat toplamaqdır. Bu tərifin praktik mənasını açaq: siz hədəf serverə heç bir paket göndərmirsiniz, heç bir port skan etmirsiniz, heç bir web səhifəsini hədəfin öz serverindən açmırsınız (bəzi yanaşmalarda hədəf saytın ziyarəti belə məhdudlaşdırılır). Əvəzində üçüncü tərəf mənbələrdən — axtarış mühərrikləri, domain qeydiyyat bazaları, sertifikat logları, arxivlər — istifadə edirsiniz.

Niyə passiv recon birinci addımdır? Üç səbəb:

| Səbəb | İzah |
|---|---|
| Gizlilik | Hədəf sizin fəaliyyətinizi görmür — IDS/IPS, firewall log-ları boş qalır |
| Təhlükəsizlik | Səhv nəticəsində "hədəfi oyatma" riski yoxdur (aqressiv skan hədəfi həssaslaşdıra bilər) |
| Zəmin | Nəyi skan edəcəyinizi əvvəlcədən bilirsiniz — aktiv recon daha hədəfli və sürətli olur |

Analogiya: evə oğru girməzdən əvvəl küçədə durub evi müşahidə edir — hansı pəncərələr açıqdır, nə vaxt ev boş qalır, qonşular kimdir. Heç kəs bu müşahidədən xəbər tutmur. Passiv recon da eynidir: hədəf haqqında "kənardan baxış".

Passiv recon-da hansı məlumatlar maraq doğurur?

- **İnfrastruktur:** domain-lər, subdomain-lər, IP aralıqları, texnologiya izləri
- **İnsanlar:** işçi adları, email formatı (məs. ad.soyad@şirkət.com), iş elanları (hansı texnologiyalar istifadə olunur — "Windows administrator axtarırıq" = Windows mühiti var)
- **Sızmış məlumatlar:** data breach-lərdə üzə çıxan credential-lar

Bu room-da üç əsas texnikanı — Google Dorking, WHOIS və subdomain aşkarlamayı — sırayla öyrənəcəyik.

Etik qeyd: passiv recon qanuni sərhədlərdə ən "təhlükəsiz" fəaliyyət olsa da, toplanan məlumatın istifadəsi (məs. credential stuffing) üçün icazə lazımdır. OSINT = Open Source Intelligence — açıq mənbə kəşfiyyatı.

**Sual 1**
Passiv recon-u aktiv recon-dan ayıran əsas meyar nədir?

**Sual 2**
Passiv recon-un birinci addım olmasının üç səbəbini deyin.

**Sual 3**
İş elanları kimi görünüşdə "zərərsiz" məlumat pentest üçün necə dəyər kəsb edir?

## Task 2 — Google Dorking: Axtarış Mühərriki Kəşfiyyat Alətinə Çevrilir

Google Dorking — Google axtarışına xüsusi operatorlar (advanced search operators) əlavə edərək nəticələri dəqiq filtrləmə texnikasıdır. Axtarış mühərrikləri internetin böyük hissəsini indeksiqləyir — o cümlədən heç kimin görmək istəmədiyi səhifələri: indeksə düşmüş admin panelləri, qorumasız qalan fayl siyahıları (directory listing), açıq database export faylları. Dorking bu "çöldə qalmış" məlumatları üzə çıxarır.

Əsas operatorlar:

| Operator | Funksiya | Nümunə |
|---|---|---|
| `site:` | Yalnız konkret domendə axtarır | `site:example.com` |
| `filetype:` | Fayl növünə görə filtrləyir | `filetype:pdf` |
| `inurl:` | URL-də söz axtarır | `inurl:admin` |
| `intitle:` | Səhifə başlığında söz axtarır | `intitle:"index of"` |
| `""` | Dəqiq ifadə | `"internal use only"` |

Operatorlar birləşdirilir — bu, dorking-in gücüdür:

```
site:example.com filetype:pdf "confidential"
```

Bu sorğu example.com domeni altındakı, adında "confidential" olan bütün PDF-ləri tapır. Başqa bir klassik nümunə:

```
intitle:"index of" site:example.com
```

`"index of"` başlığı adətən qorumasız directory listing-i göstərir — serverin fayl siyahısını açıq göstərdiyi vəziyyət.

Bir vacib real-laboratoriya qeydi: admin panel tapmaq (`inurl:admin`) pentest-də maraqlı olsa da, **başqasının domeni üzərində dorking edib tapdığınız zəifliyi istismar etmək icazəsiz hücumdur**. Dorking özü "oxumaq" qədər passivdir, amma nəticələrin istifadəsi artıq aktiv fəaliyyətdir. Lab mühitində (icazəli hədəflərdə) isə bu texnikanı tam azad məşq edə bilərsiniz.

Google Hacking Database (GHDB) — Exploit-DB-nin bir hissəsi olan, community tərəfindən paylaşılan hazır dork-ların bazasıdır. Yüzlərlə hazır sorğu oradan götürülüb öyrənilə bilər.

Dorking nə verir (passiv recon nəticəsi kimi): gizli subdomain-lər (site: nəticələrindən), hədəfin istifadə etdiyi texnologiyalar (fayl növlərindən), potensial həssas faylların mövcudluğu haqqında ipucu. Bunlar növbəti mərhələ — aktiv recon-un hədəf siyahısına çevrilir.

**Sual 1**
`site:` və `filetype:` operatorlarını birləşdirən bir dork nümunəsi yazın və nə tapdığını izah edin.

**Sual 2**
`intitle:"index of"` nətyə ehtimal olunan texniki səbəb nədir?

**Sual 3**
Dorking "passiv" sayılır, amma hansı şəraitdə onun nəticələri problemi yaradır?

## Task 3 — WHOIS: Domain-in "Şəxsiyyət Vəsiqəsi"

WHOIS — domain qeydiyyatı haqqında sorğu protokoludur. Hər domain (example.com kimi) bir registrar-da (GoDaddy, Namecheap və s.) qeydiyyatdan keçib və bu qeydiyyatın məlumatları WHOIS bazalarında saxlanılır. Sorğu etməklə bu məlumatları əldə edirsiniz — tamamilə qanuni, hədəfə paket getməyən, klassik passiv recon.

Sorğu belədir:

```bash
whois example.com
```

Nəticədən nə oxunur?

| Sahə | Məlumat | Pentest dəyəri |
|---|---|---|
| Registrar | Qeydiyyat şirkəti | Infrastruktur ipucu |
| Creation Date | Domain yaşı | Çox köhnə = köhnə subdomain-lər ola bilər |
| Registry Expiry | Bitmə tarixi | — |
| Name Servers | DNS server-lər | Hosting/infrastruktur aşkarlama (məs. Cloudflare? Oz hosting?) |
| Registrant | Sahib məlumatı | Şəxs/şirkət əlaqəsi (privacy protection ilə gizlədilə bilər) |

Ən dəyərli sahələrdən biri Name Servers-dir. Əgər NS-lər `ns1.cloudflare.com` kimi görünürsə, domain Cloudflare DNS arxasındadır — bu, aktiv mərhələdə real IP tapmaq problemi deməkdir. Əgər NS-lər şirkətin öz adını daşıyırsa (`ns1.sirket.com`), öz DNS infrastrukturu var deməkdir.

WHOIS-dən birbaşa "bonus" texnika: **reverse WHOIS / registrar data axtarışı**. Registrant email-i bilinirsə, həmin email ilə qeydiyyatdan keçmiş *digər* domain-ləri axtarmaq olur (viewdns.info kimi servis-lərlə). Şirkətin test/lab domain-ləri çox vaxt əsas domendən ayrı və daha az qorunur — bu, klassik kəşfiyyat tapıntısıdır.

Qeydlər:

- GDPR-dən sonra bir çox domain-də registrant məlumatları gizlədilir (privacy protection) — bu normaldır, digər sahələr yenə də dəyərlidir.
- WHOIS sorğusu hədəfin özünə deyil, WHOIS serverinə gedir — hədəf bunu görmür.
- `whois` aləti Kali-da hazırdır; IP ünvanına da whois çəkmək olur (netblock sahibini göstərir).

**Sual 1**
WHOIS sorğusu hansı serverə gedir və niyə hədəf tərəfindən görülmür?

**Sual 2**
Name Servers sahəsində `cloudflare` görünməsi aktiv recon-a hansı təsir göstərir?

**Sual 3.**
Reverse WHOIS nədir və hansı tapıntı ilə nəticələnə bilər?

## Task 4 — Subdomain Aşkarlama: crt.sh və Digər Alətlər

Şirkətin əsas domain-i (example.com) yalnız buz dağının görünən hissəsidir. Əsl infrastruktur subdomain-lərdə gizlənir: `dev.example.com`, `staging.example.com`, `old-app.example.com`, `vpn.example.com`... Və ən vacib psixologiya: **dev/staging mühitləri adətən əsas saytdan zəif qorunur** — orada debug açıq qalır, default parollar işləyir, yamaqlar gecikir. Subdomain aşkarlama bu "unutqan küncləri" üzə çıxarır.

**crt.sh — Certificate Transparency log-ları.** Müasir texnologiya zəncirində hər TLS sertifikatı Certificate Transparency (CT) log-larına yazılır — bu, açıq, axtarıla bilən public bazadır. crt.sh bu log-ların axtarış interfeysidir:

```
https://crt.sh/?q=%25.example.com
```

(`%25` = wildcard simvolu; bütün subdomain-ləri siyahılayır). Nəticə: hər hansı vaxt sertifikat almış bütün hostnamelər — o cümlədən artıq mövcud olmayan, amma tarixçədə qalanlar. Bu, tam passivdir: məlumat Google/Apple/etc. tərəfindən saxlanan CT loglarından gəlir, hədəfdən yox.

**Digər passiv mənbələr (qısa icmal):**

- **Sublist3r / assetfinder / amass** — bir neçə mənbəni (CT logları, axtarış mühərrikləri, DNS arxivləri) birləşdirən avtomatik alətlər:

```bash
assetfinder example.com
```

- **DNSBrute-force (aktivdir!)** — `dev.`, `test.`, `admin.` kimi adları sınamaq DNS sorğusu göndərir — bu artıq passiv deyil, hədəf DNS serveri sorğuları görür. Sərhədi qarışdırmaq olmaz.
- **Axtarış mühərriki:** `site:*.example.com -site:www.example.com` dorku da subdomain verir.

Aşkarlanan subdomain-lərlə nə edilir? Hər biri passiv şəkildə daha da araşdırıla bilər: sertifikat məlumatları, arxivlərdə (web.archive.org) köhnə versiyaları, tech stack izləri. Sonra — aktiv recon mərhələsində — DNS həlli ilə IP-ləri tapılır və hədəf siyahısı formalaşır.

Praktik vərdiş: subdomain siyahısını faylda saxlayın (`subdomains.txt`) — növbəti room-larda bu siyahı Nmap və digər alətlərə input olacaq. Recon mərhələsinin outputs-u növbəti mərhələnin inputs-udur — bu zənciri qırmaq olmaz.

**Sual 1**
 crt.sh məlumatı haradan alır və niyə passiv sayılır?

**Sual 2**
Dev/staging subdomain-ləri niyə tez-tez hücum hədəfi olur?

**Sual 3**
DNS brute-force subdomain aşkarlaması hansı səbəbdən passiv deyil?

## Task 5 — Toplanan Məlumatın Sənədləşdirilməsi: Recon Notes

Recon-un texnikasından biri də sənədləşdirmə disiplinidir. Təcrübəsiz pentester skan edir, nəticəni ekranda görür və itirir. Professional isə hər tapıntını qeyd edir, çünki: (a) hesabat üçün sübut lazımdır, (b) növbəti günlərdə xatırlamaq olmur, (c) müştəriyə "biz bunu aşkarladıq" demosu lazım olur.

Sadə, amma effektiv bir recon qeyd strukturu:

```markdown
## Hədəf: example.com  (tarix: 2026-08-15)

### WHOIS
- Registrar: Example Registrar, NS: ns1.cloudflare.com (Cloudflare arxasında)
- Creation: 2010

### Subdomain-lər (mənbə: crt.sh)
- dev.example.com    -> mövcud, arxivdə login formu
- old.example.com    -> CT log-da var, DNS həll olunmur (ölü)

### Google Dork tapıntıları
- site:example.com filetype:pdf "internal" -> 3 nəticə (qeyd: /docs/ qovluğu)

### Növbəti addımlar
- [ ] dev.example.com aktiv recon-a daxil et
- [ ] /docs/ qovluğunu Burp ilə yoxla
```

Nə üçün bu qədər ciddi? Bir rəqəm ilə: orta hesabla real engagement-də recon mərhələsi ümumi vaxtın 40-70%-ni tuta bilər. Bu qədər işin struktursuz aparılması demək, işin sonunda "nə tapdıq, harada?" sualına cavabın olmamasıdır.

Qeyd aparan zaman üç prinsip:

1. **Mənbə göstərin** — hər məlumatın haradan gəldiyi (crt.sh, WHOIS, dork) yazılmalıdır. Etibarlılıq fərqlidir: WHOIS rəsmi məlumatdır, axtarış nəticəsi isə köhnəlmiş ola bilər.
2. **Tarix yazın** — subdomain siyahıları, IP-lər vaxtla dəyişir; bir həftə köhnə məlumat yanlış hədəfə apara bilər.
3. **Fərziyyə ilə faktı ayırın** — "old.example.com ölüb" fərziyyədir (DNS həll olunmadı), amma hələ də birbaşa IP ilə yaşaya bilər. Fakt/fərziyyə qarışması klassik səhvdir.

Bu vərdiş indi formalaşsa, "Reporting" module-da hesabat yazmaq mexaniki işə çevriləcək — çünki material artıq hazır olacaq.

**Sual 1**
Recon qeydlərində hər məlumatın yanında mənbəni göstərmək nə üçün vacibdir?

**Sual 2**
"DNS həll olunmur, deməli host ölüdür" — bu faktı yoxsa fərziyyəsi? Niyə?

**Sual 3.**
Recon mərhələsinin real engagement-də hansı hissəni tuta biləcəyini və bunun sənədləşdirməyə təsirini izah edin.
