# KiberEduAz Onboarding, Error UX və Landing Redesign — Dizayn Spesifikasiyası

## Xülasə

Bu dəyişiklik KiberEduAz saytında dörd əlaqəli istifadəçi təcrübəsini vahid şəkildə yeniləyir:

1. `frontend/public/kibereduaz_logo.png` əsas brend loqosu kimi istifadə olunur.
2. Yeni hesablar platformanın qorunan hissələrinə keçməzdən əvvəl məcburi, dörd suallıq onboarding sorğusunu tamamlayır və cavablar backend-də saxlanılır.
3. İstifadəçiyə göstərilən xəta mətnləri təhlükəsiz və Azərbaycan dilində olur; daxili texniki detallar sadə istifadəçinin interfeysinə çıxmır.
4. Ana səhifənin hero və “Məzmun arxitekturası” hissələri şəkilsiz, qatlı və simmetrik vizual sistemlə yenidən qurulur.

İş mövcud Next.js 16 frontend, NestJS backend, Supabase auth və Prisma/PostgreSQL arxitekturasını saxlayır. Hazırkı React Bits Silk fonu bütün yeni vizual hissələrin arxa planı olaraq qalır.

## Məqsədlər

- Yeni hesabın ilkin təcrübəsini ölçən strukturlaşdırılmış məlumatı birdəfəlik toplamaq.
- Sorğu tamamlanmadan qorunan məhsul səhifələrinə keçidi dayandırmaq.
- Mövcud hesabların iş axınını pozmadan yalnız yeni hesabları onboarding-ə yönləndirmək.
- Texniki xəta, stack trace, Prisma məlumatı, endpoint və daxili səbəblərin learner interfeysində görünməsinin qarşısını almaq.
- Admin və müəllimə əməliyyatı anlamağa kifayət edən təhlükəsiz status və sorğu identifikatoru göstərmək, tam texniki detalı yalnız server loglarında saxlamaq.
- Faktiki asinxron gözləmə zamanı vahid loading geribildirimi təqdim etmək.
- Yeni loqonu header, footer, auth və loading vəziyyətlərində ardıcıl göstərmək.
- Hero şəklini silərək məhsulun öyrənmə axınını öz UI elementləri ilə vizuallaşdırmaq.
- “Məzmun arxitekturası”nı desktop-da simmetrik üfüqi, mobil cihazda aydın şaquli ardıcıllıq kimi göstərmək.

## Əhatədən kənar

- Onboarding cavabları üçün ayrıca admin analitika paneli.
- Sorğunun sonradan profil səhifəsindən redaktəsi.
- Loqonun öz piksel məzmununun və ya rənglərinin dəyişdirilməsi.
- Yeni şəkil, video və ya üçüncü tərəf analitika xidməti.
- Mövcud rol, müəllim təsdiqi və dərs irəliləyişi qaydalarının dəyişdirilməsi.

## İstifadəçi axını

### Yeni hesab

1. İstifadəçi tələbə və ya müəllim qeydiyyatını tamamlayır.
2. Email təsdiqi tələb olunursa, callback sessiyanı qurur və profil məlumatını alır.
3. `onboardingCompletedAt` boş olduğu üçün istifadəçi `/onboarding` səhifəsinə yönləndirilir.
4. İstifadəçi dörd sualın hamısına cavab verir və “Davam et” düyməsini seçir.
5. Frontend `PUT /profiles/me/onboarding` sorğusu göndərir.
6. Backend cavabları və tamamlanma tarixini eyni database transaction daxilində saxlayır.
7. Uğurlu cavabdan sonra istifadəçi rol və hesab statusuna uyğun səhifəyə yönləndirilir: tələbə `/dashboard`, aktiv müəllim `/teacher`, gözləyən və ya rədd edilmiş müəllim `/pending`, admin `/admin`.

### Mövcud hesab

Migration tətbiq edilən anda artıq mövcud olan bütün profillərə `onboarding_completed_at = NOW()` yazılır. Buna görə mövcud istifadəçilər sorğu görmür və hazırkı giriş axınını saxlayır. Migration-dan sonra yaradılan profil üçün sahə `NULL` qalır və onboarding məcburi olur.

### Məcburi giriş qapısı

