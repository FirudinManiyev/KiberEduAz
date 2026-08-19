# Room: Web Tətbiq Arxitekturası Əsasları

**Path:** Web Application Hacking
**Module:** Web Fundamentals
**Çətinlik:** Beginner
**Təxmini vaxt:** 1 saat

## Room haqqında

Zəifliyi anlamaq üçün əvvəlcə onun "harada yaşadığını" anlamaq lazımdır. Bu room-da müasir web tətbiqinin arxitekturasını — frontend/backend/database ayrımını, client-server modelini, API-lərin rolunu və tipik 3-qatlı (3-tier) strukturu öyrənəcəksiniz. Bu anlayışlar sonrakı OWASP room-larında hər zəifliyin "hansı qatda" baş verdiyini görməyə kömək edəcək.

## Öyrənmə nəticələri

- Frontend, backend və database qatlarının rol və məsuliyyətlərini ayırd etmək
- Client-server modelində məlumat axınını izləmək
- API anlayışını və REST-in əsas prinsiplərini izah etmək
- 3-tier arxitekturanı reallıqda tanımaq və hər qatın hücum səthini müəyyən etmək

## Task 1 — Frontend və Backend: İki Dünya

Hər web tətbiqi iki əsas dünyaya bölünür:

**Frontend (client-side)** — browser-də icra olunan hissə: HTML (struktur), CSS (görünüş), JavaScript (davranış). Bu kod istifadəçinin maşınına göndərilir və orada işləyir — yəni **istifadəçi ona tam nəzarət edir**. DevTools açıb JavaScript-i oxumaq, dəyişmək, breakpoint qoymaq istənilən kimsə üçün açıqdır.

**Backend (server-side)** — server-də icra olunan hissə: PHP, Python (Django/Flask), Node.js, Java və s. Source code istifadəçiyə göndərilmir — yalnız icranın nəticəsi (HTML cavabı) görünür. Auth yoxlamaları, business logic, database sorğuları burada yaşayır.

Bu ayrımın pentest üçün kritik nəticələri var:

1. **Client-side yoxlamalar yalnız "rəftar"dır, "qayda" deyil.** Form-da JavaScript ilə "yalnız .jpg fayl seç" yoxlaması backend-də təkrarlanmalır. Yoxsa JS-i söndürüb (və ya request-i Burp ilə dəyişib) bypass olunur. Bu, file upload zəifliyinin kök səbəbidir.
2. **Frontend-dən görünən hər şey intelligence-dır.** JavaScript fayllarında (xüsusən source map-lərdə) gizli endpoint-lər, API açarları, daxili URL-lər qala bilər.
3. **Hiddən form field-ləri və client-side "rollar".** `<input type="hidden" name="price" value="100">` — server bunu etibarlı qəbul edirsə, price manipulyasiya olunur.

Məlumat axını belədir: browser (frontend) HTTP sorğu göndərir → backend onu qəbul edir, işləyir (yoxlamalar, logic) → lazım olanda database-ə müraciət edir → nəticəni HTML/JSON kimi qaytarır → frontend onu göstərir.

Zəifliklərin yeri bu axında müəyyən qatlarla bağlıdır:

| Zəiflik | Qat | Səbəb |
|---|---|---|
| XSS | Frontend + backend | Backend, istifadəçi input-unu təmizləmədən səhifəyə qaytarır |
| SQL Injection | Backend → DB | Input SQL sorğusuna birbaşa qatılır |
| IDOR | Backend | Access control yoxlanmır |
| DOM XSS | Yalnız frontend | JavaScript input-u təhlükəli şəkildə işləyir |

Frontend-i müşahidə etmək üçün əsas alət browser-in özüdür: DevTools → Elements (DOM), Sources (JS faylları), Console. Amma unutmayın: gördüyünüz DOM server-in göndərdiyi + JavaScript-in yaratdığı kombinasiyadır.

**Sual 1**
Frontend və backend kodunun "harada" icra olunduğunu və bunun nəticələrini izah edin.

**Sual 2**
"Client-side yoxlama qayda deyil, rəftardır" ifadəsinin mənası nədir?

**Sual 3**
XSS və SQL Injection hansı qatlarda baş verir?

## Task 2 — Client-Server Modeli və İstəyən Etibarsızdır

Bütün web əsasən bir modelin üstündə durur: **client sorğu göndərir, server cavab verir.** Sadə görünən bu modelin təhlükəsizlik tərəfi çox dərindir.

