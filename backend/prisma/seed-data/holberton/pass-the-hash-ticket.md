# Room: Pass-the-Hash / Pass-the-Ticket

**Path:** Active Directory Attacks
**Module:** AD Hücum Texnikaları
**Çətinlik:** Intermediate
**Təxmini vaxt:** 1.5 saat

## Room haqqında

Pass-the-Hash (PtH) və Pass-the-Ticket (PtT) — parolu bilmədən onun "şəkli" ilə avtorizasiya etmək texnikalarıdır. Hər ikisi Windows/Kerberos arxitekturasının təbiətindən doğur və AD hücumlarının onurğa sütununu təşkil edir. Bu room-da hash ilə avtorizasiyanın niyə işlədiyini, hansı alətlərlə həyata keçirildiyini, bilet oğurluğunu və bunlara qarşı müdafiəni öyrənəcəksiniz.

## Öyrənmə nəticələri

- Parolun NTLM hash forması ilə avtorizasiyanın niyə mümkün olduğunu izah etmək
- Pass-the-Hash hücumunu alətlərlə (konseptual) tətbiq etmək
- Pass-the-Ticket və OverPass-the-Hash fərqlərini bilmək
- PtH/PtT-ə qarşı müdafiə təbəqələrini sadalamaq

## Task 1 — Niylə Hash Kifayət Edir: NTLM-in Təbiəti

Windows-da parol heç vaxt "parol" kimi saxlanmır — **NTLM hash** şəklində (parolun MD4-based hash-i; hash-dan parol geri qaytarıla bilməz, amma bəzi crack üsulları var). İkisi fərqli şeydir:

- **Parolu bilmək** — hash-i yenidən hesablamağa imkan verir.
- **Hash-i bilmək** — hesablama lazım olmadan bir çox avtorizasiya axınında "parol yerinə" istifadə oluna bilər.

Niyə? Çünki NTLM protokolunda (NTLMv1/v2 challenge-response) müştəri server-in verdiyi challenge-ı **parolun hash-i ilə** şifrələyir. Server də eyni hesablamayı öz saxladığı hash ilə edib müqayisə edir. Yəni sübut mexanizmi parolun özünü yox, hash-i "tanıyır". Hash əlindədirsə — challenge-ı doğru şifrələyə bilərsən → parol əsla istənilmir.

Pass-the-Hash — məhz budur: **NTLM hash-i əldə edilmiş hesabın kimliyində avtorizasiya.**

Hash haradan gəlir (mənbələr — əvvəlki room-ların davamı):

- **LSASS dump:** maşında admin olan hər kəs proses yaddaşından (mimikatz tipli alətlərlə) saxlanılan hash-ləri çıxarır. Ən məhsuldar mənbə.
- **SAM bazası:** lokal hesabların hash-ləri.
- **AD database (NTDS.dit):** DC ələ keçirilsə — bütün domain hesablarının hash-ləri.
- **Kerberoasting-dən fərqli olaraq:** burada crack yoxdur — hash birbaşa işləyir.

Bu o deməkdir ki, AD-də "parol" anlayışı yumşaqdır: hücumçunun əlində parolun özü, hash-i və ya ticket-i ola bilər — hamısı "kimlik sübutu" kimi çıxış edir. Müdafiəçinin buna görə problemi: parolları güclü etmək hash-in işləməsinə mane olmur.

**Sual 1**
NTLM hash-i paroldan fərqli nə cəhəti daşıyır?

**Sual 2.**
Challenge-response mexanizmi hash-i niyə "parol qədər" güclü edir?

**Sual 3.**
Hash mənbələrindən üçünü sadalayın.

## Task 2 — Pass-the-Hash Praktikası: Alətlər və Ssenari

PtH üçün əsas alət ailəsi — **Impacket** (Python toplusu). Ən çox istifadə olunanlar:

```bash
# Hash ilə SMB üzərindən əmr icrası (PSExec analoqu)
impacket-psexec -hashes :AAD3B435B51404EEAAD3B435B51404EE:31D6CFE0D16AE931B73C59D7E0C089C0 administrator@10.10.10.20

# Hash ilə WMI icrası
impacket-wmiexec -hashes :... administrator@10.10.10.20

# Hash ilə şəbəkə paylaşımlarına baxış
impacket-smbexec -hashes :... administrator@10.10.10.20
```

`-hashes` formatı: `LMhash:NThash` (müasir sistemlərdə LM hissə boş/ignor edilir). Nəticə: parol heç soruşulmur — hash ilə SYSTEM səviyyəli shell.

**Mühüm məhdudiyyətlər (peşəkar bilməsi lazım):**

