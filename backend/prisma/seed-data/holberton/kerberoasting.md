# Room: Kerberoasting

**Path:** Active Directory Attacks
**Module:** AD Hücum Texnikaları
**Çətinlik:** Intermediate
**Təxmini vaxt:** 1.5 saat

## Room haqqında

Kerberoasting — AD-dəki ən məşhur hücum texnikalarından biridir: hər hansı adi domain istifadəçisi, servis hesabları üçün service ticket istəyib onları **offline** crack-ləyə bilər. Bu room-da Kerberos autentifikasiyasının qısa təkrarını, ticket-in necə istənməsi və parolun necə çıxarıldığını, hansı hesabların hədəf olduğunu və müdafiə tədbirlərini öyrənəcəksiniz.

## Öyrənmə nəticələri

- Kerberos TGT/TGS axınını xatırlamaq və Kerberoasting-in bu axındakı yerini göstərmək
- Service ticket-in offline crack imkanını izah etmək
- Hədəf seçim meyarlarını (SPN-li hesablar, parol gücü) bilmək
- Kerberoasting-ə qarşı müdafiə tədbirlərini sadalamaq

## Task 1 — Kerberos Təkrar: Ticket Mexanizmi

Kerberoasting-i anlamaq üçün Kerberos-un işləməsini dəqiq bilmək lazımdır (AD strukturu room-unulnanın təkrarı, bu dəfə hücum gözü ilə):

1. **AS-REQ/AS-REP:** İstifadəçi login edir — parolundan düzələn açar ilə DC-yə sorğu. DC **TGT** (Ticket Granting Ticket) qaytarır — istifadəçinin parol açarı ilə şifrələnmiş "session açarı" və DC-nin imzaladığı ticket.
2. **TGS-REQ/TGS-REP:** Resurs lazımdır (fayl server, SQL, web app). İstifadəçi TGT-ni göstərib **"bu servis üçün ticket ver"** deyir. DC **service ticket (TGS)** qaytarır.
3. **AP-REQ:** Service ticket resursa təqdim olunur → giriş.

Kritik detal: **service ticket servis hesabının parolundan törəmiş açarla şifrələnir.** Servis (məs. `sql-svc` hesabı altında işləyən SQL Server) ticket-i açmaq üçün öz parol açarından istifadə edir.

Hücum məntiqi buradan doğur:

- **TGS-REQ zamanı heç bir "yalnız real istifadəçi" yoxlaması yoxdur** — hər hansı valid domain istifadəçisi istədiyi servisin ticket-ini istəyə bilər. Bu, dizaynın özüdür (məqsədli əlçatanlıq).
- Ticket-in şifrələnmə açarı = servis hesabının parolu → **ticket əlindədirsə, parolu offline brute-force edə bilərsən.**
- Offline = DC-yə heç bir əlavə sorğu yoxdur = aşkarlanma minimal (biri "ticket istədi" — hansı ki qanuni hərəkətdir; crack isə attacker-in maşınında baş verir).

Yəni Kerberoasting = "qanuni sorğu + offline crack". Bu kombinasiya onu AD-də ən "sərfəli" hücumlardan birinə çevirir.

**Sual 1**
Service ticket nə ilə şifrələnir?

**Sual 2.**
Niyə hər hansı istifadəçi istədiyi servisin ticket-ini istəyə bilir?

**Sual 3.**
Kerberoasting niyə "aşkarlanması çətin" sayılır?

## Task 2 — Hücumun Gedişatı: İstə və Crack Et

Kerberoasting addımları (lab mühitində):

**Addım 1 — Hədəflərin tapılması.** SPN (Service Principal Name) daşıyan hesablar — bunlar servis hesablarıdır və ticket istənilə bilən "servis identifikatorları"dır:

```powershell
# PowerView
Get-DomainUser -SPN
```

Və ya BloodHound-da "Kerberoastable Users" sorğusu. Hədəyə görə: mümkün qədər **parolu zəif ehtimal olunan** hesablar (köhnə servis hesabları, texniki hesablar).

**Addım 2 — Ticket-in istənilməsi.** Alətlər: Rubeus (Windows), GetUserSPNs.py (impacket, Linux):

```bash
GetUserSPNs.py -request -dc-ip 10.10.10.10 corp.local/ali:Parol123
```

Output: hər SPN üçün Kirbi formatında (və ya hash şəklində) service ticket. Diqqət: bu addım **yalnız bir DC sorğusudur** — log-da adi TGS-REQ kimi görünür.

**Addım 3 — Offline crack.** Ticket hash-i John/Hashcat formatına çevrilir:

```bash
# hashcat (mode 13100 — Kerberos TGS-REP RC4)
hashcat -m 13100 ticket.hash /usr/share/wordlists/rockyou.txt
```

Crack uğurlu olanda: servis hesabının **parolu açıq mətn şəklində** əldə edilir.

**Addım 4 — Parolla nə edilir?** Servis hesabının parolu = həmin servisin (və çox vaxt server-in) resurslarına giriş:

- Hesabla birbaşa login (əgər icazə varsa — RDP/WinRM/SSH).
- Parolun başqa yerlərdə reuse-u — shared admin parolları real dünyada yayğındır.
- Hesabın icazələri — BloodHound-da bax: bu hesab hansı qruplardadır? Hansı server-də admin?

AES/RC4 qeydi: Kerberos encryption tipləri var (RC4-HMAC, AES128/256). RC4 hash-ləri (etype 23) sürətlə crack olunur; AES daha yavaş amma mümkündür (mode 19600/19700). Müasir domain-lərdə RC4 deaktiv edilə bilər — o zaman Kerberoasting texniki olaraq qalır, amma praktiki "səmərəsi" azalır.

**Sual 1**
Hədələrin tapılması hansı alətlə/sorğu ilə aparılır?

**Sual 2.**
GetUserSPNs.py -request nə edir və nə qaytarır?

**Sual 3.**
Crack uğurlu olanda əldə edilən parolla hansı yollar açılır?

## Task 3 — Hədəf Seçimi və Parol Gücü Amili

Kerberoasting-in uğuru bir amilə bağlıdır: **servis hesabının parol gücü.** Bu, "zəifliyi" birbaşa parol siyasətinə bağlayan texnikadır.

Uğur ehtimalı yüksək hədəflər:

- Köhnə/miras servis hesabları (illərdir dəyişilməyən).
- Default naming pattern-lər (`sqlsvc`, `backup-svc`, `test-spn`) — parol da pattern daşıyır.
- Şirkət müştərilərinin yarım-standart hesabları.
- Test/dev mühitindən production-a köçmüş hesablar.

Uğur ehtimalı aşağı:

- MSSQL-in avtomatik idarə etdiyi **gMSA** (Group Managed Service Accounts) hesabları — parolları avtomatik, uzun (120 simvol) və heç kim bilmir → crack praktiki olaraq mümkünsüz.
- Parol siyasəti ciddi tətbiq olunan (25+ simvol) servis hesabları.

Bu amil müdafiəyə birbaşa töhfə verir (növbəti task), amma attacker üçün də dərkdir: Kerberoasting "həmişə işləyən" deyil — "şans oyunu"dur ki, onu lab-da da görəcəksiniz: rockyou ilə 10 hədəfdən 1-i açılır, ya da heç biri. Uğursuz Kerberoasting = enum məlumatı ("güclü parollar var") — bu da qiymətlidir.

Bir vacib fərqləndirmə (tezin başqa texnika ilə qarışmasın): **AS-REP Roasting.** Kerberoasting TGS-REP-i (servis ticket) hədəfləyir; AS-REP Roasting isə "preauth tələb etməyən" hesabların TGT cavabını (AS-REP) hədəfləyir. Məntiq eynidir (cavabda parol-əsaslı şifrələnmiş hissə → offline crack), amma şərt fərqlidir: hesabda "Do not require Kerberos preauthentication" işarəsi (yanlış/köhnə konfiqurasiya). Hər iki texnika eyni crack infrastrukturundan istifadə edir.

Pentest hesabatında Kerberoasting tapıntısı necə görünür? İki variant: (a) "Kerberoasting mümkündür" — hər hansı ticket alınabildiyi üçün (bu özü-özünə zəiflik deyil — AD-nin təbiətidir); (b) "parolu crack olunan servis hesabı" — bu, konkret tapıntıdır (zəif parol + nəticədə əldə edilən icazələr). Professional hesabat ikincini sübutla verir.

**Sual 1**
Kerberoasting uğurunu təyin edən əsas amil nədir?

**Sual 2.**
gMSA hesabları nə üçün Kerberoasting-ə davamlıdır?

**Sual 3.**
AS-REP Roasting ilə Kerberoasting arasındakı fərq nədir?

## Task 4 — Müdafiə: Parollar, Tiplər, Monitorinq

Kerberoasting-ə qarşı müdafiə — çoxtəbəqəli, amma mərkəzi prinsip aydındır: **servis parollarını crack-ləməyə dəyməz hala gətir.**

**1. Güclü/uzun servis parolları:** 25+ random simvol. Kerberoasting "mümkün" qalır, amma crack praktiki olaraq iflas edir. Ən sadə, ən effektli tədbir.