Əsas prinsip: **server-ə gələn hər sorğu istənilən mənbədən, istənilən məzmunla gələ bilər.** Browser sizin "gözəl form-unuzdan" sorğu göndərir — amma server üçün fərq yoxdur: eyni sorğu curl ilə, Python scripti ilə, Burp Repeater ilə, digər ölkədən gələ bilər. Server yalnız aldığı baytları görür.

Bunun üç təcəlli:

1. **Form validation-ın server tərəfdə olması məcburidir.** Browser "required" attribute-u, maxlength, pattern — bunların hamısı istənilən attacker üçün bir dəqiqəlik maneədir.
2. **Gözlənilməyən input formaları.** Backend `id` parametrini `1,2,3` gözləyir — attacker `' OR 1=1--` göndərir. Hər input sahəsi (URL parametrləri, header-lər, cookie-lər, JSON body, fayl adları) potensial hücum nöqtəsidir.
3. **İstənilən sorğu ardıcıllığı mümkündür.** Normal istifadəçi əvvəl səhifəni açır, sonra "buy" düyməsini vurur. Attacker birbaşa "buy" endpoint-inə birbaşa POST ata bilər — aradakı addımlarsız. Server-in öz state-ini və logic-ini özü qorumalıdır.

Bu prinsip OWASP-un bütün siyahılarının arxasındaki düşünən qüvvədir: SQLi, XSS, IDOR, CSRF — hamısı "server client-a (yaxud client-in göndərdiyinə) lazımi dərəcədə şübhə ilə yanaşmadı" nəticəsidir.

Hücum tərəfdən baxanda isə bu model azadlıq deməkdir: professional pentester browser-in imkanları ilə məhdudlaşmır. Sorğular Burp Suite ilə tutulur, dəyişdirilir, təkrarlanır; cavablar analiz olunur. "Normal istifadəçi axını" yox, "server-in necə davrandığı" əsasdır.

Bir əlavə məqam: modern tətbiqlərdə client həmişə browser olmur — mobil tətbiq, başqa server, IoT cihazı da client ola bilər. Amma onların hamısı eyni HTTP qaydaları ilə danışır və eyni qədər "etibarsız"dır.

**Sual 1**
"Server üçün client-in kimliyi/kodu önəmsizdir" nə deməkdir — nümunə ilə izah edin.

**Sual 2**
Hansı input nöqtələri (form-dan başqa) hücum səthi sayılır?

**Sual 3**
"İstənilən sorğu ardıcıllığı mümkündür" müddəasını bir nümunə ilə izah edin.

## Task 3 — API-lər: Tətbiqlərin Danışıq Dili

API (Application Programming Interface) — proqramların bir-biri ilə danışdığı müqavilədir. Web-də ən çox **REST API**-lərə rast gəlinir: HTTP metodları + URL yolları ilə resurslara çıxış.

REST-in mahiyyəti — resurs-yönümlü dizayn:

```http
GET    /api/users        → bütün istifadəçiləri oxu
GET    /api/users/5      → 5 nömrəli istifadəçini oxu
POST   /api/users        → yeni istifadəçi yarat
PUT    /api/users/5      → 5-i yenilə
DELETE /api/users/5      → 5-i sil
```

Cavablar adətən **JSON** formatında gəlir:

```json
{"id": 5, "username": "ali", "email": "ali@example.com", "role": "user"}
```

Müasir tətbiqlərdə frontend artıq "səhifə" deyil, JavaScript tətbiqidir (SPA — Single Page Application) ki, o da API-yə sorğu ataraq məlumat çəkir. Nəticədə web-də iki üslub var:

- **Traditional (server-rendered):** server tam HTML qaytarır. Form-lar POST ilə gedir.
- **SPA + API:** server JSON qaytarır, HTML-i browser-də JS qurur.

Pentest baxımından API-lərin gətirdiyi xüsusiyyətlər:

1. **Daha çox görünməz səth.** Səhifədə görünməyən endpoint-lər olur (məs. `/api/internal/users`) — JS fayllarını oxumaqla, və ya `/api` üzərində fuzzing-lə tapılır.
2. **IDOR API-larda daha aydın görünür.** `GET /api/users/5` → `GET /api/users/6` dəyişmək kifayətdir. Rəqəmlər ardıcıldırsa, enumeration da asandır.
3. **Mass assignment.** `PUT /api/users/5` sorğusuna `"role": "admin"` əlavə etmək — backend gözlənilməz sahələri qəbul edirsə, imtiyaz yüksəlişi alınır.
4. **Auth mexanizmləri.** Klassik cookie əvəzinə `Authorization: Bearer <token>` header-i (JWT) istifadə olunur — token-in saxlanması, imzası, vaxtı ayrıca test mövzusudur.
5. **Sənədləşmə sızması.** `/swagger.json`, `/openapi.json`, `/graphql` kimi sənəd endpoint-ləri açıq qalıbsa, bütün API xəritəsi ələ keçir.

