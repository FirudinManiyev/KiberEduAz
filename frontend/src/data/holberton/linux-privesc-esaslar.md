# Room: Linux PrivEsc — Əsaslar

**Path:** Privilege Escalation
**Module:** Linux PrivEsc
**Çətinlik:** Intermediate
**Təxmini vaxt:** 1.5 saat

## Room haqqında

Hücumun ən çox qazandığı an — adi istifadəçi shell-indən root-a çıxdığı andır. Bu room-da Linux privilege escalation-ın niyə vacib olduğunu, SUID/SGID, kernel exploit, cron job kimi ən ümumi yüksəliş vektorlarını ümumi xəritə şəklində öyrənəcəksiniz. Konkret addım-addım texnikalar növbəti room-da (Praktiki Texnikalar) gələcək — əvvəlcə model qurulur.

## Öyrənmə nəticələri

- Privilege escalation-ın hücum zəncirindəki rolunu izah etmək
- SUID/SGID mexanizmini və onun istismar məntiqini başa düşmək
- Kernel exploit və cron job vector-larını konseptual bilmək
- Privesc axtarışının sistemli yanaşmasını (enum avtomatlaşdırması) qurmaq

## Task 1 — Niyə Root: Hücumun İkinci Oxu

İlk shell (foothold) adətən məhduddur: www-data, service hesabı, adi istifadəçi. Bu səviyyədə nə əksikdir?

- **Hamısını oxumaq olmur:** /etc/shadow, digər istifadəçilərin faylları, bəzi log-lar.
- **Sistemi idarə etmək olmur:** service-lər, şəbəkə konfiqurasiyası, yeni proqram.
- **İzleri gizlətmək olmur** (özünüzlə bağlı): öz prosesləriniz, öz home qovluğunuz görünür.
- **Digər sistemlərə keçid üçün alət** yoxdur: sniffing (interfeysləri mix mode-a almaq), hash dump (mimikatz-ın Linux ekvivalentləri) — root tələb edir.

Root isə — sistemdə **hər şey**: bütün fayllar, bütün proseslərin yaddaşı, bütün şəbəkə trafiki (lokal), kernel-a qədər nəzarət. AD dünyasının "DA hesabı" Linux-da root-dur — eyni "hədəf ucu" mənası.

Privesc-in zəncirdəki yeri:

```
İlkin giriş (webshell/servis/phishing) → adi user shell → [PRIVESC] → root
                                                                        ↓
                                                    persistence / internal pivot / data exfil
```

Linux privesc yollarının mənşəyi üç qrupdur:

1. **Konfiqurasiya səhvləri:** yanlış icazələr, zəif sudo qaydaları, SUID binary-lər, yazıla bilən kritik fayllar. *Ən çox rast gəlinən.*
2. **Proqram/xidmət zəiflikləri:** köhnə versiyalı proqramların local exploit-ləri.
3. **Kernel zəiflikləri:** Linux kernel-ın öz CVе-ləri (Dirty COW, Dirty Pipe kimi) — qədim/mövcud sistemlərdə.

Bunların hamısının ortaq premissi: **sistemdə "root-a aparan qapı" artıq var** — privesc onu tapmaq sənətidir. Enum (növbəti task + praktiki room) qapıları axtarır; bu room hər qapı növünü tanıdır.

**Sual 1**
Adi istifadəçi shell-ində nə əksikdir (root ilə müqayisədə)?

**Sual 2**
Linux privesc yollarının üç qrupu hansılardır?

**Sual 3.**
"Hazır qapını tapmaq sənəti" ifadəsi nəyi ifadə edir?

## Task 2 — SUID/SGID: İcazələrin Daşıyıcıları

Linux icazə modelində hər faylın sahibi var; icra edilən proqram adətən **işə salan** istifadəçinin haqları ilə işləyir. İstisna — **SUID (Set User ID)** bit-i: SUID-li binary **sahibinin** haqları ilə işləyir.

Konseptual nümunə: `passwd` əmri — hər istifadəçi öz parolunu dəyişir, amma `/etc/shadow` yalnız root-un yazıla bildiyi fayldır. Həll: `passwd` binary-si root-a məxsusdur və SUID bit daşıyır → istənilən istifadəçi onu işə salanda proqram **root hüquqları ilə** işləyir və shadow-a yazır.

Bu, zəruri mexanizmdir (sistem belə işləyir), amma hücum üçün qapıdır:

- SUID bit **yanlış fayla** qoyulubsa (`root-owned bash + SUID` — birbaşa root shell), və ya
- SUID-li proqramın **öz funksiyası** shellə qaça bilirsə (aşağıda GTFOBins dünyası).

