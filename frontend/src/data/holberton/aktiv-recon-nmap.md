# Room: Aktiv Recon — Nmap

**Path:** Red Team Fundamentals
**Module:** Recon & Enumeration
**Çətinlik:** Beginner
**Təxmini vaxt:** 2 saat

## Room haqqında

Bu room-da passiv recon-dan toplanan məlumatın üzərinə ilk "birbaşa toxunuşu" — aktiv recon-u, onun əsas aləti olan Nmap-ı öyrənəcəksiniz. Nmap-ın skan növləri (SYN scan, TCP connect, UDP scan), port state-lərinin mənası (open/closed/filtered) və əsas flag-ləri (-sV, -sC, -A, -p-) praktik nümunələrlə araşdırılacaq. Room-un sonunda sizə verilən lab IP-sinə mərhələli skan edərək tam port xəritəsi çıxarmağı bacaracaqsınız.

## Öyrənmə nəticələri

- Aktiv recon-un passiv recon-dan fərqini və görünənliyini (hədəf loglarında iz) anlamaq
- Nmap-ın üç əsas skan növünü (SYN, TCP connect, UDP) və fərqlərini bilmək
- Port state-lərini (open/closed/filtered) düzgün şərh etmək
- `-sV`, `-sC`, `-A`, `-p-` flag-lərini məqsədə uyğun istifadə etmək
- Mərhələli skan strategiyası ilə effektiv işləmək

## Task 1 — Aktiv Recon: Artıq Hədəf Sizi Görür

Aktiv recon — hədəflə birbaşa texniki əlaqə quraraq məlumat toplamaqdır: port skan, servis yoxlaması, versiya sorğuları. Passiv recon "kənardan baxış" idisə, aktiv recon artıq qapını döyməkdir — və ev sahibi (hədəf) bunu eşidir.

Bu o deməkdir ki, aktiv recon həmişə hədəfin loglarında iz buraxır:

| Hərəkət | Hədətdə görünən iz |
|---|---|
| TCP skan | Firewall/IDS log-larında çoxsaylı bağlantı cəhdləri |
| Versiya sorğusu (-sV) | Servis loglarında qeyri-adi sorğular (apache access.log) |
| UDP skan | Çoxsaylı ICMP "port unreachable" cavabları |

Buna görə aktiv recon yalnız icazəli hədəflərdə (öz lab, müqaviləli test, CTF) aparılır. Real engagement-də icazə sənədində hansı IP-lərin, hansı vaxt pəncərəsində skan edilə biləcəyi yazılır.

Aktiv recon-un passiv recon-dan gələn məlumatla əlaqəsi: passiv mərhələdə tapdığınız subdomain/IP siyahısı aktiv skanın hədəf siyahısıdır. Sıra ilə: əvvəl "harada ola bilər" (passiv), sonra "hansı qapılar açıqdır" (aktiv).

Nmap nə üçün əsas alətdir? Çünki o, bir alətlə üç suala cavab verir: (1) hansı host-lar canlıdır (host discovery), (2) hansı portlar açıqdır (port scanning), (3) arxalarında nə işləyir (versiya/script detection). Bu üç funksiya bütün aktiv recon-un özəyidir.

İlk skanınızı edək (lab-da icazəli hədəf IP ilə əvəz edin):

```bash
nmap 10.10.10.5
```

Bu əmr default olaraq ən məşhur 1000 TCP portunu yoxlayır və açıqları göstərir. Növbəti tasklarda bu sadə əmri professional səviyyəyə daşıyacağıq.

**Sual 1**
Aktiv recon-un "görünənliyi" nə deməkdir — hansı loglarda iz qalır?

**Sual 2**
Passiv recon-un nəticəsi aktiv recon-da hansı formada istifadə olunur?

**Sual 3**
Nmap-ın cavab verdiyi üç əsas sual hansılardır?

## Task 2 — Skan Növləri: SYN, TCP Connect və UDP

Nmap müxtəlif skan növləri ilə işləyir. Növlər arasındakı fərq texniki detallarda deyil, iki sualda: nə qədər "səs-küylü"dür və nə qədər etibarlıdır?

