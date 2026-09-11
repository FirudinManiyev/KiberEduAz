# KiberEduAz

KiberEduAz məktəb və kolleclərdə İT və kibertəhlükəsizlik təlimlərinin təşkili, izlənməsi və praktiki formada öyrənilməsi üçün hazırlanan təhsil platformasıdır.

Platforma **“oxu → analiz et → cavablandır → yoxla → xal qazan”** modeli üzərində qurulur. Məqsəd nəzəriyyə və praktikanı ayrı bölmələrə parçalamadan, TryHackMe və Hack The Box yanaşmalarından ilhamlanan, yerli auditoriyaya uyğun təhlükəsiz öyrənmə təcrübəsi yaratmaqdır.

## Repozitoriya quruluşu

```text
KiberEduAz/
├── frontend/   # Next.js 16 tətbiqi (App Router, React 19, Tailwind 4)
├── backend/    # NestJS API (Prisma + Supabase Postgres + Supabase Auth)
├── docs/       # Hesabatlar, qərar sənədləri, audit materialları (docs/audits/)
└── scripts/    # Deploy-dan sonra işlədilən yoxlama skriptləri
```

## Branch modeli

| Branch | Rolu |
|---|---|
| `main` | Yeganə əsas branch. Render (`render.yaml` → `branch: main`) və Vercel bundan deploy edir. Birbaşa push **olunmur**. |
| `feature/*`, `fix/*`, `security/*` | Bütün iş bunlarda gedir və `main`-ə **Pull Request** ilə birləşir. |

Niyə PR məcburidir: Render hər commit-də avtomatik deploy edir, amma migration-ları işlətmir (bax "Prisma migration-ları haqqında"). Yeni sütun tələb edən kod migration-dan əvvəl deploy olunsa API bütün sorğularda 500 qaytarır. PR bu iki addımın sırasını qorumaq üçün nəzarət nöqtəsidir: **əvvəl migration, sonra merge.**

Köhnə `backend` və `frontend` branch-ları tarixi qalıqdır — hər ikisi bütün monorepo-nu saxlayırdı və heç nəyi ayırmırdı. `frontend` `main`-in içində tam mövcud olduğu üçün silinib; `backend` GitHub-da default branch `main` edildikdən və Render `main`-ə keçirildikdən sonra silinməlidir.

## MVP-də nələr var?

- Supabase Auth ilə qeydiyyat, giriş və rol əsaslı icazə (`STUDENT`, `TEACHER`, `ADMIN`)
- `Path → Module → Room → Task → Question` iyerarxiyası üçün tam API
- Server tərəfdə cavab yoxlaması — düzgün cavab heç vaxt brauzerə göndərilmir
- Daimi progress: task/room tamamlanması, xal jurnalı, gündəlik seriya (streak)
- Sinif, təşkilat və qlobal reytinq cədvəli
- Bildiriş mərkəzi və profil redaktəsi
- Red Team, Blue Team və GRC istiqamətlərində yeddi hazır Room
- İki hesabla sinxron API Room-u və `frontend/src/data/` materiallarından qurulan beş cihaz-lokal Markdown Room-u
- Cədvəl, kod nümunəsi, sual və task axınını qoruyan interaktiv dərs player-i
- Üç istiqamətli roadmap, axtarışlı Azərbaycanca FAQ və bütün ekranlarda əlçatan hesabdan çıxış
- Kontekstə uyğun foto/illüstrasiyalar və mobil cihazlarda aşağı-yüklü responsive WebGL fon
- Mobil, planşet və masaüstü üçün 320 px-dən başlayan responsive dizayn

## Texnologiyalar

| Sahə | Seçim |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Lucide, OGL/WebGL |
| Backend | NestJS 11, TypeScript, Prisma 6, `jose` (JWT), Helmet, Throttler |
| Verilənlər bazası | Supabase Postgres 17 (layihə ref: `okyhjpywngmportlzmxo`, region `ap-southeast-2`) |
| Autentifikasiya | Supabase Auth — frontend sessiyanı cookie-də saxlayır, backend JWT-ni JWKS ilə yoxlayır |

## Lokal işə salma

Ön şərtlər: Node.js 20+ və Supabase layihəsinə giriş.

