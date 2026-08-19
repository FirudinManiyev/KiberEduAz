# Room: AD Enumeration (BloodHound, PowerView)

**Path:** Active Directory Attacks
**Module:** AD Fundamentals
**Çətinlik:** Intermediate
**Təxmini vaxt:** 2 saat

## Room haqqında

AD hücumlarının qızıl qaydası: "görmədiklərini qazana bilməzsən". Bu room-da AD mühitini enumerate etməyin iki güclü yolunu — PowerView ilə komanda-səviyyəli sorğuları və BloodHound ilə attack path vizuallaşdırmasını öyrənəcəksiniz. Məqsəd: mühitdəki "kim kimə nəyə icazə verir" mənzərəsini qurmaq.

## Öyrənmə nəticələri

- AD enumeration-un məqsədini və toplanan məlumat növlərini izah etmək
- PowerView-un əsas komandalarını (konseptual) bilmək
- BloodHound-un toplama (SharpHound) və analiz axınını anlamaq
- Attack path anlayışını və klassik qısa yolları tanımaq

## Task 1 — AD Enumeration Nə Axtarır

AD enumeration — domain-dəki obyektlərin və onların münasibətlərinin toplanmasıdır. Əsasən adi Domain User səviyyəsində belə — çünki AD default olaraq "hər şeyi oxumağa" icazə verir (məxfilik yox, idarəetmə şəffaflığı üçün dizayn edilib — bu, attacker üçün hədiyyədir).

Axtarılan məlumat kateqoriyaları:

1. **İstifadəçilər** — kimlər var, hansı hesablar aktiv, təsvirlər (ad/vəzifə), son login vaxtları.
2. **Qruplar** — kim hara üzvdür (əsasən hüquqi qruplar: Domain Admins, server admin-ləri).
3. **Kompüterlər** — hansı maşınlar var, operativ rollar (DC, SQL, file server).
4. **GPO-lar** — hansı siyasətlər kimə tətbiq olunur.
5. **ACL-lər** — kim nəyi redaktə edə bilər (qeyri-adi icazələr — qızıl məlumat).
6. **Trust-lar** — hansı domain-lər əlaqədədir.
7. **Session/loqon məlumatı** — hansı hesab hansı maşında oturub (admin haradadır?).

Bütün bunlar bir məqsədə xidmət edir: **attack path qurmaq** — "indi haradayam → DA haradadır → aradakı ən qısa yol nədir". Hər obyekt və münasibət bu graph-ın düyünü/kənarıdır.

Alət ekosistemi (bu room-da ikisi, amma xəritə tam olsun):

- **PowerView/SharpView** — PowerShell enumeration (dərin, əl ilə).
- **SharpHound** — BloodHound üçün data toplayıcı.
- **BloodHound** — toplanan datanı graph şəklində göstərən analiz interfeysi.
- **ldapsearch, rpcclient, enum4linux** — birbaşa protokol sorğuları (ənənəvi).
- **Ldapdomaindump, ADRecon** — toplu dump alətləri.

**Sual 1**
AD enumeration-da hansı yeddi məlumat kateqoriyası axtarılır?

**Sual 2.**
Niyə adi Domain User belə çox məlumat oxuya bilir?

**Sual 3.**
Attack path nədir və enumeration ona necə xidmət edir?

## Task 2 — PowerView: Əl ilə Sorğular

**PowerView** — AD enumeration üçün PowerShell moduludur (PowerSploit ailəsindən; standalone PowerView.ps1 kimi da yayılır). Əsas komandalar (konseptual səviyyədə — lab-da təkrarlanmalı):

**Domain əsas məlumat:**

```powershell
Get-Domain                      # domain adı, funksional səviyyə
Get-DomainController            # DC siyahısı
Get-DomainPolicy                # parol siyasəti (min uzunluq, lockout)
```

**İstifadəçilər:**

```powershell
Get-DomainUser                  # bütün istifadəçilər
Get-DomainUser -Identity ali    # konkret hesab (təsvir, qruplar, SPN)
Get-DomainUser -SPN             # SPN-li hesablar → Kerberoasting hədəfləri!
Find-UserDNSName                # ...
```

**Qruplar:**

```powershell
Get-DomainGroup                 # qrup siyahısı
Get-DomainGroupMember -Identity "Domain Admins"   # DA-lar kimlərdir
```

**Kompüterlər və sessiyalar:**

```powershell
Get-DomainComputer              # maşın siyahısı (OS daxil)
Get-NetSession -ComputerName DC01   # kim DC-də oturub
```

