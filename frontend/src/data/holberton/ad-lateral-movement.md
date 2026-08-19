# Room: AD-də Lateral Movement

**Path:** Active Directory Attacks
**Module:** AD Hücum Texnikaları
**Çətinlik:** Intermediate
**Təxmini vaxt:** 1.5 saat

## Room haqqında

Lateral movement — bir sistemdən digərinə keçid sənətidir: ilk foothold-dan başlayaraq şəbəkə daxilində hərəkət, hər sistemdə yeni credential/imiraz toplayaraq hədəfə (adətən DC/DA) çatmaq. Bu room-da hərəkət anlayışını, WMI/PsExec kimi klassik üsulları, hərəkətin izlərini və şəbəkə seqmentasiyasının müdafiə rolunu öyrənəcəksiniz.

## Öyrənmə nəticələri

- Lateral movement konseptini və onun AD hücum zəncirindəki rolunu izah etmək
- WMI, PsExec, WinRM, RDP kimi hərəkət üsullarını müqayisə etmək
- Hərəkətin yaratdığı izləri (log/event) bilmək
- Seqmentasiya və digər müdafiə tədbirlərinin əhəmiyyətini izah etmək

## Task 1 — Hərəkət Nədir: Foothold-dan Hədəfə

İlk giriş (foothold) — adətən zəif bir nöqtədir: işçi maşını, test server, zəif servis. Hədəf isə adətən mərkəzidir: Domain Controller, həssas data, kritik tətbiq. Aradakı məsafə — **lateral movement** ilə aşılır.

Hərəkətin "addımları" (hər addım əvvəlki room-ların bilikləridir):

1. **Cari mövqeyin qiymətləndirilməsi:** hansı imtiyazlar var (lokal admin? domain user?), hansı credential-lar əldə edilib.
2. **Hədəf seçimi:** BloodHound graph-ında növbəti düyün — hansı serverə çata bilirəm? Orada nə qazanacağam?
3. **Keçid:** üsul seçib (aşağıda) hədəf sistemdə icra.
4. **Yeni mövqeyin qiymətləndirilməsi:** dump → yeni hash/ticket → daha geniş imkanlar.
5. **Təkrar** — hədəfə çatana qədər.

Hərəkətin əsas xarakteri — **təkrarlanan tsikl**. Heç kim "bir dəfə hücum edib DC-yə düşmür"; hərəkət mərhələli yüksəlişdir. Müdafiə tərəfindən baxanda: hərəkət zamanı pəncərə açıqdır — hər keçid aşkarlanma şansı daşıyır (növbəti task-da izlər).

Niyə hərəkət "qaçınılmaz" hissədir? Çünki ilk giriş nöqtəsi demək olar heç vaxt hədəfin özü deyil. DC internetə açıq olmur, həssas data birbaşa ilk hədəfdə saxlanmır — hərəkət olmadan hücum "sərhəddə dayanmış" hücumdur.

**Sual 1**
Lateral movement-in iki ucu nədir (başlanğıc/hədəf)?

**Sual 2.**
Hərəkət tsiklinin addımlarını sadalayın.

**Sual 3.**
Niyə ilk foothold adətən hədəfin özü olmur?

## Task 2 — Keçid Üsulları: Alət Lüğəti

Hərəkət üsulları — Windows-un öz idarəetmə mexanizmləridir (admin-lər də eyni yollarla işləyir — hücumçu fərqi yalnız niyyətdir):

**PsExec tipli (SMB/RPC əsaslı):** uzaqdan proses yaratma. Impacket `psexec`/`smbexec`, Sysinternals PsExec (leqal tool), Metasploit `psexec` modulu. İcra: SMB (445) üzərindən service quraşdırılır → əmr icrası. Tələb: hədəfdə admin imtiyazı (və ADMIN$ paylaşımı). İz: service quraşdırma hadisələri (7045), yeni fayllar.

**WMI (DCOM əsaslı):** Windows Management Instrumentation — "hər şeyin idarə interfeysi". Uzaqdan sorğu və icra:

```bash
impacket-wmiexec -hashes :... administrator@10.10.10.20
```

Və ya `wmic /node:... process call create`. İz: WMI activity log-ları, SCCM/monitorinq agent-ləri tərəfindən görünür. PsExec-dən "təmiz" sayılır (fayl yazmır) — amma müasir EDR-lər tutur.

**WinRM (HTTP 5985/5986):** PowerShell remoting-in altında duran protokol. `evil-winrm` (alət), `Enter-PSSession` (leqal). Tələb: hədəfdə WinRM aktiv (server-lərdə adətən aktivdir). İz: PowerShell script block log-ları (aktiv olsa).