**TCP Connect scan (`-sT`).** Ən sadə, ən "nəzakətli" skan: hər port üçün tam TCP bağlantısı qurur — üçlü handshake (SYN → SYN/ACK → ACK), sonra bağlanır. Sistem kitabxanası (OS socket API) istifadə etdiyindən root hüququ tələb etmir. Çatışmazlığı: hər tam bağlantı hədəfin loglarında görünür — ən "səs-küylü" üsuldur.

**SYN scan (`-sS`) — "half-open" və ya "stealth" scan.** Burada mühüm məntiq var: tam handshake-in son ACK-ni göndərmir. Sıra belədir:

```
Siz            Hədəf (port açıq)
SYN     →      
        ←      SYN/ACK   (port açıqdır!)
RST     →      (bağlantını yarımçıq kəsirik)
```

Əgər port bağlıdırsa, hədəf RST qaytarır. Niyə bu əsassızdır? Çünki tam bağlantı qurulmur — bir çox sistemlər yarımçıq bağlantını application səviyyəsinə (log yazan proqrama) çatdırmır. Yalnız firewall/IDS səviyyəsində görünür. Həm də sürətlidir: tam handshake-in bir addımı yoxdur, minlərlə port tez yoxlanılır. SYN scan root hüququ tələb edir (xam paket düzəltmək lazımdır) — `sudo` ilə işlədin. Nmap default olaraq (root ilə) məhz SYN scan seçir.

**UDP scan (`-sU`).** UDP protokolunda "bağlantı" yoxdur — UDP sorğu göndərilir, cavab gəlirsə port açıqdır. Amma problem: UDP servis-lərin çoxu (DNS, SNMP) yalnız "düzgün formatlı" sorğuya cavab verir. Boş sorğu göndərilsə, cavab yoxdur. Nəticə — UDP skan yavaşdır və "open|filtered" kimi qeyri-müəyyən state-lər verir. Amma vacibdir: 161 (SNMP), 53 (DNS), 69 (TFTP) kimi UDP servis-ləri klassik zəiflik mənbəyidir və yalnız UDP skanla aşkarlanır.

| Skan | Flag | Sürət | Səs-küy | Root? |
|---|---|---|---|---|
| TCP Connect | `-sT` | Orta | Yüksək (log-lanır) | Xeyr |
| SYN | `-sS` | Sürətli | Orta (yarımgizli) | Bəli |
| UDP | `-sU` | Yavaş | Aşağı | Bəli |

Praktik qərar ağacı: gündəlik pentest-də SYN scan standartdır; icazənin və ya alətin məhdud olduğu halda TCP connect; UDP isə əsas portlar (top 20 kimi) üçün hədəfli şəkildə atılır — bütün 65535 UDP portu skan etmək çox vaxt aparır.

**Sual 1**
SYN scan niyə "half-open" adlanır və TCP connect-dən nə ilə fərqlənir?

**Sual 2**
UDP skan niyə yavaşdır və "open|filtered" state-i nə deməkdir?

**Sual 3**
Root hüquq tələb edən skan növləri hansılardır və niyə?

## Task 3 — Port State-ləri: open, closed, filtered və Sərhədləri

Skan nəticəsindəki hər sətir bir port state-i daşıyır. Onları düzgün oxumaq skanın yarıdan çoxu deməkdir — çünki state hədəfin infrastrukturu haqqında hekayə danışır.

**`open`** — portda bir servis dinləyir və qəbul edir. Hədəf üçün "qapı açıqdır" — bu port növbəti mərhələnin (enumeration) hədəyidir.

**`closed`** — port açıqdır deyə bilək: host canlıdır, amma bu portda heç nə dinləmir. Closed state də məlumatdır: host-un yaşadığını təsdiqləyir və firewall-un bu portu bloklamadığını göstərir.

**`filtered`** — Nmap cavab almır, amma səbəb aydın deyil: ya firewall paketi drop edir (cavab yoxdur), ya da şəbəkə yolu çatıxmır. Filtered ən çox Firewall-un varlığını göstərən siqnaldır — filtering araşdırmağa dəyər: hansı portlar filtered, hansıları open? Bu nümunə firewall qaydalarının xəritəsini verir.

**`unfiltered`** — (yalnız bəzi skan növlərində) portun çatıldığı bilinir, amma açıq/bağlı demək olmur.

Nümunə çıxış və şərhi:

```
PORT     STATE    SERVICE
22/tcp   open     ssh
80/tcp   open     http
3389/tcp filtered ms-wbt-server
```

Şərh: SSH və web açıqdır (test hədəfi), RDP (3389) isə filtered — yəqin firewall arxasında ya da yalnız müəyyən IP-lərə açıqdır. Bu, "RDP yoxdur" demək deyil! Bu, "RDP görünmür" deməkdir. Real engagement-də filtered portların arxasında gizlənən servis-lər çox olur — müştərinin içərisindən (lateral movement ilə) baxanda filtered portlar birdən açıq görünə bilər.

State oxumağın praktik dəyəri — firewall aşkarlama:

| Nəticə | Ehtimal |
|---|---|
| Hamısı filtered (bir-iki open) | Firewall var, minimalist policy |
| Çox closed, az open | Firewall yoxdur ya da geniş policy, host birbaşa internetdə |
| filtered və closed qarışığı | Qaydalar port-auxin seçicidir — maraqlı hədəf |

Bir xatırlatma: default Nmap skanı yalnız 1000 ən məşhur TCP portu yoxlayır. "Nmap heç nə tapmadı" nəticəsi çox vaxt sadəcə "məşhur portlarda heç nə yoxdur" deməkdir — bütün portları yoxlamaq üçün `-p-` lazımdır (növbəti task).

**Sual 1**
`open`, `closed` və `filtered` state-lərini bir cümlə ilə tərif edin.

**Sual 2.**
"3389/tcp filtered" nəticəsi "RDP yoxdur" deməkdimi? İzah edin.

**Sual 3.**
Bütün portlar filtered çıxsa, hansı nəticə çıxarılır?

## Task 4 — Əsas Flag-lər: -sV, -sC, -A və -p-

Flag-lər Nmap-ın gücünü açan düymələrdir. Dörd ən vacibini işlək nümunə ilə öyrənək.

**`-sV` — versiya aşkarlama.** Açıq portdan sorğu göndərir və cavabın "imzasından" servisin adını və versiyasını müəyyən edir:

```
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu
80/tcp open  http    Apache httpd 2.4.41
```

"SSH var" yox, "OpenSSH 8.2p1" bilmək — CVE axtarışı üçün zəruridir. Bu sətirlər növbəti mərhələnin (istismar axtarışı) başlanğıc nöqtəsidir.

**`-sC` — default script scan.** Nmap Scripting Engine (NSE) — hazır skriptlər toplusudur; `-sC` ən təhlükəsiz və faydalı default set-i işə salır: anonim FTP yoxlaması, HTTP title, SSL sertifikat məlumatı, SMB versiya sorğusu və s. Nümunə: `-sC` FTP portunda avtomatik "Anonymous login allowed" yazarsa, işiniz asanlaşıb.

**`-A` — agressiv rejim.** Bir neçə şeyi birləşdirir: `-sV` + `-sC` + OS detection (`-O`) + traceroute. Bir əmrlə dolğun şəkil. Çatışmazlığı: sürətli, amma "səs-küylü" və bəzən hədəfi yüngül yükləyə bilər. Lab mühitində əla seçimdir.

**`-p-` — bütün portlar.** Default 1000 port əvəzinə 65535 portun hamısını yoxlayır. Vaxt aparır (dəqiqələr), amma "gizli servis" tapmağın yeganə tam yolu. Praktik vərdiş: əvvəl default sürətli skan, tapılarsa iş başa düşülür; heç nə tapılmazsa və ya anlaşılmazdırsa `-p-`.

Birləşmiş "full picture" əmri:

```bash
sudo nmap -sV -sC -p- 10.10.10.5
```

Və ya qısa agressiv formada:

```bash
sudo nmap -A 10.10.10.5
```

Fayda nəzərə alın: skan nəticəsini fayla yazmaq professional vərdişdir — `-oN nmap_ilk.txt` normal formatda saxlayır, `-oA ad` isə üç formatda (normal, grep-able, XML) bir anda yazır. XML gələcəkdə hesabat generatorlarına input olur.

Digər faydalı flag-lər cəmiyyətdə tez lazım olur: `-O` (OS detection), `-p 1-1000` (port aralığı), `-T4` (sürət template-i, amma diqqət: `-T5` hədəfi yükləyir və nəticəni pozur), `-v` (verbose, real-time izləmə), `--script vuln` (zəiflik yoxlayan NSE set-i — bu artıq enumeration-a ayaq açır).

