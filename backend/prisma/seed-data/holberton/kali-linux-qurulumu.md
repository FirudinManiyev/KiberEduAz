# Room: Kali Linux Qurulumu

**Path:** Red Team Fundamentals
**Module:** Pentesting Toolkit & Mühit
**Çətinlik:** Beginner
**Təxmini vaxt:** 1.5–2 saat

## Room haqqında

Bu room-da pentesting səyahətinizin əsasını qoyacaqsınız — Kali Linux-u virtual maşın kimi qurub işlək vəziyyətə gətirəcəksiniz. Kali Linux, Offensive Security tərəfindən dəstəklənən və içərisində yüzlərlə hazır təhlükəsizlik aləti olan Debian əsaslı Linux distributivdir. Room sonu sizdə tam konfiqurasiya edilmiş, yenilənmiş və istifadəyə hazır bir hücum mühiti olacaq.

## Öyrənmə nəticələri

- Kali Linux-un nə olduğunu və niyə industry standard hesab edildiyini izah edə bilmək
- VirtualBox və ya VMware üzərində Kali virtual maşınını qurmaq
- Sistemi ilkin konfiqurasiya etmək (update/upgrade, snapshot almaq)
- Kali-nin əsas qovluq strukturunu tanımaq və terminalda rahat hərəkət etmək

## Task 1 — Kali Linux Nədir və Niyə Pentesting Üçün Seçilir?

İlk sual: niyə ümumiyyətlə xüsusi bir distributiv lazımdır? Nəzəri olaraq hər hansı Linux-da (Ubuntu, Fedora və s.) pentesting alətlərini əl ilə qurmaq mümkündür. Amma bu, çox vaxt aparıcı bir prosesdir: dependency conflict-ləri, uyğun olmayan versiyalar, əl ilə yazılması lazım olan konfiqurasiyalar... Kali Linux bu problemi aradan qaldırır — alətlər bir-biri ilə test edilmiş halda, hazır paket kimi gəlir.

Kali-nin üstünlüklərini bir cədvəldə görək:

| Xüsusiyyət | Kali Linux | Adi Linux (məs. Ubuntu) |
|---|---|---|
| Əvvəlcədən quraşdırılmış alətlər | 600+ (Nmap, Burp, Metasploit...) | Yoxdur, hər biri əl ilə |
| Alətlərin uyğunluğu | Rəsmi repo-da test edilir | İstifadəçi özü həll etməlidir |
| Rolling release | Hər zaman yeni versiyalar | 6 ayda bir böyük yenilənmə |
| Dəstək | Offensive Security + geniş community | Təhlükəsizlik alətləri üçün zəif |

Kali Debian əsaslıdır, yəni `apt` paket meneceri, eyni fayl strukturu və eyni komandalardan istifadə olunur. Əgər gələcəkdə Ubuntu Server və ya digər Debian sistemləri ilə işləsəniz, bilikləriniz birbaşa keçərlidir.

Vacib məqam: Kali "gizli" və ya "anonim" bir sistem deyil. Kino təsiri yaratdığı üçün bəzən belə düşünülür, amma əslində Kali sadəcə alət dəstidir. Professional pentester-lərin bəziləri hətta adi Ubuntu üzərində işləyir — mühüm olan alət deyil, bilikdir. Kali yalnız rahatlıq təmin edir.

Həmçinin qeyd edək: Kali-ni yalnız qanuni hədəflərdə (öz lab mühitin, icazəli testlər, CTF platformaları) istifadə etmək lazımdır. Başqasının sisteminə icazəsiz skan belə etmək hüquqi nəticələr doğurur.

**Sual 1**
Kali Linux hansı Linux distributivinə əsaslanır və paket meneceri hansıdır?

**Sual 2**
Kali-nin "rolling release" olması praktikada nə deməkdir?

**Sual 3**
Kali Linux istifadə etmək öz-özlüyündə hücumları "aşkarlanmaz" edirmi? Niyə?

## Task 2 — Virtualizasiya: VirtualBox və ya VMware Seçimi

Kali-ni ən təhlükəsiz və ən rahat üsulla işlətmək üçün onu virtual maşın (VM) kimi işlədirik. Virtualizasiya nədir? Sadə analogiya: fiziki kompüteriniz bir bina, virtual maşın isə o binadakı mənzillərdən biridir. Hər mənzilin (VM) öz elektrik, su, qapısı (CPU, RAM, şəbəkə) var, lakin hamısı eyni binanı (host) paylaşır. Bir mənzildə yanğın baş versə (VM-da səhv və ya zərərli kod), binanın özü xilas olur.

İki əsas seçim var:

| Keyfiyyət | VirtualBox | VMware (Workstation Player/Fusion) |
|---|---|---|
| Qiymət | Pulsuz, open source | Player pulsuz, Pro version ödənişli |
| Performans | Yaxşı | Adətən bir qədür yaxşı |
| Snapshot | Var | Var |
| Platform | Windows, macOS, Linux | Windows, Linux (macOS üçün Fusion) |

