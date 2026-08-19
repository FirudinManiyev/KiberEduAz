# Room: Manual Zəiflik Doğrulaması

**Path:** Network & Infrastructure Security
**Module:** Vulnerability Assessment
**Çətinlik:** Intermediate
**Təxmini vaxt:** 1 saat

## Room haqqında

Skaner "bu sistem ola bilsin ki, zəifdir" deyir — amma real pentest-də və düzgün remediation qərarlarında yalnız **doğrulanmış** zəiflik qiymət daşıyır. Bu room-da false positive anlayışını, manual doğrulamanın niyə vacib olduğunu və sadə doğrulama metodologiyasını öyrənəcəksiniz. Əsas mesaj: skaner tapıntısı hipotezdir, insan təsdiqi isə həqiqət.

## Öyrənmə nəticələri

- False positive və false negative anlayışlarını izah etmək
- Manual doğrulamanın zəruriliyini (qərar keyfiyyəti baxımından) əsaslandırmaq
- Versiya-əsaslı və davranış-əsaslı doğrulama fərqini bilmək
- Sadə doğrulama metodologiyasını (mərhələlərlə) tətbiq etmək

## Task 1 — False Positive: Skanerin Yalanları

**False positive (FP)** — skaner olmayan zəifliyi "tapıb". **False negative (FN)** — real zəifliyi buraxıb. İkisi də mövcuddur, amma manual doğrulamanın əsas hədəfi FP-dir.

FP nə üçün yaranır?

1. **Versiya-bazlı mühakimə.** Skaner banner-də "Apache 2.4.49" görür → bazada "2.4.49-də path traversal (CVE-2021-41773)" var → "VULNERABLE" işarəsi. Amma Debian/RHEL paketləri **backport** edir: versiya sətri köhnə qalır, patch artıq içəridədir. Skaner "2.4.49" görür, həqiqət isə "2.4.49+patch"dir.
2. **Qeyri-müəyyən sübut.** Bəzi plug-in-lər zəif əlamətlərə görə (error mesaj oxşarlığı, timeout, banner fərzi) işarə verir — "possible" tapıntılar.
3. **Qorunan mühit.** Zəiflik var, amma qarşısında WAF/proxy/firewall — skanerin test sorğusu çatmır, amma skaner hələ də versiya əsaslı işarə verir.
4. **Emulyasiya/yanlış identifikasiya.** Servis özünü başqa məhsul kimi təqdim edir (honeypot, custom implementation).

FP-in real qiyməti nədir? **Sifarişçi etibazlığını itirir.** VA hesabatında 10 tapıntının 4-ü saxta olanda, remediation komandası bütün hesabata şübhə ilə yanaşır — real critical tapıntılar da "yəq yenə FP" kimi qalır. Buna görə professional qayda: **hesabata yalnız doğrulanmış tapıntı keçir** (və ya açıq şəkildə "unverified" kimi markirlənir).

FN-in tam əksinə qiyməti var: buraxılmış real zəiflik = açıq qapı. FN-in azaldılması — credentialed skan, daha geniş plug-in bazası, və pentest (dərin insan baxışı) ilə tamamlanır.

**Sual 1**
False positive nədir və hesabat üçün nə deməkdir?

**Sual 2.**
Backport konsepti FP-ni necə yaradır?

**Sual 3.**
FP-in ən böyük praktiki ziyanı nədir?

## Task 2 — Niyə Manual Doğrulama Vacibdir

Manual doğrulama — skaner tapıntısının insan tərəfindən sübutla təsdiqi. Zərurəti dörd istiqamətdən:

**1. Qərar keyfiyyəti.** Remediation (patch/restart/upgrade) resurs tələb edir: sistemi yenidən başlatmaq, iş saatı itirmək. Yanlış tapıntıya görə patch pəncərəsi açmaq — israf; real təhlükəni gecikdirmək — risk. Doğrulanmış tapıntı = düzgün qənar.

**2. Real exploitability müəyyənetməsi.** "Zəiflik var" ilə "zəiflik istismar oluna bilər" fərqli şeylər. Məsələn: CVE işıqlandırdığı servis yalnız daxili şəbəkədədi və exploit üçün valid credential tələb edir — real təhlükə kontekstə görə aşağı düşür. Bu qiymətləndirmə avtomatik olmur.

