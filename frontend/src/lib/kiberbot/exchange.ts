export type KiberBotExchange = {
  userText: string;
  reply: string;
};

export function createKiberBotExchange(input: string): KiberBotExchange | null {
  const userText = input.trim();

  if (!userText) return null;

  return {
    userText,
    reply:
      "KiberBot xidməti hazırda aktiv deyil. Tezliklə burada sənə kömək edə biləcəyəm.",
  };
}
