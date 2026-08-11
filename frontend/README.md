# KiberEduAz Frontend

Next.js 16 (App Router) tətbiqi. Bütün məzmun və progress məlumatı KiberEduAz API-dan gəlir; statik mock data artıq yoxdur.

Quraşdırma addımları üçün repozitoriyanın kök [README](../README.md) faylına bax.

## Data axını

```text
Server Component  ──> lib/api/server.ts  (apiFetch)   ──> NestJS API
Client Component  ──> lib/api/client.ts  (apiRequest) ──> NestJS API
proxy.ts          ──> Supabase sessiyasını yeniləyir və qorunan route-ları yoxlayır
```

- `lib/supabase/server.ts` və `lib/supabase/client.ts` — `@supabase/ssr` klientləri.
- `apiFetch` cookie-dəki Supabase access token-i `Authorization` başlığına əlavə edir. Sessiya yoxdursa `apiFetchOrNull` `null` qaytarır ki, layout qonaq rejimində render oluna bilsin.
- `lib/api/types.ts` backend cavablarının tiplərini saxlayır; backend DTO-ları dəyişəndə bu fayl da yenilənməlidir.
- `lib/api/labels.ts` enum dəyərlərini (`WALKTHROUGH`, `BEGINNER` və s.) Azərbaycan dilindəki etiketlərə çevirir.

## Route-lar

| Marşrut | Təyinat | Giriş |
|---|---|---|
| `/` | İdarə paneli: room-lar, progress, reytinq, bildirişlər | Tələb olunur |
| `/rooms` | Room kataloqu, axtarış və filtrləmə | Tələb olunur |
| `/rooms/[slug]` | Dərs və quiz axını | Tələb olunur |
| `/roadmap` | Bacarıq yol xəritəsi | Açıq |
| `/notifications` | Bildiriş mərkəzi | Tələb olunur |
| `/profile` | Profil redaktəsi | Tələb olunur |
| `/contact` | Əlaqə formu və FAQ | Açıq |
| `/login`, `/register` | Supabase Auth | Yalnız qonaq |

Qorunma `src/proxy.ts` faylında həyata keçirilir (Next.js 16-da `middleware.ts` bu adla əvəz olunub).

## Struktur

```text
src/
├── app/          # Route-lar və server component-lər
├── components/   # UI və funksional komponentlər
└── lib/
    ├── api/      # Backend klienti və tiplər
    └── supabase/ # Supabase browser/server klientləri
```

## Əmrlər

```bash
npm run dev     # inkişaf serveri
npm run build   # production build
npm run lint    # ESLint
```

## Dizayn istiqaməti

Vizual sistem qara fon, qırmızı risk siqnalları və yaşıl sistem/progress vəziyyətləri üzərində qurulub. UI daxilində əməliyyat mərkəzi, radar, terminal və təhlükəsizlik siqnalı motivlərindən istifadə edilir. Animasiyalar əsasən CSS üzərindən işləyir və `prefers-reduced-motion` seçiminə hörmət edir.
