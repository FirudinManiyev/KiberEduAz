# Room: AD Strukturu & Komponentləri

**Path:** Active Directory Attacks
**Module:** AD Fundamentals
**Çətinlik:** Intermediate
**Təxmini vaxt:** 2 saat

## Room haqqında

Active Directory — korporativ şəbəkələrin 90%-də dayanan identifikasiya və idarəetmə sistemidir; ona görə də attacker üçün "hədəf nömrə bir"dir. Bu room-da AD-nin strukturu — Domain, Domain Controller, OU, Group Policy, Forest/Tree anlayışları — və onun korporativ mühitdəki rolu öyrənilir. AD hücumlarını anlamaq, əvvəlcə AD-nin özünü anlamaqdır.

## Öyrənmə nəticələri

- AD-nin nə olduğunu və korporativ mühitdə rolunu izah etmək
- Domain, Domain Controller, OU, Group Policy anlayışlarını ayırd etmək
- Forest/Tree/Domain iyerarxiyasını izah etmək
- AD obyektlərini (user, group, computer) və autentifikasiya axınını konseptual bilmək

## Task 1 — AD Nədir və Niyə Bu Qədər Mərkəzi

**Active Directory (AD)** — Microsoft-un directory service-i: şirkətdəki hər "şey"in (istifadəçi, kompüter, printer, qrup, tətbiq) mərkəzi kataloqu və onların identifikasiya/idarəetmə sistemi.

Bir təsəvvür: 5000 işçili şirkət. Hər işçinin bir hesabı var; hər hesab hər kompüterə, e-poçta, fayl serverinə, printer-lərə giriş alır. Bir işçi işə girəndə hesab açılır, çıxanda bağlanır; şəxsən 200 sistemdə ayrıca hesab açmaq əvəzinə — hamısı bir mərkəzdən. Bu mərkəz AD-dir; "domain-ə qoşulmaq" (domain join) — kompüterin bu idarəetməyə üzv olmasıdır.

AD-nin əsas xidmətləri:

- **LDAP** (389) — kataloq sorğu dili: "marketing qrupunun üzvləri kimlərdir?".
- **Kerberos** (88) — əsas autentifikasiya protokolu: parol yox, ticket ilə giriş.
- **SMB/RPC** (445/135) — fayl, idarəetmə, siyasət paylanması.

Bu portları tanıyırsınız — servis enum room-undan. AD mühitində onların hamısı bir ekosistemdə birləşir.

Niyə attacker üçün mərkəzi? Çünki:

1. **Mərkəziyyət = tək hədəf.** Domain Administrator (DA) hesabı — bütün şirkətin açarıdır. Bir yerdə qazan, hər yerdə hökm sür.
2. **Hər yerde mövcuddur.** Korporativ şəbəkəyə daxil olusan — deməli, AD ilə qarşılaşacaqsan.
3. **Mürəkkəblik = zəif konfiqurasiya ehtimalı.** Minlərlə obyekt, illərlə dəyişiklik — kimin hansı icazəsi qalıb, çox vaxt heç kim tam bilmir (BloodHound-un mövzusu).
4. **Etibar münasibətləri hücum yollarıdır.** Domain-lər arası trust, qrup üzvlükləri, delegation — bütün bunlar attack path yaradır.

**Sual 1**
AD-nin əsas vəzifəsini bir cümlədə izah edin.

**Sual 2.**
AD-nin əsas portları hansılardır?

**Sual 3.**
AD niyə attacker üçün mərkəzi hədəfdir (üç səbəb)?

## Task 2 — Domain və Domain Controller

**Domain** — AD-nin əsas təhlükəsizlik sərhədidir: `corp.local` kimi. Domain daxilində bütün obyektlər (users, computers, groups) vahid ad sahəsində və vahid autentifikasiya ilə yaşayır. İstifadəçi `CORP\ali` və ya `ali@corp.local` formatında identifikasiya olunur (UPN).

**Domain Controller (DC)** — domain-in "beyni" olan server: AD database-ini (NTDS.dit) saxlayan, bütün autentifikasiya sorğularına cavab verən, Group Policy paylayan server. DC-ni ələ keçirmək = domain-i ələ keçirmək — bütün hash-lər, bütün obyektlər, bütün idarəetmə.

Domain-də mühüm obyekt tipləri:

| Obyekt | Nədir | Nümunə |
|---|---|---|
| **User** | İnsan və ya servis hesabı | `ali`, `sql-service` |
| **Computer** | Domain-ə qoşulmuş maşın | `WS-1024$` (sondakı $ — machine account) |
| **Group** | İstifadəçi toplusu — icazə idarəetməsi | `Domain Admins`, `Marketing` |
| **OU (Organizational Unit)** | Konteyner — obyektlərin qruplanması | `OU=Marketing,DC=corp,DC=local` |

