# SOC Analysis: Windows Event Logs & Sysmon
### Module: Defensive Security Fundamentals — Room 2
**Çətinlik:** Başlanğıc / Orta | **Vaxt:** 50–60 dəqiqə | **Format:** Log Analizi + Ssenari

---

## Table of Contents

1. [Before You Start: A Simple Analogy](#before-you-start-a-simple-analogy)
2. [Task 1 — Windows Event Logs Arxitekturası](#task-1--windows-event-logs-arxitekturası)
3. [Task 2 — Əsas SOC Event ID-ləri](#task-2--əsas-soc-event-id-ləri-the-most-important-security-event-ids)
4. [Task 3 — Sysmon (System Monitor) Nədir və Niyə Lazımdır?](#task-3--sysmon-system-monitor-nədir-və-niyə-lazımdır)
5. [Task 4 — Hands-on Case Study: Şübhəli PowerShell və Malicious Payload Analizi](#task-4--hands-on-case-study-şübhəli-powershell-və-malicious-payload-analizi)
6. [Task 5 — Detection & Threat Hunting ilə Logların Analizi](#task-5--detection--threat-hunting-ilə-logların-analizi)
7. [Key Terminology](#key-terminology)
8. [Summary](#summary)
9. [Self-Check & Review Questions](#self-check--review-questions)

---

## Before You Start: A Simple Analogy

Təsəvvür et ki, sən böyük bir iş mərkəzinin mühafizə şöbəsinin rəhbərisən. Binada iki fərqli müşahidə sistemi var:

1. **Binanın rəsmi giriş-çıxış jurnalı** — foyedəki qeydiyyat masasında saxlanılır. Burada yalnız əsas məlumatlar qeyd olunur: kim, hansı saatda daxil oldu, hansı şəxsiyyət vəsiqəsi ilə. Sadə, amma məhduddur — otaqda konkret nə etdiyini görmür.

2. **Yüksək dəqiqlikli hərəkət və səs sensorları** — binanın hər küncündə quraşdırılmış, hər addımı, hər açılan qapını, hər çıxardılan əşyanı, hətta kimin kiminlə əlaqə saxladığını belə qeyd edən mikro-sensorlar şəbəkəsi.

Bax elə **Windows Event Logs** — birinci sistemdir (rəsmi jurnal), **Sysmon** isə ikinci sistemdir (dərin sensor şəbəkəsi).

| Binanın Mühafizə Sistemi | Rəqəmsal Qarşılığı | Qısa İzah |
|---|---|---|
| Foyedəki rəsmi giriş-çıxış jurnalı | **Windows Event Logs (Security Log)** | Standart, Windows-un özü ilə gələn əsas qeydiyyat sistemi |
| Hər otaqdakı yüksək dəqiqlikli sensorlar | **Sysmon (System Monitor)** | Microsoft Sysinternals-ın əlavə etdiyi, çox daha ətraflı monitorinq aləti |
| "Kim, nə vaxt daxil oldu" qeydi | **Event ID 4624 / 4625 (Logon/Logoff)** | Sadə giriş-çıxış qeydiyyatı |
| "Kim, hansı otağa girib, orada nə edib" qeydi | **Sysmon Event ID 1 (Process Creation + Command Line)** | Prosesin tam icra detalları |
| Kameraların xarici zəng/əlaqələri qeyd etməsi | **Sysmon Event ID 3 (Network Connection)** | Prosesin qurduğu şəbəkə əlaqələri |
| Anbar otağına yeni əşya gətirilməsi qeydi | **Sysmon Event ID 11 (File Create)** | Yeni faylın yaradılması |

> 💡 **Yadda saxla:** Windows Event Logs sənə "nə baş verdi"nin skeletini verir, Sysmon isə həmin skeletə "ət-sümük" — konkret detalları əlavə edir. SOC analitiki üçün hər ikisi bir-birini tamamlayan alətlərdir.

---

## Task 1 — Windows Event Logs Arxitekturası

Windows əməliyyat sistemi bütün mühüm hadisələri avtomatik olaraq öz **Event Log** sistemində qeydə alır. Bu qeydlərə `Event Viewer` (`eventvwr.msc`) vasitəsilə baxmaq mümkündür.

### 5 Əsas Log Jurnalı

| Log Jurnalı | Nəyi Qeyd Edir |
|---|---|
| **Security** | Giriş/çıxış cəhdləri, icazə dəyişiklikləri, audit hadisələri — SOC üçün ən vacib jurnal |
| **System** | Əməliyyat sistemi komponentlərinin (drayverlər, xidmətlər) fəaliyyəti |
| **Application** | Quraşdırılmış proqramların yaratdığı hadisələr |
| **Setup** | Windows quraşdırma və yeniləmə əməliyyatları |
| **Forwarded Events** | Digər kompüterlərdən mərkəzi serverə ötürülən log-lar (log forwarding) |

### Event Strukturu

Hər bir Windows Event-i aşağıdakı əsas sahələrdən ibarətdir:

```
Event ID:     4624
Timestamp:    2026-08-13T10:02:15Z
Provider:     Microsoft-Windows-Security-Auditing
User:         CORP\jsmith
Computer:     WORKSTATION-07
Logon Type:   3
```

- **Event ID** — hadisənin növünü göstərən unikal rəqəm (bu, "hadisənin kodu"dur).
- **Timestamp** — hadisənin baş verdiyi dəqiq vaxt.
- **Provider** — hadisəni yaradan sistem komponenti.
- **User / Computer** — hadisəyə aid olan istifadəçi və kompüter.

> 💡 SOC analitiki üçün **Event ID**-ni tanımaq, sanki həkimin diaqnoz kodlarını əzbərdən bilməsi kimidir — bu, analiz sürətini kəskin artırır.

---

**Sual 1.1**
Windows-da giriş/çıxış cəhdləri və audit hadisələrinin qeydə alındığı əsas log jurnalının adı nədir?
*Format: İngiliscə söz (bir söz)*

**Sual 1.2**
Doğru/Yanlış: "Application" log jurnalı əsasən istifadəçilərin giriş cəhdlərini qeydə alır.
*Format: Doğru / Yanlış*

---

## Task 2 — Əsas SOC Event ID-ləri (The Most Important Security Event IDs)

Bir SOC analitiki gündəlik işində bəzi Event ID-lərlə tez-tez qarşılaşır. Bunları əzbər bilmək analiz sürətini xeyli artırır.

| Event ID | Adı | İzahı |
|---|---|---|
| **4624** | Successful Logon | İstifadəçi sistemə uğurla daxil olub. `Logon Type` sahəsi *necə* daxil olduğunu göstərir |
| **4625** | Failed Logon | Uğursuz giriş cəhdi — çoxsaylı təkrarlar *brute-force* əlaməti ola bilər |
| **4672** | Special Privileges Assigned | İstifadəçiyə admin səviyyəli xüsusi hüquqlar verilib (yüksək diqqət tələb edir) |
| **4688** | Process Creation | Yeni bir proses (proqram) başladılıb |
| **4720** | User Account Created | Sistemdə yeni istifadəçi hesabı yaradılıb (hücumçular tez-tez arxa qapı hesabı yaradır) |

### Logon Type-lar (Event ID 4624/4625 üçün vacib)

| Logon Type | Mənası |
|---|---|
| **2** | Interactive — fiziki olaraq klaviatura ilə giriş |
| **3** | Network — şəbəkə üzərindən giriş (məs. paylaşılan qovluğa girmək) |
| **10** | RemoteInteractive — Remote Desktop (RDP) vasitəsilə giriş |

**Nümunə log:**

```
Event ID:     4624
Logon Type:   10
Account Name: administrator
Source IP:    203.0.113.55
```

Bu log göstərir ki, `administrator` hesabına uzaqdan **RDP** vasitəsilə uğurlu giriş baş verib — bu, xüsusilə naməlum IP-dən gəldikdə ciddi diqqət tələb edən bir hadisədir.

---

**Sual 2.1**
Logon Type 10 nəyi ifadə edir?
*Format: İngiliscə termin (qısaltma və ya tam ad)*

**Sual 2.2**
Event ID 4625 hansı hadisəni bildirir?
*Format: qısa ifadə (Azərbaycan və ya İngilis dilində)*

---

## Task 3 — Sysmon (System Monitor) Nədir və Niyə Lazımdır?

### Ənənəvi Log-ların Çatışmazlığı

Standart Windows Event Log-lar faydalıdır, amma **dərinlik baxımından məhduddur**. Məsələn, Event ID 4688 (Process Creation) yalnız hansı proqramın işə salındığını göstərir, amma çox vaxt **hansı parametrlərlə (command line arguments)** işə salındığını, hansı **şəbəkə əlaqələrini** qurduğunu və ya hansı **faylları yaratdığını** ətraflı göstərmir.

Bax elə buna görə Microsoft-un **Sysinternals** dəstinin bir hissəsi olan **Sysmon (System Monitor)** yaradılıb — sistemə "yüksək dəqiqlikli sensorlar" quraşdıran pulsuz bir alətdir.

### Əsas Sysmon Event ID-ləri

| Event ID | Adı | İzahı |
|---|---|---|
| **1** | Process Creation | Yeni proses yaradılması — **command line arguments** daxil olmaqla tam detallar |
| **3** | Network Connection | Prosesin hansı IP ünvanına və porta qoşulduğu |
| **7** | Image Loaded | Prosesin yüklədiyi DLL-lər — *DLL injection* kimi hücumların indikatoru |
| **11** | File Create | Yeni faylın yaradılması (məsələn, zərərli faylın diskə yazılması) |

**Nümunə Sysmon Event ID 1 log-u:**

```json
{
  "EventID": 1,
  "UtcTime": "2026-08-13T10:05:22.104Z",
  "Image": "C:\\Windows\\System32\\cmd.exe",
  "CommandLine": "cmd.exe /c powershell.exe -enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQA...",
  "ParentImage": "C:\\Windows\\explorer.exe",
  "User": "CORP\\jsmith"
}
```

Diqqət et: bu log təkcə "powershell.exe işə düşdü" demir — **tam command line**-ı, **valideyn prosesi (parent process)** və **istifadəçini** göstərir. Bu səviyyədə detal, Windows-un standart 4688 log-unda adətən mövcud olmur (əgər əlavə audit siyasəti aktivləşdirilməyibsə).

---

**Sual 3.1**
Sysmon Event ID 1 ilə Windows Event ID 4688 arasındakı əsas üstünlük nədir?
*Format: qısa cümlə (Azərbaycan dilində)*

**Sual 3.2**
Sysmon-da bir prosesin xarici şəbəkə/IP ünvanına qoşulmasını izləyən Event ID hansıdır?
*Format: rəqəm*

---

## Task 4 — Hands-on Case Study: Şübhəli PowerShell və Malicious Payload Analizi

Sən XYZ Corp-un SOC mərkəzində işləyirsən. Saat 10:14-də Sysmon sənə aşağıdakı log zəncirini göndərir. Bunları analiz et:

### Log Zənciri

```
[LOG 1 — Sysmon Event ID 1: Process Creation]
UtcTime:      2026-08-13T10:14:02.501Z
Image:        C:\Windows\System32\cmd.exe
CommandLine:  cmd.exe /c "powershell.exe -nop -w hidden -enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIABOAGUAdAAuAFcAZQBiAEMAbABpAGUAbgB0ACkA"
ParentImage:  C:\Windows\explorer.exe
User:         CORP\l.hasanova
Computer:     FIN-WS-014

[LOG 2 — Sysmon Event ID 1: Process Creation]
UtcTime:      2026-08-13T10:14:03.117Z
Image:        C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe
CommandLine:  powershell.exe -nop -w hidden -enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIABOAGUAdAAuAFcAZQBiAEMAbABpAGUAbgB0ACkA
ParentImage:  C:\Windows\System32\cmd.exe
User:         CORP\l.hasanova
Computer:     FIN-WS-014

[LOG 3 — Sysmon Event ID 3: Network Connection]
UtcTime:         2026-08-13T10:14:05.882Z
Image:           C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe
DestinationIp:   194.61.55.128
DestinationPort: 443
User:            CORP\l.hasanova
Computer:        FIN-WS-014
```

### Vəziyyətin Təhlili

Bu log zənciri klassik bir **fileless malware** icra ssenarisini əks etdirir:

1. `explorer.exe` (istifadəçinin adi iş prosesi) `cmd.exe`-ni başladır.
2. `cmd.exe`, gizli pəncərədə (`-w hidden`) kodlanmış (`-enc`) bir PowerShell əmri icra edir.
3. Bu PowerShell prosesi dərhal xarici bir IP ünvanı ilə (443 portu üzərindən, adətən HTTPS kimi maskalanmış) şəbəkə əlaqəsi qurur.

Bu zəncir, hücumçunun artıq sistemə giriş əldə etdiyini və indi zərərli *payload*-u yükləmək və ya *Command & Control (C2)* serverlə əlaqə qurmaq cəhdində olduğunu göstərir.

---

**Sual 4.1**
Log-a əsasən: PowerShell-i başladan valideyn proses (Parent Process) hansıdır?
*Format: fayl adı (məs. proses.exe)*

**Sual 4.2**
Sysmon Event ID 3 log-una əsasən: Zərərli skriptin qoşulmağa çalışdığı xarici IP ünvanı nədir?
*Format: XXX.XXX.XXX.XXX*

**Sual 4.3**
Sual 4.1 və 4.2-dəki əməliyyatları icra edən Windows istifadəçi hesabı hansıdır?
*Format: DOMAIN\istifadəçi_adı*

---

## Task 5 — Detection & Threat Hunting ilə Logların Analizi

### IOC — Indicators of Compromise

**IOC (Indicators of Compromise)** — bir sistemin təhlükəyə məruz qaldığını göstərən konkret dəlillərdir: şübhəli IP ünvanları, fayl heş-ləri (*hash*), qeyri-adi command line-lar, naməlum proseslər və s. SOC analitikləri IOC-ları aşkarlamaq üçün log-ları müntəzəm analiz edirlər.

### Sadə Threat Hunting Məntiqi

Threat Hunting — hələ alert yaranmamış olsa belə, sistemdə gizli təhlükələri **proaktiv şəkildə** axtarmaq prosesidir. Sadə bir SIEM sorğu məntiqi belə görünə bilər:

```
search Event_ID=1 
| where CommandLine contains "-enc" 
| where ParentImage="cmd.exe"
```

Bu cür sorğu, "kodlanmış PowerShell əmrləri `cmd.exe` vasitəsilə işə salınıbmı?" sualına cavab axtarır — çünki bu nümunə tez-tez zərərli fəaliyyətlə əlaqələndirilir.

### Log-ların SIEM-ə Ötürülməsi

Fərdi kompüterlərdəki Sysmon və Windows Event Log-lar adətən **Windows Event Forwarding (WEF)** və ya agent-əsaslı vasitələrlə mərkəzi SIEM sisteminə (Splunk, Sentinel, Wazuh) göndərilir ki, SOC komandası bütün şəbəkəni bir mərkəzdən analiz edə bilsin.

---

**Sual 5.1**
Alert yaranmamış olsa belə, sistemdə gizli təhlükələri proaktiv şəkildə axtarma prosesi necə adlanır?
*Format: İngiliscə termin (2 söz)*

---

## Key Terminology

| Termin | Açıqlama |
|---|---|
| **Event ID** | Windows-da hər hadisə növünə aid edilən unikal identifikasiya nömrəsi |
| **Sysmon (System Monitor)** | Microsoft Sysinternals-ın dərin sistem monitorinqi təmin edən pulsuz aləti |
| **Security Log** | Giriş cəhdləri və audit hadisələrinin qeydə alındığı əsas Windows log jurnalı |
| **Logon Type** | Girişin necə baş verdiyini göstərən kod (2=Interactive, 3=Network, 10=RDP) |
| **Parent/Child Process** | Bir prosesi başladan (parent) və onun nəticəsində yaranan (child) proses əlaqəsi |
| **Command Line Arguments** | Bir proqramın hansı əlavə parametrlərlə icra olunduğunu göstərən mətn |
| **Process Creation** | Yeni bir proqramın (prosesin) sistemdə başladılması hadisəsi |
| **DLL Injection** | Zərərli kodun mövcud bir prosesin yaddaşına daxil edilməsi üsulu |
| **Fileless Malware** | Diskdə fayl saxlamadan, birbaşa yaddaşda icra olunan zərərli proqram növü |
| **IOC (Indicators of Compromise)** | Sistemin təhlükəyə məruz qaldığını göstərən konkret dəlillər |
| **Threat Hunting** | Sistemdə gizli təhlükələri proaktiv şəkildə axtarma prosesi |
| **C2 (Command & Control)** | Hücumçunun zərərli proqramı uzaqdan idarə etdiyi əlaqə kanalı |
| **Event Forwarding (WEF)** | Log-ların fərdi kompüterlərdən mərkəzi serverə ötürülməsi mexanizmi |

---

## Summary

Bu room-da öyrəndik ki:

- **Windows Event Logs** sistemin əsas hadisələrini qeydə alan standart mexanizmdir; **Security**, **System**, **Application**, **Setup** və **Forwarded Events** olmaqla 5 əsas jurnaldan ibarətdir.
- **Event ID 4624, 4625, 4672, 4688 və 4720** kimi kодlar SOC analitiki üçün gündəlik iş alətidir.
- **Logon Type** sahəsi girişin necə (fiziki, şəbəkə, RDP) baş verdiyini müəyyən etməyə kömək edir.
- **Sysmon** standart log-lara nisbətən çox daha dərin görünürlük verir — xüsusilə **command line arguments**, **şəbəkə əlaqələri** və **fayl yaratma** hadisələrində.
- Real bir insident ssenarisində **Process Creation → Network Connection** zəncirini izləməklə şübhəli fəaliyyəti necə aşkarlamağı öyrəndik.
- **IOC** və **Threat Hunting** anlayışları, SOC analitikinin sadəcə alert gözləməkdənsə, proaktiv şəkildə təhlükə axtarmasına imkan verir.

Növbəti room-da bu bacarıqları genişləndirəcək və real *SIEM query* qurma prinsiplərinə daha dərindən baxacağıq!

---

## Self-Check & Review Questions

1. Windows Event Logs ilə Sysmon arasındakı əsas fərqi öz sözlərinlə izah et — hansı hallarda Sysmon vacib olur?
2. Event ID 4624 (uğurlu giriş) təkbaşına həmişə "təhlükəsiz" hadisə deməkdirmi? Niyə/niyə yox?
3. Task 4-dəki log zəncirinə əsasən, sən SOC analitiki olsaydın, hansı əlavə məlumatları (məs. digər Sysmon Event ID-ləri) yoxlamaq istəyərdin və niyə?
4. "Fileless malware" termininin mənasını izah et və bunun ənənəvi antivirus üçün niyə çətinlik yaratdığını göstər.
5. Bir SOC komandasının Threat Hunting aparması, sadəcə alert-lərə reaksiya verməkdən daha üstün olduğu bir vəziyyətə nümunə gətir.