SUID axtarışı:

```bash
find / -perm -4000 -type f 2>/dev/null     # SUID
find / -perm -2000 -type f 2>/dev/null     # SGID (qrup haqları ilə)
```

Nəticə siyahısı analiz olunur: hansı binary-lər standartdır (`passwd`, `sudo`, `mount` — normal), hansı **qeyri-standartdır** (custom script-lər, köçürülmiş alətlər — şübhəli). Qeyri-standart SUID — lab-ların klassik tapıntısıdır.

SGID — eyni məntiq, qrup hüquqları üçün (məs. `write` command). İstismar modeli SUID ilə eynidir.

Mühafizə tərəfi: SUID minimal saxlanmalıdır (distribution-ların default siyahısı + zəruri əlavələr), custom SUID script-lər QADAĞANDIR (script SUID-i bir çox sistemdə iqnor olunur — amma binary wrapper-lər hələ təhlükəli), noexec mount-lar, müntəzəm audit (`find` cron-la).

**Sual 1**
SUID bit nə edir — `passwd` nümunəsində izah edin.

**Sual 2.**
SUID siyahısında "şübhəli" nədir?

**Sual 3.**
Niyə custom SUID script-lər təhlükəlidir (və ya iqnor olunur)?

## Task 3 — Kernel Exploit-lər: Sistemin Öz Qapısı

Kernel — özəkdır; onun zəifliyi bütün sistemin zəifliyidir. Kernel exploit-i işə salan adi istifadəçi **kernel məkanında kod icrası** qazanır = root.

Məşhur nümunələr (tarixi xəritə — konsept):

| Exploit | İl | Nə verirdi |
|---|---|---|
| Dirty COW (CVE-2016-5195) | 2016 | copy-on-write bug — yalnız-oxuna fayllara yazma → root |
| PwnKit (CVE-2021-4034) | 2021 | polkit's pkexec — 12 illik bug, hamıda hazır |
| Dirty Pipe (CVE-2022-0847) | 2022 | pipe buffer bug — fayllara yazma |
| Looney Tunables (CVE-2023-4911) | 2023 | GLIBC env bug — root |

Axın (pentest/lab-da):

1. **Versiya identifikasiyası:** `uname -a` → kernel versiyası.
2. **Uyğunluq yoxlaması:** versiya exploit-in təsir aralığındadırmı (exploit mətnində/qeydlərində göstərilir).
3. **Exploit tapmaq:** searchsploit (`searchsploit linux kernel 4.4 privesc`), Exploit-DB.
4. **Kompilyasiya/istifadə:** exploit C ilə yazılıbsa — hədəfdə (və ya uyğun arxitekturada cross-compile) `gcc`.
5. **İcra** — yalnız icazəli/lab hədəfində: kernel exploit-lər **sistemi qəlizlədirə bilər** (kernel panic) — production-da ən riskli privesc yoludur.

Kernel exploit-lərin prinsipi: **kernel patch-lanmamışsa, qapı açıqdır.** Buna görə müdafiə sadədir və çətindir: patch idarəetməsi (köhnə VM-lər, unudulmuş server-lər — real dünyada hələ də çoxdur), exploit mitigation-lər (SMEP/SMAP, KASLR — işi çətinləşdirir, amma mümkünsüz etmir), container-lərdə host kernel paylaşımı (container breakout mövzusu — advanced).

CTF/lab-da kernel exploit "sürətli yol" ola bilər; real pentest-də isə son seçimdir (stabil risk). Konfiqurasiya yolları (SUID, sudo, cron) həm daha çox rast gəlinir, həm daha təhlükəsizdir.

**Sual 1**
Kernel exploit nə verir və niyə?

**Sual 2.**
Kernel exploit axınının addımları hansılardır?

**Sual 3.**
Niyə production-da kernel exploit son seçimdir?

## Task 4 — Cron Job-lar və Servis Yolları

**Cron** — vaxtlaşdırılmış tapşırıq sistemi: `/etc/crontab`, `/etc/cron.d/`, istifadəçi crontab-ları. Privesc üçün üç klasik qapı:

**1. Yazıla bilən cron script:** root-a məxsus cron job-ın icra etdiyi **script adi istifadəçiyə yazılabiləndirsə** — script-i dəyişirsiniz (payload əlavə), növbəti icrada root kimi işləyir:

```bash
cat /etc/crontab
# m h dom mon dow user command
*/5 * * * * root /opt/scripts/backup.sh

ls -la /opt/scripts/backup.sh
# -rwxrw-r-- 1 root root ... → qrup/universal yazma var — qapıdır
```