Hər ikisi işini görür — bu kurs üçün VirtualBox seçmək taməm qane edicidir.

Quraşdırma zamanı diqqət yetiriləcək VM parametrləri:

- **Disk həcmi:** Kali quraşdırıldıqdan sonra özü təxminən 10-15 GB yer tutur, amma alətlər, wordlist-lər (məsələn rockyou.txt) və gələcəkdə toplayacağınız məlumatlar üçün 40-60 GB ayırmaq məsləhətdir.
- **RAM:** Minimum 2 GB işləyir, amma rahat iş üçün 4 GB və ya daha çox təyin edin. Burp Suite kimi Java əsaslı alətlər yaddaş acğızdır.
- **CPU:** 2 və ya daha çox nüvə. Nmap skanları və hash crack prosesləri CPU-dan asılıdır.
- **Şəbəkə rejimi:** İlk mərhələdə NAT (default) kifayətdir — VM internetə host üzərindən çıxır. Lab mühitlərində sonradan "Host-only" və ya "Bridged" rejimləri ilə tanış olacaqsınız.

Qızıl qayda: host maşının resurslarını tam olaraq VM-a verməyin — öz sisteminiz donar. Real yaddaşınızın təxminən yarısını keçməmək məntiqli başlanğıcdır.

**Sual 1**
Virtualizasiya nə üçün təhlükəsizlik tədqiqatçısı üçün vacibdir — xüsusən zərərli fayl təhlili edərkən?

**Sual 2**
Kali VM üçün nə qədər disk həcmi tövsiyə olunur və niyə minimum quraşdırma ölçüsündən çox?

**Sual 3**
NAT rejimi ilə Bridged rejimi arasındakı əsas fərq nədir?

## Task 3 — Kali-nin Quraşdırılması Addım-Addım

İndi əsl quraşdırmaya keçək. İki əsas yol var: hazır VM şəkli (pre-built image) və ya ISO faylından sıfırdan quraşdırma.

**Yol 1 — Hazır VM image (tövsiyə olunur):** Kali-nin rəsmi saytında VirtualBox və VMware üçün hazır şəkllər var. Faylı endirin, arxivdən çıxarın, VirtualBox-da "Import Appliance" ilə açın — sistem 5 dəqiqəyə işləkdir. Default giriş məlumatları `kali` istifadəçi adı və `kali` paroludur (bəzi versiyalarda root/kali). İlk girişdən dərhal sonra parolu dəyişməyi vərdiş edin.

**Yol 2 — ISO-dan quraşdırma:** Kali ISO endirilir, VM-a optical disk kimi qoşulur, graphikal installer ilə addım-addım quraşdırılır. Dil, region, istifadəçi adı, parol, disk bölgüsü (guided — entire disk seçmək ən sadədir) seçilir. Bu yol daha uzun olsa da, sistemin necə qurulduğunu dərindən başa düşməyə kömək edir.

Quraşdırma bitdikdən sonra ilk işlər:

1. Sistemi açın və login olun.
2. Terminal açın (Ctrl+Alt+T və ya Applications → Favorites → Terminal).
3. Snapshot alın! VirtualBox-da Machine → Take Snapshot. Niyə? Əgər gələcəkdə sistemi səhv konfiqurasiya etsəniz və ya zərərli proqram "sistemi yaksanız", snapshot-a qayıdaraq 2 dəqiqəyə işlək vəziyyətə qayıdersiniz. Bu, "save game" kimi işləyir — professional tədqiqatçılar snapshot almazdan əvvəl riskli əməliyyat heç cürə başlamırlar.

Bir məsləhət: snapshot adlarını mənalı verin — "təmiz quraşdırma", "update edilmiş", "lab-1 hazırdır" kimi. Altı ay sonra "snapshot1", "snapshot2" adları sizə heç nə deməyəcək.

**Sual 1**
Hazır VM image ilə ISO-dan quraşdırma arasında hansı praktik fərqlər var?

**Sual 2**
Snapshot nədir və niyə riskli əməliyyatlardan əvvəl alınmalıdır?

**Sual 3**
Kali-nin hazır VM image-inin default istifadəçi məlumatları nədir və ilk girişdən sonra nə etmək lazımdır?

## Task 4 — İlkin Konfiqurasiya: Update və Upgrade

Təzə quraşdırılmış Kali bir qədər "köhnə" hesab olunur — repo-dakı alətlərin yeni versiyaları, təhlükəsizlik yamaqları hər gün çıxır. Buna görə ilk iş sistemi yeniləməkdir. Terminalı açın və aşağıdakı əmri çalışdırın:

```bash
sudo apt update && sudo apt full-upgrade -y
```

Bu əmr nə edir?

