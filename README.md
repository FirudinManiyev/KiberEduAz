# KiberEduAz

KiberEduAz məktəb və kolleclərdə İT və kibertəhlükəsizlik təlimlərinin təşkili, izlənməsi və praktiki formada öyrənilməsi üçün hazırlanan təhsil platformasıdır.

Platforma **“oxu → analiz et → cavablandır → yoxla → xal qazan”** modeli üzərində qurulur. Məqsəd nəzəriyyə və praktikanı ayrı bölmələrə parçalamadan, TryHackMe və Hack The Box yanaşmalarından ilhamlanan, yerli auditoriyaya uyğun təhlükəsiz öyrənmə təcrübəsi yaratmaqdır.

## MVP-də nələr var?

- Şagird üçün interaktiv idarə paneli
- Pentestinq və GRC istiqamətində iki Room
- Dərs və quiz-in birləşdirildiyi task axını
- Ani cavab yoxlaması və frontend progress göstəriciləri
- Room axtarışı və kateqoriya filtrləri
- Şəxsi kiber roadmap səhifəsi
- Statik profil redaktəsi və bildiriş mərkəzi
- Xal, rütbə, seriya və sinif reytinqi interfeysləri
- Mobil, planşet və masaüstü üçün responsive dizayn

> MVP hazırda yalnız frontend demonstrasiyasıdır. Profil, bildiriş və progress dəyişiklikləri backend qoşulana qədər daimi saxlanmır.

## Texnologiyalar

- Next.js 16 — App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Lucide React
- React Markdown və digər gələcək məzmun inteqrasiyaları üçün hazır frontend strukturu

## Səhifələr

| Marşrut | Təyinat |
|---|---|
| `/` | İnteraktiv idarə paneli və günlük mikro-missiya |
| `/rooms` | Room kataloqu, axtarış və filtrləmə |
| `/rooms/[slug]` | Birləşdirilmiş dərs, task və quiz təcrübəsi |
| `/roadmap` | Bacarıq və ixtisaslaşma yol xəritəsi |
| `/notifications` | Statik təlim və nailiyyət bildirişləri |
| `/profile` | Statik profil və təlim seçimləri redaktəsi |

## Lokal işə salma

```bash
cd frontend
npm install
npm run dev
```

Production build və kod keyfiyyəti yoxlamaları:

```bash
npm run build
npm run lint
```

## Frontend strukturu

```text
frontend/src/
├── app/             # Next.js səhifələri və route-lar
├── components/      # Təkrar istifadə olunan UI və funksional komponentlər
├── data/            # Room məzmunu və statik MVP məlumatları
└── types/           # TypeScript data modelləri
```

## Dizayn istiqaməti

Vizual sistem qara fon, qırmızı risk siqnalları və yaşıl sistem/progress vəziyyətləri üzərində qurulub. UI daxilində əməliyyat mərkəzi, radar, terminal və təhlükəsizlik siqnalı motivlərindən istifadə edilir. Animasiyalar əsasən CSS üzərindən işləyir və `prefers-reduced-motion` seçiminə hörmət edir.

## Komanda

1. Firudin Maniyev - Frontend developer
2. Şıxı İbrahimov - Backend developer
3. Mübariz - Kibertəhlükəsizlik mütəxəssisi
4. Səbuhi - Kibertəhlükəsizlik mütəxəssisi
5. Aqşin - Kibertəhlükəsizlik mütəxəssisi

## Növbəti mərhələlər

- Supabase Auth və rol əsaslı giriş
- Backend API və daimi progress saxlanması
- Müəllim/admin idarəetmə panelləri
- Sinif və qrup idarəetməsi
- Sertifikat və badge sistemi
- Daha çox ssenari əsaslı Room və task

---

KiberEduAz — təhlükəsiz öyrən, ağıllı analiz et, məsuliyyətlə müdafiə et.
