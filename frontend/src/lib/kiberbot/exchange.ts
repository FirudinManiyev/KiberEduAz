export type KiberBotExchange = {
  userText: string;
  reply: string;
};

export type KiberBotSuggestion = {
  id: string;
  question: string;
  answer: string;
};

export const KIBERBOT_SUGGESTIONS: readonly KiberBotSuggestion[] = [
  {
    id: "start-room",
    question: "Room-a necə başlaya bilərəm?",
    answer:
      "Room-lar səhifəsini aç, maraqlandığın təlimi seç və Room səhifəsindəki başlanğıc düyməsindən istifadə et. Daha əvvəl başlamısansa, həmin düymə səni qaldığın Task-a qaytaracaq.",
  },
  {
    id: "complete-tasks",
    question: "Room daxilində Task-ları necə tamamlayım?",
    answer:
      "Task-ları sırası ilə aç, mövzu izahını oxu və verilən sual və ya praktik addımı tamamla. Cavabın yoxlandıqdan sonra növbəti Task-a keçə bilərsən.",
  },
  {
    id: "roadmap",
    question: "Təlim xəritəsi nə üçündür?",
    answer:
      "Təlim xəritəsi mövzuları öyrənmə istiqamətlərinə və mərhələlərə bölür. Oradan sənə uyğun yolu görə, açıq Room-ları seçə və növbəti öyrənmə addımını planlaşdıra bilərsən.",
  },
  {
    id: "progress",
    question: "İrəliləyişimi harada görə bilərəm?",
    answer:
      "Dashboard səhifəsində tamamladığın Room və Task-ları, topladığın xalları və ümumi irəliləyişini görə bilərsən. Room kartlarındakı göstəricilər də hər təlim üzrə vəziyyətini göstərir.",
  },
  {
    id: "teacher-panel",
    question: "Müəllim panelindən necə istifadə olunur?",
    answer:
      "Müəllim hesabı ilə daxil olduqdan sonra müəllim panelindən siniflərini və şagirdləri idarə edə, Room təyin edə və onların təlim irəliləyişini izləyə bilərsən.",
  },
] as const;

const UNKNOWN_QUESTION_REPLY =
  "Bu sualın cavabını hələ bilmirəm. Hazır suallardan birini seçə və ya FAQ səhifəsinə baxa bilərsən.";

function normalizeQuestion(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("az")
    .replace(/\s+/g, " ")
    .replace(/[?!.,]+$/g, "");
}

export function createKiberBotExchange(input: string): KiberBotExchange | null {
  const userText = input.trim();

  if (!userText) return null;

  const normalizedInput = normalizeQuestion(userText);
  const suggestion = KIBERBOT_SUGGESTIONS.find(
    (item) => normalizeQuestion(item.question) === normalizedInput,
  );

  return {
    userText,
    reply: suggestion?.answer ?? UNKNOWN_QUESTION_REPLY,
  };
}
