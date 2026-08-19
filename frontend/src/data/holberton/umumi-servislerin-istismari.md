# Room: Ümumi Servislərin İstismarı (FTP, SMB, SSH)

**Path:** Network & Infrastructure Security
**Module:** Network Exploitation
**Çətinlik:** Easy
**Təxmini vaxt:** 2 saat

## Room haqqında

Recon & Enumeration module-u açıq qapıları və onların arxasındakıları göstərdi; bu room isə həmin qapılardan içəri girməyin yollarını göstərir. FTP, SMB və SSH — hər şəbəkədə rast gəlinən üç servisdir və zəif konfiqurasiyada konkret istismar yolları açır. Hər biri üçün tipik zəiflikləri və konseptual istismar nümunələrini öyrənəcəyik.

## Öyrənmə nəticələri

- Anonymous FTP girişindən istismara gedən yolu izləmək
- SMB null session və bilinən zəifliklərin (konseptual) istismarını anlamaq
- Zəif SSH konfiqurasiyasının (parol auth, zəif açarlar) istismarını bilmək
- Hər servisin müdafiə konfiqurasiyasını sadalamaq

## Task 1 — FTP İstismarı: Anonim Girişdən Cod Ecranə

FTP (port 21) üçün istismar ssenariləri enum tapıntılarından doğur:

**Ssenari 1 — Anonim giriş + yazma icazəsi (webshell-yə körpü).** Enumeration-da anonim giriş və yazma icazəsi aşkarlandı. Növbəti məntiqi sual: **FTP qovluğu web server-in root-u ilə üst-üstə düşürmü?** Yoxlama:

```bash
# Anonim daxil ol
ftp 10.10.10.5 (anonymous/anonymous)
ftp> put test.txt           # yazma testi
ftp> ls
```

Sonra web-də `http://10.10.10.5/test.txt` açılır — fayl görünürsə, FTP = web root deməkdir. Buradan webshell addımı gəlir: PHP icra edən serverdirsə, webshell faylı FTP ilə yüklənilir və browser ilə çağırılır — RCE. (File upload room-undakı zəncirin şəbəkə versiyası.)

**Ssenari 2 — Versiya zəifliyi.** Banner-də köhnə versiya (məs. vsftpd 2.3.4) → searchsploit-də axtarış:

```bash
searchsploit vsftpd 2.3.4
```

Bu konkret versiya tarixən qəsdən yerləşdirilmiş backdoor ilə tanınır (6200 portunda shell). Metasploit-də hazır modulu var: `exploit/unix/ftp/vsftpd_234_backdoor`. Metasploit room-u bu axını dərinləşdirəcək; burada konsept kifayətdir: **banner → exploit bazası → hazır modul**.

**Ssenari 3 — Sniffing (şəbəkə mövqeyindən).** FTP şifrələmir — şəbəkədə MITM mövqeyi olan attacker (məs. Wi-Fi, ARP poisoning) parolları birbaşa oxuyur. Wireshark-da `ftp` filtrini qoşub `USER`/`PASS` komandlarını görmək klassik lab məşqidir.

Müdafiə açarı: anonim giriş yalnız read-only publik paylaşım üçün; yazma icazəsi web root-dan ayrı; FTP əvəzinə SFTP/FTPS (şifrəli); versiya yenilənməsi.

**Sual 1**
FTP yazma icazəsindən RCE-yə gedən zənciri izah edin.

**Sual 2**
FTP-nin şifrələməməsi hansı hücum ssenarisini yaradır?

**Sual 3**
vsftpd 2.3.4 nümunəsi hansı ümumi istismar axınını təmsil edir?

## Task 2 — SMB İstismarı: Null Session-dan EternalBlue-yə

SMB (445) — Windows mühitlərinin ən məhsuldar hücum səthlərindən biridir.

**Ssenari 1 — Null session + həssas paylaşım.** Enumeration-da `smbclient -L //IP -N` paylaşım siyahısı verdi (məs. `backup` paylaşımı parolsuz). İstismar: paylaşımın içində nə var? Klassik tapıntılar: `backup.zip` (parollu — hash ilə crack olunur: `zip2john` + `john`), konfiq faylları (parollar), `id_rsa` açarları (SSH-ya birbaşa körpü). Burada SMB özü "exploit" deyil — **məlumat qapısıdır**, zəiflik zənciri çox vaxt paylaşımın içindən davam edir.

**Ssenari 2 — SMBv1 + EternalBlue (MS17-010).** Tarixin ən məşhur SMB zəifliyi: SMBv1-dəki buğalar uzaqdan kod icrasına imkan verir. İstismar axını (konseptual):

1. `nmap --script smb-vuln-ms17-010 -p 445 IP` → "VULNERABLE" cavabı.
2. Metasploit: `exploit/windows/smb/ms17_010_eternalblue` + payload (reverse shell).
3. Uğurda SYSTEM səviyyəli shell — bu zəifliklə yayılan WannaCry kimi worm hadisəsi 2017-də dünya miqyasında məşhur oldu.

