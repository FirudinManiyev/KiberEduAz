# Room: Zəiflik Skanlaması (Nessus/OpenVAS)

**Path:** Network & Infrastructure Security
**Module:** Vulnerability Assessment
**Çətinlik:** Intermediate
**Təxmini vaxt:** 1.5 saat

## Room haqqında

Zəiflik skanerləri — bütöv şəbəkəni sistemli yoxlayıb bilinən zəiflikləri (CVE-ləri) tapıb qiymətləndirən avtomatik sistemlərdir. Bu room-da vulnerability scanner-lərin iş prinsipini, Nessus və OpenVAS alətlərini, CVE/CVSS anlayışlarını və skan nəticələrinin düzgün oxunmasını öyrənəcəksiniz. Web modulundakı ZAP'dən fərqli olaraq, burada səth — bütün infrastruktur.

## Öyrənmə nəticələri

- Vulnerability scanner-in iş prinsipini (port skan → servis identifikasiya → plug-in yoxlamaları) izah etmək
- Nessus və OpenVAS alətlərinin quraşdırma və skan axınını bilmək
- CVE və CVSS anlayışlarını izah etmək
- Skan hesabatını oxuyub tapıntıları qiymətləndirmək

## Task 1 — Scanner Necə İşləyir: Prinsip

Vulnerability scanner — ağlabatan ardıcıllıqla işləyən "auktoritetə sahib enum + exploit yoxlaması" sistemidir. Mərhələləri:

1. **Discovery:** host-ların tapılması (ping sweep) və port skanı (TCP/UDP).
2. **Servis identifikasiyası:** banner grabbing, versiya aşkarlama — bizim enum biliklərimizin avtomatik versiyası.
3. **Plug-in yoxlamaları:** hər aşkarlanan servis üçün zəiflik bazasından uyğun yoxlamalar: versiya müqayisələri (passive), xüsüsü sorğular (aktiv, zərərsiz "soruşma"), bəzən mini-istismar (safe exploit testləri).
4. **Qiymətləndirmə:** tapıntı → CVE uyğunlaşdırma → CVSS skor → severity.
5. **Hesabat:** tapıntı siyahısı + sübut + remediation tövsiyələri.

Nəticə etibarilə scanner sizin "enum → exploit axtarışı" əl işinizi minlərlə host üzərində avtomatlaşdırır. Amma diqqət: scanner yalnız **bilinən** zəiflikləri tapır (CVE bazası), **bilinməyən/cənub logic** zəiflikləri yox (bu, web room-larında gördüyümüz DAST məhdudiyyətinin infrastruktur versiyasıdır).

Nessus və OpenVAS — iki ən məşhur alət:

| Alət | Satıcı | Model | Güclü tərəf |
|---|---|---|---|
| **Nessus Essentials** | Tenable | Pulsuz (kiçik həcm limiti) | Ən böyük plug-in bazası, sənaye standartı |
| **OpenVAS/GVM** | Greenbone | Açıq mənbə | Tam pulsuz, geniş inteqrasiya |

İkisinin də konsepti eynidir; interfeys fərqli. Corporate dünyada Nessus (və ailəsi — Tenable.io/sc) daha geniş yayılıb; öyrənmə üçün hər ikisi uyğundur.

Digər qohumlar: Qualys (cloud), Rapid7 InsightVM (Nexpose) — commercial VA platformaları. Hamısı eyni prinsiplə işləyir; birini öyrənən digərinə asan keçir.

**Sual 1**
Scanner-in beş mərhələsini sadalayın.

**Sual 2**
Nessus ilə OpenVAS-ın oxşarlığı və fərqləri nədir?

**Sual 3**
Scanner-in tapa bilməyəcəyi zəifliklər hansılardır?

## Task 2 — Nessus/OpenVAS ilə Praktiki Axın

**Nessus quraşdırma (Kali/Debian):**

```bash
# Tenable-dan Essentials paketi endirilir (qeydiyyatlı activation code ilə)
dpkg -i Nessus-10.x.x-debian10_amd64.deb
systemctl start nessusd
# Browser: https://localhost:8834 → inicial konfiqurasiya + activation code
```

**İlk skan axını (Nessus GUI):**

1. **Scans → New Scan** → şablon seçimi:
   - *Basic Network Scan* — ümumi başlanğıc skanı.
   - *Credentialed Scan* — parol/açar ilə daxil olub DAXİLİDƏN yoxlama (daha dəqiq — patch səviyyəsi, lokal proqramlar).
   - *Malware/Web application* — xüsusi mövzular.
2. **Hədəf:** host IP/dəsti (yalnız razılaşdırılmış range!).
3. **Discovery/Assessment parametrləri:** portların genişliyi, "safe checks" (zərərsiz yoxlamalar) — production sistemlərdə vacib.
4. **Run** → progress → nəticə.

