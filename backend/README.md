# KiberEduAz API

NestJS + Prisma API-si. Supabase Postgres-i verilənlər bazası, Supabase Auth-u isə identifikasiya provayderi kimi istifadə edir.

Quraşdırma addımları üçün repozitoriyanın kök [README](../README.md) faylına bax.

## Arxitektura

```text
src/
├── auth/          # Supabase JWT yoxlaması, guard-lar, rol dekoratorları
├── catalog/       # Path, Module, Room, Task, Question CRUD + serializasiya
├── progress/      # Cavab yoxlaması, xal, streak, tamamlanma
├── profiles/      # İstifadəçi profili və rol idarəetməsi
├── leaderboard/   # Sinif / təşkilat / qlobal reytinq
├── notifications/ # Bildiriş axını
├── common/        # Paylaşılan DTO-lar və Prisma exception filtri
├── config/        # Mühit dəyişənlərinin oxunması
└── prisma/        # PrismaService
```

## Autentifikasiya

Frontend Supabase Auth ilə giriş edir və `access_token`-i `Authorization: Bearer` başlığında göndərir. `JwtAuthGuard` tokeni `jose` ilə yoxlayır:

- Layihə asimmetrik açarlardan istifadə edirsə, açarlar JWKS endpoint-indən götürülür və keşlənir.
- Köhnə HS256 layihələri üçün `SUPABASE_JWT_SECRET` fallback kimi işləyir.

Guard qlobaldır. İstisna üçün `@Public()`, rol tələbi üçün `@Roles('TEACHER', 'ADMIN')` dekoratorlarından istifadə et.

İlk uğurlu sorğuda guard istifadəçi üçün `profiles` və `user_stats` sətirlərini yaradır, ona görə Supabase-də əvvəlcədən mövcud olan hesablar da problemsiz işləyir.

## Cavab yoxlaması

Düzgün cavab heç vaxt learner-ə göndərilmir. `catalog.serializer.ts` sualı yalnız aşağıdakı hallarda cavabla birlikdə qaytarır:

- istifadəçi `TEACHER` və ya `ADMIN`-dirsə,
- və ya istifadəçi həmin sualı artıq həll edibsə (izahatı görmək üçün).

`POST /progress/questions/:questionId/answer` bir tranzaksiya daxilində: cəhdi yazır, xal verir, task/room progresini yeniləyir, streak-i hesablayır və room tamamlandıqda bonus əlavə edir. Təkrar düzgün cavab üçün xal ikinci dəfə verilmir.

## Verilənlər bazası ilə iş

`prisma migrate` üçün `DIRECT_URL` (port 5432) istifadə olunur; işləmə zamanı tətbiq `DATABASE_URL` (pooler, port 6543) ilə qoşulur.

```bash
npm run prisma:generate   # client-i yenidən yarat
npm run prisma:deploy     # miqrasiyaları tətbiq et
npm run prisma:studio     # bazaya vizual baxış
npm run seed              # Room məzmununu yüklə (idempotent)
```

Sxem dəyişikliyi edərkən həm `prisma/schema.prisma`, həm də `prisma/migrations/` altındakı SQL sinxron saxlanmalıdır.

## Mühit dəyişənləri

`.env.example` faylına bax. Real dəyəri commit edilməməli olanlar: `SUPABASE_SECRET_KEY`, `SUPABASE_JWT_SECRET`, `DATABASE_URL`, `DIRECT_URL`.
