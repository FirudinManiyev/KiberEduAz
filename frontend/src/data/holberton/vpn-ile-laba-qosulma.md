# Room: VPN ilə Lab-a Qoşulma

**Path:** Red Team Fundamentals
**Module:** Pentesting Toolkit & Mühit
**Çətinlik:** Beginner
**Təxmini vaxt:** 1 saat

## Room haqqında

Bu room-da OpenVPN vasitəsilə uzaq lab mühitinə qoşulmağı öyrənəcəksiniz. TryHackMe, HackTheBox və DMZ Academy kimi praktik platformalar hədəf maşınlarını internetdən təcrid olunmuş şəxsi şəbəkələrdə saxlayır və sizə yalnız VPN tunneli vasitəsilə giriş verir. Bu, həm təhlükəsizlik (hədəflər yalnız üzvlər üçün), həm də izolyasiya (skanlarınız başqalarına təsir etmir) üçün industry-standard yanaşmadır. Room-da .ovpn konfiqurasiya faylının strukturu, qoşulma əmrləri və tez-tez rast gəlinən problemlərin həlli var.

## Öyrənmə nəticələri

- VPN-in lab mühitlərində nə üçün istifadə edildiyini izah etmək
- .ovpn faylını qəbul edib OpenVPN ilə qoşulmaq
- Qoşulmanın uğurlunu yoxlamaq (IP yoxlaması, ping, interfeys)
- Ümumi qoşulma xətalarını diaqnoz etmək və həll etmək

## Task 1 — VPN Nədir və Lab Niyə Onu Tələb Edir?

VPN (Virtual Private Network) — internet üzərindən uzanan, şifrələnmiş "xüsusi koridor"dur. Analogiya: ümumi küçədə (internet) hamının danışıqlarını eşidə bilərkən, VPN sizinlə qarşı tərəf arasında görünməz bir boru qurur — borunun içindən keçən məlumat şifrələnib və kənardan oxuna bilməz.

Amma lab kontekstində VPN-in rolu bir qədər fərqlidir. Təhlükəsizlik platformaları (TryHackMe, HackTheBox və s.) hədəf maşınları birbaşa internetə açmırlar. Niyə? Təsəvvür edin: minlərlə istifadəçi eyni anda bir hədəfə skan atırsa, hədəf sadəcə tükənər (resursa hücum kimi təsir edər) və bu, başqa istifadəçinin təcrübəsini pozar. Əvəzində hədəflər daxili şəbəkədə saxlanılır və yalnız VPN tunneli ilə çatdırılır:

```
[Sizin Kali VM] ---(şifrəli tunnel)---> [VPN server] ---> [Lab şəbəkəsi: hədəf maşınlar]
```

Nəticədə hər istifadəçi öz şəxsi lab nüsxəsi ilə işləyir: siz hədəfi skan edirsən, heç kimə mane olmursan və kimsə sənə mane olmur.

Bu yanaşmanın sizin üçün bir neçə faydası var:

| Fayda | İzah |
|---|---|
| Təcrid | Hədəf maşınlar yalnız VPN daxilindən görünür — kənardan giriş yoxdur |
| Təhlükəsizlik | İcazəsiz şəxslər lab trafikini oxuya bilmir (şifrələnib) |
| Realizm | Özəl IP-lərlə (məs. 10.10.x.x) iş — real corporate network təcrübəsinə bənzəyir |
| Hesablar üzrə identifikasiya | Hər istifadəçi öz VPN sertifikatı ilə qoşulur, fəaliyyət izlənilir |

Bu kursda əsasən OpenVPN istifadə olunacaq — open source, cross-platform və bu platformaların standart seçimi. Növbəti taskda ona keçək.

**Sual 1**
VPN tunnelini "görünməz boru" analogiyası ilə izah edin.

**Sual 2**
Lab platformaları hədəfləri niyə birbaşa internetə açmır — iki səbəb deyin.

**Sual 3**
Özəl IP-lərlə (10.10.x.x kimi) işləmək hansı baxımdan realistikdir?

## Task 2 — .ovpn Faylı: Nədir və Necə Almaq Olar?

OpenVPN qoşulması üçün sizə konfiqurasiya faylı — .ovpn faylı lazımdır. Bu fayl bir növ "rəsmi dəvətnamə + yol xəritəsi"dir: server ünvanı, şifrələmə parametrləri və sizin şəxsi sertifikat/açar məlumatlarınız (bir çox platformada istifadəçi xüsusi fayl endirir) bir fayl içində birləşdirilir.

Platformadan asılı olaraq adətən belə alınır:

1. Platforma hesabınıza login olun (məsələn, TryHackMe-də Access bölməsi, HackTheBox-də VPN tab-ı).
2. Server lokasiyası seçin (yaxın region daha aşaşı latency verir).
3. "Download" düyməsi ilə .ovpn faylını endirin (məsələn, `paranoid.ovpn`).
4. Faylı Kali-da rahat bir yerə qoyun — məsələn, `~/vpn/` qovluğu.