API testində də əsas alətlər eynidir: Burp Suite (tutulan JSON sorğularını Repeater-də dəyişmək) və curl (sürətli sınaqlar). Fərq yalnız formatdadir — form-encoded əvəzinə JSON body, HTML əvəzinə JSON cavab.

**Sual 1**
REST API-də metod + yol kombinasiyası necə məna daşıyır — nümunə ilə göstərin.

**Sual 2**
SPA + API arxitekturası pentest səthini necə dəyişir?

**Sual 3**
Mass assignment zəifliyi nədir?

## Task 4 — 3-Qatlı Arxitektura və Hər Qatın Hücum Səthi

Klassik web tətbiqi üç qatdan (tier) ibarətdir:

```
[Browser] ⇄ [Web Server + App] ⇄ [Database]
 frontend        backend              storage
```

**1-ci qat — Presentation (frontend):** browser-də HTML/CSS/JS. Hücum səthi: XSS (burada "partlayış" baş verir), DOM manipulation, client-side həssas məlumat (token-lərin localStorage-da saxlanması), source map/JS-də bilgi sızması.

**2-ci qat — Application (backend):** web server (Nginx/Apache) + tətbiq kodu (PHP/Python/Node). Hücum səthi: bütün OWASP ailəsi — SQLi (burada qurulur), auth xətaları, business logic, fayl yükləmə, RCE. Həmçinin web server-in öz versiya zəiflikləri.

**3-cü qat — Data (database):** MySQL, PostgreSQL, MSSQL, MongoDB. Adətən birbaşa şəbəkədən çatılmır (yalnız backend-dən). Amma SQLi vasitəsilə "içəridən" sorğulana bilir: version oxuma (`SELECT version()`), məlumat oğurluğu, bəzi hallarda fayl yazma/oxuma (RCE-yə körpü).

Bu modelin pentest üçün dəyəri — **zəifliyin təsirini qatlarla düşünməkdir.** Məsələn:

- XSS → frontend qatında icra olunur, amma təsiri istifadəçinin sessiyasına (2-ci qatın auth-una) gedir.
- SQLi → 2-ci qatdan 3-cü qata sızmadır; məlumat oğurluğu (3-cü qat) və ya RCE (2-ci qata qayıtma) nəticə verir.
- SSRF → backend-i "forvetçi"yə çevirir: daxili şəbəkəyə (normalda çatılmayan 2-ci/3-cü qat qonşularına) sorğu göndərir.

Real dünya deployment-larında bu qatlar ayrı-ayrı server-lərdə də yaşaya bilər: load balancer → web server-lər → app server-lər → DB cluster. Daxili şəbəkədə admin panel-lər, cache-lər (Redis/Memcached), message queue-lar olur — bunlara birbaşa çıxış yoxdur, amma SSRF/RCE kimi zəifliklər "içəri bilet" verir.

Hər qatın öz klassik konfiqurasiya xətaları da var: frontend-də source map-lərin production-da qalması, backend-də debug rejimin açıq olması, database-də default credential-lar (root:boş) və "yalnız localhost"un yanlış başa düşülməsi. Enumeration zamanı toplanan texnologiya xəritəsi (whatweb, header-lər) məhz bu qatları tanımağa xidmət edir.

Bu module-u yekunlaşdıranda: yaxşı tətbiq arxitekturası hər qatda "öz işini, yalnız öz işini" görür — frontend yalnız göstərir, backend qərar verir, database yalnız saxlayır. Zəifliklərin böyük hissəsi bu sərhədlərin bulanıqlaşdığı yerlərdə (client-a etibar etmək, DB-yə raw input ötürmək) yaranır.

**Sual 1**
3-tier arxitekturanın qatlarını və onların əsas vəzifələrini sadalayın.

**Sual 2**
SQLi-ni qatlar baxımından necə təsvir edərdiniz?

**Sual 3**
Frontend-də production-da qalan source map faylları hansı risk yaradır?