### 1. Verilənlər bazası parolunu götür

Sxem Supabase layihəsinə artıq tətbiq edilib. Bağlantı sətirləri üçün parol lazımdır:

**Dashboard → Project Settings → Database → Connection string**. Parolu bilmirsənsə, həmin səhifədən `Reset database password` ilə yenisini yarat.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env          # PowerShell: Copy-Item .env.example .env
```

`.env` faylında `DATABASE_URL` və `DIRECT_URL` sətirlərindəki `PASSWORD` hissəsini əsl parolla əvəz et. `SUPABASE_SECRET_KEY` yalnız admin əməliyyatları üçün lazımdır (Dashboard → Project Settings → API Keys).

```bash
npm run prisma:generate
npm run seed                  # mövcud iki Room-un məzmununu bazaya yükləyir
npm run dev                   # http://localhost:4000/api/v1
```

Sağlamlıq yoxlaması: `curl http://localhost:4000/api/v1/health`

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local    # PowerShell: Copy-Item .env.example .env.local
npm run dev                   # http://localhost:3000
```

`.env.example` içindəki dəyərlər (Supabase URL və publishable key) real və açıq paylaşıla biləndir, ona görə əlavə dəyişiklik tələb olunmur.

Frontend keyfiyyət yoxlamaları:

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

Yeni statik dərslərin progress-i `kibereduaz:room-progress:v1` açarı ilə brauzerdə saxlanılır və UI-də “Bu cihazda saxlanılır” kimi işarələnir. `intro-to-pentesting` və `grc-foundations` Room-ları əvvəlki kimi backend hesabı ilə sinxron işləyir.

### 4. İlk istifadəçi

`/register` səhifəsindən qeydiyyatdan keç. Backend ilk girişdə avtomatik olaraq `profiles` sətiri və `user_stats` yaradır; rol `STUDENT` olur.

Özünü admin etmək üçün SQL Editor-də:

```sql
update public.profiles set role = 'ADMIN' where email = 'sənin@email.az';
```

## Backend API

Bütün route-lar `/api/v1` prefiksi altındadır. `Authorization: Bearer <supabase_access_token>` başlığı tələb olunur (`/health` istisna).

| Metod | Route | Təyinat |
|---|---|---|
| `GET` | `/paths` | Tam məzmun ağacı + istifadəçi progresi |
| `POST` `PATCH` `DELETE` | `/paths`, `/modules` | Məzmun idarəetməsi (müəllim/admin) |
| `GET` | `/rooms` | Room kataloqu |
| `GET` | `/rooms/:slug` | Room detalları (cavablar gizlədilir) |
| `GET` | `/rooms/:id/edit` | Redaktə görünüşü, cavablarla (müəllim/admin) |
| `POST` | `/progress/questions/:questionId/answer` | Cavabı yoxlayır və xal verir |
| `GET` | `/progress/summary` | Xal, rütbə, seriya, tamamlanma |
| `GET` | `/leaderboard` | Sinif → təşkilat → qlobal reytinq |
| `GET` `PATCH` | `/profiles/me` | Profil |
| `GET` | `/notifications` | Bildirişlər və oxunmamış sayı |

## Verilənlər bazası

Sxem `backend/prisma/migrations/` altındadır və Supabase-ə artıq tətbiq edilib. Prisma modelləri `backend/prisma/schema.prisma` faylında eyni strukturu əks etdirir.

Bütün KiberEduAz cədvəllərində RLS aktivdir və heç bir policy yoxdur — yəni `anon`/`authenticated` açarları ilə birbaşa oxumaq mümkün deyil. Bütün giriş NestJS API-dan keçir; API baza sahibi kimi qoşulduğu üçün RLS-i keçir.

`backend/prisma/manual/` qovluğunda iki köməkçi skript var:

- `seed_content.sql` — Room məzmununu Dashboard-dan birbaşa yükləmək üçün (`npm run seed` alternativi)
- `drop_legacy_tables.sql` — layihədə qalmış köhnə turizm cədvəllərini silmək üçün

### ⚠️ Köhnə cədvəllər

Supabase layihəsi əvvəlki turizm layihəsindən 7 cədvəl saxlayır: `User`, `TouristProfile`, `EntrepreneurProfile`, `Place`, `Booking`, `Review`, `CoinTransaction`. Hamısı boşdur. `20260911000200_rls_legacy_tables` migration-ı onlarda RLS-i yandırıb `anon`/`authenticated` icazələrini geri alır, yəni tətbiq olunandan sonra publishable açarla oxunmurlar. KiberEduAz onlardan istifadə etmir; backup götürdükdən sonra `drop_legacy_tables.sql` ilə tamamilə sil.

## Deploy

Backend **Render**-də (web service), frontend **Vercel**-də yerləşir, verilənlər bazası isə Supabase-də qalır. Konfiqurasiya kökdəki `render.yaml` Blueprint faylındadır.

Sıra vacibdir: **əvvəlcə backend deploy olunur → URL alınır → Vercel-ə yazılır → Vercel domeni backend-in `CORS_ORIGINS` dəyişəninə yazılır.**

### 1. Addım — Render (backend)

1. Repozitoriyanı GitHub-a push et (Blueprint git repo tələb edir).
2. Render Dashboard → **New → Blueprint** → repozitoriyanı seç. Render kökdəki `render.yaml` faylını oxuyur və `kiberedu-api` adlı web service yaradır (`region: singapore`, `plan: free`, `rootDir: backend`).
3. Render `sync: false` işarələnmiş dəyişənlərin dəyərini soruşacaq — aşağıdaki cədvələ bax.
4. `CORS_ORIGINS` üçün hələ Vercel domeni yoxdur; müvəqqəti olaraq `http://localhost:3000` yaz və 3-cü addımda dəyiş.
5. Deploy bitəndən sonra URL-i yoxla: `curl https://kiberedu-api.onrender.com/api/v1/health` → `{"status":"ok",...}`