**İcazə axtarışı (ən dəyərli):**

```powershell
Find-PSRemotingPermission       # PSRemoting icazəsi olanlar
Get-ObjectAcl -Identity "ali"   # obyektin ACL-i
```

PowerView-un gücü — **dərində nəzarət**: hər sual konkret komandayla. Zəif tərəfi — output-un insan tərəfindən sintez olunması lazımdır (yüzlərlə obyekt, minlərlə münasibət). Məhz buna görə BloodHound gəldi — növbəti task.

İki praktik qeyd: (1) PowerView legacy moduludur — müasir mühitlərdə SharpView/.NET versiyaları və ya ADSI sorğuları da işlədilir, amma öyrənmə üçün PowerView-ın səliqəli komandaları ideal; (2) real pentest-də bütün enumeration hadisələri DC log-larında görünür — "enum təmizliyi" anlayışı (min sorğu yox, məqsədli az sorğu) operational security-in hissəsidir.

**Sual 1**
`Get-DomainUser -SPN` nə üçün əhəmiyyətlidir?

**Sual 2.**
PowerView-un güclü və zəif tərəfləri nədir?

**Sual 3.**
"Enum təmizliyi" nə deməkdir?

## Task 3 — BloodHound: Graph Dünyası

**BloodHound** — AD məlumatını graph (qraf) kimi toplayıb göstərən, attack path-ləri avtomatik aşkarlayan analiz alətidir. İki komponentdən:

1. **SharpHound** (toplayıcı) — domain-də LDAP/SMB/API sorğuları ilə obyektləri və münasibətləri toplayır → JSON fayllar.
2. **BloodHound GUI** — JSON-ları yükləyir → Neo4j graph DB → brauzer interfeysində vizual mənzərə + hazır suallar (queries).

Toplama (əldə edilmiş istənilən domain istifadəçisi ilə):

```bash
# SharpHound (Windows) və ya bloodhound-python (Linux)
bloodhound-python -u ali -p Parol123 -d corp.local -dc dc01.corp.local -c All
```

GUI-də hazır analizlər (built-in queries):

- **Shortest Path to Domain Admins** — mən/hər hansı hesabdan DA-ya ən qısa yol.
- **Find Principals with DCSync Rights** — DCSync icazəsi olanlar.
- **Kerberoastable Users** — SPN-li hesablar.
- **List all Domain Admins** — hədəf siyahısı.

**Niyə BloodHound inqilabi idi?** Çünki AD-dəki münasibətlər (üzvlük + ACL + sessiya + trust + GPO) insan zehnində tam saxlanıla bilmir. "Ali — SQL admin qrupundadır; SQL admin qrupu SQLServer-in lokal adminidir; DA olan hesab SQLServer-də sessiya açıb" — bu zənciri PowerView çıxışlarından əl ilə qurmaq günlər, BloodHound-da bir klikdir. Və korporativ mühitlərin açıq sirri: **belə dolanbac yollar hər yerdədir.**

Klassik tapılan yollar (AD attack module-larında istismarını görəcəyik):

- İstifadəçi → qrup üzvlüyü → server-də lokal admin → orada oturan DA-nin credential-ı (credential cashing) → DA.
- Zəif ACL: "user X, group Y-ni redaktə edə bilər" + Y-nin üzvlüyü hüquqi → X özünü Y-yə əlavə edir → hüquqi.
- Kerberoastable servis hesabı → parol crack → server admin → ...

BloodHound həm müdafiə üçün də işlədilir (counterpart: "hansı yolları qapatmalıyıq") — attack path reduksiya edilməsi müasir AD auditi standartıdır.

**Sual 1**
BloodHound-un iki komponenti nədir?

**Sual 2.**
"Niyə inqilabi" sualının cavabı nədir?

**Sual 3.**
BloodHound-un müdafiə tərəfindəki rolu nədir?

## Task 4 — Klassik Attack Path-lərə Baxış

BloodHound graph-ında ən çox görünən yol naxışlarına yaxından baxaq — hər biri sonrakı room-ların "xammalı"dır:

**1. Qrup üzvlüyü zənciri:** `ali → IT-Support qrupu → Server-Operators → SERVER01 lokal admin`. Hər kənar qanuni üzvlükdür, amma son nəticə: alinin SERVER01-də admin. Orada nə qazanılır? LSASS-dan hash dump → oradan keçən DA credential-ları.

