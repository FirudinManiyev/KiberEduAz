"use client";

import { FormEvent, KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import { Bot, ChevronDown, MessageCircle, Send, ShieldCheck, Sparkles, X } from "lucide-react";
import { createKiberBotExchange } from "@/lib/kiberbot/exchange";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

const INITIAL_MESSAGE: ChatMessage = {
  id: "kiberbot-welcome",
  role: "assistant",
  text: "Salam! Mən KiberBotam. KiberEduAz və kibertəhlükəsizlik üzrə sualını yaza bilərsən.",
};

export function KiberBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [isTyping, setIsTyping] = useState(false);
  const panelId = useId();
  const descriptionId = useId();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const replyTimerRef = useRef<number | null>(null);
  const messageSequenceRef = useRef(0);

  useEffect(() => {
    if (!isOpen) return;

    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 120);

    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    messageListRef.current?.scrollTo({
      top: messageListRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [isOpen, isTyping, messages]);

  useEffect(
    () => () => {
      if (replyTimerRef.current !== null) window.clearTimeout(replyTimerRef.current);
    },
    [],
  );

  function submitMessage(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (isTyping) return;

    const exchange = createKiberBotExchange(draft);
    if (!exchange) return;

    const sequence = messageSequenceRef.current++;
    setMessages((current) => [
      ...current,
      { id: `user-${sequence}`, role: "user", text: exchange.userText },
    ]);
    setDraft("");
    setIsTyping(true);

    replyTimerRef.current = window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        { id: `assistant-${sequence}`, role: "assistant", text: exchange.reply },
      ]);
      setIsTyping(false);
      replyTimerRef.current = null;
    }, 650);
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitMessage();
    }
  }

  return (
    <aside className="kiberbot fixed bottom-4 right-4 z-[80] sm:bottom-6 sm:right-6">
      {isOpen && (
        <section
          id={panelId}
          className="kiberbot-panel mb-3 flex h-[min(36rem,calc(100svh-7rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-[1.4rem] border border-white/10 bg-[#111518]/95 shadow-[0_32px_110px_rgba(0,0,0,.62),0_0_55px_rgba(239,68,68,.08)] backdrop-blur-2xl"
          role="dialog"
          aria-modal="false"
          aria-labelledby={`${panelId}-title`}
          aria-describedby={descriptionId}
        >
          <header className="relative overflow-hidden border-b border-white/[0.07] bg-gradient-to-br from-red-500/[0.12] via-transparent to-emerald-400/[0.07] px-4 py-3.5">
            <div className="cyber-grid pointer-events-none absolute inset-0 opacity-[0.09]" aria-hidden="true" />
            <div className="relative flex items-center gap-3">
              <span className="relative grid size-10 shrink-0 place-items-center rounded-xl border border-red-300/20 bg-red-300/[0.08] text-red-200">
                <Bot className="size-5" aria-hidden="true" />
                <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-[#171a1d] bg-amber-300" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 id={`${panelId}-title`} className="text-sm font-bold text-white">
                    KiberBot
                  </h2>
                  <span className="rounded-full border border-amber-300/15 bg-amber-300/[0.06] px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.14em] text-amber-200">
                    Tezliklə aktiv
                  </span>
                </div>
                <p id={descriptionId} className="mt-0.5 text-[10px] text-slate-500">
                  KiberEduAz rəqəmsal köməkçisi
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="grid size-9 place-items-center rounded-xl border border-white/[0.07] text-slate-400 transition hover:border-white/15 hover:bg-white/[0.04] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                aria-label="KiberBot söhbətini bağla"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          </header>

          <div
            ref={messageListRef}
            className="kiberbot-messages flex-1 space-y-4 overflow-y-auto px-4 py-5"
            role="log"
            aria-live="polite"
            aria-relevant="additions"
          >
            <div className="flex items-center justify-center gap-2 text-[9px] uppercase tracking-[0.13em] text-slate-600">
              <ShieldCheck className="size-3" aria-hidden="true" />
              Lokal önizləmə · məlumat göndərilmir
            </div>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`kiberbot-message flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={
                    message.role === "user"
                      ? "max-w-[84%] rounded-2xl rounded-br-md bg-red-500 px-3.5 py-2.5 text-xs leading-5 text-white shadow-[0_10px_32px_rgba(239,68,68,.18)]"
                      : "max-w-[88%] rounded-2xl rounded-bl-md border border-white/[0.07] bg-white/[0.035] px-3.5 py-2.5 text-xs leading-5 text-slate-300"
                  }
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="kiberbot-message flex justify-start" role="status" aria-label="KiberBot yazır">
                <div className="kiberbot-typing flex items-center gap-1 rounded-2xl rounded-bl-md border border-white/[0.07] bg-white/[0.035] px-4 py-3">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
          </div>

          <form onSubmit={submitMessage} className="border-t border-white/[0.07] bg-black/15 p-3">
            <div className="flex items-end gap-2 rounded-2xl border border-white/[0.08] bg-black/20 p-1.5 transition focus-within:border-emerald-300/25 focus-within:ring-2 focus-within:ring-emerald-300/[0.06]">
              <textarea
                ref={inputRef}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleInputKeyDown}
                rows={1}
                maxLength={600}
                placeholder="Mesajını yaz…"
                aria-label="KiberBot üçün mesaj"
                className="max-h-24 min-h-10 flex-1 resize-none bg-transparent px-2.5 py-2.5 text-xs leading-5 text-white outline-none placeholder:text-slate-600"
              />
              <button
                type="submit"
                disabled={!draft.trim() || isTyping}
                className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-400 text-emerald-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
                aria-label="Mesajı göndər"
              >
                <Send className="size-4" aria-hidden="true" />
              </button>
            </div>
            <p className="mt-2 flex items-center justify-center gap-1.5 text-[9px] text-slate-600">
              <Sparkles className="size-3" aria-hidden="true" />
              Cavablar hazırda nümunə rejimindədir
            </p>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={isOpen ? "KiberBot söhbətini kiçilt" : "KiberBot söhbətini aç"}
        className="kiberbot-launcher group ml-auto flex min-h-14 items-center gap-3 rounded-2xl border border-red-300/20 bg-[#171a1d]/95 p-2 pr-4 text-left shadow-[0_18px_60px_rgba(0,0,0,.5),0_0_34px_rgba(239,68,68,.11)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-red-300/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
      >
        <span className="relative grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-red-500 to-red-700 text-white shadow-[0_8px_26px_rgba(239,68,68,.28)]">
          {isOpen ? <ChevronDown className="size-5" aria-hidden="true" /> : <MessageCircle className="size-5" aria-hidden="true" />}
          {!isOpen && <span className="kiberbot-launcher__pulse absolute inset-0 rounded-xl border border-red-300/40" />}
        </span>
        <span className="hidden sm:block">
          <span className="block text-xs font-bold text-white">KiberBot</span>
          <span className="mt-0.5 block text-[9px] text-slate-500">Sualını yaz</span>
        </span>
        <span className="sr-only">Kibertəhlükəsizlik suallarını yaza bilərsən.</span>
      </button>
    </aside>
  );
}