**Render-də əl ilə təyin edilməli dəyişənlər:**

| Dəyişən | Dəyəri haradan götürülür |
|---|---|
| `DATABASE_URL` | Supabase → **Connect** → Transaction pooler (port `6543`). Sətri olduğu kimi kopyala, `[YOUR-PASSWORD]` yerinə DB parolunu yaz və sonuna `?pgbouncer=true&connection_limit=10&pool_timeout=20` əlavə et. |
| `DIRECT_URL` | Supabase → **Connect** → Session pooler (port `5432`), eyni parolla. Yalnız Prisma migration-ları üçün. |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase → **Project Settings → API Keys** → publishable key |
| `SUPABASE_SECRET_KEY` | Supabase → **Project Settings → API Keys** → secret key. **Heç vaxt frontend-ə vermə.** |
| `SUPABASE_JWT_SECRET` | Yalnız layihə köhnə HS256 açarı ilə token verirsə lazımdır (**Project Settings → JWT Keys**). Asimmetrik açar istifadə olunursa bu dəyişəni tamamilə buraxma — backend JWKS ilə yoxlayır. |
| `CORS_ORIGINS` | Vercel-dən alınacaq production domeni (3-cü addım) |

**Bağlantı sətirləri üçün üç vacib qeyd:**

- **Host-u əldən yazma.** Pooler hostu hər layihə üçün fərqlidir; bu layihə `aws-1-ap-southeast-2.pooler.supabase.com` üzərindədir, `aws-0` deyil. `aws-0` üçün DNS və TCP işlədiyindən xəta aldadıcı olur: Prisma `Can't reach database server` deyir, əsl səbəb isə Supavisor-un `tenant/user not found` cavabıdır. Ona görə sətri həmişə **Dashboard → Connect**-dən kopyala.
- **`connection_limit=1` yazma.** O dəyər yalnız serverless üçün doğrudur. NestJS uzunömürlü prosesdir və hər səhifə bir neçə paralel sorğu atır, ona görə `1` limiti ilə `P2024 – Timed out fetching a new connection from the connection pool` alınır və hətta `/health` də 500 qaytarır. Düzgün dəyər: `?pgbouncer=true&connection_limit=10&pool_timeout=20`.
- **Parolu percent-encode et.** URL-də `@ # / : ? &` simvolları xüsusi məna daşıyır, ona görə parolda varsa kodlaşdırılmalıdır (`@` → `%40`, `#` → `%23`, `/` → `%2F`, `:` → `%3A`, `?` → `%3F`, `&` → `%26`). Bu layihənin parolunda `@` var — kodlaşdırılmasa Prisma sətri səhv yerdən bölür.

