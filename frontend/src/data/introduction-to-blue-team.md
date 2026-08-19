# Introduction to Blue Team
### Module: Defensive Security Fundamentals — Room 1
**Çətinlik:** Başlanğıc (Easy) | **Vaxt:** 45–60 dəqiqə | **Format:** Nəzəriyyə + Ssenari Analizi

---

## Table of Contents

1. [Before You Start: A Simple Analogy](#before-you-start-a-simple-analogy)
2. [Task 1 — Blue Team Nədir və Niyə Vacibdir?](#task-1--blue-team-nədir-və-niyə-vacibdir)
3. [Task 2 — Blue Team-in Əsas Sahələri və Rolları](#task-2--blue-team-in-əsas-sahələri-və-rolları)
4. [Task 3 — Blue Team Alətləri və Texnologiyaları](#task-3--blue-team-alətləri-və-texnologiyaları)
5. [Task 4 — Simulyasiya Ssenarisi: SOC Analitikinin İlk Günü](#task-4--simulyasiya-ssenarisi-soc-analitikinin-ilk-günü-hands-on-case-study)
6. [Task 5 — Müdafiə Strategiyaları (Defense in Depth)](#task-5--müdafiə-strategiyaları-defense-in-depth)
7. [Key Terminology](#key-terminology)
8. [Summary](#summary)
9. [Self-Check & Review Questions](#self-check--review-questions)

---

## Before You Start: A Simple Analogy

Təsəvvür et ki, sən qədim bir **Qalanın (Castle) Baş Mühafizəçisisən**. Qalanın içində qiymətli xəzinələr (şirkətin məlumatları), yaşayış otaqları (serverlər) və giriş qapıları (şəbəkə portları) var. Sənin işin təkcə divarları hündür tikmək deyil — kimin qalaya girib-çıxdığını izləmək, şübhəli hərəkətləri sezmək və hücum olduğu zaman sürətlə reaksiya verməkdir.

Bax elə **Blue Team** də məhz budur: rəqəmsal qalanın daimi mühafizəçiləri.

Aşağıdakı cədvəl qala analogiyasını Blue Team-in real dünyadakı rolları və texnologiyaları ilə qarşılaşdırır:

| Qala Analogiyası | Blue Team Qarşılığı | Qısa İzah |
|---|---|---|
| Qala divarları və xəndək | **Firewall** | Xarici təhlükəli trafiki kənarda saxlayan ilk müdafiə xətti |
| Qapıdakı keşikçilər | **IDS/IPS (Intrusion Detection/Prevention System)** | Şübhəli hərəkəti aşkar edən və ya bloklayan sistemlər |
| Qala bürcündəki müşahidəçi | **SOC Analyst** | 24/7 monitorinq aparan, ekranlara baxan mütəxəssis |
| Bürcdəki "hər şeyi görən" durbin | **SIEM (Security Information and Event Management)** | Bütün qala ərazisindəki (şəbəkədəki) hadisələri mərkəzləşdirən sistem |
| Casus tutmaq üçün kəşfiyyat şəbəkəsi | **Threat Intelligence** | Düşmənin (hücumçuların) kim olduğu, necə hərəkət etdiyi haqqında əvvəlcədən məlumat toplamaq |
| Hücumdan sonra "kim, necə, nə vaxt girib" araşdırması | **Digital Forensics** | İnsidentdən sonra sübutları toplayıb təhlil etmək |
| Divarlardakı çatları bağlamaq | **Hardening / Vulnerability Management** | Sistemlərdəki zəiflikləri aşkarlayıb bağlamaq |
| Hücum anında qapıları bağlamaq, yanğını söndürmək | **Incident Response** | Aktiv təhlükəni zərərsizləşdirmək və zərəri minimuma endirmək |

> 💡 **Yadda saxla:** Qala heç vaxt "bitmiş" tikili sayılmır — daim təkmilləşdirilir, yoxlanılır və gücləndirilir. Kibertəhlükəsizlik də eynilə davamlı bir prosesdir, birdəfəlik layihə deyil.

---

## Task 1 — Blue Team Nədir və Niyə Vacibdir?

**Blue Team** — bir təşkilatın rəqəmsal infrastrukturunu qoruyan, monitorinq edən və hücumlara qarşı müdafiə quran kibertəhlükəsizlik mütəxəssisləri qrupudur. Onlar hücum etmirlər — onlar **müdafiə edir, aşkarlayır və reaksiya verirlər**.

### Əsas Fəlsəfə

Kibertəhlükəsizlikdə çox məşhur bir prinsip var:

> **"Hücumçu yalnız 1 dəfə haqlı olmalıdır, müdafiəçi isə HƏR ZAMAN."**

Bu o deməkdir ki, hücumçu (Red Team və ya real təhlükə aktoru) minlərlə cəhddən yalnız birində uğur qazana bilər — bir açıq port, bir unudulmuş parol, bir *phishing* e-poçtu kifayətdir. Amma Blue Team-in işi fərqlidir: onlar **hər saniyə, hər gün, fasiləsiz** sayıq olmalıdırlar. Elə buna görə də Blue Team-in işi həm çətin, həm də son dərəcə vacibdir.

### Red Team vs Blue Team vs Purple Team

| Komanda | Rolu | Analogiya |
|---|---|---|
| 🔴 **Red Team** | Sistemə hücum edir, zəiflikləri aşkarlamaq üçün real hücumçu kimi davranır (*Penetration Testing*) | Qalanı sınamaq üçün muzdlu "sınaq hücumçuları" |
| 🔵 **Blue Team** | Sistemi müdafiə edir, hücumları aşkarlayır və qarşısını alır | Qalanın daimi mühafizəçiləri |
| 🟣 **Purple Team** | Red və Blue komandalar arasında əməkdaşlığı təmin edir, bilik mübadiləsini gücləndirir | Hər iki tərəfin təcrübəsini birləşdirən strateq |

### SOC — Security Operations Center

**SOC (Security Operations Center)** — Blue Team-in "əməliyyat mərkəzi"dir. Bura, bütün şəbəkə fəaliyyətinin 24/7 monitorinq edildiyi, alert-lərin analiz olunduğu və insidentlərə reaksiya verildiyi mərkəzi otaqdır (fiziki və ya virtual). Bir SOC-da adətən müxtəlif səviyyəli analitiklər (*Tier 1, Tier 2, Tier 3*) işləyir.

---

**Sual 1.1**
Aşağıdakı fəlsəfəni tamamla: "Hücumçu yalnız 1 dəfə haqlı olmalıdır, müdafiəçi isə ____ ."
*Format: bir söz (Azərbaycan dilində)*

**Sual 1.2**
Doğru/Yanlış: Red Team-in əsas vəzifəsi sistemləri müdafiə etmək və monitorinq aparmaqdır.
*Format: Doğru / Yanlış*

---

## Task 2 — Blue Team-in Əsas Sahələri və Rolları

Blue Team tək bir peşə deyil — bir neçə ixtisaslaşmış sahədən ibarət komandadır. Gəl bu sahələrə nəzər salaq:

### 1. Security Operations Center (SOC) & Log Analysis
SOC analitikləri hər gün minlərlə *log* (qeyd) və *alert* (xəbərdarlıq) görür. Onların işi bu məlumat okeanından **real təhlükəni** tapmaqdır — sanki min səhifəlik kitabda bir orfoqrafik səhvi axtarmaq kimi, amma sürətli və dəqiq şəkildə.

**Real nümunə:** Bir işçinin hesabına 2 dəqiqə ərzində 50 uğursuz giriş cəhdi baş verir, sonra uğurlu giriş qeydə alınır. SOC analitiki bunu şübhəli sayıb araşdırmalıdır.

### 2. Incident Response (İnsidentlərə Reaksiya)
Hücum baş verdikdə, Incident Response komandası "yanğınsöndürən dəstə" rolunu oynayır: təhlükəni izolyasiya edir, zərəri minimuma endirir və sistemi bərpa edir.

**Real nümunə:** Bir serverdə *ransomware* aşkarlanır — komanda dərhal həmin serveri şəbəkədən ayırır ki, virus digər sistemlərə yayılmasın.

### 3. Digital Forensics (Rəqəmsal Ekspertiza)
İnsidentdən sonra "detektiv" rolunu oynayan sahədir: **nə baş verdi, kim etdi, necə etdi** suallarına cavab axtarır. Sübutlar (log-lar, disk imicləri, yaddaş dampları) toplanır və məhkəmədə istifadə oluna biləcək şəkildə saxlanılır.

**Real nümunə:** Sızma baş verdikdən sonra ekspert komandası zərərli faylın hansı vaxt sistemə düşdüyünü müəyyən edir.

### 4. Threat Intelligence (Təhdid Kəşfiyyatı)
Bu sahə "kəşfiyyat zabiti" roludur — hücumçuların kim olduğunu, hansı üsullardan (TTPs — *Tactics, Techniques, Procedures*) istifadə etdiklərini öyrənir və bu məlumatı müdafiəni gücləndirmək üçün istifadə edir.

**Real nümunə:** Threat Intelligence komandası müəyyən bir *hacker* qrupunun son zamanlar bank sektoruna qarşı yeni bir *phishing* üsulundan istifadə etdiyini aşkarlayır və bu barədə SOC-a xəbərdarlıq edir.

### 5. Vulnerability Management & Hardening
Bu sahə sistemlərdəki zəiflikləri (*vulnerabilities*) tapıb bağlamaqla məşğul olur — "qala divarındakı çatları qabaqcadan tapıb bağlamaq" kimi.

**Real nümunə:** Köhnə versiyalı proqram təminatında məlum bir zəiflik aşkarlanır və komanda dərhal *patch* (yamaq) tətbiq edir.

---

**Sual 2.1**
Hücumdan sonra "kim, nə vaxt, necə" suallarına cavab axtaran Blue Team sahəsi hansıdır?
*Format: İngiliscə termin (2 söz)*

**Sual 2.2**
Ssenari: Şirkətin İT komandası köhnə bir proqram təminatındakı məlum zəifliyi (CVE) aşkarlayıb bağlayır. Bu, Blue Team-in hansı sahəsinə aiddir?
*Format: İngiliscə termin*

---

## Task 3 — Blue Team Alətləri və Texnologiyaları

Blue Team komandaları öz işlərini effektiv görmək üçün müxtəlif alətlərdən istifadə edir. Gəl əsas kateqoriyalara baxaq:

### SIEM (Security Information and Event Management)
**Nümunələr:** Splunk, Microsoft Sentinel, Wazuh

SIEM — şəbəkədəki bütün cihazlardan (server, firewall, endpoint və s.) gələn log-ları **bir mərkəzdə toplayan və analiz edən** sistemdir. Bu, bürcdəki "hər şeyi görən durbin" kimidir — min fərqli mənbədən gələn məlumatı bir ekranda birləşdirir və şübhəli nümunələri (*pattern*) avtomatik aşkarlayır.

```json
{
  "timestamp": "2026-08-13T09:12:44Z",
  "event_type": "authentication_failure",
  "source_ip": "185.220.101.47",
  "target_user": "admin",
  "attempts": 47
}
```

### EDR / Antivirus (Endpoint Detection & Response)
**EDR** — hər bir "endpoint" (kompüter, server, noutbuk) üzərində baş verən fəaliyyəti izləyən və şübhəli davranışı (məsələn, zərərli proses icrası) real vaxtda aşkarlayıb bloklayan həlldir. Ənənəvi antivirusdan fərqli olaraq, EDR təkcə məlum virusları yox, **davranış nümunələrini** də təhlil edir.

### Firewall & IDS/IPS
**Nümunələr:** Snort, Suricata

- **Firewall** — şəbəkəyə giriş-çıxışı qaydalara əsasən nəzarət edən "qapı keşikçisi".
- **IDS (Intrusion Detection System)** — şübhəli trafiki **aşkarlayır** və xəbərdarlıq edir, amma bloklamır.
- **IPS (Intrusion Prevention System)** — şübhəli trafiki aşkarlamaqla yanaşı, **avtomatik bloklayır** da.

### Packet Analyzers
**Nümunə:** Wireshark

Şəbəkədəki hər bir məlumat paketini "mikroskop altında" incələməyə imkan verən alətdir. SOC analitikləri şübhəli trafikin məzmununu, mənbəyini və istiqamətini bu vasitə ilə dəqiq analiz edə bilirlər.

```bash
# Wireshark ilə şübhəli trafiki filtrləmək nümunəsi
tcp.port == 4444 && ip.addr == 185.220.101.47
```

---

**Sual 3.1**
Splunk, Microsoft Sentinel və Wazuh hansı alət kateqoriyasına aid nümunələrdir?
*Format: Abbreviatura (4 hərf)*

**Sual 3.2**
Şübhəli trafiki yalnız aşkarlayıb xəbərdarlıq edən, lakin avtomatik bloklamayan sistemin adı nədir?
*Format: Abbreviatura (3 hərf)*

---

## Task 4 — Simulyasiya Ssenarisi: SOC Analitikinin İlk Günü (Hands-on Case Study)

Təbrik edirik! Bu gün sənin **"XYZ Corp"** şirkətində SOC analitiki kimi ilk iş günündür. Saat 09:14-də SIEM sistemi (Splunk) sənə aşağıdakı alert-i göndərir:

### 🚨 Alert Card

```
ALERT ID: SOC-2026-08132
SEVERITY: HIGH
RULE TRIGGERED: Multiple Failed Login Attempts Followed by Successful Login
```

### Log Fraqmenti

```syslog
2026-08-13T09:10:02Z auth-server sshd[2210]: Failed password for admin from 185.220.101.47 port 51422 ssh2
2026-08-13T09:10:04Z auth-server sshd[2210]: Failed password for admin from 185.220.101.47 port 51423 ssh2
2026-08-13T09:10:07Z auth-server sshd[2210]: Failed password for admin from 185.220.101.47 port 51424 ssh2
... (44 daha uğursuz cəhd) ...
2026-08-13T09:12:41Z auth-server sshd[2210]: Accepted password for admin from 185.220.101.47 port 51467 ssh2
2026-08-13T09:13:15Z auth-server powershell[3391]: Process created: powershell.exe -enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQA...
2026-08-13T09:13:16Z auth-server network: Outbound connection established to 91.203.145.12:443
```

### Vəziyyətin Təhlili

Bu ssenaridə diqqət yetirməli olduğun əsas elementlər:

1. Eyni mənbədən (bir IP ünvanından) qısa müddətdə çoxlu sayda uğursuz giriş cəhdi.
2. Bu cəhdlərin ardından **uğurlu** bir giriş.
3. Girişdən dərhal sonra kodlanmış (*encoded*) bir PowerShell əmrinin icrası.
4. Naməlum xarici bir ünvana (91.203.145.12) şifrəli əlaqə qurulması.

> 💡 **İpucu:** Bu nümunə klassik bir hücum zəncirini əks etdirir — əvvəlcə parolu təxmin etməyə çalışmaq, sonra sistemə giriş əldə edib zərərli əməliyyat icra etmək və xarici serverlə əlaqə qurmaq (bu, tez-tez *Command & Control (C2)* əlaqəsi adlanır).

---

**Sual 4.1**
Log-a əsasən: Hücumçunun istifadə etdiyi IP ünvanı nədir?
*Format: XXX.XXX.XXX.XXX*

**Sual 4.2**
Log-a əsasən: İlkin giriş mərhələsində istifadə olunan hücum növü nədir? (İpucu: eyni hesaba qarşı çoxlu sayda parol cəhdi)
*Format: İngiliscə termin (bir söz və ya defislə birləşmiş söz)*

**Sual 4.3**
Ssenariyə əsasən: SOC analitiki bu insidenti aşkar etdikdən sonra ilk növbədə hansı zərərsizləşdirmə (containment) addımını atmalıdır?
*Format: qısa cümlə (Azərbaycan dilində)*

---

## Task 5 — Müdafiə Strategiyaları (Defense in Depth)

### Defense in Depth (Çoxtəbəqəli Müdafiə)

Bir qalanı yalnız bir divarla qorumursan — xəndək, hündür divarlar, keşikçi qülləsi, daxili kapitan və son olaraq xəzinə otağının öz kilidi olur. Əgər hücumçu bir təbəqəni keçsə belə, növbəti təbəqə onu dayandırır.

Kibertəhlükəsizlikdə bu prinsip **Defense in Depth** adlanır: tək bir müdafiə tədbirinə güvənmək əvəzinə, bir neçə **paralel müdafiə qatı** qurmaq (firewall + EDR + SIEM + istifadəçi təlimi + backup və s.).

### NIST Incident Response Həyat Dövrü

**NIST (National Institute of Standards and Technology)** insident idarəetməsi üçün 6 mərhələdən ibarət bir çərçivə təklif edir:

| Mərhələ | İzahı |
|---|---|
| **1. Preparation** | İnsidentə hazır olmaq — planlar, alətlər, təlimlər əvvəlcədən hazırlanır |
| **2. Detection** | Şübhəli fəaliyyətin aşkarlanması (SIEM, alert-lər vasitəsilə) |
| **3. Containment** | Təhlükənin yayılmasının qarşısını almaq (məs. sistemi şəbəkədən ayırmaq) |
| **4. Eradication** | Təhlükənin kökünü kəsmək (zərərli faylı silmək, zəifliyi bağlamaq) |
| **5. Recovery** | Sistemləri normal iş rejiminə qaytarmaq |
| **6. Lessons Learned** | Baş verənləri təhlil edib gələcək üçün dərs çıxarmaq |

> 💡 Bu mərhələlər dövri xarakter daşıyır — "Lessons Learned" mərhələsindən əldə olunan biliklər "Preparation" mərhələsini gücləndirir və dövr yenidən başlayır.

---

**Sual 5.1**
NIST İnsidentlərə Reaksiya çərçivəsində, təhlükənin yayılmasının qarşısının alındığı mərhələ hansıdır?
*Format: İngiliscə termin (bir söz)*

---

## Key Terminology

| Termin | Açıqlama |
|---|---|
| **Blue Team** | Təşkilatın rəqəmsal infrastrukturunu müdafiə edən komanda |
| **Red Team** | Real hücumçu kimi davranaraq sistemin zəifliklərini sınayan komanda |
| **Purple Team** | Red və Blue komandalar arasında əməkdaşlığı təmin edən yanaşma |
| **SOC (Security Operations Center)** | Şəbəkə fəaliyyətinin 24/7 monitorinq edildiyi mərkəz |
| **SIEM** | Log-ları mərkəzləşdirən və analiz edən sistem (Splunk, Sentinel, Wazuh) |
| **EDR** | Endpoint-lərdə şübhəli davranışı aşkarlayan və bloklayan həll |
| **IDS** | Şübhəli trafiki aşkarlayan, lakin bloklamayan sistem |
| **IPS** | Şübhəli trafiki aşkarlayıb avtomatik bloklayan sistem |
| **Firewall** | Şəbəkəyə giriş-çıxışı qaydalara əsasən idarə edən sistem |
| **Incident Response** | Aktiv təhlükəyə qarşı görülən reaksiya tədbirləri |
| **Digital Forensics** | İnsidentdən sonra sübutları toplayıb təhlil etmə sahəsi |
| **Threat Intelligence** | Hücumçuların taktika və üsulları haqqında məlumat toplama |
| **Vulnerability Management** | Sistem zəifliklərinin aşkarlanıb bağlanması prosesi |
| **Hardening** | Sistemin təhlükəsizlik səviyyəsini artırmaq üçün konfiqurasiyaların gücləndirilməsi |
| **Defense in Depth** | Çoxtəbəqəli müdafiə strategiyası |
| **C2 (Command & Control)** | Hücumçunun zərərli proqramı uzaqdan idarə etdiyi əlaqə kanalı |
| **Brute-force Attack** | Parolu təkrar-təkrar sınaqla təxmin etməyə çalışma hücumu |
| **NIST** | İnsident idarəetməsi üçün standart çərçivə təklif edən qurum |

---

## Summary

Bu room-da öyrəndik ki:

- **Blue Team** — təşkilatları hücumlardan qoruyan, monitorinq edən və insidentlərə reaksiya verən komandadır.
- Blue Team-in fəlsəfəsi sadədir, amma tələbkardır: *"Hücumçu 1 dəfə haqlı olmalıdır, müdafiəçi hər zaman."*
- Blue Team daxilində SOC, Incident Response, Digital Forensics, Threat Intelligence və Vulnerability Management kimi ixtisaslaşmış sahələr fəaliyyət göstərir.
- SIEM, EDR, Firewall, IDS/IPS və Packet Analyzer kimi alətlər Blue Team-in gündəlik iş alətləridir.
- Real bir insident ssenarisində log analizi vasitəsilə şübhəli fəaliyyəti necə tanımaq öyrənildi.
- **Defense in Depth** və **NIST Incident Response** çərçivəsi müdafiə strategiyalarının əsasını təşkil edir.

Növbəti room-da bu bilikləri daha dərinə aparacaq və real *log analysis* mühitində praktiki bacarıqlar inkişaf etdirəcəyik!

---

## Self-Check & Review Questions

1. Blue Team-in Red Team-dən əsas fərqi nədir və hər ikisi niyə bir-birini tamamlayır?
2. Öz sözlərinlə izah et: SIEM sistemi olmadan bir SOC analitikinin işi necə çətinləşərdi?
3. Task 4-dəki ssenaridə, əgər sən SOC analitiki olsaydın, "Eradication" mərhələsində konkret olaraq hansı addımları atardın?
4. Defense in Depth prinsipinin real həyatda (kibertəhlükəsizlikdən kənar) bir nümunəsini gətir və izah et.
5. Threat Intelligence-in Incident Response prosesini necə gücləndirdiyini izah et — konkret bir nümunə ilə göstər.
