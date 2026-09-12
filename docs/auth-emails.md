# Auth e-poçtları — niyə bir dəfə gəlir, nə etməli

Qeydiyyat təsdiqi, parol bərpası və e-poçt dəyişmə məktubları Supabase Auth
tərəfindən göndərilir — backend onlara toxunmur. "Link yalnız bir dəfə gəlir"
şikayətinin **üç ayrı səbəbi** var və ikisi konfiqurasiyadır, biri isə normal
davranışdır.

## 1. Supabase-in daxili SMTP-si production üçün deyil (ən çox rast gəlinən)

Öz SMTP provayderin qoşulmayıbsa, Supabase öz paylaşılan poçt xidmətindən
istifadə edir. O, **bütün layihə üçün saatda cəmi bir neçə məktub** buraxır —
istifadəçi başına yox, layihə başına. Supabase bunu açıq şəkildə "yalnız test
üçün" adlandırır.

Nəticə tam olaraq müşahidə etdiyin kimi görünür: ilk qeydiyyat işləyir,
sonrakılar səssizcə heç nə göndərmir.

**Düzəlişi:** Supabase Dashboard → **Project Settings → Authentication → SMTP
Settings** → Enable Custom SMTP. Resend, Postmark, Brevo, SendGrid — hər hansı
biri olar; hamısının pulsuz təbəqəsi bu ölçüdə platforma üçün kifayətdir.
Eyni səhifədə **Rate Limits** bölməsindən saatlıq limiti də qaldır.

Bu, kodla həll oluna bilməyən yeganə hissədir.

## 2. Təsdiqlənmiş ünvana təkrar məktub göndərilmir (normal davranış)

Hesab bir dəfə təsdiqlənəndən sonra Supabase həmin ünvana daha təsdiq məktubu
göndərmir. Eyni e-poçtla yenidən `signUp` çağırsan, cavab **uğurlu görünür,
amma heç nə göndərilmir** — bu qəsdəndir: əks halda forma "bu e-poçt
qeydiyyatdadır" sualına cavab verən bir alətə çevrilərdi (user enumeration).

Yəni təsdiqdən sonra məktub gözləmək lazım deyil — sadəcə e-poçt və şifrə ilə
daxil olursan.

**Test edərkən:** eyni ünvanı təkrar sınamaq üçün Dashboard → Authentication →
Users-dan istifadəçini silmək lazımdır, yoxsa yeni məktub gəlməyəcək.

## 3. Link tək istifadəlikdir və vaxtı bitir

Təsdiq linki bir dəfə açılır (PKCE `code` və ya `token_hash` istifadə olunub
yanır) və standart olaraq 24 saatdan sonra etibarsız olur. İkinci dəfə açanda
`/auth/callback` `?authError=used-link` ilə login səhifəsinə qaytarır və
"Bu link artıq istifadə olunub. Sadəcə daxil ol." yazır.

## Kodda nə var

Linkin gəlmədiyi və ya vaxtının bitdiyi hal üçün artıq **yenidən göndərmə**
axını var (`components/auth/resend-confirmation.tsx`):

- Qeydiyyatdan sonra "təsdiq linki göndərildi" mesajının altında görünür.
- Təsdiqlənməmiş hesabla daxil olmağa çalışanda da görünür — bu, ünvanın
  həqiqətən qeydiyyatda olduğunu bildiyimiz yeganə andır.
- `supabase.auth.resend({ type: "signup" })` çağırır, `emailRedirectTo` isə
  `getSiteUrl()`-dan qurulur.
- Supabase "X saniyə sonra" desə, düymə həmin qədər geri sayır — istifadəçi
  uğursuz olacağı bəlli olan düyməyə basmır.

Linkin vaxtı bitibsə mesaj artıq "yenidən qeydiyyatdan keç" demir; daxil olmağa
çalışmağı təklif edir, çünki yeni link oradan bir kliklikdir.

## Dashboard-da yoxlanmalı ayarlar

| Yer | Nə olmalıdır |
|---|---|
| Authentication → URL Configuration → **Site URL** | `https://kiber-edu-az-one.vercel.app` |
| Authentication → URL Configuration → **Redirect URLs** | `https://kiber-edu-az-one.vercel.app/auth/callback` və lokal iş üçün `http://localhost:3000/auth/callback` |
| Project Settings → Authentication → **SMTP Settings** | Öz provayderin (bax 1-ci bənd) |
| Project Settings → Authentication → **Rate Limits** | Saatlıq e-poçt limiti + login/OTP limitləri |

Redirect URL siyahıda yoxdursa, kod düzgün link göndərsə belə Supabase
yönləndirməni rədd edir və istifadəçi login səhifəsinə xəta ilə qayıdır.