Nəticə faylını `less nmap_ilk.txt` ilə oxuyun və şərh yazın: hansı servis-lər, hansı versiyalar, hansı ipucları var. Bu, "Nmap çalışdırmışam" ilə "recon aparmışam" arasındakı fərqdir.

**Sual 1**
`-sV` nəticəsində versiya bilmək növbəti hansı addımı mümkün edir?

**Sual 2**
`-A` flag-i hansı funksiyaları birləşdirir və çatışmazlığı nədir?

**Sual 3.**
Default 1000-port skan "heç nə tapmadı" deyəndə ilk ehtimal nədir və necə yoxlanılır?

## Task 5 — Mərhələli Skan Strategiyası: Recon-un Metodologiyası

Alətləri biləndən sonra "hansı sıra ilə" bilmək gəlir. Amma professional skan mərhələlidir — hər mərhələ əvvəlkinin nəticəsinə əsaslanır. Təsadüfi flag-lərlə atılan skanlar vaxt itkisi və yarımçıq nəticə deməkdir.

**Mərhələ 1 — Sürətli ümumi baxış:**

```bash
sudo nmap 10.10.10.5
```

Məqsəd: 30 saniyədə ümumi vəziyyət. Hansı məşhur portlar açıqdır? Bu, hədəfin "xarakteri" haqqında ilk hiss — 445 açıqdırsa Windows, 22/80/443 açıqdırsa tipik Linux web server.

**Mərhələ 2 — Tam port skanı:**

```bash
sudo nmap -p- --min-rate 1000 10.10.10.5 -oN full_ports.txt
```

Məqsəd: gizli portları tapmaq. `--min-rate` skanı sürətləndirir (lab şəraitində qəbul edilə bilən). Nəticədə açıq portların tam siyahısı olur — məsələn: 22, 80, 8080.

**Mərhələ 3 — Tapılmış portlarda dərinləşmə:**

```bash
sudo nmap -sV -sC -p 22,80,8080 10.10.10.5 -oN deep.txt
```

Məqsəd: yalnız açıq portlarda versiya + skript işə salmaq. Diqqət: `-p-` ilə `-sV -sC` birləşdirmək vaxt itkisidir — versiya sorğusu bütün bağlı portlarda boşuna işləyər. Ona görə mərhələ 2-nin nəticəsindən port siyahısı çıxarılır və mərhələ 3 yalnız ona yönəlir.

**Mərhələ 4 — (lazım olsa) UDP əsas portları:**

```bash
sudo nmap -sU --top-ports 20 10.10.10.5
```

Məqsəd: SNMP, DNS kimi kritik UDP servis-ləri. Tam UDP skan çox vaxt apardığından, ilk olaraq ən məşhur 20 port yoxlanılır.

Nəticə: dörd mərhələdən sonra əlinizdə dolğun bir şəkil var: bütün açıq TCP portlar, versiyalar, skript tapıntıları, əsas UDP portları. Bu şəkil növbəti room-un — Servis Enumeration-un input-udur.

Metodologiyanın əsas dəyəri — qənaətbəxşlik və izlənilənlik. Mərhələlər arası keçidlərdə həmişə "bu mərhələ nə tapdı, nəyi yoxlamaq lazımdır" sualı qeydlərinizə yazılır. Sonda bu qeydlər hesabatın recon bölməsinə çevrilir.

Bu room-da praktiki tapşırıq: lab-da hədəf maşın götürün və dörd mərhələni ardıcıl icra edib, hər mərhələnin nəticəsini ayrıca faylda saxlayın. Fərqi görün: mərhələ 1-də "5 port tapıldı", mərhələ 2-də isə "+3 gizli port" — bu, strategiyanın əməli dəyəridir.

**Sual 1**
Niyə `-p-` və `-sV` flag-lərini bir skanda birləşdirmək məsləhət deyil?

**Sual 2**
Mərhələli skanın dörd mərhələsini və hər birinin məqsədini sadalayın.

**Sual 3**
UDP üçün "top ports" yanaşmasına nə üçün üstünlük verilir?