- `/onboarding` yalnız autentifikasiya olunmuş istifadəçilər üçündür.
- Auth callback və login/register tamamlandıqdan sonra profilin onboarding statusu yoxlanılır.
- Next.js `proxy.ts` qorunan route sorğularında access token ilə backend-dən `/profiles/me` profilini yoxlayır.
- Tamamlanmamış hesab `/onboarding`-dən başqa qorunan route-a getdikdə `/onboarding?next=<təhlükəsiz daxili yol>` ünvanına yönləndirilir.
- Tamamlanmış hesab `/onboarding`-ə getdikdə `homePathFor(profile)` nəticəsinə yönləndirilir.
- `next` yalnız `/` ilə başlayan daxili yol olduqda qəbul edilir; protokol-relative (`//`) və xarici URL-lər rədd edilir.
- Profil yoxlaması müvəqqəti backend problemi ilə uğursuz olarsa, proxy istifadəçini redirect dövrəsinə salmır. Qorunan səhifə açılır və server/client data sorğusunun təhlükəsiz error UI-si problemi göstərir.

## Onboarding məlumat modeli

`Profile` modelinə aşağıdakılar əlavə olunur:

- `onboardingCompletedAt DateTime? @map("onboarding_completed_at") @db.Timestamptz(6)`
- `onboardingResponse OnboardingResponse?`

Yeni Prisma enum-ları:

- `CyberExperienceLevel`: `NEW`, `FOUNDATION`, `EXPERIENCED`
- `PracticalExperience`: `NONE`, `GUIDED_LABS`, `PERSONAL_PROJECTS`, `PROFESSIONAL`
- `LearningTrack`: `RED_TEAM`, `BLUE_TEAM`, `GRC`, `UNDECIDED`
- `ReferralSource`: `SCHOOL`, `TEACHER`, `FRIEND`, `SOCIAL_MEDIA`, `SEARCH`, `EVENT`, `OTHER`

Yeni `OnboardingResponse` modeli:

- `profileId`: UUID primary key və `Profile` ilə one-to-one relation
- `experienceLevel`: `CyberExperienceLevel`
- `practicalExperience`: `PracticalExperience`
- `learningTrack`: `LearningTrack`
- `referralSource`: `ReferralSource`
- `referralOther`: maksimum 160 simvolluq nullable mətn; yalnız `referralSource = OTHER` olduqda qəbul edilir və tələb olunur
- `createdAt`, `updatedAt`: timezone-aware tarixlər

Profil silindikdə onboarding cavabı cascade ilə silinir.

## Sorğunun məzmunu

Sorğu bir səhifədə, dörd nömrələnmiş kart kimi göstərilir. Hər sualda yalnız bir seçim edilir.

1. **Kibertəhlükəsizlik sahəsində səviyyəniz necədir?**
   - Bu sahədə yeniyəm
   - Əsas anlayışları bilirəm
   - Artıq təcrübəm var
2. **Praktiki təcrübəniz hansına daha yaxındır?**
   - Hələ praktiki təcrübəm yoxdur
   - Təlimatlı lablar etmişəm
   - Şəxsi layihələr üzərində işləmişəm
   - Peşəkar iş təcrübəm var
3. **Hazırda ən çox hansı istiqamət sizi maraqlandırır?**
   - Red Team
   - Blue Team
   - GRC
   - Hələ qərar verməmişəm
4. **KiberEduAz haqqında haradan eşitmisiniz?**
   - Məktəb və ya universitet
   - Müəllim
   - Dost və ya həmkar
   - Sosial media
   - Axtarış sistemi
   - Tədbir
   - Digər

“Digər” seçildikdə maksimum 160 simvolluq əlavə mətn sahəsi açılır. Dörd seçim tamamlanmadan submit düyməsi aktiv olmur. Sorğunu keçmək və bağlamaq üçün keçid göstərilmir.

## Backend API

### Profil cavabı

Mövcud `GET /profiles/me` cavabına aşağıdakılar əlavə edilir:

```json
{
  "onboardingCompletedAt": "2026-08-23T12:00:00.000Z",
  "onboardingCompleted": true
}
```

Frontend yönləndirmə qərarını boolean `onboardingCompleted` ilə verir; tarix audit və gələcək analitika üçün saxlanılır.

### Onboarding submit

`PUT /profiles/me/onboarding` autentifikasiya tələb edir və bu body-ni qəbul edir:

```json
{
  "experienceLevel": "NEW",
  "practicalExperience": "NONE",
  "learningTrack": "UNDECIDED",
  "referralSource": "SOCIAL_MEDIA",
  "referralOther": null
}
```

DTO yalnız müəyyən edilmiş enum dəyərlərini qəbul edir. `OTHER` seçilmədikdə `referralOther` server tərəfindən `null` kimi saxlanılır; `OTHER` seçildikdə boş və ya 160 simvoldan uzun mətn `400` qaytarır.

Endpoint retry üçün idempotentdir: eyni istifadəçinin sətri `upsert` olunur, `onboardingCompletedAt` yalnız ilk uğurlu tamamlanmada təyin edilir. Bütün yazılar Prisma transaction daxilində baş verir. Cavab yenilənmiş `MyProfile` formasındadır.

## Təhlükəsiz xəta arxitekturası

### Backend sərhədi

Global NestJS exception filter bütün cavabları aşağıdakı ictimai kontrakta salır:

```json
{
  "statusCode": 500,
  "code": "INTERNAL_ERROR",
  "message": "Əməliyyatı hazırda tamamlamaq mümkün olmadı.",
  "requestId": "cuid-or-uuid"
}
```

- Gözlənilməyən `5xx` xətalarında stack, Prisma məlumatı, SQL, endpoint detalları və exception message response-a yazılmır.
- Tam exception, stack, request metodu, route və `requestId` server loguna yazılır.
- `400`, `401`, `403`, `404`, `409`, `429` üçün sabit, Azərbaycan dilində təhlükəsiz kod və mesajlar qaytarılır.
- Class-validator xətaları texniki obyekt kimi deyil, ümumi `VALIDATION_ERROR` kodu kimi qaytarılır; sahəyə aid aydın validation mətni frontend-in özündə göstərilir.
- Mövcud Prisma filter bu vahid filter daxilində davranışını qoruyur, amma `target`, model və constraint adlarını response-a çıxarmır.

### Frontend sərhədi

`ApiError` status, təhlükəsiz backend `code`, `message` və `requestId` saxlayır. Yeni mərkəzi `getDisplayError(error, { audience, context })` funksiyası UI mətnini müəyyən edir.

- `audience: "learner"`: səbəbin raw `message` dəyəri heç vaxt render edilmir; status və kontekstə uyğun sadə bərpa addımı göstərilir.
- `audience: "staff"`: təhlükəsiz əməliyyat mesajı, HTTP status və varsa `requestId` göstərilir. Stack, Prisma və endpoint detalları yenə göstərilmir.
- Development mühitində tam client-side səbəb `console.error` vasitəsilə görünür, production UI-yə daxil edilmir.
- Auth səhifələrində Supabase-in raw səbəbi və callback `reason` dəyəri render edilmir; məlum auth kodları təhlükəsiz Azərbaycan dili mesajlarına map edilir.

Standart istifadəçi mesajları:

- Network: “Serverlə əlaqə qurmaq mümkün olmadı. İnterneti yoxlayıb yenidən cəhd edin.”
- `400`: “Daxil etdiyiniz məlumatları yoxlayın.”
- `401`: “Sessiyanız bitib. Yenidən daxil olun.”
- `403`: “Bu əməliyyat üçün icazəniz yoxdur.”
- `404`: “Axtardığınız məlumat tapılmadı.”
- `409`: “Bu məlumat artıq mövcuddur və ya əməliyyat cari vəziyyətə uyğun deyil.”
- `429`: “Çox sayda cəhd edildi. Bir qədər sonra yenidən yoxlayın.”
- `5xx`: “Əməliyyatı hazırda tamamlamaq mümkün olmadı. Bir qədər sonra yenidən cəhd edin.”

Next.js `error.tsx` route xətaları üçün retry düyməli təhlükəsiz səhifə göstərir. `global-error.tsx` root render xətaları üçün öz minimal `html` və `body` qabığını, yeni loqonu və ana səhifəyə keçidi təqdim edir. `not-found.tsx` bu vizual dilə uyğunlaşdırılır.

## Loading sistemi

Loading animasiyası yalnız real gözləmə olan vəziyyətlərdə göstərilir:

- Mövcud route `loading.tsx` skeleton-u yeni brend dilinə uyğunlaşdırılır.
- Global site loader yeni loqodan istifadə edir və dekorativ Silk fonunun üzərində qalır.
- Onboarding submit düyməsi pending olduqda spinner, “Yadda saxlanılır...” mətni və `disabled` vəziyyəti göstərir.
- Login, register, profile, room, teacher və admin daxilində async action düymələri vahid spinner ölçüsü və `aria-busy` qaydası istifadə edir.
- Səhifə daxilində ilkin data yüklənirsə skeleton; istifadəçi əməliyyatında button spinner; route keçidində mövcud link loading indikatoru istifadə olunur.
- Süni gecikmə əlavə edilmir və eyni əməliyyat üçün iki üst-üstə loading overlay göstərilmir.

Vahid `LoadingSpinner` komponenti dekorativ SVG/CSS spinner, əlçatan gizli mətn və ölçü variantlarını daşıyır. Səhifə səviyyəli skeleton-lar öz layout ölçülərini qoruyaraq content shift-i azaldır.

## Loqo inteqrasiyası

Mənbə asset dəyişdirilmir: `frontend/public/kibereduaz_logo.png`.

- `Logo` komponenti Next.js `Image` ilə tam wordmark göstərir və ana səhifəyə link rolunu saxlayır.
- Header desktop görünüşündə tam logo, dar mobil görünüşdə ölçüsü kiçildilmiş tam logo göstərir; qeyri-dəqiq CSS crop yaradılmır.
- Footer və auth kartlarında tam logo istifadə olunur.
- `BrandMark` istifadə olunan loader və kompakt hallarda eyni asset ayrıca ölçü konteynerində göstərilir.
- Şəklin `alt` mətni link daxilində “KiberEduAz — ana səhifə”, dekorativ təkrar hallarda boş olur.
- Loqo şəffaf fonlu olduğuna görə əlavə ağ fon və ya border verilmir.

## Ana səhifə vizual dizaynı

### Hero

`/images/cybersecurity_photo.jpg` hero-dan çıxarılır və bu dəyişiklikdən sonra başqa yerdə istifadə olunmursa asset silinir.

Hero iki əsas qat yaradır:

1. Sol hissədə eyebrow, güclü başlıq, qısa dəyər təklifi və iki CTA.
2. Sağ hissədə şəkil əvəzinə platformanın öyrənmə dövrəsini göstərən interaktiv olmayan “mission stack”.

Mission stack üç üst-üstə düşən glass kartdan ibarətdir:

- “01 / Öyrən” — nəzəri tapşırıq və progress xətti
- “02 / Tətbiq et” — lab terminal göstəricisi
- “03 / Sübut et” — xal, streak və tamamlanma nişanı

Kartlar eyni grid oxuna bağlanır, aralarındakı nazik xətlər proses əlaqəsini göstərir. Arxa dekor Silk fonunu örtməyən radial işıq, incə grid və blur səthlərdən ibarətdir. Motion yalnız opacity/transform ilə işləyir, `prefers-reduced-motion` olduqda söndürülür. Mobil görünüşdə mətnin ardınca kartlar bir sütunda gəlir və üfüqi overflow yaranmır.

### Məzmun arxitekturası

Section başlığı və izahı mərkəzləşdirilir. Desktop görünüşündə beş mərhələ bərabər enli simmetrik grid-də göstərilir:

`Path → Module → Room → Task → Sual`

Hər kartda sıra nömrəsi, termin, Azərbaycan dilində qısa izah və dekorativ status işarəsi olur. Kartların mərkəzindən keçən connector xətti yalnız desktop-da göstərilir. Mərkəzi `Room` kartı strukturun praktik nüvəsi kimi bir qədər güclü accent alır, lakin ölçü və hizalanma simmetriyasını pozmur. Mobil görünüşdə eyni ardıcıllıq şaquli timeline-a çevrilir. Bütün terminlər hazırkı content modelinə uyğun qalır.

## Komponent sərhədləri

