export const FAQ_CATEGORIES = [
  "Platforma",
  "Hesab və giriş",
  "Room və progress",
  "Müəllim və təhlükəsizlik",
] as const;

export type FaqCategory = (typeof FAQ_CATEGORIES)[number];
export type FaqFilter = FaqCategory | "Hamısı";

export type FaqItem = {
  id: string;
  category: FaqCategory;
  question: string;
  answer: string;
};

export const FAQ_ITEMS: readonly FaqItem[] = [
  { id: "platform-purpose", category: "Platforma", question: "KiberEduAz nə üçün yaradılıb?", answer: "KiberEduAz məktəb və kollec tələbələrinin İT, kibertəhlükəsizlik və GRC mövzularını mərhələli dərslər, tasklar və ssenarilər vasitəsilə öyrənməsi üçün hazırlanmış təlim platformasıdır." },
  { id: "platform-paths", category: "Platforma", question: "Hansı öyrənmə istiqamətləri mövcuddur?", answer: "Hazırkı MVP-də hücum təhlükəsizliyi üçün Red Team, müdafiə və SOC analizi üçün Blue Team, idarəetmə və risk mövzuları üçün isə GRC istiqamətləri mövcuddur." },
  { id: "platform-mobile", category: "Platforma", question: "Dərsləri telefondan istifadə edərək oxuya bilərəm?", answer: "Bəli. Room kartları, task naviqasiyası, Markdown cədvəlləri və interaktiv yoxlamalar telefon ekranları üçün uyğunlaşdırılıb; geniş cədvəllər öz konteynerində sürüşdürülür." },
  { id: "account-login", category: "Hesab və giriş", question: "Hesabıma necə daxil ola bilərəm?", answer: "Yuxarı menyudakı “Daxil ol” düyməsini seç, qeydiyyatda istifadə etdiyin e-poçt ünvanını və şifrəni yaz. Uğurlu girişdən sonra roluna uyğun idarə panelinə yönləndiriləcəksən." },
  { id: "account-password", category: "Hesab və giriş", question: "Şifrə ilə bağlı xəta alıramsa nə etməliyəm?", answer: "E-poçtu və şifrəni boşluqsuz yazdığını yoxla. Yeni hesabda şifrə ən azı səkkiz simvol olmalıdır; e-poçt təsdiqi aktivdirsə, gələn qutudakı təsdiq linkini də açmalısan." },
  { id: "account-logout", category: "Hesab və giriş", question: "Hesabdan təhlükəsiz şəkildə necə çıxım?", answer: "Daxil olduqda desktop başlıqda, mobil menyuda və profil səhifəsində “Hesabdan çıx” düyməsi görünür. Düymə sessiyanı bağlayır və səni ana səhifəyə qaytarır." },
  { id: "room-progress", category: "Room və progress", question: "Room progress-i necə hesablanır?", answer: "Progress tamamladığın taskların ümumi task sayına nisbəti ilə hesablanır. Hər task bitdikcə progress paneli, tamamlanan addımlar və qazandığın XP yenilənir." },
  { id: "room-local", category: "Room və progress", question: "“Bu cihazda saxlanılır” nişanı nə deməkdir?", answer: "Bu nişan yeni statik Markdown dərslərinin progress məlumatının hazırda yalnız istifadə etdiyin brauzerdə saxlanıldığını bildirir. Brauzer məlumatlarını silsən, həmin lokal progress sıfırlana bilər." },
  { id: "room-sync", category: "Room və progress", question: "Bütün Room-lar hesabımla sinxronlaşır?", answer: "MVP mərhələsində əvvəlki iki API Room-u hesabınla sinxronlaşır, yeni beş Markdown Room-u isə cihazda saxlanılır. Kartdakı nişan hər Room-un hansı progress rejimindən istifadə etdiyini göstərir." },
  { id: "teacher-approval", category: "Müəllim və təhlükəsizlik", question: "Müəllim hesabı niyə admin təsdiqi tələb edir?", answer: "Müəllim paneli sinif və iştirakçı məlumatlarına çıxış verdiyi üçün müraciətlər əvvəlcə admin tərəfindən yoxlanılır. Bu addım platformadakı rol və səlahiyyətlərin etibarlı qalmasına kömək edir." },
  { id: "teacher-content", category: "Müəllim və təhlükəsizlik", question: "Müəllimlər öz dərslərini əlavə edə biləcəklər?", answer: "Hazırkı MVP əsas öyrənmə və idarəetmə axınını göstərir. Sonrakı mərhələdə müəllimlər üçün Room hazırlamaq, sinfə təyin etmək və iştirak nəticələrini izləmək imkanları genişləndiriləcək." },
  { id: "security-practice", category: "Müəllim və təhlükəsizlik", question: "Tapşırıqları real sistemlərdə sınaqdan keçirə bilərəm?", answer: "Yalnız sənə məxsus laboratoriyada və açıq icazə verilmiş sistemlərdə məşq et. İcazəsiz sistemə müdaxilə həm etik qaydaları, həm də qanunvericiliyi poza bilər; dərslərdəki ssenarilər təhlükəsiz öyrənmə üçündür." },
] as const;

export function filterFaqItems(
  items: readonly FaqItem[],
  query: string,
  category: FaqFilter,
): FaqItem[] {
  const normalizedQuery = query.trim().toLocaleLowerCase("az");

  return items.filter((item) => {
    const matchesCategory = category === "Hamısı" || item.category === category;
    const matchesQuery =
      !normalizedQuery ||
      `${item.question} ${item.answer}`.toLocaleLowerCase("az").includes(normalizedQuery);
    return matchesCategory && matchesQuery;
  });
}