`NODE_ENV`, `NODE_VERSION`, `SUPABASE_URL` və `SUPABASE_PROJECT_REF` `render.yaml`-da hazırdır — əl ilə yazmaq lazım deyil. `PORT` dəyişənini **təyin etmə**: onu Render özü verir, tətbiq `0.0.0.0:$PORT`-a bind olunur.

### 2. Addım — Vercel (frontend)

1. Vercel → **Add New → Project** → repozitoriyanı import et.
2. **Root Directory** sahəsini `frontend` et — bu monorepo olduğu üçün mütləqdir. Framework (Next.js), build (`next build`) və install əmrləri avtomatik tapılır, ona görə `vercel.json` faylına ehtiyac yoxdur.
3. Environment Variables bölməsində (Production + Preview):

| Dəyişən | Dəyər |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | **Məcburidir.** Saytın public origin-i, sonda `/` olmadan, məsələn `https://kiberedu.vercel.app`. Bütün auth e-poçtları (təsdiq, parol sıfırlama) linkini bundan qurur və `/auth/callback` yönləndirməni buna bağlayır. Production build bu dəyişən olmadan **qəsdən xəta verir** — `localhost`-a səssiz düşməkdənsə. |
| `NEXT_PUBLIC_API_URL` | Render URL-i + prefiks, məsələn `https://kiberedu-api.onrender.com/api/v1` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://okyhjpywngmportlzmxo.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key (açıq paylaşıla bilər) |

4. Deploy et və verilən domeni (məsələn `https://kiberedu.vercel.app`) qeyd et.

### 3. Addım — CORS-u bağla

Render → `kiberedu-api` → **Environment** → `CORS_ORIGINS` dəyərini Vercel domeni ilə əvəz et və servisi yenidən deploy et:

```text
https://kiberedu.vercel.app,*-<vercel-team-slug>.vercel.app
```

Vergüllə ayrılan siyahıdır. `*` ilə başlayan sətir hostname **sonluğu** kimi işləyir; tək `*` isə **heç nəyə uyğun gəlmir** — `credentials: true` ilə o, internetdəki hər sayta autentifikasiyalı sorğu icazəsi verərdi. Vercel-in preview domenləri `<layihə>-<hash>-<team-slug>.vercel.app` formasındadır, ona görə ikinci dəyər yalnız sənin komandanın preview deploy-larına icazə verir — `vercel.app`-dəki hər layihəyə deyil. Team slug-ı Vercel-dəki hər hansı preview URL-inin sonundan götür. Preview lazım deyilsə yalnız birinci dəyəri saxla.

Supabase Auth tərəfində də domeni əlavə etmək lazımdır: **Authentication → URL Configuration** → Site URL və Redirect URLs.

### Prisma migration-ları haqqında

Sxem Supabase-ə birbaşa (Prisma-dan kənar) tətbiq edildiyi üçün bazada `_prisma_migrations` cədvəli yoxdur. Bu vəziyyətdə `prisma migrate deploy` mövcud cədvəlləri yenidən yaratmağa çalışıb xəta verər, ona görə **build əmrinə daxil edilməyib**.

Gələcək migration-ları avtomatlaşdırmaq istəyirsənsə, bir dəfə lokal olaraq baseline et (`.env`-də `DIRECT_URL` production bazasına baxmalıdır):

```bash
cd backend
npm run prisma:baseline     # mövcud init migration-ı "tətbiq edilmiş" kimi qeyd edir
```

Bundan sonra `render.yaml`-daki `buildCommand`-a `&& npm run prisma:deploy` əlavə edə bilərsən.

#### 2026-09 təhlükəsizlik migration-ları

Baseline-dan sonra `npx prisma migrate deploy` bu dördünü timestamp sırası ilə tətbiq edir. Sıra vacibdir və 3-cü uğursuz ola bilər:

| # | Migration | Nə edir | Risk |
|---|---|---|---|
| 0 | `prisma/manual/find_duplicate_correct_attempts.sql` | **Əvvəlcə əl ilə, yalnız oxu.** Eyni suala təkrar düzgün cavab və təkrar room bonusu qeydlərini tapır. | 2-ci sorğu `0`-dan başqa nəsə qaytarırsa **dayan** — 3-cü migration uğursuz olacaq. Skript heç nə silmir. |
| 1 | `20260911000000_module_ownership` | `learning_modules.created_by_id` (nullable). Köhnə sətirlər yalnız admin-ə aiddir. | Yoxdur |
| 2 | `20260911000200_rls_legacy_tables` | Köhnə cədvəllərdə RLS + revoke. | Yoxdur, təkrar işlədilə bilər |
| 3 | `20260911000100_answer_attempt_idempotency` | Xal ödənişini idempotent edən iki partial unique index. | Dublikat varsa uğursuz olur və geri qayıdır |
| 4 | `20260911000300_account_deletion` | `profiles.deleted_at` + partial index. | Yoxdur |
| 5 | `20260911000400_audit_log` | Admin əməliyyatları üçün `audit_log` cədvəli (RLS açıq). | Yoxdur |

⚠️ Prisma partial index-ləri görmür: gələcək `prisma migrate dev` 3 və 4-dəki index-ləri silməyi təklif edəcək — **icazə vermə**. Hər iki modeldə bunu deyən `///` şərh var.

Migration-lar tətbiq olunmadan bu kodu deploy etmə: `JwtAuthGuard` profil sətrinin hamısını oxuyur, `deleted_at` sütunu olmayan bazada isə **hər autentifikasiyalı sorğu** 500 verir.

Tam siyahı və əl ilə görüləcək addımlar: `docs/security-remediation-2026-09.md`. Deploy-dan sonra `scripts/security-smoke.sh` ilə audit PoC-larının 403 qaytardığını yoxla.

### Pulsuz plan məhdudiyyətləri

- **Render free web service** 15 dəqiqə fəaliyyətsizlikdən sonra yatır. Növbəti sorğu servisi ayıldır və cold start 30–60 saniyə çəkə bilər — ilk yüklənmə ləng görünəcək. Həmçinin ayda 750 instance saatı limiti var.
- **Render free** planda shell girişi və pre-deploy command yoxdur; migration-lar lokaldan və ya build addımından işlədilir.
- **Supabase free** layihə 30 gün fəaliyyətsizlikdən sonra dayandırılır (pause) — Dashboard-dan əl ilə bərpa etmək lazım gəlir.
- Render-in ephemeral fayl sistemi var: diskə yazılan hər şey deploy/restart zamanı silinir. Bütün vəziyyət Postgres-də saxlanılır, ona görə problem yaratmır.
- `region: singapore` seçilib, çünki Supabase layihəsi `ap-southeast-2` (Sidney) regionundadır — Sinqapurdan gedən-gələn vaxt ~90–100 ms, Oregon-dan isə ~160 ms olur. Hər Prisma sorğusu bu fərqi ödədiyi üçün Sinqapur seçimi baza gecikməsini təxminən yarıya endirir.

## Təhlükəsizlik qaydaları

- `SUPABASE_SECRET_KEY`, `SUPABASE_JWT_SECRET` və DB parolu heç vaxt repozitoriyaya düşməməlidir — `.env.example` yalnız placeholder saxlayır.
- Düzgün cavablar API cavablarında yalnız müəllim/admin rolları üçün və ya sual həll edildikdən sonra göründür.
- Cavab göndərilməsi rate-limit ilə qorunur.

## Komanda

1. Firudin Maniyev — Frontend developer
2. Şıxı İbrahimov — Backend developer
3. Mübariz — Kibertəhlükəsizlik mütəxəssisi
4. Səbuhi — Kibertəhlükəsizlik mütəxəssisi
5. Aqşin — Kibertəhlükəsizlik mütəxəssisi

## Növbəti mərhələlər

- Sinif və qrup idarəetməsi, dəvət kodları
- Sertifikat (PDF) və badge sistemi
- Lokal Room progress-inin hesabla sinxronlaşdırılması
- Daha çox Red Team, Blue Team və GRC ssenari əsaslı Room və task
- Müəllim üçün hesabat və eksport

---

KiberEduAz — təhlükəsiz öyrən, ağıllı analiz et, məsuliyyətlə müdafiə et.