- `backend/src/profiles/dto/onboarding.dto.ts`: enum validation və referral şərti.
- `backend/src/profiles/profiles.service.ts`: idempotent transaction və profil serialization.
- `backend/src/profiles/profiles.controller.ts`: authenticated onboarding endpoint.
- `backend/src/common/http-exception.filter.ts`: təhlükəsiz public error envelope və server logu.
- `frontend/src/lib/api/errors.ts`: status/context/audience xəta mapping-i.
- `frontend/src/lib/auth/onboarding.ts`: onboarding route qərarları və təhlükəsiz `next` yolu.
- `frontend/src/components/onboarding/onboarding-form.tsx`: seçim vəziyyəti, client validation və submit.
- `frontend/src/app/onboarding/page.tsx`: server auth/profile gate və page composition.
- `frontend/src/components/feedback/loading-spinner.tsx`: vahid kiçik loading primitive-i.
- `frontend/src/components/brand/logo.tsx`: yeni asset üçün yeganə logo API-si.
- `frontend/src/components/landing/landing-hero.tsx`: şəkilsiz mission stack hero.
- `frontend/src/components/landing/content-structure.tsx`: simmetrik beş mərhələli struktur.

Mövcud böyük admin, müəllim, room və profil komponentləri yalnız error render və spinner istifadəsi səviyyəsində dəyişir; bu iş çərçivəsində onların domen davranışı refaktor edilmir.

## Əlçatanlıq və responsive qaydalar

- Bütün form seçimləri native radio semantikasına malik olur.
- Sual qrupları `fieldset` və `legend` istifadə edir.
- Error summary `role="alert"`, pending status `aria-live="polite"` və submit `aria-busy` istifadə edir.
- Keyboard focus halı brend accent ilə aydın görünür.
- Rəng informasiya üçün yeganə siqnal deyil; label, sıra və icon birlikdə işləyir.
- `prefers-reduced-motion: reduce` zamanı entrance və floating animasiyaları söndürülür.
- 320px enindən başlayaraq üfüqi scroll olmamalıdır.

## Test strategiyası

### Backend

- DTO enum və `OTHER` referral validation halları.
- Yeni profilin `onboardingCompleted = false` cavabı.
- Existing-user migration backfill SQL yoxlaması.
- Onboarding transaction-ın create, retry/upsert və ilk timestamp-i qoruma davranışı.
- Exception filter-in `5xx` üçün raw message/stack/Prisma detalı qaytarmaması.
- `400/401/403/404/409/429` təhlükəsiz kod mapping-i.

### Frontend

- `homePathFor` onboarding tamamlanmadıqda `/onboarding`, tamamlandıqda rol route-u qaytarır.
- `next` sanitization xarici və protocol-relative URL-ləri rədd edir.
- Xəta mapping-i learner üçün raw message-i gizlədir, staff üçün request ID-ni saxlayır.
- Onboarding bütün suallar olmadan submit etmir və `OTHER` mətnini yoxlayır.
- Logo komponenti yeni public asset-i istifadə edir.
- Landing hero köhnə foto asset-ini render etmir.
- Məzmun arxitekturası beş mərhələni düzgün sırada göstərir.
- Mövcud frontend regression testləri, lint və production build keçməlidir.

### Əl ilə yoxlama

- Desktop və 320px mobil ölçüdə landing, onboarding, loading, error boundary, header/footer və auth səhifələri.
- Yeni tələbə, pending müəllim və tamamlanmış mövcud hesab axınları.
- Network offline, `401`, `403`, `409`, `429` və `500` simulyasiyalarında düzgün Azərbaycan dili mesajları.
- Learner UI-də stack, Prisma adı, raw backend exception və endpoint məlumatının olmaması.

## Qəbul meyarları

- Yeni profil onboarding tamamlamadan qorunan route-a daxil ola bilmir.
- Sorğu cavabları backend database-də profilə one-to-one bağlı saxlanılır.
- Mövcud profillər migration-dan sonra onboarding-ə məcbur edilmir.
- Təkrar submit duplicate sətir yaratmır və ilk tamamlanma tarixini dəyişmir.
- Yeni logo header, footer, auth və loader-də görünür.
- Hero-da köhnə kibertəhlükəsizlik şəkli yoxdur; mission stack responsive və reduced-motion uyğundur.
- “Məzmun arxitekturası” desktop-da beş bərabər mərhələli simmetrik grid, mobil görünüşdə şaquli timeline-dır.
- Bütün faktiki async əməliyyatların loading və disabled geribildirimi var.
- Sadə istifadəçiyə texniki xəta detalı göstərilmir; staff təhlükəsiz status/request ID görür; server logu tam detalı saxlayır.
- Backend və frontend test, lint və build yoxlamaları keçərli olur.