**OpenVAS (GVM) tərəfdə** eyni məntiq: `gvm-setup` (quraşdırma), `gvm-start`, browser interfeysi (default 9392), **Scans → Tasks → New Task** → hədəf + skan konfiqurasiyası (Full and fast ən standart).

**Credentialed vs uncredentialed skan** — ən vacib konseptual fərq:

- **Uncredentialed:** xaricdən baxır — yalnız açıq səthdə görünən zəifliklər (versiyalar, konfiqurasiya). Yüksək "false negative" ehtimalı: sistem daxilindəki köhnə proqramlar görünmür.
- **Credentialed:** sistemə daxil olub lokal yoxlama — quraşdırılmış paketlər, patch səviyyəsi, konfiqurasiya auditləri. Daha dolğun, amma credential tələb edir.

Real VA proqramları adətən hər iki skanı aparır: uncredentialed "hücumçunun gördüyü", credentialed "daxili həqiqət" kimi.

Skan müddəti və yüklənmə: tam skan hədəf sistemləri yükləyə bilər (əks-sədalar, çoxsaylı sorğular). Buna görə: production skanları iş saatlarından kənar, razılaşdırılmış pəncərədə aparılır — bu, ROE-nun bir hissəsidir.

**Sual 1**
Credentialed skan uncredentialed-dən nə ilə fərqlənir?

**Sual 2.**
"Safe checks" parametri nə üçün vacibdir?

**Sual 3.**
Niyə VA skanları razılaşdırılmış zaman pəncərəsində aparılır?

## Task 3 — CVE və CVSS: Zəifliyin Dili

Tapıntıları oxumaq üçün iki fundamental anlayış:

**CVE (Common Vulnerabilities and Exposures)** — hər publik zəifliyin unikal identifikatoru: `CVE-2017-0144` (il + sıra). CVE verilməsi zəifliyin standart adını deməkdir — bütün alətlər, bazalar, hesabatlar eyni dildə danışır. Məlumat mənbələri: NVD (nvd.nist.gov — CVSS skorları ilə), vendor advisory-ləri, Exploit-DB.

**CVSS (Common Vulnerability Scoring System)** — zəifliyin şiddətinin 0-10 bal ölçüsü. Version 3.1 əsas metrikləri:

| Metrik | Sual | Nümunə dəyərlər |
|---|---|---|
| **Attack Vector (AV)** | Haradan çatılır? | Network (N) / Adjacent (A) / Local (L) / Physical (P) |
| **Attack Complexity (AC)** | Nə qədər çətin? | Low / High |
| **Privileges Required (PR)** | İmtiyaz lazımdır? | None / Low / High |
| **User Interaction (UI)** | İstifadəçi iştirakı? | None / Required |
| **Scope (S)** | Təsir komponenti dəyişirmi? | Unchanged / Changed |
| **C/I/A Impact** | Gizlilik/Bütövlük/Mövcudluq | High / Low / None |

Metriklər kombinasiyası → bəhs edilen formula → 0.0-10.0 skor → severity:

| Skor | Severity |
|---|---|
| 9.0-10.0 | Critical |
| 7.0-8.9 | High |
| 4.0-6.9 | Medium |
| 0.1-3.9 | Low |
| 0.0 | None |

Nümunə: EternalBlue (CVE-2017-0144) — AV:N (şəbəkədən), AC:L, PR:N, UI:N, impact C/H, I/H, A/H → 8.1 (High/Critical sərhəddi). Amma **exploit public + worm yayılımı** real riski skalın üstünə çıxarır — buna görə CVSS tek başına "risk" deyil, "şiddət"dir.

CVSS-in məhdudiyyətləri (peşəkar baxış üçün vacib): konteksti bilmir (hansı mühitdə, hansı data arxasında), exploit mövcudluğunu tam əks etdirmir, "skor 7" hər yerdə eyni təcili demək deyil. Buna görə müasir yanaşmalar CVSS-i tamamlayır: **EPSS** (exploit olunma ehtimalı), **KEV** (CISA-nın aktiv istismar siyahısı), RTI (real zamanlı istismar intel). Hesabatda "CVSS + kontekst" kombinasiyası professional standartdır.

**Sual 1**
CVE nə üçün mövcuddur və formatı necədir?

**Sual 2.**
CVSS-in altı əsas metrikini sadalayın.

**Sual 3.**
CVSS niyə "risk" deyil, "şiddət"dir — izah edin.

## Task 4 — Skan Hesabatının Oxunması

Nessus/OpenVAS hesabatı — tapıntılar siyahısıdır (host × zəiflik). Hər tapıntının strukturu:

- **Severity** (rəng: qırmızı/critical → sarı/medium → yaşıl/low) və CVSS skoru
- **CVE identifikator(lar)ı** və referanslar
- **Sınanmış servis/port/versiya** — harada tapıldı
- **Deskripsiya** — zəiflik nədir, nə edir
- **Sübut (plugin output)** — skanerin gördüyü xam çıxış
- **Remediation** — patch, upgrade, konfiqurasiya tövsiyəsi

Oxuma metodologiyası (analitik göz ilə):

1. **Əvvəlcə Critical/High siyahısı** — hansı sistemlərdə, hansı servislərdə. Bunlar triajın əsasıdır.
2. **Qruplaşdırma:** eyni zəiflik 30 host-da → bir remediation qərarı (mass patch). Əksinə, tək-tək ekzotik tapıntılar → xüsusi baxış.
3. **Kontekst sualları:** sistem production-durmu? Internetə açıqdırmı? Həssas data saxlayırmı? Eyni CVSS, fərqli kontekst → fərqli təcili.
4. **Sübut yoxlaması:** plugin output realdır, yoxsa versiya-əsaslı təxmindir? (Scanner bəzən "versiya görünür köhnədir — ola bilsin vulnerable" deyir: bu, təsdiqlənməli hipotezdir — növbəti room-un mövzusu.)
5. **Exploit mövcudluğu:** public exploit varmı (searchsploit, Metasploit)? KEV siyahısındadırmı? Bu, tapıntının real təhlükəsini formalaşdırır.

Hesabatın istehlakçıları fərqlidir: sistem admin üçün — host/port/patch səviyyəli texniki siyahı; rəhbərlik üçün — tendensiyalar, risk qrupları, remediation prioriteleri. Professional VA hesabatı hər ikisini ehtiva edir və "qırmızı kapitalı" (critical sayı) trend şəklində izlənilir.

Bir vacib praktika: skan nəticələri müqayisə edilə bilən olmalıdır — eyni skan siyasəti, tarix seriyası, remediation sonrası təkrar skan ("fixed" təsdiqi). VA bir dəfəlik hadisə deyil, dövrü prosesdir: yeni zəifliklər hər ay çıxır, sistemlər dəyişir.

**Sual 1**
Hər tapıntının struktur elementlərini sadalayın.

**Sual 2.**
Triage-da "eyni zəiflik 30 host-da" nə üçün əhəmiyyətlidir?

**Sual 3.**
VA-nın "dövrü proses" olması nə deməkdir?

## Task 5 — VA-nın Yeri: Pentest ilə Fərqi və Əlaqəsi

Sual: VA varsa, pentest nəyə lazımdır? (və ya əksinə). Bu, sifarişçilərin ən çoz soruşduğu sualdır — cavab ikitərəflidir.

**VA (vulnerability scanning):**

- Səth: bütün şəbəkə, minlərlə host
- Metod: avtomatik, bilinən zəiflik (CVE) pattern-ləri
- Nəticə: tapıntı siyahısı + severity + remediation
- Tezliyi: həftəlik/aylıq davamlı
- Qiymət: ucuz/sürətli

**Pentest:**

- Səth: konkret hədəf/ssenari (daha dərin)
- Metod: insan + alətlər — zəifliklərin zəncirlənməsi, business logic, istismar
- Nəticə: "real təsir" sübutu (nə qədər dərinə getsəldi — attack narrative)
- Tezliyi: illik/yarım-illik (və ya layihə bazlı)
- Qiymət: bahalı, insan vaxtı

İkisinin birləşmə sintezi — **Vulnerability Management (VM) proqramı:** davamlı skan (VA) + tapıntıların triage/remediation prosesi + müntəzəm pentest (dərin təsdiq). VA "hansı qapılar qırıqdır" siyahısı verir; pentest "qırıq qapılardan içəri necə gedilir" hekayətini sübut edir.

Pentester üçün VA biliklərinin rolu: real pentest-lərdə client-in son VA hesabatı tez-tez başlanğıc məlumat olur; həmçinin pentester özü skanerdən istifadə edir ( coverage üçün) — amma tapıntıları **manual doğrulayır** (false positive süzgəci) və **istismar edir** (real təsir sübutu). Bu iki addım — növbəti room-un (Manual Zəiflik Doğrulaması) mövzusu.

Module yekununda xəritə: bu path-də (Network Security) exploitation (FTP/SMB/SSH + Metasploit) və VA (skaner + bu room) tərəflərini gördük; növbəti room skaner tapıntısının əllə doğrulanmasını öyrədəcək. Bundan sonra isə Active Directory dünyasına keçəcəyik — korporativ şəbəkələrin əsl qəlbi.

**Sual 1**
VA və pentest arasındakı dörd fərqi sadalayın.

**Sual 2.**
Vulnerability Management proqramı nə deməkdir?

**Sual 3.**
Pentester skaner tapıntıları ilə nə edir?
