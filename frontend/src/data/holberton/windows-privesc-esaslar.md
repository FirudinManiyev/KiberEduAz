# Room: Windows PrivEsc — Əsaslar

**Path:** Privilege Escalation
**Module:** Windows PrivEsc
**Çətinlik:** Intermediate
**Təxmini vaxt:** 1.5 saat

## Room haqqında

Linux privesc-dən sonra Windows dünyası: eyni məqsəd (user → SYSTEM), fərqli mexanizmlər. Bu room-da Windows icazə modelini (token-lər, integrity levels), service misconfiguration, unquoted service path və AlwaysInstallElevated kimi ən klassik yüksəliş vektorlarının icmalı öyrənilir. Konkret praktika növbəti room-da (WinPEAS, token impersonation).

## Öyrənmə nəticələri

- Windows icazə modelini (SID, token, integrity levels) izah etmək
- Service misconfiguration privesc-inin məntiqini başa düşmək
- Unquoted service path texnikasını izah etmək
- AlwaysInstallElevated və digər registry qapılarını tanımaq

## Task 1 — Windows İcazə Modeli: Token-lər Dünyası

Linux-da "root/var-yox" modeli sadədir; Windows-da icazə sistemi daha qatlıdır:

**SID (Security Identifier):** hər prinsipalın (istifadəçi/qrup) unikal ID-si. Məşhurları: `S-1-5-18` (SYSTEM), `S-1-5-32-544` (Administrators), `S-1-5-32-545` (Users). `whoami /all` — cari token-in tam mənzərəsini verir (SID-lər, qruplar, imtiyazlar).

**Access Token:** login olanda prosesə verilən "kimlik kartı" — istifadəçi, qruplar və **imtiyazlar** (privileges) siyahısı. Hər proses token ilə yaşayır; fayl/rekursiya yoxlamaları tokenə görə edilir.

**SYSTEM:** LocalSystem — servislərin işlədiyi hesab, administratordan da yuxarı (OS daxili tam nəzarət). Privesc-in hədəf ucudur.

**Integrity Levels (Vista+):** proseslərin "etibar səviyyəsi": Low → Medium → High → System. UAC (User Account Control) məhz burada işləyir: admin qrupunda olsan belə, gündəlik proseslərin **Medium**-da işləyir; "Run as administrator" ilə **High**-a qalxır. Privesc praktikasında "admin qrupundayam, amma Medium token" → əvvəlcə UAC bypass/high token, sonra SYSTEM.

**Imtiyazlar (privileges):** token-daşıyıcı xüsusi haqlar: `SeDebugPrivilege` (istənilən prosesə yanaşma — LSASS dump!), `SeImpersonatePrivilege` (başqa identifikasiyanı təqlid — JuicyPotato ailəsi!), `SeBackupPrivilege` (faylları oxuma) və s. **"Adi istifadəçi + maraqlı imtiyaz" = qapı** — Windows privesc-in xarakterik modeli.

Privesc yollarının Windows xəritəsi (Linux-dakı üç qrupun analoqu):

1. **Konfiqurasiya:** servis icazələri, registry açarları, tasks,AlwaysInstallElevated, tokendəki imtiyazlar.
2. **Proqramlar:** köhnə/qeyri-standart quraşdırılmış servis/proqram local exploit-ləri (ən məhsuldar — Windows servisləri SYSTEM kimi işləyir!).
3. **Kernel:** Windows kernel exploit-ləri (köhnə sistemlərdə).

Bütün bu room-un aktuallığı: **servis = SYSTEM kimi icra** deməkdir — Windows-da servis səviyyəsindəki hər konfiqurasiya xətası birbaşa SYSTEM qapısıdır (Linux-dakı cron ilə müqayisədə daha "yaxın" hədəf).

**Sual 1**
Access token nə daşıyır və nə üçün proseslər üçün vacibdir?

**Sual 2.**
UAC integrity levels ilə necə əlaqəlidir?

**Sual 3.**
`SeImpersonatePrivilege` nə üçün periskop sayılır?

## Task 2 — Service Misconfiguration: SYSTEM-ə Ən Qısa Yol

Windows servis-ləri adətən **SYSTEM** hesabı ilə işləyir. Servis-lərin konfiqurasiyası registry-də və SCM (Service Control Manager)-də saxlanılır. Servis konfiqurasiyasının hər bir tərkib hissəsi — əgər adi istifadəçiyə yazıla bilirsə — SYSTEM qapısıdır. Üç klassik qapı:

**1. Yazıla bilən servis binary-si (BINARY_PATH_NAME):** servis hansı exe-ni işə salır? Əgər həmin exe-ni (və ya onun qovluğunu) adi istifadəçi yaza bilirsə — exe-ni əvəzlə (öz payload-unu qoy), servisi restart et → SYSTEM kimi icra.