**RDP (3389):** qrafik interaktiv giriş. Hərəkət üçün "ağır" amma real hücumlarda istifadə olunur (GUI tətbiqləri, brauzer sessiyaları üçün). İz: 4624 (Type 10) login hadisələri.

**Scheduled Tasks / Service:** uzaqdan tapşırıq/service yaradılıb icra. (`impacket-atexec`, `sc` əmrləri.) İz: task/service yaranması.

**Remote PowerShell / CimSession / SSH (Windows-da):** əlavə yollar; Windows-da OpenSSH server getdikcə yayılır.

**DCSync:** xüsusi "hərəkət" — DC replikası hüququ (Directory Replication) olan hesab özünü DC kimi göstərib bütün hash-ləri "replikasiya" edir (mimikatz `lsadump::dcsync`). Bu, DC-ni tam ələ keçirməyin alternativ yolu. Müdafiə: replikasiya hüquqlarının ciddi məhdudlaşdırılması.

Alət seçim prinsipləri (pentest-də): hədəfdə **nə açıqdır** (portlar/protokollar), **hansı imtiyaz** var (admin? yalnız user?), **iz nə qədər vacibdir** (stealth ssenarisi). Məsələn: WinRM açıqdır və admin credential var → evil-winrm ən sadə yol; SMB bağlıdır → WinRM/HTTP üzərindən.

**Sual 1**
PsExec ailəsinin işləmə mexanizmi nədir?

**Sual 2.**
WMI PsExec-dən nə ilə fərqlənir?

**Sual 3.**
DCSync nə edir və hansı hüquq tələb edir?

## Task 3 — İzlər və Aşkarlanma: Hərəkət Görünür

Hərəkət üsullarının hamısı Windows hadisə log-larında iz buraxır — müdafiəçinin görməli olduqları:

| Hadisə | Məna | Hansı üsulla bağlı |
|---|---|---|
| **4624 (Type 3)** | Şəbəkə login-i | PsExec/WMI/SMB hərəkətləri |
| **4624 (Type 10)** | RemoteInteractive | RDP |
| **4688** | Yeni proses yaradıldı | bütün icra üsulları |
| **7045** | Yeni service quraşdırıldı | PsExec ailəsi (klassik işarə) |
| **4672** | Xüsusi imtiyazlarla login | admin hesabın hərəkəti |
| **5140/5145** | Şəbəkə paylaşım müraciəti | SMB əməliyyatları |
| Sysmon (1, 3, 10...) | Proses/şəbəkə/LSASS access | EDR səviyyəli görünməzlik |

Tiplik anomaliyalar (SIEM qaydalarının əsası): eyni hesabın çoxsaylı maşınlarda ardıcıl login-ləri; iş saatlarından kənar admin hərəkəti; nadir service quraşdırmaları; LSASS-a proses müraciətləri.

Hücum tərəfində bu o deməkdir: hərəkət = **çoxsaylı "işıq" nöqtələri**. Stealth hücumda (red team) üsul seçimi iz minimallaşdırma üzərindən qurulur; pentest-də isə izlər qəbul olunur (ROE çərçivəsində) və hesabatda "hansı izlərin hansı mərhələdə yarana biləcəyi" müdafiəyə göstərilir — bu, detection improverment üçün dəyərli tapıntıdır.

Bir vacib nüans: **log-ların özü də hədəfdir.** Hücumçular aşkarlanma azaltmaq üçün logları təmizləməyə cəhd edir (`wevtutil cl`, mimikatz log çıxarma) — amma bu, özü yeni iz yaradır (log-un boşalması = anomaliya). Mütəşəkkil müdafiələrdə log-lar xaricə (SIEM) daşıyır — yerli silmə artıq kömək etmir.

**Sual 1**
7045 hadisəsi hansı üsulun klassik işarəsidir?

**Sual 2.**
"Çoxsaylı maşında ardıcıl login" niyə anomaliyadır?

**Sual 3.**
Log-ların xaricə daşınması nə üçün vacibdir?

## Task 4 — Müdafiə: Seqmentasiya və Maneələr

Lateral movement müdafiəsi — "hərəkəti bahalaşdırmaq" üzərində qurulur:

**1. Şəbəkə seqmentasiyası:** şəbəkəni zonlara bölmək — VLAN-lar, firewall qaydaları, mikroseqmentasiya. Məqsəd: işçi maşınından server zonaya, server-dən DC-yə birbaşa yol olmasın; yalnız tələb olunan axınlar açıq. **Seqmentasiya hərəkətin ən böyük maneəsidir** — hücumçu "bir nöqtədən hər yerə" yox, "qapı-qapı" keçməli olur.