**2. gMSA istifadəsi:** Group Managed Service Accounts — parollar avtomatik generasiya/rotate, heç kim bilmir, kompüter hesabları üçün idarə olunur. Servis parol idarəetməsinin müasir standartı.

**3. Servis hesablarını ayrı saxla:** servis hesabları yüksək imtiyaz daşımasın (yalnız lazım olan servisdə), qrup üzvlükləri minimal, admin qruplarına üzvlük yox.

**4. RC4 deaktivasiyası:** Kerberos policy-də RC4-HMAC söndürülsə — crack ölçüsü (hashcat sürəti) AES üçün kəskin yavaşlayır. Amma köhnə sistem uyğunluğu yoxlanmalıdır.

**5. Monitorinq:** Kerberoasting-in DC-də görünən izi — TGS-REQ-lərdir. Şübhə əlamətləri: bir istifadəçinin qısa müddətdə çoxsaylı/nadir SPN-lər üçün ticket istəməsi; RC4 encryption tipli TGS-REP-lər (müasir mühitdə AES gözlənilir). SIEM qaydaları bunu tutmaq üçün yazılır ( detections: "RC4 ticket istənməsi" çox vaxt Kerberoasting işarəsidir).

**6. Hesab inventarı:** domain-də neçə SPN-li hesab var, kimlər sahiblik edir, son parol dəyişməsi nə vaxt — sadic inventar "unudulmuş" servis hesablarını üzə çıxarır.

Müdafiəçinin yekun dərsi: Kerberoasting aradan qaldırıla bilən "bug" deyil — Kerberos-ün dizaynıdır. Ona görə müdafiə = **riskin idarə edilməsi** (parolları baha etmək + izləmək), yox "yamaq". Bu, AD müdafiəsinin xarakterik modelidir: bir çox hücum texnikası "qadağan edilə bilməz", ancaq "bahalaşdırıla bilər".

**Sual 1**
Ən sadə və effektli müdafiə tədbiri hansıdır?

**Sual 2.**
Müdafiəçinin monitorinqdə hansı əlamətləri izləməli?

**Sual 3.**
"Kerberoasting qadağan edilə bilməz, bahalaşdırıla bilər" nə deməkdir?

## Task 5 — Lab Ssenarisi və Module Bağlantısı

Konseptual lab ssenarisi (TryHackMe "Kerberoasting" room-u, HTB maşınları və ya GOAD):

**Verilən:** `corp.local` domain-i, adi istifadəçi `ali:Passw0rd!` (ilkin giriş — məs. phishing nəticəsi).

**Addım 1 — Enum:** `Get-DomainUser -SPN` → nəticə: `sql-svc` (MSSQL), `backup-job` (zəif görünən ad), `web-app` hesabları.

**Addım 2 — Ticket toplama:** `GetUserSPNs.py -request corp.local/ali:'Passw0rd!' -dc-ip DC` → 3 ticket hash-i.

**Addım 3 — Crack:** `hashcat -m 13100 spn.hash rockyou.txt` → `backup-job:Summer2021!` açıldı (2 saatda); digər iki hesab açılmadı (güclü parollar).

**Addım 4 — İcazə araşdırması:** `backup-job` BloodHound-da → üzv: `File-Server-Admins` qrupunda! → file server-də lokal admin.

**Addım 5 — İstismar davamı:** file server-də admin girişi (Pass-the-Hash və ya birbaşa parol login) → LSASS dump → oradan DA credential-ı (lateral movement room-unun mövzusu).

Ssenarinin dərsləri:

1. Kerberoasting nadirən "birbaşa DA verir" — o, **zəncirin bir halqasıdır**: zəif parol → servis hesabı → server admin → DA.
2. Crack nəticəsi şans amilidir — 2 uğursuz hədəf də məlumatdır.
3. Hər addım əvvəlki module-ların biliklərinə dayanır: enum (SPN tapmaq), BloodHound (icazə izləmək), credential istismarı (parolla giriş).

Module (5.2) növbəti room-larında zəncirin qalan halqaları: **Pass-the-Hash/Pass-the-Ticket** — parolun özünü bilmədən hash/ticket ilə hərəkət etmək, və **Lateral Movement** — sistemlərarası keçid üsulları. Kerberoasting-in vermədiyi "parol bilmədən davam etmə" ssenarisini onlar tamamlayır.

**Sual 1**
Ssenaridə Kerberoasting birbaşa DA verdi? Zənciri təsvir edin.

**Sual 2.**
İki hesabın crack olunmaması nə deməkdir?

**Sual 3.**
Pass-the-Hash Kerberoasting-in hansı boşluğunu doldurur?
