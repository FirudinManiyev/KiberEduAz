# Room: C2 Framework-lərinə Giriş

**Path:** Post-Exploitation & Advanced Red Team
**Module:** Command & Control (C2)
**Çətinlik:** Advanced
**Təxmini vaxt:** 1.5 saat

## Room haqqında

Command & Control (C2) — hücumun "uzaqdan idarə mərkəzi"dir: ələ keçirilmiş sistemlərlə mərkəzi server arasında strukturlaşmış əlaqə. Bu room-da C2-nin məqsədini, beacon/agent konseptini və məşhur framework-lərin (Cobalt Strike, Sliver, Mythic) qısa icmalını öyrənəcəksiniz. Konseptual səviyyə — konkret framework təlimatı yox, C2 düşüncə modeli.

## Öyrənmə nəticələri

- C2-nin məqsədini və əsas komponentlərini izah etmək
- Beacon/agent konseptini və kommunikasiya modellərini bilmək
- Məşhur framework-ləri (Cobalt Strike, Sliver, Mythic) müqayisə etmək
- C2 траfikinin aşkarlanması və müdafiə perspektivini anlamaq

## Task 1 — C2 Nədir: Niyə "Mərkəz" Lazımdır

Təsəvvür edin: 50 sistemdə shell var. Hər biri ayrıca netcat listener, əl ilə əmr, fərqli fayllar... İdarəetməsiz xaos. C2 bunu mərkəzləşdirir:

**C2 (Command & Control) server** — hücumçunun komanda mərkəzi: ələ keçirilmiş host-larla (implant-larla) əlaqə saxlayan, əmrlər göndərən, nəticələri toplayan server.

**İmplant/agent** — hədəf sistemdə işləyən proqram: C2 ilə əlaqə qurur, əmr gözləyir, icra edir, nəticə qaytarır.

Əsas komponentlər:

```
[Operator konsolu] ←→ [C2/Team server] ←→ [Listener] ←——şəbəkə——→ [Implant/Beacon]
     (insan)            (mərkəz)          (əlaqə nöqtəsi)           (hədəfdə)
```

**Listener** — C2 server-də gözləyən əlaqə nöqtəsi (HTTP/HTTPS/DNS/SMB kanalı üzrə). **Malleable profil** — trafikin "görünüşü": C2-trafikini leqal trafikə (jQuery sorğusu, cloud API) bənzədən konfiqurasiya.

C2-nin verdiyi strukturlar:

1. **Çoxsaylı sessiya idarəsi:** 50 implant bir konsolda — siyahı, kateqoriya, adlar.
2. **Modullı əməliyyatlar:** shell, fayl, screenshot, hash dump — hamısı hazır əmrlər.
3. **Pivot:** daxili şəbəkə implant-dan implant-a zəncirlənir (kənar aləm ilə əlaqəsi olmayan daxili host-lar üçün).
4. **Trafik idarəsi:** gecikmə, jitter (vaxt təsadüfiləşdirilməsi — pattern yaratmamaq üçün), profil dəyişmə.
5. **Loqi̇stika:** əməliyyat qeydləri, output saxlanması — report üçün material.

Tarixi qeyd: C2 anlayışı botnet-lərdən gəlir (zərbə botnetwork idarəsi); red team dünyası bu arxitekturanı mənimsəyib professional göstəricilərlə təchiz edib. Müasir red team əməliyyatı C2-siz təsəvvür olunmur — "post-exploitation orchestration" platformasıdır.

**Sual 1**
C2-nin beş komponent/funksiyasını sadalayın.

**Sual 2.**
Listener nədir və harada dayanır?

**Sual 3.**
Jitter nə üçün lazımdır?

## Task 2 — Beacon: Uyğunlaşan İmplant

**Beacon** — ən populyar implant tipi (Cobalt Strike terminologiyası, amma konsept ümumidir). Fərqli köhnə "socket-shell"-dən: beacon **asinxron** işləyir.

Mexanizm: implant **sleep** edir → oyandır → C2-ə "nə əmr var?" deyə sorğulayır (check-in) → əmrləri alır → icra edir → nəticələri növbəti check-in-də qaytarır → yuxuya gedir. Ortalama rabitə "hər 60 saniyə" amma **jitter** ilə (60±20%) — dəqiq intervallı trafik anomalidir, təsadüfi olan normaldur.

Beacon-un üstünlükləri (real əməliyyat üçün):

- **Yavaş-gizli profil:** seyrək check-in = az trafik = az imza.
- **Davamlılıq:** bağlantı qopanda itmir — növbəti check-in-də davam.
- **Müxtəlif kanallar:** HTTP/S (ən çox), DNS (çıxışın çox məhdud olduğu şəbəkələrdə), SMB named pipes (daxili host-lar arasında — pivot), TCP bind.