**2. Wildcard injection (konsept):** cron script-ində `tar czf backup.tar.gz /home/*` kimi wildcard varsa — `tar`-ın `--checkpoint` flag-ları ilə əmr icrası qaçırmaq klassik texnikadır (detalları exploit-lə bağlı — prinsip: **script-in çağırdığı proqramın flag-ları manipulyasiya olunur**).

**3. PATH zəifliyi:** cron script-i `backup.sh` (tam yol yox) çağırırsa və PATH yazıla bilən qovluqdan keçirsə — öz `backup.sh`-inizi qoyursunuz.

Ümumi qayda: **root-un işə saldığı hər şey** (cron, systemd service, udev rule, startup script) — əgər onun mənbəyi (script/binary/konfiq) adi istifadəçi tərəfindən yazıla bilirsə — root qapısıdır.

Bu prinsipin genişlənməsi — **"yazıla bilən kritik fayl" ailəsi:**

- Yazıla bilən `/etc/passwd` (praktiki room-da addım-addım) — istifadəçi bazasına root giriş yazmaq.
- Yazıla bilən `/etc/sudoers` — özünüzə sudo verin.
- Yazıla bilən service binary-ləri (`/usr/sbin/service-name` — systemd yenidən başlayanda icra).
- Yazıla bilən PATH qovluqları (`/usr/local/bin` — çox çağırılan əmrləri əvəzləmək).

Axtarışın məntiqi — "kim nəyi root kimi işə salır və mən ona yaza bilirəmmi?" Bu sual bütün konfiqurasiya-yolu privesc-in özəyidir.

**Sual 1**
Cron script privesc-inin əsas şərti nədir?

**Sual 2.**
Wildcard injection nə ilə bağlıdır?

**Sual 3.**
"Kim nəyi root kimi işə salır?" sualı hansı ailəni əhatə edir?

## Task 5 — Enum Alətləri: Pəncərələri Sistematik Açmaq

Bütün bu qapıları əl ilə yoxlamaq mümkündür, amma sistematik yanaşma — avtomatik skanerlərdir:

**LinPEAS / linpeas.sh** — ən məşhur Linux privesc enum aləti. İşə salınır:

```bash
# Hədəfə köçür (http/python server ilə) və ya pipe
curl -L https://github.com/peass-ng/PEASS-ng/releases/latest/download/linpeas.sh | sh
```

Output-u rənglənir: **qırmızı/sarı** — yüksək ehtimal tapıntılar (SUID siyahısı, yazıla bilən kritik fayllar, sudo qaydaları, cron-lar, kernel versiya, maraqlı proseslər...). Peas ailəsi hər kateqoriyanı avtomatik yoxlayır və şərh edir.

**Linux Exploit Suggester (LES):** kernel versiyasına görə uyğun kernel exploit-ləri təklif edir.

**LSE (linux-smart-enumeration):** addım-addım, daha "reallıq-yönümlü" enum.

**pspy** — xüsusi alət: **prosesləri root haqları olmadan izləyir**. Cron job-ların nə vaxt, nə icra etdiyini görünür — "hər 5 dəqiqədə root script işə düşür" aşkarlanması üçün qiymətlidir (cron faylında yazılmayan tapşırıqlar üçün də).

Avtomatik alət + insan kombinasiyası (web modulundakı DAST dərsinin bu təkrarı): alətlər **siyahı** verir, insan **seçir**. Qırmızı çox olur — hansının real qapı olduğunu context müəyyənləşdirir (versiya, icazələr, mühit).

Enum metodologiyasının böyük xəritəsi (bu room-un yekunu — növbəti room-un planı):

| Kateqoriya | Nə yoxlanılır | Alət/komanda |
|---|---|---|
| Sistem | kernel, distro, patch | `uname -a`, LES |
| SUID/SGID | qeyri-standart binary-lər | `find -perm -4000` |
| Sudo | qaydalar, NOPASSWD | `sudo -l` |
| Cron | yazıla bilən script-lər | crontab-lar, pspy |
| Fayllar | yazıla bilən kritiklər | linpeas |
| Proqramlar | köhnə versiyalı local exploit-lər | versiya + searchsploit |
| Şəbəkə/cred | config fayllarda parollar | linpeas + grep |

Növbəti room (Praktiki Texnikalar) bu xəritənin ən məhsuldar xanalarını — `sudo -l`, yazıla bilən `/etc/passwd`, GTFOBins — addım-addım nümunələrlə gəzəcək.

**Sual 1**
linpeas nə edir və output necə şərh olunur?

**Sual 2.**
pspy hansı unikal imkan verir?

**Sual 3.**
Enum xəritəsinin yeddi kateqoriyasını sadalayın.
