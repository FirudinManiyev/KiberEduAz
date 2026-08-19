# Room: AV/EDR Evasion Əsasları

**Path:** Post-Exploitation & Advanced Red Team
**Module:** Evasion
**Çətinlik:** Advanced
**Təxmini vaxt:** 1 saat

## Room haqqında

Evasion — hücum alətlərinin AV/EDR sistemlərinin gözlərindən yayınması sənətidir. Bu room-da signature-based aşkarlamanın necə işlədiyi, obfuscation konsepti, müasir EDR davranış modeli və — çox vacib — bu biliklərin etik sərhədləri öyrənilir. Texnikalar konseptual səviyyədə; hədəf anlayışdır, hazırlanmış "bypass resepti" yox.

## Öyrənmə nəticələri

- Signature-based və behavior-based aşdarlamanın fərqini izah etmək
- Obfuscation/packing/in-memory icra konseptlərini bilmək
- EDR-ın həllərini (hook, callback, telemetry) konseptual anlamaq
- Evasion biliklərinin etik istifadə sərhədlərini müəyyən etmək

## Task 1 — AV Necə Görür: Signature-Dən Davranışa

**Antivirus (AV)** — klassik model: fayl skan edilir, **imza bazası** ilə müqayisə. İmza — bilinən zərərli kodun "barmaq izi" (bayt sequence, hash, strukturlar). Bu modelin gücü: sürətli, dəqiq (bilinən nümunələr). Zəifliyi: **yalnız bilinəni tutur** — yeni/mutasiya olunmuş kod keçir.

**EDR (Endpoint Detection & Response)** — müasir model: imzadan əlavə **davranış + telemetry**. Nə izləyir: proses ağacları (parent-child əlaqələri), API çağırışları (özellikle hücum-əlaqəli: injection, credential access), fayl/regerstry anomaliyaları, şəbəkə davranışı. Məntiq: "kod nədirsə, **nə edir**?" — masmikat olmayan binary belə "lsass.exe-yə oxuma" etsə, siqnal qalxır.

İki modelin fərqli "görmə" nümunələri:

| Hadisə | AV (imza) | EDR (davranış) |
|---|---|---|
| Bilinən mimikatz.exe | TUTUR | TUTUR (+ davranış) |
| Mimikatz-ın dəyişdirilmiş köpüyü | BURAXA BİLƏR | lsass oxuma davranışı → TUTUR |
| Powershell-ilə lsass dump | Skript imzası yoxdursa buraxır | Proses + API pattern → TUTUR |
| Leqal admin aləti (Rubeus-ın leqal istifadəsi) | Bəzən false positive | Kontekst yanlışsa siqnal |

Müasir realiteya: **EDR = AV + davranış + response** (tutulanı izolyasiya edə bilir). ona görə müasir hücumçu yalnız "faylı gizləmək" yox, "fəaliyyəti normal göstərmək" məcburiyyətindədir.

Bu room-un qalanı üçün müqavilə: texnikalar **anlayış üçün** təqdim olunur. Hər texnikanın real müdafiə qarşısı var; "magik bypass" yoxdur — qarşıdurma var.

**Sual 1**
İmza əsaslı aşdarlamanın fundamental zəifliyi nədir?

**Sual 2.**
EDR "lsass dump" əməliyyatını imza olmadan necə tutur?

**Sual 3.**
Niyə müasir hücumçu "faylı gizlətməkdən" "fəaliyyəti normal göstərməyə" keçməlidir?

## Task 2 — Obfuscation: Kodun Şəklini Dəyişmək

**Obfuscation** — kodun/məlumatın "oxunmaz" edilməsi: məntiq eyni qalır, görünüş dəyişir. İmza əsaslı aşdarlamanın təbiətinə qarşı birbaşa cavabdır (imza konkret baytları axtarır — baytlar dəyişibsə, imza tutmur).

Əsas üsullar (konsept səviyyədə):

**1. Encoder/packer-lər:** payload əvvəlcədən encode/şifrələnir; icra zamanı yaddaşda dekod olunur. Klassik nümunə: msfvenom-un encoder-ləri (`shikata_ga_nai` və s.) — amma müasir AV bunları tanıyır (encoder-in özü imzalaşıb). Packer-lər (UPX və s.) — fayl strukturu dəyişir; yaygın packer-lər də imzalaşıb. Real dünyada: **unikal packing/öz şifrələmə** effektivdir, "hazır məhsul" yox.

**2. Kod metamorfozları:** eyni funksiyanın başqa yazılışı — dəyişən adlar, dead code əlavəsi, ekvivalent əməliyyatlar (`XOR` əvəzinə `NOT+ADD`...). Polymorphic/metamorphic virus-ların əsası — hər nüsxə başqa baytlarla.