**Pivot konsepti** dərinləşmə: hədəf şəbəkənin daxili host-u internetə çıxa bilmir. Həll: kənarla əlaqəsi olan host-dakı beacon "parent" olur, daxili host-lar ona SMB/TCP ilə qoşulur — trafik şəbəkədən xaricə "bir nöqtədən" görünür. Bu, AD lateral movement room-undakı portfwd konseptinin C2-səviyyəli təşkilidir.

**Beacon-lərin tipik imkanları** (C2-də hazır əmrlər): shell/əmr icrası, fayl yüklə/endir, screenshot, keyscan, hash dump (mimikatz inteqrasiyası), process listing/injection, socks proxy (daxili şəbəkəyə tunnel), token manipulyasiyası. Yəni bütün post-exploitation toolkit-i (əvvəlki room-lar) vahid agent-də.

Mühüm fərqləndirmə: **beacon ≠ malware payload.** Beacon idarə əlaqəsidir; hansısa zəifliklə düşən ilkin payload (örə. webshell, exploit nəticəsi) ayrıca olur. Adətən axın: ilkin giriş (exploit) → staging (beacon yüklə) → bütün sonrakı iş beacon-dan. (Müasir OPSEC-də staging azaldılır — beacon birbaşa exploit payload-u kimi gedir.)

**Sual 1**
Beacon-un işləmə tsikli necədir?

**Sual 2.**
SMB kanallı beacon pivot nə verir?

**Sual 3.**
"Beacon ≠ ilkin payload" fərqini izah edin.

## Task 3 — Framework Xəritəsi: Cobalt Strike, Sliver, Mythic

**Cobalt Strike** — sənaye standartı (commercial, ~$3.5K+/il user). Güclü tərəfləri: yetkin beacon (malleable C2 profilləri geniş ekosistem), team server (bir neçə operator bir əməliyyatda), stabillik. Zəif tərəfi: qiymət + **cracked versiyaların geniş yayılması** — bu, iki nəticə verib: (a) criminal akterlər də istifadə edir → EDR-lər CS beacon-larını agressiv imzalayır; (b) "CS trafiki = ya red team, ya ransomware" — monitoring üçün yaxşı hədəf.

**Sliver** (BishopFox, open source) — müasir open-source C2: multi-implant (Windows/Linux/Mac), mTLS/HTTP(S)/DNS kanalları, dinamik implant generasiyası (hər build unikal), wireguard əsaslı pivot. Red team təlimi və kiçik komandalar üçün ən populyar pulsuz seçim. "Cobalt Strike-ın open-source alternativi" rolunu daşıyır.

**Mythic** (its-a-feature, open source) — modul arxitekturası ilə fərqlənir: agent-lər (Apollo, Poseidon, Merlin...) pluggable, hər biri fərqli dil/OS; web interfeys; tasking API. Tədqiqat/multi-variant əməliyyatlar üçün çevik platforma.

**Digər adlar (qısa):** Metasploit (Meterpreter — C2 funksiyaları var, amma exploit framework mərkəzlidir; "pentest C2-si" kimi), Brute Ratel (controversial — "EDR-bypass mərkəzli" marketinqi ilə tanınır), Havoc (müasir open-source, modul yazımı asan), Empire/Starkiller (PowerShell ənənəsi).

Müqayisə ölçüsü (seçim üçün):

| Ölçü | Cobalt Strike | Sliver | Mythic |
|---|---|---|---|
| Model | Commercial | Open source | Open source |
| Agent-lər | Beacon (Windows mərkəzli) | Multi-OS (daxili) | Multi-agent (pluggable) |
| Güc | Ekosistem/profillər | Müasir/pulsuz | Arxitektura çevikliyi |
| İstifadəçi | Pro red teams | Təlim/orta komandalar | Tədqiqat/konkret agent ehtiyacı |

Təhsil yolu üçün tövsiyə: **Sliver və ya Havoc** — pulsuz, sənədləşdirilmiş, lab-da qurmaq asan; Cobalt Strike trial yoxdur (yalnız ticari) — onun konseptləri (malleable profile, team server) mətnlərdən öyrənilir.

**Sual 1**
Cobalt Strike-ın cracked versiyalarının yayılması hansı iki nəticə yaratdı?

**Sual 2.**
Sliver nə üçün təhsil üçün ideal seçimdir?

**Sual 3.**
Mythic-in fərqləndirici xüsusiyyəti nədir?

## Task 4 — C2 Aşkarlanması: Müdafiə Gözləri

C2 trafiki şəbəkədən keçir — müdafiə onu haradan görür?