**3. Sübutun keyfiyyəti.** Hesabatda screenshot/request-response/konkret çıxış olmalıdır — "skaner dedi" deyil. İnsan doğrulaması bu sübutu istehsal edir.

**4. Zəiflik zəncirlərinin görünməsi.** Tək-tək "medium" tapıntılar zəncirdə birləşəndə critical nəticə verir (security misconfiguration room-undakı ssenari kimi). Zənciri yalnız insan görür.

Amma balans da vacibdir: **hər tapıntını manual doğrulamaq mümkün deyil** (minlərlə tapıntı). Praktik model — risk-əsaslı triage:

- **Critical/High + internetə açıq sistemlər** → hər biri manual doğrulanır.
- **Kütləvi eyni tapıntı (30 host-da eyni CVE)** → nümayəndə host-da bir dəfə doğrulanır, qalanına tutulur (eyer homojen mühitdirsə).
- **Low/Informational** → adətən doğrulanmır, remediation siyahısına düşür.

Bu model həm keyfiyyəti, həm effektivliyi saxlayır — peşəkar VA/pentest komandalarının standart yanaşmasıdır.

**Sual 1**
"Zəiflik var" və "istismar oluna bilər" fərqinə nümunə verin.

**Sual 2.**
Risk-əsaslı triage modeli hansı məntiqə əsaslanır?

**Sual 3.**
Hesabatda sübut nə üçün "skaner dedi"ndən güclüdür?

## Task 3 — Doğrulama Metodologiyası: Beş Addım

Tək bir tapıntının doğrulanması — kiçik, amma intizamlı proses. Ssenari: Nessus "10.10.10.20:445 — MS17-010 (EternalBlue) — Critical" dedi.

**Addım 1 — Tapıntının oxunması.** Plugin output tam oxunulur: skaner nə gördü? Versiya əsaslı fərzdimi, yoxsa konkret davranış cavabımı? (Nessus MS17-010-da konkret SMB sorğusuna cavab əsaslı işləyir — bu, artıq güclü işarədir, amma yenə də davam.)

**Addım 2 — Zəifliyin öyrənilməsi.** CVE referansı (NVD/vendor advisory): hansı versiyalar təsirlənir, hansı şərtlər lazımdır (autentifikasiya? SMBv1 aktiv?), nəticə nədir (RCE? DoS?), exploit public-durmu? Bu addım zəifliyin "necə doğrulanacağını" deyir.

**Addım 3 — Aşkarlama təsdiqi (zərərsiz).** Müstəqil alətlə eyni nəticə:

```bash
nmap --script smb-vuln-ms17-010 -p 445 10.10.10.20
```

İki müstəqil alət razılaşanda inam artır. Bu hələ istismar deyil — yalnız aşkarlama.

**Addım 4 — Davranış/konseptual doğrulama (ROE daxilində).** İstismara yaxın, amma minimal: təsirlənən şərti yoxlama. MS17-010 üçün — auxiliary skaner (Metasploit) və ya kiçik PoC. Bəzi zəifliklər üçün bu addım "safe" variantla mümkündür (crash riski qiymətləndirilir). Əgər ROE tam istismara icazə verirsə — demo lab-da exploit + sübut (screenshot). Production-da isə adətən Addım 3-4-ün zərərsiz forması kifayətdir.

**Addım 5 — Nəticənin sənədlənməsi.** Doğrulanmışsa: tapıntı statusu "confirmed", süput (çıkışlar, sorğular), real severity qiymətləndirməsi (CVSS + kontekst), remediation. Doğrulanmadısa: FP səbəbi qeyd olunur (məs. "backport — paket versiyasında patch mövcuddur") və tapıntı hesabatdan çıxarılır/yoxlanılmış kimi markirlənir.

Bu beş addımın qısa duyğusu: **oxu → öyrən → müstəqil yoxla → minimal sübut → sənədləşdir.** Heç bir addım "inamla exploit at" içermir — hər addım əvvəlkinin nəticəsinə qurulur.

**Sual 1**
Addım 3-də "iki müstəqil alət" nə üçün lazımdır?

**Sual 2.**
Production sistemdə Addım 4 necə modifikasiya olunur?

**Sual 3.**
FP tapılanda nə sənədlənir?

## Task 4 — Doğrulama Alətləri: Kiçik Lüğət

Manual doğrulamanın əl alətləri (bu curriculum-də artıq tanış olanlar + bir neçə yeni):