Faylın daxili strukturu konseptual olaraq belə görünür:

```
client                      # client rejimi
remote vpn1.example.com 1194   # server ünvanı və port
proto udp                   # protokol (udp/tcp)
dev tun                     # virtual tunel interfeysi
auth SHA256                 # autentifikasiya alqoritmi
cipher AES-256-CBC          # şifrələmə alqoritmi
<ca> ... </ca>              # CA sertifikatı
<cert> ... </cert>          # sizin sertifikatınız
<key> ... </key>            # sizin şəxsi açarınız
```

Hər sətir texniki cəhətdən əhəmiyyətlidir, amma yeni başlayan üçün üçü əsasdır: `remote` — hara qoşulmalı; `cipher/auth` — necə şifrələməli; `<cert>/<key>` — kim olduğunu sübut edən sənədlər.

Mühüm təhlükəsizlik qaydası: .ovpn faylı şəxsi açarınızı ehtiva edə bilər — onu heç kimlə paylaşmayın, git repo-ya əlavə etməyin, çap etməyin. Bu fayl sizin lab şəxsiyyətinizdir; sızsa, başqası sizin adınıza qoşula bilər.

Faylın mövcudluğunu yoxlamaq üçün: `ls -la ~/vpn/` — faylın adını və ölçüsünü (adətən bir neçə KB) görərsiniz.

**Sual 1**
.ovpn faylında hansı üç əsas məlumat kateqoriyası var?

**Sual 2**
.ovpn faylını paylaşmamaq nə üçün kritikdir?

**Sual 3**
`remote` sətri nəyi göstərir və yanlış server seçmək nəyə gətirib çıxarır?

## Task 3 — Qoşulma: openvpn Əmri və Uğurun Yoxlanması

Kali-da OpenVPN client əvvəlcədən quraşdırılıb (yoxdursa: `sudo apt install openvpn`). Qoşulma əmri belədir:

```bash
sudo openvpn ~/vpn/paranoid.ovpn
```

Nə baş verir? Əmr bir neçə saniyə inititialization mətni çap edir — bu normaldır. Aşağıdakı sətirlər uğur əlamətidir:

```
Initialization Sequence Completed
```

Bu sətri gördünüzsə, tunnel qurulub. Terminalı açıq saxlayın — bu terminalda `Ctrl+C` basdıqda VPN bağlanır. VPN-i arxa fonda saxlamaq üçün alternativ:

```bash
sudo openvpn --config ~/vpn/paranoid.ovpn &> /tmp/vpn.log &
```

Beləcə log `/tmp/vpn.log` faylına yazılır və terminal azad olur.

Qoşulmanın uğurunu hər zaman yoxlayın — üç addımlı yoxlama:

1. **İnterfeys yoxlaması:** `ip a` — `tun0` adlı yeni interfeys görməlisiniz, VPN şəbəkəsindən bir IP ilə (məs. 10.x.x.x).
2. **Qoşulma səhifəsi:** platformanın "connected" status göstərən səhifəsini açın (məsələn, TryHackMe Access səhifəsində yaşıl işarə).
3. **Hədəfə ping:** lab-da hədəf maşını başladın və `ping 10.10.x.x` ilə cavab gözləyin. Cavab gəlirsə, hər şey hazırdır.

Növbəti mərhələ adətən belədir: hədəf maşın başladılır, sizə onun VPN IP-si verilir (məsələn, 10.10.10.45) və artıq Nmap ilə ilk skanınızı edə bilərsiniz:

```bash
nmap -sV 10.10.10.45
```

Bütün sonrakı module-larda hədəflərlə məhz bu şəkildə — VPN tunneli içindən — işləyəcəksiniz. Qoşulma vərdişə çevrilməlidir: hər sessiya əvvəlində VPN-i qaldır, uğuru yoxla, sonra işə başla.

**Sual 1**
`Initialization Sequence Completed` məsajı nə deməkdir və terminalı bağlasanız nə olur?

**Sual 2**
`ip a` əmri ilə uğurlu qoşulmanı necə təsdiqləyirsiniz?

**Sual 3**
VPN qoşulduqdan sonra ilk texniki addım adətən nədir?

## Task 4 — Tez-tez Rast Gəlinən Problemlər və Həlləri

VPN qoşulması adətən problemsiz keçir, amma yeni başlayanlar üçün bir neçə "klasik" problem var. Onları tanımaq saatlarla boş vaxt itirilməsinin qarşısını alır.

**Problem 1 — Autentifikasiya xətası (`AUTH_FAILED`).** Səbəblər: .ovpn faylı köhnədir (bəzi platformalar sertifikatları müntəzəm yeniləyir), hesab problemsiz deyil və ya eyni faylla çox paralel qoşulma var. Həll: platformadan yeni .ovpn endirin və köhnəsini silin.