- `apt update` — paket siyahılarını yeniləyir (neyə yeni versiya var, öyrənir, amma heç nə qurmur). Bunu "mağazanın kataloquna baxmaq" kimi təsəvvür edin.
- `apt full-upgrade` — kataloqa əsasən quraşdırılmış paketləri yeni versiyalara yüksəldir. Həmçinin yeni versiya üçün lazım olan dependency dəyişikliklərini idarə edir.
- `-y` — bütün suallara avtomatik "bəli" demək.
- `&&` — birinci əmr uğurla bitsə, ikincisi çalışır.

Sonda sistemi yenidən başladın: `sudo reboot`.

Yeniləmədən sonra bir neçə faydalı əlavə:

```bash
sudo apt install -y gobuster seclists
```

Beləliklə, işə yarar paketləri əlavə edirsiniz. Gələcəkdə "hansısa alət yoxdur" deyə xəta alsanız, `apt install <paket-adı>` ilə qurmaq adətən ilk cəhddir.

Bir vacib konfiqurasiya: ` /etc/apt/sources.list` faylında Kali-nin rəsmi repo ünvanı saxlanılır. Əgər `apt update` "404 Not Found" və ya GPG xətası verirsə, bu faylı yoxlamaq lazımdır — ancaq bu kursda adətən default konfiqurasiya problemsiz işləyir.

Alət hardan tapılır soruşsanız: əksər alətlər Applications menyu-sunda kateqoriyalara bölünüb — Information Gathering (recon), Exploitation, Password Attacks, Sniffing & Spoofing və s. Bu kateqoriyalar həm də pentest mərhələlərinin xəritəsidir — gələcək module-larda bu mərhələrin hər birinə dalacağıq.

Son bir vərdiş: update/upgrade əməliyyatını hər bir neçə həftədə bir təkrarlayın və yeniləmədən sonra snapshot alın — beləcə "işlək base" həmişə hazır olur.

**Sual 1**
`apt update` ilə `apt upgrade` arasındakı fərq nədir?

**Sual 2**
`&&` operatoru iki əmr arasında nə edir və `;` operatorundan nə ilə fərqlənir?

**Sual 3**
Alət tapılmadı xətası aldıqda ilk cəhd nə olmalıdır?

## Task 5 — Kali Qovluq Strukturuna İlk Baxış

Linux-a yeni gələnlər üçün fayl sistemi əvvəl qorxulu görünür, amma bu qorxu 5 dəqiqədə keçir. Kali, bütün Linux sistemləri kimi, tək bir kök qovluqdan — `/` (root qovluq) — başlayan ağac strukturuna malikdir. Windows-dakı `C:\` disk anlayışı burada yoxdur: hər şey — disklər, cihazlar, proseslər — fayl kimi təqdim olunur.

Pentester kimi ən çox işləyəcəyiniz yerlər:

| Qovluq | Məqsəd | Nümunə |
|---|---|---|
| `/home/kali` | Sizin şəxsi qovluğunuz | Skan nəticələri, şəxsi skriptlər |
| `/usr/share` | Alət məlumatları, wordlist-lər | `/usr/share/wordlists/rockyou.txt` |
| `/opt` | Əlavə proqramlar | Git-dən endirilən alətlər |
| `/etc` | Sistem konfiqurasiyası | `/etc/ssh/sshd_config` |
| `/var/log` | Loglar | `/var/log/auth.log` |
| `/tmp` | Müvəqqəti fayllar | Adətən hamı tərəfindən yazıla bilər |

Bir neçə əsas terminal əmri ilə məşq edin:

```bash
pwd                 # haradayam? (print working directory)
ls -la              # bu qovluqda nə var? (-la: gizli fayllar da daxil)
cd /usr/share/wordlists   # həmin qovluğa keç
cd ..               # bir səviyyə yuxarı
cd ~                # ev qovluğuna qayıt
```

Rockyou.txt haqqında xüsusi qeyd: bu, məşhur bir parol wordlist-idir və Kali-də sıxılmış halda gəlir. Açmaq üçün:

```bash
sudo gunzip /usr/share/wordlists/rockyou.txt.gz
```

Parol attack room-larında bu wordlist-dən çox istifadə edəcəyik.

Bu taskda məqsəd dərin biliyin yox, rahatlığın təməlidir: terminal açıb bir neçə qovluq arasında gəzin, `ls` ilə nələr olduğuna baxın. Linux-da "hər şey fayldır" prinsipini hiss etmək önəmlidir — gələcək room-larda konfiqurasiya fayllarını oxuyub dəyişərkən bu struktur sizə tanış gələcək.

**Sual 1**
Linux fayl sisteminin kökü hansı simvollur və Windows-dakı hansı anlayışa uyğun gəlir?

**Sual 2**
`/usr/share/wordlists` qovluğunda nə saxlanılır?

**Sual 3**
`pwd`, `ls -la` və `cd ~` əmrləri nə edir?