**Aşkarlama təsdiqi (zərərsiz):**

- `nmap --script vuln` — NSE vuln script-ləri (smb-vuln-ms17-010, http-vuln-cve... ailəsi).
- Metasploit auxiliary skanerləri (`auxiliary/scanner/...`) — istismar etməyən yoxlamalar.
- Vendor-ın öz yoxlama alətləri (Microsoft Detection/Scan tools) — bir çox CVE-lər üçün rəsmi scanner var.

**Versiya/konfiqurasiya dəqiqləşdirməsi:**

- `ssh -V`, paket menecer sorğuları (`dpkg -l | grep apache`) — backport yoxlanışı: distro-nun security notlarında "CVE-fixed in 2.4.49-3+deb11u2" kimi qeydlər.
- `openssl s_client` — TLS versiya/cipher yoxlaması (zəif TLS tapıntılarının doğrulanması).

**Sübut istehsalı:**

- Screenshot alətləri, terminal çıxışlarının qeydi.
- Burp/curl çıxışları (web tərəfli tapıntılar üçün).

**İstismar (yalnız icazəli/lab):**

- `searchsploit` — PoC script-lər; hər script **oxunur** (nə edir? hansı parametrlər? crash riski?) və yalnız sonra — icazəli hədəfdə — işə salınır.
- Metasploit exploit modulları — "check" funksiyası olan modullar xüsusilə dəyərlidir: `check` əmri istismarsız doğrulama aparır.

`check` funksiyası haqqında ayrıca qeyd: MSF-də bəzi exploit modullarında `exploit` əvəzinə `check` işlədilə bilər — zəifliyin olub-olmamasını istismar etmədən yoxlayır. Peşəkar ilk seçim həmişə `check`-dir (varsa); `exploit` yalnız sübut/istismar zərurətində.

Skaner + doğrulama alətlərinin vahid şəkli:

```
[Skaner tapıntısı] → [oxu/öyrən] → [nmap/auxiliary/check] → [istismar sübutu?]
        hipotez         insan            zərərsiz təsdiq        yalnız ROE daxilində
```

**Sual 1**
Metasploit-də `check` funksiyası nə edir?

**Sual 2.**
Backport yoxlanışı necə aparılır?

**Sual 3.**
searchsploit-dən PoC script götürəndə ilk addım nədir?

## Task 5 — Module Yekunu: Hipotez-Sübut Mədəniyyəti

Bu module-un böyük dərsi — **hipotez-sübut mədəniyyəti**: bütün alət çıxışları hipotezdir; hesabata yalnız sübut keçir.

Bu mədəniyyətin faydaları toplusu:

1. **Etibarlılıq:** hər tapıntısı sübutlu hesabat — sifarişçi üçün qəbul ediləbilən sənəd.
2. **Effektivlik:** remediation komandası FP-ə vaxt itirmir.
3. **Öyrənmə:** doğrulama prosesi zəifliyin özünü öyrədir — təkrarlanan tapıntılar artıq "bibliya kimi" deyil, məlum mexanizm kimi görünür.
4. **Huquqi dəqiqlik:** "sistem zəifdir" iddiası sübutsuz — problemli iddia; sübutla — professional tapıntı.

Path-4 (Network Security) bu modul ilə tamamlanır. Yekun xəritə:

- **4.1 Network Exploitation:** FTP/SMB/SSH istismarı + Metasploit — "içəri necə girilir".
- **4.2 Vulnerability Assessment:** skanerlər (Nessus/OpenVAS) + CVE/CVSS + manual doğrulama — "hansı qapılar qırıqdır və bunu necə dəqiq bilirik".

Növbəti path — Active Directory Attacks — korporativ mühitinə keçid: orada bu gün öyrənilən "hipotez → doğrulama" mədəniyyəti daha da kritikləşir, çünki AD hücumları zəiflik-zəncirləri deməkdir: tək-tək tapıntılar (zəif servis, sızan credential) birgə "domain ələ keçirmə" hekayətinə çevrilir. Hər halda, əsas qayda dəyişməz qalır: **alət danışır, insan sübut edir.**

**Sual 1**
"Hipotez-sübut mədəniyyəti" nə deməkdir?

**Sual 2.**
Bu mədəniyyətin dörd faydasını sadalayın.

**Sual 3.**
AD hücumlarında bu mədəniyyət nə üçün daha kritikdir?