**2. Tiering modeli (təkrar — ən kritik):** admin hesablar heç vaxt aşağı tier maşınlarda login olmur → hash-lər orada yatmır → dump-dan DA gəlmir. Bu, "kəşfiyyat zəncirini" (credential caching) qırır.

**3. LAPS:** lokal admin parolları fərqli və avtomatik — bir maşından əldə edilən hash yalnız bir maşına çatır (hərəkət "mübadilə valyutası"nı itirir).

**4. Protokol gigiyenası:** SMBv1 off, NTLM məhdud, WinRM yalnız HTTPS (5986)/trusted hostslar, RDP - restricted admin mode, PsExec/service yaratma hüquqları məhdud.

**5. EDR/AV + behavioral detections:** imza əsaslı yox — davranış əsaslı (LSASS access, service creation pattern-ləri). Müasir EDR-lər mimikatz/impacket ailəsini davranışdan tanıyır.

**6. Honeytoken/decoy:** saxta admin hesablar, saxta paylaşım-lar — kim toxunsa dərhal siqnal. Hərəkət edən hücumçu "səhv qapı" açma riski daşıyır.

**7. İmkansız keçidlərin monitorinqi:** admin-in işçi maşınından serverə keçidi normalda olmamalıdır — "heç vaxt baş verməməli" axınların siqnalı ən təmiz anomaliyadır.

Seqmentasiyanın xüsusi vurğusu (focus-da da): **o, "hücum dayandırır" deyil — "hücumu yavaşladır və görünür edir".** Seqmentasiyalı şəbəkədə hərəkət üçün hücumçu qapı tapmalı, açmalı, iz buraxmalıdır — müdafiəçiyə zaman qazandırır. Bu, müdafiə arxitekturasının "zaman üçün məkan" mübadiləsidir.

**Sual 1**
Seqmentasiya hərəkəti necə məhdudlaşdırır?

**Sual 2.**
Tiering modeli hərəkət zəncirinin hansı halqasını qırır?

**Sual 3.**
"Zaman üçün məkan" mübadiləsi nə deməkdir?

## Task 5 — Module və Path Yekunu: AD Hücum Sənəti

AD Hücum Texnikaları module-u (5.2) tamamlandı. Üç room-un vahidi:

- **Kerberoasting** — ticket istə → offline crack → parol.
- **Pass-the-Hash/Ticket** — parol bilmədən hash/ticket ilə kimlik.
- **Lateral Movement** — üsullarla sistemlərarası keçid, zəncirin davamı.

Path-5 (Active Directory Attacks) ümumi mənzərəsi:

```
[5.1 Fundamentals]              [5.1 Enumeration]           [5.2 Attacks]
Struktur: domain/DC/GPO/  →   PowerView/BloodHound  →   Kerberoasting
forest/trust                    attack path graph          PtH/PtT
                                                           Lateral Movement
```

AD hücumunun böyük dərsləri (bütün path boyu):

1. **Hücum = icazələrin istismarı.** Exploit-lər az, yanlış konfiqurasiya çox: qrup üzvlüyü, ACL, parol paylaşımı, unudulmuş servis hesabı.
2. **Zəiflik zəncirləri:** hər tapıntı təkdir, amma hücum onları birləşdirir. Müdafiə zəncirin istənilən halqasını qıra bilər.
3. **Credential-lar mərkəzi sərvətdir:** parol, hash, ticket — hamısı "açardır"; onların qorunması (LAPS, Credential Guard, tiering) müdafiənin özəyidir.
4. **Görünməzlik yoxdur, yalnız gecikmə var:** hər texnika iz buraxır; müdafiə gözünü düzəltməlidir (SIEM, Sysmon, EDR).
5. **Müdafiə arxitekturadır:** tək patch yox — tiering, seqmentasiya, parol idarəetməsi, monitorinq birlikdə işləyir.

Növbəti path — Privilege Escalation — zəncirin "yuxarı" istiqamətini dərinləşdirir: əldə edilmiş adi shell-dən (Linux və Windows-da) root/SYSTEM səviyyəsinə çıxmaq. AD-dəki "lateral" hərəkətlə yanaşı, "vertical" yüksəliş — hücumun ikinci əsas oxudur.

**Sual 1**
Module-un üç room-unun vahid məntiqi nədir?

**Sual 2.**
AD hücumunun beş böyük dərsindən ikisini izah edin.

**Sual 3.**
Privilege Escalation path-i AD zəncirinə hansı istiqaməti əlavə edir?