Əsas qruplar (hücum perspektivindən əhəmiyyət sırası ilə):

- **Domain Admins** — domain-də tanrı. Hədəf nömrə bir.
- **Enterprise Admins** — Forest-da tanrı (bütün domain-lərdə).
- **Administrators** — DC-lərdə lokal admin.
- **Domain Users** — adi istifadəçilər. Domain Users-a yeni üzv = hər kompüterdə giriş (Domain Users default olaraq iş stansiyalarına lokal giriş icazəsi daşıyır — lateral movement üçün kritik detal).
- **Service account-lar** — tətbiqlər üçün hesablar (SQL, backup) — parollar nadir dəyişilir, SPN daşıyırlar → Kerberoasting hədəfi (növbəti module).

**Autentifikasiya: Kerberos qısa forması.** İşçi `ali` səhər kompüterdə login olur:

1. `ali` + parol hash-i → **AS-REQ**: Domain Controller-ə.
2. DC → **TGT** (Ticket Granting Ticket) qaytarır — "sən doğrulandın" bileti.
3. Fayl server lazım olanda: TGT + "fayl server istəyirəm" → DC → **Service Ticket**.
4. Fayl serverə service ticket təqdim olunur → giriş.

Parol heç yerə getmir; hash-dən düzələn açarlarla şifrələnmiş biletlər gəzir. Bu mexanizmin zəif tərəfləri (Kerberoasting, Pass-the-Ticket) növbəti module-un mövzusudur — amma strukturu indi qoyulmalıdır: **TGT = "kimliyim qəbul edildi", Service Ticket = "bu resursa icazəm var".**

**Sual 1**
Domain Controller nə saxlayır və onu ələ keçirmək nə deməkdir?

**Sual 2.**
Domain Users qrupunun "gizli" gücü nədir?

**Sual 3.**
Kerberos-da TGT və Service Ticket-in rollarını izah edin.

## Task 3 — OU və Group Policy: İdarəetmə Mexanizmləri

**OU (Organizational Unit)** — domain daxilində obyektlərin qruplanması: adətən departament/coğrafiya üzrə (`OU=Finance,OU=Baku,DC=corp,DC=local`). OU-nun istismar baxımından əhəmiyyəti: **GPO-lar OU-lara bağlanır** — yəni OU strukturu hansı siyasətlərin kimə tətbiq olunduğunu müəyyən edir.

**Group Policy Object (GPO)** — tətbiq olunan konfiqurasiya dəstləri: parol siyasəti, firewall qaydaları, skriptlər, icazələr. Məsələn: "Bütün Marketing OU-na — desktop wallpaper, USB qadağası, parol minimum 12 simvol."

GPO strukturu iki hissədən: **Group Policy Container** (AD-də — obyektin metadata-sı) və **Group Policy Template** (`\\DC\SYSVOL\...` — real fayllar, skriptlər). SYSVOL hər domain üzvünə oxuna biləndir — **enumeration qaynağıdır** (GPO-ları oxumaqla mühit haqqında çox şey öyrənilir).

GPO hücum səthi (nümunə konseptlər — detailed exploitation AD attack module-da):

- **GPO modification hücumu:** GPO redaktə icazəsi olan (amma admin olmayan) hesab varsa — GPO-ya startup skripti əlavə etməklə həmin GPO-nun tətbiq olunduğu BÜTÜN maşınlarda kod icrası. İcazə = uzaqdan idarə.
- **Startup/logon script-lər:** köhnə skriptlərdə sərt kodlu parollar (credential sapması).
- **GPP (Group Policy Preferences) parollar:** tarixi zəiflik — GPP-də saxlanılan parollar AES açarı ilə "şifrələnirdi", amma açar publik idi → msfvenom... yox, `gpp-decrypt` ilə bir klikdə açılırdı. Modern sistemlərdə patch-lanıb, amma köhnə mühitlərdə rast gəlinir.

Müdafiə tərəfdə GPO-a baxış: GPO-lar mühitin "qanunları"dır — onların özləri də audit obyekti olmalıdır (kim nəyi dəyişə bilər, dəyişikliklər loglanırmı). AD-nin sürprizi: hücumlar çox vaxt "exploit" deyil, **yanlış konfiqurasiya olaraq verilmiş qanuni icazələrin** istismarıdır.

**Sual 1**
OU və GPO-nun münasibəti nədir?

**Sual 2.**
SYSVOL nə üçün enumeration qaynağıdır?

**Sual 3.**
GPO modification hücumunun məntiqi nədir?

## Task 4 — Forest, Tree və Trust-lar: Böyük Şəkil

Bütün AD strukturu iyerarxiya ilə qurulub:

```
Forest: CORPFOREST
├── Tree: corp.local          (root domain)
│   └── (tək tree, tək domain — kiçik şirkət ssenarisi)
└── Tree: sub.corp.local      (böyük şirkət / region)
    └── ...
```