- **Lokal hesablar vs domain hesabları:** PtH ən yaxşı lokal admin hesabları ilə işləyir. Domain hesabları üçün NTLM-in deaktivasiyası məhdudiyyət qoyur.
- **UAC (LocalAccountTokenFilterPolicy):** lokal admin hesabla uzaqdan girişdə UAC token filtri işə düşür — admin icazələri "filtirlənir" (bypass üçün registry dəyişkənliyi — amma bu, artıq admin olmağın nəticəsidir).
- **NTLM deaktivasiyası:** təşkilat "NTLM yox, yalnız Kerberos" policy qoyubsa — PtH (NTLM əsaslı) işləmir; amma... OverPass-the-Hash (aşağıda) qapını yenidən açır.
- **Hash nədir:**parolun yox, session açarının sübutu — bəzi "Protected Users" qrupu hesabları NTLM ilə ümumiyyətlə login edə bilmir.

**Ssenari (zəncir formasında):**

1. Phishing ilə işçi maşınında shell (adi istifadəçi səviyyəsi).
2. PrivEsc (növbəti path-in mövzusu) → lokal admin.
3. **LSASS dump → lokal admin hash-ləri.**
4. **PtH ilə digər maşınlara** (eyni lokal admin parolu paylaşılan maşınlar — real dünyada çox yayğındır).
5. Hər yeni maşında dump → yeni hash-lər (o maşında login olmuş domain hesabları da).
6. Zəncir bir gün DA-nin login olduğu serverdən keçir.

Ssenarinin əsas dərsi: **PtH tək hücum deyil, "hərəkət üsulu"dur** — əldə edilmiş hər hash yeni qapılar açır və hücum "rolling" xarakter daşıyır.

**Sual 1**
impacket-psexec -hashes nə edir?

**Sual 2.**
Domain-wide NTLM deaktivasiyası PtH-ni necə məhdudlaşdırır?

**Sual 3.**
"PtH hərəkət üsuludur" ifadəsini ssenari ilə izah edin.

## Task 3 — Pass-the-Ticket və OverPass-the-Hash

Kerberos dünyasında eyni ideyanın iki təzahürü:

**Pass-the-Ticket (PtT):** Kerberos ticket-ləri (TGT və ya service ticket) diskdə/yaddaşda fayl şəklində saxlanılır (KIRBI formatı). Ticket-i oğurlayıb (LSASS dump, kerberoasting yox — sadəcə fayl kopyalama) öz sessiyana yükləyirsən → sən o istifadəçisən. Ticket parolu bilmir, amma lazım da deyil — **ticket-in özü kimlik sübutudur.**

Praktik (konseptual): mimikatz/Rubeus ilə ticket export → başqa maşında import → resurslara qoşul. Məhdudiyyət: ticket-lər vaxtlıdırlar (default ~10 saat TGT) — oğurluqdan sonra "istifadə pəncərəsi" məhduddur.

**OverPass-the-Hash (OPtH):** NTLM hash-i Kerberos biletinə "çevirmək". NTLM deaktiv olsa belə: hash ilə Kerberos AS-REQ düzgün şifrələnə bilər → **TGT alınır** → normnal Kerberos həyatı. Yəni NTLM qadağası PtH-ni dayandırır, amma hash hələ də "valyuta"dır — sadəcə Kerberos dəvalütasına çevrilir.

Üç texnikanın qısa cədvəli:

| Texnika | Nə istifadə olunur | Hansı protokolla | Əsas mənbə |
|---|---|---|---|
| Pass-the-Hash | NTLM hash | NTLM (SMB və s.) | LSASS dump |
| Pass-the-Ticket | Ticket (TGT/TGS) | Kerberos | LSASS dump / fayl oğurluğu |
| OverPass-the-Hash | NTLM hash → TGT | Kerberos (çevrilmə) | LSASS dump |

**Golden Ticket / Silver Ticket** — mövzunun "inci" variantları (konseptual səviyyədə):

- **Golden Ticket:** `krbtgt` hesabının hash-i bilinirsə (DC dump-dan) — attacker **özü istənilən istifadəçi üçün TGT "yarada" bilər** (mimikatz ilə). Bu, domain-in tam kompromiti deməkdir — hətta parollar dəyişsə belə krbtgt hash-i dəyişməyincə (ikiqat rotate tələb olunur!) saxta biletlər yaşayır.
- **Silver Ticket:** Servis hesabının hash-i ilə service ticket forjirovkası (yalnız həmin servis üçün, amma həmin servisdə tam nəzarət).

Bu "forjirovka" texnikaları AD-nin ən ağır kompromit formalarıdır — müdafiəçilər üçün "incident response-da krbtgt rotate" standart addımdır, məhz Golden Ticket-ə görə.

**Sual 1**
Pass-the-Ticket nə ilə işləyir və məhdudiyyəti nədir?

**Sual 2.**
OverPass-the-Hash NTLM qadağasını necə "dolanır"?

**Sual 3.**
Golden Ticket nə üçün bu qədər ağır kompromitdir?

## Task 4 — Müdafiə: Credential-Informasiya Qoruması