**3. Interpretasiya dilləri ilə dinamika:** PowerShell/Python/VBS — skript mətnində imza axtarmaq çətindir; encoding səviyyələri (base64, secure-string), `IEX`/`Invoke-Expression` ilə runtime-da yığılma. AMİ (Amusement Management Instrumentation... yox — **AMSI** — AntiMalware Scan Interface) bunun qarşısı üçün gəlib (aşağıda).

**4. Living-off-the-land (LoL):** zərərli kod yazmaq əvəzinə **sistemin öz leqal alətlərini** istifadə: powershell, certutil (download), bitsadmin, mshta, rundll32... Hər biri leqal binary — imza yoxdur. Müdafiə buna "LoLBins" monitorinqi ilə cavab verir ("certutil urlcache" = şübhəli pattern).

**5. In-memory icra (fileless):** disk-ə heç yazılmır — payload yaddaşda dekod+icra olunur (PowerShell `IEX`, .NET reflection, process injection). Disk skanının tam boş keçməsi. EDR-ın cavabı: yaddaş skanları, API hook-lar (aşağıda).

Etik kontur (bu texnikalar üçün xüsusən vacib): obfuscation bilikləri əsasən **müdafiə tərəfi üçün dəyərlidir** — DLP/EDR konfiqurasiyası, blue team treninqi, malware analizində (analyst paklenmiş nümunəni açmalıdır). Hücum tərəfində isə yalnız icazəli əməliyyat (pentest/red team ROE) çərçivəsində, hədəfin EDR məhsuluna qarşı danışıqlı scope ilə.

**Sual 1**
Obfuscation imza əsaslı AV-ni niyə keçir?

**Sual 2.**
LoLBins nə deməkdir?

**Sual 3.**
Fileless icranın disk skanına təsiri nədir?

## Task 3 — EDR-ın Silahları: Hook-lar və Telemetriya

Obfuscation imzaları keçir — amma EDR davranışı görür. EDR-ın "görmə" mexanizmləri:

**1. User-mode hook-lar:** EDR bütün proseslərə öz DLL-ini yerləşdirir, təhlükəli API-ləri (VirtualAlloc, WriteProcessMemory, CreateRemoteThread...) "hook" edir — çağırış öz filterindən keçir. Hücum tərəfi: hook-un özünü aşmaq (direct syscalls — API əvəzinə birbaşa syscall təlimatı; unhooking — hook olunmuş bölgəni təmiz kodla bərpa etmək).

**2. Kernel driver/minifilter:** fayl, proses, registry hadisələri kernel səviyyəsində görünür — user-mode-da gizlənmək effektini itirir. Müasir EDR-lərin əsas gücü (buna görə də EDR-məhsulları kernel driver tələb edir; tam bypass nadirdir).

**3. ETW (Event Tracing for Windows):** Windows-un daxili telemetry sistemi — .NET/PowerShell hadisələri ETW-dən axır. EDR ETW listener-ləri qoyur. Hücum tərəfi: ETW-ni söndürmək/əzmək (patch EtwEventWrite) — müasir qarşıdurma sahəsi.

**4. AMSI:** skript dilləri (PowerShell/VBS/JS) **icradan əvvəl** məzmunu AV-yə göstərir. `IEX(...)` ilə gizlədilmiş skript belə AMSI-dən keçir. Hücum tərəfi: AMSI-ni söndürmək/əzmək (yaddaşda `AmsiScanBuffer`-ı patch-ləmək) — məşhur texnika, amma EDR-lər AMSI-tamir/əz-mə cəhdlərini də görür.

**5. Behavioral correlation:** tək-tək hadisələr zərərsiz görünəndə **birgə mənalı olur**: "winword.exe → powershell.exe → encoded əmr → HTTP POST" = klassik makro hücum hekayəsi. EDR hekayələri belə qurur.

Buna görə müasir "tam bypass" anlayışı yumşaqdır: real hədəf — **detection-in azaldılması** (rizq qəbul edilə bilən səviyyəyə) yox, "görünməzlik". Red team əməliyyatında hər texnika seçərkən "bu EDR-da nə tetikleyir?" sualı əsasdır — əməliyyat threat model hissəsidir.

Müdafiəçiyə mesaj (room-un ikinci yarıüzlüü): bu texnikaların **hamısının izi var** — unhooking cəhdi, AMSI patch, ETW kill, qəribə LoLBin zəncirləri. Müasir SIEM qaydaları bunları axtarır; blue team bu "tetikleyiciləri" bilsə, hücumçunun "azaldılması" uğursuz olur.

**Sual 1**
User-mode hook nə edir və direct syscall nə üçün işləyir?

**Sual 2.**
AMSI hansı boşluğu qapatır?

**Sual 3.**
"Detection azaldılması, görünməzlik yox" nə deməkdir?

## Task 4 — Qarşıdurmanın Diaoqramı və Etik Sərhədlər

Evasion vs detection qarşıdurması — dinamik tarazlıqdır (scalar müharibə):

```
Müdafiə yenilik: imzalar → davranış → EDR hook → memory scan → AI/anomaliya
                         ↓
Hücum cavabı:     packing → fileless → unhooking → hardware-level... 
```