- **Tree** — eyni ad sahəsinin davamı olan domain-lər zənciri (`corp.local` → `sub.corp.local`).
- **Forest** — ən yuxarı təhlükəsizlik sərhədi: birlikdə idarə olunan bütün tree/domain-lər toplusu. Forest-də vahid schema (obyekt tərifləri), vahid konfiqurasiya var.
- **Trust** — domain-lər/forest-lər arası etibar münasibəti: "A domain-in istifadəçisi B domain-in resurslarına çata bilər".

Trust növləri (istismar baxımından):

| Trust | Xarakter | Risk |
|---|---|---|
| Parent-Child | Tree daxili, two-way, transitive | Default — uşaq domain-interedici yollar |
| Tree-Root | Tree-lər arası, two-way, transitive | Forest daxili keçidlər |
| Forest Trust | Forest-lər arası (explicit) | Bütün forest-i əhatə edən körpü |
| External Trust | Domain-lər arası (explicit, non-transitive) | Yalnız göstərilən domain-lər |

**Transitive** — etibarın "keçməsi": A→B, B→C varsa, transitive trust-da A→C də işləyir. Trust zəncirləri hücum yollarını uzadır — attacker bir ucdan girib trust graph-ı izləyərək "Enterprise Admin" ucuna çatmağa çalışır.

Forest-ə bir daha baxış: **təhlükəsizlik sərhədi domain deyil, FOREST-dır.** Domain admin yalnız öz domain-inin ağasıdır; amma forest-dəki şərtlər (Enterprise Admins, schema) bütün forest-i idarə edir. Buna görə "ayrı company üçün ayrı domain" deyil, **ayrı forest** qurulur — bəzi şirkətlərin bunu bilməməsi klassik arxitektura riskidir.

AD-nin iyerarxiyasını bilmək nə verir? Hücum planını: hansı domain-dəyik → hansı trust-lar var → hədəf (EA/DA) haradadır → hansı attack path-lar oraya aparır. BloodHound (növbəti room) məhz bu graph-ı avtomatik çəkir — amma graph-ın dili (domain, trust, OU, qrup) bu room-da qoyuldu.

**Sual 1**
Forest nə üçün "təhlükəsizlik sərhədi"dir?

**Sual 2.**
Transitive trust nə deməkdir?

**Sual 3.**
Trust münasibətləri hücum planına necə daxil olur?

## Task 5 — İlk Əlaqə: AD-yə "Doko" Vurmaq

İndi nəzəriyyəni ilkin praktik görüşə gətirək: pentester şəbəkəyə daxil olub (phishing, zəif servis, guest Wi-Fi...) — AD mühiti ilə ilk təması. Bu addımlar konseptual giriş; dərin enumeration növbəti room-dadır.

**Sual 1: burada AD varmı?** İşarələr: DNS-də SRV qeydləri (`_ldap._tcp...`), 88/389/445 portları, `corp.local`-ə istinadlar, e-poçt adreslərinin domain-i. Nmap + DNS sorğuları bunu göstərir.

**Sual 2: domain-in adı nədir?** Ən sadə mənbələr: NTLM auth cavabları, KrbError mesajları, LLMNR/NBT-NS sorğuları, `systeminfo` (qoşulmuş maşında), LDAP anonim sorğuları (bəzi mühitlərdə).

**İlkin alət lüğəti** (hər birinin detalları AD Enumeration room-unda):

- **PowerView / SharpHound** — AD enumeration (PowerShell).
- **ldapsearch / enum4linux** — LDAP/SMB əsaslı sorğular.
- **rpcclient** — RPC əsaslı enum.
- **BloodHound** — graph toplayıcı + analiz (növbəti room-un qəhrəmanı).

Bu mərhələdə hədəf konkret məlumatlar: domain adı, DC ünvanı, istifadəçi adları (bir neçəsi), qrup strukturu. Bunlar sonrakı hücumların (password spray, Kerberoasting, lateral movement) xammalıdır.

Module bağlanarkən AD dünyagörüşünün xülasəsi: AD — **identifikasiyanın mərkəzləşdirilməsidir**; hücum isə bu mərkəzdən "kim kimə nəyə icazə verir" graph-ını izləməkdir. Struktur (domain/OU/GPO/forest/trust) graph-ın düyünləridir; növbəti room-larda graph-ı çəkəcək (enumeration), sonra üzrə gəzəcəyik (attack techniques).

**Sual 1**
AD mühitinin varlığını göstərən ilkin işarələr hansılardır?

**Sual 2.**
İlkin AD enumeration-da hansı məlumatlar toplanır?

**Sual 3.**
"Kim kimə nəyə icazə verir graph-ı" ifadəsi AD hücumlarının nəsini ifadə edir?