PtH/PtT ailəsinə qarşı müdafiə — parolun "istifadə formalarını" qorumaq və hash-lərin ələ keçməsinin qarşısını almaq:

**1. Credential Guard (Windows 10+/Server 2016+):** LSASS-daki hash-ləri virtualizasiya-based izolyasiyada saxlayır — admin belə dump edə bilmir. PtH ailəsinin texnoloji qarşısı.

**2. Protected Users qrupu:** üzvləri üçün NTLM tam deaktiv, yalnız Kerberos; credential caching məhdud. Hüquqi hesablar üçün (DA-lər) tövsiyə olunur.

**3. NTLM məhdudlaşdırılması:** təşkilat səviyyəsində NTLM → Kerberos keçidi (ama OPtH qalıq riskdir).

**4. Lokal admin parol ayrılığı (LAPS):** hər maşının lokal admin parolu fərqli və avtomatik idarə olunur — "bir hash ilə bütün maşınlar" ssenarisi ölür. LAPS AD hücum müdafiəsinin ən effektli tədbirlərindən biridir.

**5. Tiering modeli:** admin-lərin (Tier 0) gündəlik istifadəçi maşınlarına (Tier 2) heç vaxt login olmaması — "DA hash-i işçi laptopunda yatmasın". Admin işi ayrı admin workstation-dan (PAW).

**6. Monitorinq:** NTLM login-lərin anomaliyaları (qeyri-adi maşından, qeyri-adi saatda), LSASS-a müraciət hadisələri (Sysmon ID 10 — lsass.exe-ə process access), 4624 (logon type/network) anomaliyaları. EDR məhsulları mimikatz davranışını imza/davranışla tutur.

**7. İnkident hallığı üçün:** krbtgt ikiqat rotate (Golden Ticket qarşı), qısamüddətli sessiya ticket ömrü, hasarlanmış hesabların təcili parol dəyişməsi (hash-ləri köhnəldir).

Bütün müdafiənin məntiqi bir cümlədə: **"credential" yalnız parol deyil — hash, ticket hamısı sərvətdir; onların saxlanması, istifadəsi və aşkarlanması idarə olunmalıdır.** Ənənəvi "güclü parol = təhlükəsizlik" modeli AD-də tək başına çatışmır.

**Sual 1**
LAPS hansı ssenarini öldürür?

**Sual 2.**
Credential Guard nə ilə fərqlənir (adi müdafiədən)?

**Sual 3.**
"Parol, hash, ticket — hamısı sərvətdir" nə deməkdir?

## Task 5 — Sintez: AD Zəncirinin Tam Şəkli

Bu module-un iki room-u (Kerberoasting + bu room) və növbəti (Lateral Movement) birlikdə AD hücum zəncirini təşkil edir. İndiyə qədərki ümumi mənzərə — bir ssenaridə birləşdirilmiş texnikalar:

```
[İlkin giriş]                    [Enum]                  [Credential əldə etmə]
phishing/zəif servis   →   PowerView/BloodHound   →   Kerberoasting (parol)
                                                          ↓
                              [Hərəkət]              LSASS dump (hash/ticket)
                              PtH / PtT / parol  ←────────┘
                                  ↓
                              [Yeni maşın] → [Yeni dump] → [Yeni hücumlar]
                                  ↓ (bir gün)
                              DA hesabı / DC → Golden Ticket → domain
```

Zəncirin xüsusiyyətləri (AD hücumlarının "imzası"):

1. **Heç bir addım tək başına "sıçrayış" deyil** — hər addım bir-iki imtiyaz qazandır, zəncir isə dağa çıxarır.
2. **Texnikalar bir-birini qidalandırır:** Kerberoasting parol verir; LSASS dump hash verir; PtH yeni maşına aparır; orada yenə dump...
3. **Alətlər sabitdir:** impacket (Linux tərəfi), mimikatz/Rubeus (Windows tərəfi), BloodHound (navigasiya). Bu "dördlük" AD hücumunun standart dəsti sayılır.

Bu şəkil həm də müdafiəyə görünür: zəncirin **hər halqasını qırmaq** kifayətdir ki, bütün zəncir dəysin — buna görə LAPS, Credential Guard, tiering, monitorinq... hamısı zəncirin müxtəlif halqalarına qarşı durur. Müdafiədə "bir qala divarı" yox, "çoxlu kiçik maneələr" modeli (defense in depth) AD-də özünü tam doğruldur.

Növbəti room (Lateral Movement) zəncirin "hərəkət" hissəsinin texniki detallarını (WMI, PsExec, RDP, WinRM...) daşıyacaq — bu room-da keçilən "PtH/PtT qapılarından" hansı alətlərlə keçildiyini göstərəcək.

**Sual 1**
AD hücum zəncirinin üç xüsusiyyəti nədir?

**Sual 2.**
"Niyə müdafiə hər halqanı qırmalıdır" — izah edin.

**Sual 3.**
Standart AD hücum alətləri dörtlüyü hansılardır?