Hər tərəfin addımı digərinin dəyərini azaldır; sabit qalibi yoxdur. Real amillər: EDR məhsulunun keyfiyyəti, SOC-un hazırliğı (alət siqnal verəndə kim baxır?), hücumçunun resursu (dövlət-destəkli vs fürsətçi).

**Etik sərhədlər** (bu room-un ən vacib task-ı):

1. **Qanuni sahələr:** icazəli pentest/red team əməliyyatları (ROE-də evasion açıq yazılımlı), öz lab-ınız, təhsil platformaları, müdafiə tədqiqatı (blue team üçün "hücum necə görünür" hazırlığı), malware analitikası.

2. **Qadağan sahələr:** üçüncü tərəfin sistemlərində istənilən formada; "yalnız öyrənmək üçün" bəhanəsi ilə real sistemdə sınaq; açıq şəbəkədə hazırlanmış alətin yayılması (criminal istifadəyə xidmət edir).

3. **Peşəkar ROE nümunəvi:** red team əməliyyatında EDR-evasion müzakirəsi əvvəlcədən aparılır — "EDR bypass sınağı əhatədədirmi?" sualı müqavilədə olmalıdır. Bəzi əməliyyatlarda müşahidə (detection test) məqsəd daşıyır — hükomçunun tutulması **uğur** sayılır (müdafiənin ölçülməsi). Bəzəndə tam "detection avoidance" sınaq olunur — amma bu, müştərinin agah seçimidir.

4. **Biliklərin məsuliyyəti:** evasion texnikalarını bilən hər kəs həm müdafiəni gücləndirə, həm zərər verə bilər. Bu curriculum-da texnikalar konsept səviyyədə saxlanılır — "hazır silah" deyil, "düşüncə modeli" verilir. Real istiqamət: müdafiə tərəfdə istifadə (EDR konfiqurasiyası, detection qaydaları, təlim materialları) biliklərin ən konstruktiv tətbiqidir.

Bu sərhədlərin pozulması — qanuni pozuntu (kompüter cinayətləri qanunvericiliyi) və peşəkar etikanın pozulmasıdır. Cybersecurity peşəsinin etibarı hər praktikantın bu xəttə sadiq qalmasından asılıdır.

**Sual 1**
"Niyə sabit qalibi yoxdur" — izah edin.

**Sual 2.**
Red team əməliyyatında EDR-evasion ROE-də necə əks olunmalıdır?

**Sual 3.**
Evasion biliklərinin "ən konstruktiv tətbiqi" hansıdır?

## Task 5 — Yekun: Path-7 və Bütün Curriculumun Texniki Bağlanışı

Bu room Path-7-nin (Post-Exploitation & Advanced Red Team) sonuncu texniki room-udur. Yekun xəritə:

- **7.1:** Persistence (qapılar) + Exfiltration (məlumat çıxışı).
- **7.2:** C2 — mərkəzləşdirilmiş idarə (beacon, listener, framework-lər).
- **7.3:** Evasion — AV/EDR qarşılıqlı təsir (bu room).

Post-exploitation üçlüyünün vahidi: **hücum lifecycle-ın "hədəfdən sonra" mərhələsi.** Privesc zirvəyə çıxardı (Path-6); post-exploitation zirvədə yaşayır, iş görür, aşkarlanmamağa çalışır.

Bütün curriculum (Path 2-7) üzrə böyük arxitektura:

```
[2] Fundamentals: toolkit, recon, enum
        ↓
[3] Web: protokollar → OWASP zəiflikləri → alətlər
        ↓
[4] Network: servis istismarı → Metasploit → VA
        ↓
[5] Active Directory: struktur → enum → hücum texnikaları
        ↓
[6] PrivEsc: Linux + Windows
        ↓
[7] Post-exploitation: persistence + exfil + C2 + evasion
        ↓
[8] Reporting & Capstone (növbəti path!)
```

Növbəti (və sonuncu) path — **Reporting & Capstone**: bütün bu texniki biliklərin (a) peşəkar hesabata çevrilməsi (client üçün dəyər), (b) uçdan-uca simulyasiyada birləşdirilməsi (əldə edilən biliklərin tam sınağı). Texniki iş hesabat olmadan bitmir — bu, sifarişçi üçün yeganə görünən məhsuldur.

Bu room-un bağlanış mesajı: **evasion — sonsuz qarşıdurma sahəsidir; peşəkar onu "mükəmməl gizlilik" kimi yox, "risk idarəetməsi" kimi anlayır** — və bu idarəetmə həm hücum (ROE çərçivəsində), həm müdafiə (detection qaydaları) tərəfində eyni elmlə dayanır.

**Sual 1**
Path-7-nin üç module-u və vahid məqsədi nədir?

**Sual 2.**
Curriculum-un texniki axını hansı məntiqlə qurulub?

**Sual 3.**
"Nəticə texniki iş yox, hesabatdır" nəyi ifadə edir?