**2. Sessiya/credential caching:** DA hesabı gündəlik iş üçün SERVER01-də login olub (pis praktika, amma real dünyada hər yerdə). Windows credential-ları yadda saxlayır (LSASS) — SERVER01-də admin olan hər kəs onları çıxara bilər (mimikatz tipli alətlərlə). Yol: sadə istifadəçi → (bir addım) → server admin → (credential çıxarma) → DA.

**3. ACL istismarı:** GenericAll/WriteDacl/GenericWrite kimi icazələr obyekt üzərində. Məs. "Helpdesk qrupu — ali hesabında GenericWrite" → Helpdesk ali-nin parolunu sıfırlaya bilər → əgər ali hüquqi yoldadırsa... Yaxud "WriteDacl qrup üzərində" → özünü admin qrupuna yaz.

**4. Kerberoastable hesablar:** SPN daşıyan hesablar üçün hər domain istifadəçisi service ticket istəyə bilər; ticket parol-əsaslı şifrələnir → offline crack (detalları Kerberoasting room-da). BloodHound "Kerberoastable" düyməsi bu hədəfləri bir klikdə verir.

**5. GPO-based path:** GPO redaktə icazəsi → hədəf OU-da bütün maşınlarda kod icrası (strukture room-da görmüşdük).

**6. Unconstrained/Constrained delegation:** "servis A, servis B adına autentifikasiya edə bilər" konfiqurasiyaları — güclü, amma texniki cəhətdən mürəkkəb yollar (advanced mövzu; burada anlayış kimi qeyd).

Bütün naxışların ortak qrammatikası: **icazə + münasibət + credential izi = yol.** Hücum heç bir "exploit" tələb etmir — AD-nin öz qanunları daxilində hərəkət edir. Bu səbəbdən AD müdafiəsi "patch" deyil, **arxitektura təmizliyi**dir: qısa yolları qapatmaq, hüquqi istifadəni azaltmaq, tiering modeli (admin-lərin gündəlik maşınlara girməməsi).

**Sual 1**
"Qrup üzvlüyü zənciri + credential caching" yolunu izah edin.

**Sual 2.**
ACL istismarı nə deməkdir — bir nümunə ilə?

**Sual 3.**
Niyə AD hücumları "exploit" tələb etmir?

## Task 5 — Lab Praktikası və Module Yekunu

Bililəri yoxlamaq üçün mini lab planı (TryHackMe/HTB AD room-ları və ya kendi lab-iniz — məs. GOAD (Game of Active Directory) layihəsi):

1. **Mühit:** domain `corp.local`, DC + 2-3 workstation + bir neçə "yanlış konfiqurasiya" (qrup üzvlüyü, ACL, Kerberoastable hesab).
2. **İlkin giriş:** verilmiş adi istifadəçi hesabı (phishing simulyasiyası kimi).
3. **PowerView turu:** domain məlumatı → istifadəçilər → qruplar → mənim üzvlüklərim → komputerlər. Hər komandanın output-unu qeyd edin.
4. **SharpHound/bloodhound-python toplama:** `-c All` ilə tam toplayın.
5. **BloodHound analiz:** "Shortest path to Domain Admins" — öz hesabınızdan DA-ya yol görünür? Hansı naxış? (Module 5.2-də həmin yolu "gəzəcəyik".)
6. **Müqayisə:** PowerView çıxışları ilə BloodHound tapıntısını əl ilə təsdiqləyin — graph-dakı hər kənarın hansı komanda ilə doğrulanacağını tapın. Bu, "alət deyil, anlayış" dərsidir.

Module yekunu — AD Fundamentals (5.1) tamamlandı:

- **Struktur:** domain/DC/OU/GPO/forest/trust (birinci room).
- **Enumeration:** PowerView + BloodHound, attack path anlayışı (bu room).

İndi "xəritə" var. Növbəti module (AD Hücum Texnikaları) xəritədəki yolları fiziki gəzməyi öyrədəcək: Kerberoasting (ticket crack), Pass-the-Hash/Ticket (credential istismarı), Lateral Movement (sistemlərarası keçid). Hər texnika bu room-da görünən düyünlər arasındakı kənarların "necə gedilir" cavabıdır.

**Sual 1**
Lab-da "PowerView ilə BloodHound-u doğrulamaq" nə öyrədir?

**Sual 2.**
GOAD kimi mühitlər nə üçün qurulur?

**Sual 3.**
Növbəti module-da hansı suallara cavab veriləcək?