EternalBlue-nun dərsi: **patch olunmamış köhnə protokol versiyaları = birbaşa tirektən RCE**. Müasir Windows-larda SMBv1 söndürülür, port 445 internetə açılmır.

**Ssenari 3 — Authenticated istismar (PSExec).** Credential əldə edilibsə (crack/leak), SMB üzərindən PSExec tipli üsulla uzaqdan əmr icrası mümkündür (`impacket-psexec user:pass@IP`) — bu, artıq post-exploitation/lateral movement ərazisidir (AD module-larında dərinləşəcəyik), amma mənşəyi SMB-nin inzibati paylaşım­larından (ADMIN$/C$) gəlir.

**Ssenari 4 — Relay/NTLM hücumları.** SMB autentifikasiyası (NTLM) relay hücumlarına həssasdır — captured NTLM hash-in başqa servisə "relayed" olması (AD module-un mövzusu). Burada yalnız qeyd: SMB-nin təhlükələri təkcə versiya exploit-ləri deyil, protokolun identifikasiya mexanizmləridir.

Müdafiə: SMBv1 söndürülməsi, 445 portunun external qapatması, qonaq/anonim girişlərin bağlanması, güçlü parol siyasəti, signing/encryption aktivləşdirilməsi.

**Sual 1**
SMB null session istismarında "zəiflik zənciri" adətən haradan davam edir?

**Sual 2**
EternalBlue nədir və nə üçün bu qədər məşhurdur?

**Sual 3.**
Authenticated SMB istismarı (PSExec) nə üçün güclü hücum vasitəsidir?

## Task 3 — SSH İstismarı: Zəif Auth və Açar İdarəetməsi

SSH (22) — özü təhlükəsiz protokoldur (şifrələnmiş), amma **konfiqurasiyası** zəif olanda hədəfə çevrilir.

**Ssenari 1 — Parol auth + zəif parollar + brute-force.** `PasswordAuthentication yes` + root girişinə icazə (`PermitRootLogin yes`) + zəif parol = hydra ilə klasik hücum:

```bash
hydra -l root -P rockyou.txt 10.10.10.5 ssh
```

Tapılan credential yalnız SSH-a deyil, bütün digər servislərə (parol reuse) sınaq edilir — enumeration mərhələsində toplanan istifadəçi adları burada işə düşür.

**Ssenari 2 — Zəif/exposed private açarlar.** Private açar (`id_rsa`) haradansa əldə edilib (SMB paylaşımı, backup, git tarixçəsi):

```bash
chmod 600 id_rsa
ssh -i id_rsa user@10.10.10.5
```

Açarın özü parollu idarə olunursa (`ssh2john` + crack). Açar autentifikasiyası brute-force-a qapalı olduğundan "güclü" sayılır — amma açarın özü sızırsa, güc əhəmiyyət daşımır. Açarın əldə olunduğu yer zəiflik, açarın özü deyil.

**Ssenari 3 — Agent forwarding/znachok istismarı.** `ForwardAgent yes` təhlükəli serverdə — server-dəki root istifadəçisi agent-ə qoşulub sizin açarınızla digər sistemlərə keçə bilər. Oxşar: `authorized_keys`-də `from=` məhdudiyyəti olmayan geniş icazələr.

**Ssenari 4 — Zəif açar alqoritmləri/versiya.** Köhnə OpenSSH versiyaları (CVE-lər), DSA açarları, qısa RSA açarları (768 bit — çatıla bilən) — versiya skanından (`nmap -sV -p 22`) sonra exploit axtarışı.

Müdafiə açarı (konfiqurasiya gigiyenası `/etc/ssh/sshd_config`-də):

```
PermitRootLogin no
PasswordAuthentication no        # yalnız açar
PubkeyAuthentication yes
MaxAuthTries 3
AllowUsers specific_users
```

Plus: strong açarlar (Ed25519), açarların passphrase ilə qorunması, fail2ban (brute-force blok), agent forwarding-in deaktivləşdirilməsi.

SSH-nin dərsi: **təhlükəsiz protokol ≠ təhlükəsiz sistem.** Protokolun gücü konfiqurasiya xətaları ilə neytrallaşa bilər — bu, bütün servislərin ümumi qanunudur.

**Sual 1**
SSH üçün hydra ilə brute-force hansı konfiqurasiya şəraitində mümkündür?

**Sual 2.**
Sızan private açar ssenarisində zəiflik haradadır?

**Sual 3.**
SSH-nin müdafiə konfiqurasiyasından dörd elementi sadalayın.

## Task 4 — İstismar Metodologiyası: Enum-dan Exploit-ə Ümumi Axın

Üç servis üzərindən ümumi istismar metodologiyası formalaşdıraq — bu axın bütün servislərə (SMTP, RDP, database-lər...) eyni tətbiq olunur:

**Addım 1 — Tapıntının təsnifatı.** Enum nəticəsində hər açıq servis üçün sual: zəiflik nədir?

| Tapıntı növü | Nümunə | İstismar istiqaməti |
|---|---|---|
| Konfiqurasiya | Anonim giriş, default cred | Birbaşa giriş/istifadə |
| Versiya | vsftpd 2.3.4, SMBv1 | Public exploit axtarışı |
| Credential | Sızan parol/açar | Auth-istismar, spray |
| Məlumat | Backup, conf faylları | Zəncirin davamı |

**Addım 2 — Exploit mənbəyi.** Versiya zəifliyi aşkarlandıqda: `searchsploit` (lokal Exploit-DB), Metasploit (`search` modulu), CVE bazaları (NVD, vendor advisory). Tapılan exploit **hədəfə uyğunluğu** yoxlanılır: versiya aralığı, OS, dil paketi (məs. EternalBlue — yalnız müəyyən Windows versiyaları/dilləri).

**Addım 3 — İstismar (icazəli hədəfdə).** Əl ilə exploit (python script) və ya Metasploit (modul + payload + options). İlk cəhddən əminlik üçün: lab-da snapshot var, ROE məlumdur, crash riski qiymətləndirilib (service-dən başqa sistemə təsir edə bilər).

**Addım 4 — Nəticənin sabitlənməsi.** Uğurlu istismar nə verdi? Shell (kimin haqqında — SYSTEM? root? user?), fayl oxuma, hash? Növbəti mərhələyə (privesc/pivot) nə daşıyır?

**Addım 5 — Sənədləşdirmə.** Hər istismar: başlanğıc tapıntı (enum sübutu) → istifadə olunan exploit → nəticə (screenshot) → təsir. Bu zəncir hesabatın "attack narrative" hissəsidir.

Metodologiyanın qızıl qaydası: **exploit, enum tapıntısının sualına cavabdır.** "Mən Metasploit işə salım" — yox; "anonymous FTP + writable + webroot = webshell" — bəli. Alət tapıntıdan gəlir, tapıntı enum-dan.

**Sual 1**
Enum tapıntısının dörd növü hansılardır?

**Sual 2.**
Exploit seçərkən "hədəfə uyğunluq" nə deməkdir?

**Sual 3.**
"Exploit, enum tapıntısının sualına cavabdır" qaydasını nümunə ilə izah edin.

## Task 5 — Müdafiə Perspektivi: Hər Zəifliyin Arxası

Bu room-un sonunda masa o tərəfə keçsin — müdafiəçi gözləri ilə eyni üç servis:

**FTP müdafiəsi:** anonim giriş read-only publik üçün məcbirirsə — yazma yoxdu; yazma lazımdırsa — autentifikasiya + web root-dan ayrı; ideal — FTP-ni tamamilə SFTP/FTPS ilə əvəz etmək (şifrələmə sniffing-i də kəsir); versiya/patch idarəetməsi.

**SMB müdafiəsi:** SMBv1 söndürülməsi (həm təhlükəsizlik, həm performans); 445-in internetdən bloklanması (yalnız daxili); anonim/qonaq girişlərin qadağası; parol siyasəti + signing aktiv; paylaşım icazələrinin periodic auditi ("backup paylaşımı parolsuzdur" — tapıntı olmaqdan çıxmalı).

**SSH müdafiəsi:** açar-only auth; root login qadağası; MaxAuthTries/fail2ban; agent forwarding deaktiv; versiya yenilikləri; açarların passphrase+idaarəetməsi.

Ümumi müdafiə prinsipləri (üç servisdən çıxan):

1. **Default-dan uzaq:** hər quraşdırma dərhal konfiqurasiya auditi (default cred, anonim giriş).
2. **Minimal açıqlıq:** yalnız lazım olan portlar, yalnız lazım olan icazələr.
3. **Şifrələmə:** plaintext protokollar (FTP, Telnet, HTTP) müasir alternativlərlə (SFTP, HTTPS) əvəz edilməli.
4. **Patch idarəetməsi:** versiya zəiflikləri (EternalBlue nümunəsi) yalnız sistemli yeniləmə ilə aradan qalxır.
5. **Monitoring:** qeyri-adi davranışlar (çox uğursuz login, qəribə paylaşım sorğuları) görünməlidir.

Bu room Path-4-ün ilk daşıdır: növbəti room (Metasploit) burada adı çəkilən framework-ün sistemli istifadəsini öyrədəcək, sonra isə vulnerability assessment module-u zəifliklərin sistemli tapılması/skanlanması metodologiyasına keçəcək.

**Sual 1**
FTP-nin SFTP ilə əvəz edilməsi hansı iki hücum vectorunu kəsir?

**Sual 2.**
SMB üçün beş müdafiə tədbirindən üçünü sadalayın.

**Sual 3.**
"Minimal açıqlıq" prinsipi nə deməkdir?
