# Room: Burp Suite Əsasları

**Path:** Web Application Hacking
**Module:** Web Exploitation Alətləri
**Çətinlik:** Easy
**Təxmini vaxt:** 2 saat

## Room haqqında

Burp Suite — web pentest-in "iş masası"dır: bütün HTTP trafikini tutmaq, dəyişmək, təkrarlamaq və avtomatlaşdırmaq imkanı verir. Əvvəlki room-larda gördüyümüz bütün manual testlər (SQLi, XSS, IDOR, CSRF sınaqları) Burp olmadan ağlagəlməz dərəcədə məhsulsuz olardı. Bu room-da Burp-un interfeysini, Proxy tab-ını, Intercept mexanizmini və Repeater-in sadə istifadəsini öyrənəcəksiniz.

## Öyrənmə nəticələri

- Burp Suite-in interfeys və modul strukturunu tanımaq
- Proxy + browser konfiqurasiyası ilə trafiyi tutmağı tətbiq etmək
- Intercept mexanizmi ilə sorğuları saxlamaq və dəyişməyi bacarmaq
- Repeater ilə sorğu təkrarı və analiz aparmağı öyrənmək

## Task 1 — Burp Nədir və Niyə Mərkəzi Alətdir

Browser-in DevTools-u trafiki göstərir, amma müdaxilə etməkdə məhduddur. Burp Suite isə **proxy** kimi dayanır: browser ↔ Burp ↔ server. Bütün sorğular Burp-dan keçir — deməli, onları görmək, saxlamaq, dəyişmək, təkrarlamaq, avtomatik sınaqdan keçirmək olar.

Burp Suite PortSwigger-in (OWASP Top 10-in yaradıcılarının şirkəti) məhsuludur. Community (pulsuz), Professional (pullu — scanner ilə), Enterprise versiyaları var. Öyrənmək üçün Community tam kifayətdir; Kali-də ön-quruludur.

Əsas modullar (tab-lar):

| Modul | Vəzifə |
|---|---|
| **Proxy** | Trafiki tutmaq, intercept, forward/drop |
| **Repeater** | Sorğunu əl ilə təkrarla və dəyiş |
| **Intruder** | Avtomatik payload yerləşdirmə (fuzzing/brute-force) |
| **Decoder** | Encode/decode (URL, Base64, hex...) |
| **Comparer** | İki cavabı müqayisə et |
| **Sequencer** | Token randomness analizi (sessiya token-ləri) |
| **Dashboard/Scanner** | Avtomatik zəiflik skanı (Pro) |

Niylər bu qədər mərkəzi? Çünki əvvəlki room-lardakı hər test növü Burp-un təbəqəsində işləyir:

- SQLi testi → sorğudakı parametri Repeater-də dəyişmək
- XSS kontekst analizi → cavabda input-un harada göründüyünü oxumaq
- IDOR → ID-ləri tək-tək dəyişmək (və ya Intruder ilə seriya)
- CSRF token yoxlaması → token-i silib Repeater-də göndərmək
- Authorization testi → eyni sorğunu başqa sessiya cookie ilə göndərmək

Bütün bu hərəkətlərin ümumi adı — **request manipulyasiyası**, və web pentest-in 90%-i məhz budur. Browser yalnız "normal axını" göstərir; Burp isə sizə server-in gerçek davranışını göstərir.

**Sual 1**
Burp Suite proxy kimi hansı mövqedə dayanır?

**Sual 2.**
Repeater və Intruder arasındakı fərq nədir?

**Sual 3.**
Niyə browser-in DevTools-u Burp-u əvəz edə bilmir?

## Task 2 — Proxy Tab və Browser Konfiqurasiyası

Proxy tab — Burp-un ürəyidir. Strukturu:

- **Intercept is on/off:** açıq olanda hər sorğu Burp-da "donur" — siz baxıb dəyişib göndərirsiz.
- **HTTP History:** keçən bütün sorğu/cavabların xronologiyası — ən çox istifadə olunan hissə. Hər sətirdə: vaxt, metod, URL, status, ölçü.
- **Forward/Drop:** donmuş sorğunu buraxmaq/atmaq.
- **Intercept üçün şərtlər (condition):** "yalnız /api/ olanları saxla" kimi filtr — əks halda hər statik fayl donub işi məhv edir.

Quraşdırma addımları (Kali + Firefox):

1. Burp-u başladın (Kali-də: `burpsuite`).
2. Browser-i proxy-yə yönəlt: Firefox Settings → Network Settings → Manual: `127.0.0.1:8080` (proxy listener Burp-da default bu portdadır: Proxy → Options → Listener).
3. Burp-un CA sertifikatını browser-ə quraşdırın (http://burp ünvanından endirilir) — HTTPS saytlar xəbərdarlıq verməsin deyə. **Diqqət:** bu sertifikat yalnız test browser-ində olmalıdır; gündəlik browser-inizə qoşmayın (TLS-aşma riski).

Tarixçə ilə iş vərdişləri:

- Hər sətri seçib **Request/Response panellərində** oxuyun: header-lər, parametrlər, cookie-lər, cavab məzmunu.
- **Filtr-lər:** şəkil/CSS sorğularını gizlətmək (yalnız HTML/API qalsın) — səs-küyü azaldır.
- **"Send to Repeater/Intruder/Decoder"** — sağ klik kontekst menyu: HTTP History-dən bir kliklə hər hansı sorğunu digər modula göndərmək. Əsas iş axını budur: tarixçədə tap → analiz üçün Repeater-ə at.

Hansı sorğular maraq doğurur? URL-də parametr daşıyanlar (`?id=`), POST body-ə saiblər, cookie-ləri dəyişənlər (login/auth), JSON API çağırışları. Bunlar — "canlı" input nöqtələri, yəni gələcək testlərin hədəfləridir.

İntercept-in gündəlik istifadə qaydası: əksər vaxt **Intercept off, HTTP History işlədir** (tutub saxlamadan sadəcə qeydə almaq). Intercept yalnız dəyişmək istədiyiniz anda açılır — məsələn, form submit-i göndərməzdən əvvəl.

**Sual 1**
CA sertifikatını test browser-inə qurmaq nə üçün lazımdır və hansı qayda ilə?

**Sual 2.**
Gündəlik işdə Intercept və HTTP History necə birgə istifadə olunur?

**Sual 3.**
HTTP History-də hansı sorğular "canlı" test hədəfi sayılır?

## Task 3 — Intercept: Sorğunu Saxlamaq və Dəyişmək

İndi əsas gücdən istifadə edək: **canlı sorğunu yolda saxlayıb dəyişmək.**

Praktik ssenari — hidden field dəyişməsi:

1. Intercept-i açın (Proxy → Intercept → "Intercept is on").
2. Browser-də form-u submit edin (məs. sifariş formu).
3. Sorğu Burp-da donur. Panel-də görünür:

```http
POST /checkout HTTP/1.1
Host: shop.local
Cookie: session=abc123
Content-Type: application/x-www-form-urlencoded

product=42&price=100&quantity=1&user_id=1024
```

4. **Price=100 → price=1** yazın (mətn redaktor kimi birbaşa dəyişdirilir).
5. Forward — sorğu server-ə bu şəkildə gedir.
6. Cavab: sifariş 1 AZN ilə qeydə alındısa — server client-a etibar edir deməkdir (business logic tapıntısı).

Bu texnikanın nümayə etdirdiyi prinsip — arxitektura room-undan: **client-ın göndərdiyi hər şey dəyişdirilə bilər.** JS ilə hesablanan qiymət, hidden sahə, disabled input, cookie, header — Intercept hamsının "dəyişəbilən mətn" olduğunu sübut edir.

Tipik intercept hədəfləri:

- **Hidden form field-lər** (`<input type="hidden" name="discount">`)
- **Disabled sahələr** (UI-da deaktiv, amma sorğuda gedən)
- **Client-side hesablamalar** (JS-in hesabladığı məbləğ)
- **Parameter əlavəsi/silməsi** (role=admin əlavə etmək)
- **Cookie manipulyasiyası** (başqa istifadəçinin cookie-si ilə sınaq)
- **Header dəyişmə** (User-Agent, Referer, X-Forwarded-For bypassları)

Intercept ilə işləyərkən praktik məsləhətlər:

- Brauzer "donmuş" görünəcək — panik etməyin, sorğu Burp-dadır.
- Şəkil/CSS sorğuları da donursa — Intercept condition qurun və ya Forward ilə keçirin.
- Dəyişikliyi etdikdən sonra sorğunun tam oxunaqlı olduğunu yoxlayın (məzmun uzunluğu Content-Length — Burp adətən avtomatik yeniləyir).

Bu vərdişin psixoloji tərəfi: Intercept istifadəçiyə "form-da nə yazılıbsa o gedir" illüziyasını dağıdır. Form — yalnız client tərəfli qabdır; server isə sadəcə baytları görür. Bunu bir dəfə öz gözlərinizlə görmək — min dəfə oxumaqdan yaxşıdır.

**Sual 1**
Intercept mexanizmi necə işləyir — addım-addım təsvir edin.

**Sual 2.**
Hidden field və disabled sahələrin manipulyasiyası nəyi sübut edir?

**Sual 3.**
Intercept işləyərkən browser "donur" — bu normaldır və nə edilməlidir?

## Task 4 — Repeater: Təkrar, Dəyiş, Müqayisə et

Repeater — Burp-un ən çox istifadə olunan moduludur (Interceptor-dan sonra). Vəzifəsi: **bir sorğunu saxlayıb istədiyiniz qədər dəyişə-dəyişə təkrar göndərmək.**

İş axını:

1. HTTP History-də maraqlı sorğunu tapın (məs. `GET /product?id=5`).
2. Sağ klik → **Send to Repeater** (və ya Ctrl+R).
3. Repeater tab-a keçin: sol panel = sorğu (redaktə olunur), sağ panel = cavab.
4. Sorğuda dəyişiklik edin: `id=5'` (SQLi sınağı).
5. **Send** (və ya Ctrl+R daxilində Go) → cavab sağ panelə gəlir.
6. Dəyiş → Send → bax → dəyiş → Send... istədiyiniz qədər.

Niyə bu qədər güclüdür? Çünki zəiflik testi təkrarlanan sorğular deməkdir: bir parametri onlarca variantla sınamaq (`'`, `"`, `OR 1=1`, `<script>`, `../`...). Browser ilə bunu etmək — hər dəfə səhifəni yenidən doldurmaq, formu doldurmaq, CSRF-i keçmək... Repeater-da isə bütün kontekst (cookie, header) saxlanılır, yalnız hədəf parametr dəyişir.

Repeater-in köməkçi imkanları:

- **Request/Response tab-ları:** raw görünüş, header-lər, HTML render (Render tab — cavabı browser kimi göstərir).
- **Müqayisə:** ardıcıl göndərilən sorğuların cavablarını yan-yana müqayisə (IDOR-dan cavab fərqlərini görmək üçün).
- **Inspector:** sorğunun struktur hissələrini (parametrlər, cookie) ayrıca göstərən panel.
- **Sorğu tarixçəsi:** hər Send bir nömrə alır — 1, 2, 3... hansı cavabın hansı sorğuya aid olduğını izləmək asandır.

Repeater ilə praktik məşqlər (öz lab-ınızda):

- SQLi room-undan: `id=5` → `id=5'` → xəta? → `id=5 AND 1=1` / `AND 1=2` → fərq?
- IDOR room-undan: `user_id=1024` → `user_id=1025` → cavabda kimin datası?
- XSS room-undan: `q=test` → `q=<x>` → cavabda `<x>` harada, necə görünür (kontekst)?
- Auth room-undan: login sorğusunu saxlayıb parolları serial şəklində göndərmək (rate limit müşahidəsi ilə).

Bir vacib peşəkar vərdiş: **testlərinizi nömrələnmiş tarixçədə izləyin** — hansı sorğunun hansı cavabı verdiyi sonra hesabat üçün sübut mənbəyidir. Repeater-da görülən hər maraqlı nəticə screenshot/script kimi qeyd edilir.

**Sual 1**
Repeater nə üçün "ən çox istifadə olunan" moduldur?

**Sual 2.**
Repeater ilə IDOR testi necə aparılır — konkret addımlarla?

**Sual 3.**
Sorğu nömrələri (1, 2, 3...) nəyə xidmət edir?

## Task 5 — Intruder, Decoder və Digər Modullara Qısa Baxış

Əsas ikili (Proxy + Repeater) ilə tanış olduqdan sonra qalan modullara nəzər yetirək — hər biri konkret problemi həll edir.

**Intruder** — Repeater-in avtomatlaşdırılmış versiyası: sorğuda pozisiya(lar) müəyyən edilir (`§param§`), payload siyahısı verilir, Burp hər payload üçün sorğunu göndərib nəticələri cədvəldə göstərir. İstifadə yerləri:

- IDOR enumeration (`user_id=§1025§` → 1000-1100 seriyası) — cavab status/ölçü fərqləri ilə valid obyektlər görünür.
- Parameter fuzzing (`?id=§payload§` → SQLi/XSS wordlist-i) — amma diqqət: agressivdir, rate-limit/lab şəraitində.
- Kiçik brute-force-lar (token, PIN).

Intruder-in 4 hücum modu var: Sniper (bir pozisiya, siyahı), Battering ram (hamısı eyni payload), Pitchfork (paralel siyahılar — user+pass), Cluster bomb (kartezian — bütün kombinasiyalar). Community versiyasında rate limit yoxdur, amma scanner kimi Pro funksiyalar məhduddur.

**Decoder** — tez-tez lazım olan çevirici: URL-encode/decode, Base64, HTML entity, hex. Məsələn: cookie `YWRtaW46MTIz` (Base64) → `admin:123`. Smart decode bir neçə təbəqəni avtomatik açır.

**Comparer** — iki sorğu/cavabı yan-yana qoyur, fərqləri vurğulayır. İstifadə: "admin ilə user cavabı nə ilə fərqlənir?", "AND 1=1 ilə AND 1=2 cavabları fərqlidirmi?" — blind zəifliklərdə fərqin tapılması üçün.

**Sequencer** — token-lərin (sessiya ID, CSRF token) təsadüfilik analizi: entropiya, bit-level statistika. "Sessiya token-i proqnozlaşdırıla bilərmi?" sualına cavab verir (auth room-una bağlı).

**Extensions (BApp Store)** — Burp-u genişləndirən plaginlər: Autorize (avtomatik auth testləri — IDOR üçün), Turbo Intruder, JWT editor,.logger++ və s. Yaxşı konfiqurasiya edilmiş extension dəsti Burp-u şəxsiləşdirilmiş "pentest platforması"na çevirir.

Module yekunu — alət fəlsəfəsi: **Burp sizin üçün düşünmür, sizin üçün "əllər" olur.** Avtomatik skan (növbəti room-un mövzusu — ZAP və Burp Scanner) sürətli səth örtüyü verir, amma zəifliyin mənasını, kontekstini və istismarını anlamaq Repeater-dəki insan gözünə qalır. Ən yaxşı nəticə — hər ikisinin kombinasiyası: skan genişlənmiş səthi göstərir, insan dərinə gedir.

**Sual 1**
Intruder-in Pitchfork və Cluster bomb modlarının fərqi nədir?

**Sual 2.**
Decoder hansı gündəlik situasiyalarda işə düşür?

**Sual 3.**
Autorize extension nə üçün faydalıdır?