**2. Servis konfiqurasiyasını dəyişmə icazəsi (SERVICE_CHANGE_CONFIG):** servisin öz parametrlərini (o cümlədən binary path) dəyişmək icazəsi varsa — birbaşa path dəyişdirilir:

```cmd
sc config VulnerableSvc binPath= "C:\temp\payload.exe"
sc start VulnerableSvc
```

`sc` əmrləri — Service Control interfeysi (qanuni admin aləti; hücumçu eyni əmrlərdən istifadə edir — Windows hücumlarının xarakterik cəhəti: hər şey leqal interfeyslər).

**3. Yazıla bilən qovluqdakı servis exe-si:** binary özü qorunub, amma **yerləşdiyi qovluq** (məs. `C:\Program Files\Vendor\` yerinə `C:\Vendor\`) yazıla biləndirsə — exe-ni silib eyni adla payload qoymaq.

Yoxlama alətləri (enum):

- `accesschk.exe` (Sysinternals): `accesschk.exe -uwcqv user Da` — hansı servis-ləri dəyişə bilirəm.
- PowerUp (PowerShell): `Get-ServiceUnquoted`, `Get-ModifiableServiceFile`, `Get-ModifiableService` — hamısı bir əmrdə.
- winPEAS — avtomatik hamısı (növbəti room-un qəhrəmanı).

Maraqlı statistik fakt: **"kötən yazılış custom servis" Windows privesc-in real dünyada ən çox görülən səbəblərindən biridir** — vendor proqramları quraşdırarkən icazələri səlis vermir; pentest-lərdə tez-tez rast gəlinir.

**Sual 1**
Niyə servis konfiqurasiyası SYSTEM qapısıdır?

**Sual 2.**
`sc config ... binPath=` nə edir?

**Sual 3.**
PowerUp-un üç əsas funksiyası nədir?

## Task 3 — Unquoted Service Path: Boşluqun İstismarı

Windows-un köhnə (və məşhur) primitivi: **əmr sətri boşluqlarla çağırılan exe-ni haradan tapır?**

Servis path-i **dırnaqsız və boşluqlu** olanda:

```
C:\Program Files\Vendor\Sub Dir\service.exe
```

Windows exe-ni axtararkən hər "boşluq kəsimində" dayanıb sınaq aparır:

```
C:\Program.exe         → baxılır (yoxdursa davam)
C:\Program Files\Vendor\Sub.exe  → baxılır
C:\Program Files\Vendor\Sub Dir\service.exe  → əsl
```

Yəni hücumçu **aşağı səviyyəli yazıla bilən qovluqlardan birinə** sınaq adını qoyur:

- `C:\Program.exe` yaza bilirsə (nadir — Program Files qorunur) → oraya.
- `C:\Program Files\Vendor\Sub.exe` (Vendor qovluğu zəif icazəlidirsə — lab-ların klassikası) → payload qoy, servis restart → **SYSTEM kimi Sub.exe işə düşür**.

Şərtlər (yoxlama siyahısı):

1. Servis path-i dırnaqsızdır (`sc qc ServiceName` → BINARY_PATH_NAME-də dırnaq yoxdur).
2. Path-də boşluq var.
3. Boşluqdan əvvəlki qovluqlardan biri yazıla biləndir.
4. Servis yüksək imtiyazla işləyir (SYSTEM/Admin) və **başladıla bilər** (adi istifadəçiyə SERVICE_START).

Axtarış: `wmic service get name,pathname,startmode | findstr /i "Auto" | findstr /i /v "C:\Windows\\"` (dırnaqsız dırnaqlı filtri) və ya PowerUp `Get-ServiceUnquoted` — hazır hesablayır.

Müasir Windows-larda bu primitiv daralmışdır (CreateProcess davranışı, qorunan qovluqlar), amma köhnə sistemlərdə və zəif quraşdırmalarda hələ də aktualdır — hər privesc enum alətinin standart yoxlamasıdır.

Müdafiə: quraşdırıcılar həmişə **dırnaqlı** path yazmalı (`"C:\Program Files\...\service.exe"`), qovluq icazələri standart (Program Files yazma yalnız admin).

**Sual 1**
Unquoted service path-in işləmə mexanizmi nədir?

**Sual 2.**
İstismarın dörd şərti hansılardır?

**Sual 3.**
Müdafiə tərəfi nədir?

## Task 4 — Registry və AlwaysInstallElevated: Konfiqurasiya Qapıları

**Registry** — Windows-un mərkəzi konfiqurasiya bazası. Privesc üçün bir neçə məşhur qapı:

**1. AlwaysInstallElevated:** MSI quraşdırma paketlərinin (installer-lərin) **həmişə yüksək imtiyazla** işə salınması rejimi. İki registry açarı aktiv olanda (adminlər üçün nəzərdə tutulan "rahatlıq" — amma qlobal açılıbsa):

```
HKCU\SOFTWARE\Policies\Microsoft\Windows\Installer\AlwaysInstallElevated = 1
HKLM\SOFTWARE\Policies\Microsoft\Windows\Installer\AlwaysInstallElevated = 1
```

→ adi istifadəçi **öz zərərli MSI-ni** hazırlayıb (msfvenom ilə) quraşdırır → SYSTEM kimi icra. Yoxlama: `reg query` hər iki açar; tapılanda: `msfvenom -p windows/x64/meterpreter/reverse_tcp ... -f msi -o setup.msi` → `msiexec /quiet /qn /i setup.msi`.

**2. Yazıla bilən autorun/registry start açarları:** `HKLM\...\Run` açarlarına yazma icazəsi varsa — başlanğıcda icra olunan əmr əlavə et (yenidən başlatma və ya runonce gözləmək lazım gəlir).

**3. Servislərin registry açarları:** hər servis üçün `HKLM\SYSTEM\CurrentControlSet\Services\Name` — buraya yazma icazəsi = servis konfiqurasiyasını dəyişmə (Task 2-nin registry variantı).

**4. Stored credentials:** registry-də saxlanan avtomatik login:

```
HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon
DefaultUserName / DefaultPassword (plaintext!)
```

Auto-login konfiqurlu sistemlərdə parol plaintext saxlanır — enum-un klassik tapıntısı.

Registry qapılarının ortaq xüsusiyyəti: **"yazıla bilən konfiqurasiya + yüksək imtiyazda icra" birləşməsi.** Bu, bütün Windows privesc-in daimi formuludur — sadəcə "konfiqurasiya" haradadır (servis/registry/task/MSI) fərqlənir.

Əlavə qapılar siyahısından (qısa icmal — hər biri enum alətlərində avtomatik yoxlanır): scheduled tasks (yazıla bilən task script-ləri — Linux cron-un analoqu), startup qovluqları (`shell:startup`), DLL hijacking (yazıla bilən qovluqlarda proqramların axtardığı DLL-lər), token impersonation (növbəti room).

**Sual 1**
AlwaysInstallElevated nə edir və necə istismar olunur?

**Sual 2.**
Registry-nin privesc üçün dörd qapısını sadalayın.

**Sual 3.**
Windows privesc-in "daimi formulu" nədir?

## Task 5 — Ssenari Bağlantısı və Module Keçidi

Kiçik sintez ssenarisi (konseptual — növbəti room-da praktiki dərinləşəcəyik):

**Vəziyyət:** Webshell-dən `iis apppool\web` hesabı shell-i (IIS worker). `whoami /priv` → `SeImpersonatePrivilege` göründü! Bu, **service hesablarının standart imtiyazıdır** — və qapıdır (JuicyPotato/PrintSpoofer ailəsi — token impersonation ilə SYSTEM; detalları növbəti room-da).

Bəs alternativ yollar da varmı? Enum (winPEAS) nəticəsi:

- Unquoted servis: `C:\Program Files\Custom\Tools\service.exe` — Custom qovluğu yazıla bilən → qapı.
- Registry: AlwaysInstallElevated = hər iki açar → qapı.
- Scheduled task: `C:\Tasks\report.bat` yazıla bilən → qapı.

Dörd qapıdan hər hansı biri kifayətdir — real hücumda ən "səbirli" olanı seçilir (aşkarlanma/crash riski ən azı). Peşəkar seçim meyarları: icra üçün nə lazımdır (restart? gözləmə?), iz nə qədər qalır, EDR nə görür.

Windows privesc-in Linux-dan fərqi (modul-arası körpü):

- **Servis mədəniyyəti:** Windows-da hər şey servic-dır və SYSTEM kimi işləyir — servis qapıları bol; Linux-da cron/systemd.
- **Registry:** mərkəzi konfiqurasiya bazası — Linux-daayar faylları (/etc/...); yazıla bilən konfiqurasiya = qapı hər ikisində.
- **Token modeli:** identifikasiya token-lərlə; Linux icazələr UID/dəstəklə — amma "imtiyaz" anlayışı (sudo) hər ikisində mərkəzi rol daşıyır.

Növbəti room — Windows PrivEsc Praktiki — winPEAS enumunun, SeImpersonatePrivilege istismarının (JuicyPotato ailəsi) və tam ssenarinin addım-addım keçidi.

**Sual 1**
SeImpersonatePrivilege webshell-də nəyi göstərir?

**Sual 2.**
Dörd qapıdan birini seçmək üçün hansı meyarlar var?

**Sual 3.**
Windows və Linux privesc arasındakı üç fərqi sadalayın.