**1. Trafik anomaliyası (NDR/NTA):**

- **Check-in pattern-i:** vaxt intervalı (jitter olsa da statistik davranış görünür), eyni host-un davamlı sorğu sayı.
- **JA3/JA3S (TLS imza):** client/server TLS handshake xüsusiyyətləri — "bu TLS client-i Go dilidir, amma user-agent Chrome deyir" kimi uyğunsuzluqlar.
- **Sertifikat/metadata:** self-signed, qısa ömürlü, nadir JA3 kombinasiyaları.

**2. Endpoint (EDR):**

- İmplant prosesləri: imzalar (CS beacon-ın məşhur imzaları var), davranış (sleep loop-lar, injeksiya pattern-ləri).
- İnjection/zərərli API istifadəsi (VirtualAlloc+WriteProcessMemory kombinasiyaları).
- Münasibət: cracked CS istifadə edən criminal lərə qarşı EDR-lər xüsusən hazırlaşdırılıb.

**3. Malleable profil"in məhdudiyyəti:** profil trafiki "leqala bənzədir", amma mükəmməl leqal deyil — kontent uzunluğu, cookie strukturu, caching davranışı kimi incə detallarda fərqlər qalır. Təcrübəli SOC analitiki "bu jQuery sorğusu qəribədir" deyə bilir.

**4. Threat intel:** bilinən C2 infrastructure (domain-lər, IP-lər, imzalar) — xüsusən cracked CS/əməliyyat alətlərinin infrastructure-ı paylaşılır (banking fraud ekosistemində olduğu kimi).

C2-dən yayınma sənəti (7.3 Evasion room-unun giriş mövzusu, burada yalnız qeyd): domain fronting-in bağlanmasından sonra trusted domain socdı, CDN-resourcing, cloud proxy chain-lər, infrastructure rotasiyası. Bu "infrastructure OPSEC" red team əməliyyatının yarısıdır — alət yalnız yarısı.

Balans qeydi (etik): C2 bilikləri həm hücum (red team), həm müdafiə (SOC) tərəfin eyni dərəcədə lazımdır — "C2 trafik necə görünür" sualı hər iki masada oturanların əsas sualıdır.

**Sual 1**
JA3 nədir və nəyi tutur?

**Sual 2.**
Malleable profil nə üçün "mükəmməl gizlilik" vermir?

**Sual 3.**
"Infrastructure OPSEC" nəyi əhatə edir?

## Task 5 — Lab Giriş və Module Yekunu

Praktik ilk addım (öz lab-ınızda — qanuni):

1. **Sliver qur:** release binary endir, `sliver-server` + `sliver-client` işə sal (lokal maşında — həm server, həm victim VM yanında).
2. **İmplant generasiya:** `generate --os windows --http [kali-IP]` — unikal exe yaranır.
3. **Listener:** `http` listener başlat.
4. **Victim VM-də icra:** implant — check-in edir, sessiya açılır (`sessions`).
5. **İnteraktiv:** `interactive [session]` → `shell`, `ls`, `screenshot` — bütün post-exploitation bir konsolda.
6. **Müşahidə:** Wireshark-da (victim və ya gateway-də) trafikə bax: HTTP check-in-lər, interval, jitter. **Müdafiə gözünün nə gördüyünü öz traffic-inizdə müşahidə et.**

Bu məşqin dəyəri: konseptləri (beacon, check-in, listener, session) canlı görmək + həm operator, həm analitik tərəfdən baxmaq. TryHackMe C2 room-ları (`C2 Introduction` və s.) eyni axını hazırlanmış mühitdə verir.

Module (7.2) yekunu — C2 düşüncə modeli:

- **Arxitektura:** operator → server → listener → implant.
- **Beacon:** asinxron, uyğunlaşan, çoxkanallı, pivot qabiliyyətli.
- **Ekosistem:** CS (standart, commercial), Sliver (open-source müasir), Mythic (modul) + digərləri.
- **Qarşıdurma:** EDR/NDR/threat intel — hər kanalın imzası var.

Növbəti (və path-in sonuncu texniki) module-u — **7.3 Evasion** — implant-ların və əməliyyatların AV/EDR-dən yayınma tərəfinə baxır: signature əsaslı aşkarlamanın prinsipi, obfuscation, amma hücum müdafiə qarşıdurmasının etik sərhədləri. C2 room-un "infrastructure OPSEC" qeydi orada tam açılır.

**Sual 1**
İlk Sliver lab-ında hansı ardıcıllıq var?

**Sual 2.**
Wireshark müşahidəsi nə öyrədir?

**Sual 3.**
C2-nin "qarşıdurma" tərəfi kimdir?