**Problem 2 — Port/protokol bloklanması (`Connection refused` / uzun "connect" gözləməsi).** Bəzi şəbəkələr (korporativ, kafedəki WiFi) UDP 1194 portunu bloklayır. Həll: TCP 443 üzərindən işləyən .ovpn variantını seçin (əksər platformalar bunu təklif edir) — TCP 443 HTTPS ilə eyni port olduğundan nadirən bloklanır.

**Problem 3 — tun0 yoxdur, amma əmr "completed" deyir.** Səbəb: əmri `sudo`-sus işlətmisiniz — tunel interfeysi yaratmaq root hüququ tələb edir. Həll: `sudo openvpn ...`.

**Problem 4 — DNS problemi: ping IP işləyir, amma adlarla (hostnamelərlə) işləmir.** Lab-da adətən birbaşa IP istifadə olunur, amma bəzi lab-lar hostname verir. Həll: /etc/hosts faylına lazımi qeydi əlavə etmək (məsələn, `10.10.10.45 target.lab.local`) və ya platformanın tövsiyəsinə baxmaq.

**Problem 5 — "Address already in use" / köhnə process.** Əvvəlki openvpn process-i hələ də işləyir. Həll: `sudo pkill openvpn` ilə hamısını söndürün, sonra yenidən qoşulun.

Diaqnostikanın qızıl qaydası: log-a baxın. Ön planda işlədəndə bütün mesajlar terminaledır; arxa planda işlədəndə `/tmp/vpn.log` kimi faylı `tail -f /tmp/vpn.log` ilə canlı izləyin. Xəta mesajı adətən problemin səbəbini birbaşa deyir — onu oxumaq intuitiv təxmin etməkdən qat-qat effektivdir.

Yekun vərdiş olaraq: hər sessiyanın sonunda VPN-i bağlamağı unutmayın — `Ctrl+C` və ya `sudo pkill openvpn`.

**Sual 1**
`AUTH_FAILED` xətasının ən çox rast gəlinən səbəbi və ilk həll addımı nədir?

**Sual 2**
UDP 1194 bloklanan şəbəkədə hansı alternativ var və niyə bu alternativ adətən işləyir?

**Sual 3**
Köhnə openvpn process-i dayanmaq istəmirsənən hansı əmrlə hamısını söndürürsüz?

## Task 5 — Lab Mühitində İş Prinsipləri və Etik

Texniki qoşulmadan əlavə, lab mühitində işləməyin bir neçə prinsipi var ki, onları əvvəldən mənimsəmək gələcəkdə həm vaxt, həm etik problem qənaət edəcək.

**Prinsip 1 — Yalnız təyin olunmuş hədəflərə toxun.** VPN tunneli içində siz bir çox IP görə bilərsiniz, amma bu, "hər şey mənim üçündür" demək deyil. Platforma sizə konkret hədəf IP verir — skan və hücum yalnız ona qarşıdır. Digər istifadəçilərin maşınlarını skan etmək qayda pozuntusudur və hesabın bloklanması ilə nəticələnə bilər. Real dünyada bu prinsip daha da sərtdir: pentest müqaviləsində hansı IP aralığının hədəf olduğu yazılır və kənara çıxmaq hüquqi məsuliyyət yaradır.

**Prinsip 2 — Skanların "səs-küyü"nə nəzarət.** Aqressiv skanlar (`-A`, `-p-`, sürətli UDP skan) hədəf platformada yük yaradır. Lab-da adətən problem olmur, amma vaxtaşırı "hədəmə cavab vermir" probleminin səbəbi məhz həddindən artıq aqressiv skandır — bir az gözləyin və daha hədəfli skan edin.

**Prinsip 3 — Qeydlər aparmaq.** Hər lab sessiyasını bir faylda qeyd edin: hədəf IP, hansı portlar açıqdır, hansı istismar işlədi, flag harada tapıldı. Bu vərdiş professional hesabat yazmağın təməlidir — gələcəkdə "Reporting" module-da elə bu qeydlərdən hesabat quracaqsınız.

**Prinsip 4 — Reset və ya yenidən başlatma.** Hədəf maşını "qırdınızsa" (exploit nəticəsində çökdüsə), platformanın reset funksiyası ilə onu geri qaytarmaq olur. Amma unutmayın: reset hər şeyi sıfırlayır — əldə etdiyiniz shell-lər, yaratdığınız fayllar gedir. Əvvəlcə vacib məlumatları (hash-lər, mətn faylları) öz maşınıza kopyalayın, sonra reset edin.

Bu prinsiplər birlikdə sizə "professonal vərdişlər" formalaşdırır: hədəfyönümlü, izlənilən, sənədləşdirilmiş iş. Növbəti module — Recon & Enumeration — bu təməl üzərində ilk real texniki fəaliyyətlərə keçəcək.

**Sual 1**
VPN içində gördüyünüz hər IP-yə skan atmaq nə üçün yanlışdır — lab və real dünyada nəticəsi nədir?

**Sual 2**
Hədəf maşını reset etməzdən əvvəl nə etmək lazımdır və niyə?

**Sual 3**
Sessiya qeydləri aparmaq hansı gələcək bacarığın təməlini qoyur?
