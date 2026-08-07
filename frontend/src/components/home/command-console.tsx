"use client";

import Link from "next/link";
import { CheckCircle2, Crosshair, RotateCcw, ShieldAlert, Terminal, XCircle } from "lucide-react";
import { useState } from "react";
import { LinkLoadingIndicator } from "@/components/feedback/link-loading-indicator";

const scenarios = {
  logs: {
    label: "Log analizi",
    prompt: "Şübhəli giriş cəhdini seç",
    lines: [
      "10:14:08  192.168.1.24  LOGIN_SUCCESS  student-04",
      "10:14:21  10.0.0.18     FILE_OPEN      lesson-2.pdf",
      "10:14:32  185.91.72.4   LOGIN_FAIL ×17 admin",
      "10:15:01  192.168.1.30  LOGOUT          student-11",
    ],
    answer: 2,
    hint: "Qısa müddətdə 17 uğursuz admin girişi brute-force cəhdinə işarə edir.",
  },
  mail: {
    label: "Phishing siqnalı",
    prompt: "Ən riskli e-poçt əlamətini seç",
    lines: [
      "FROM     support@micr0soft-help.co",
      "SUBJECT  Hesabınız bloklanacaq!",
      "ACTION   Dərhal linkə daxil olun",
      "FILE     security_update.zip.exe",
    ],
    answer: 3,
    hint: "İkiqat uzantı icra olunan faylı sənəd kimi gizlədir və ən kritik siqnaldır.",
  },
} as const;

type ScenarioKey = keyof typeof scenarios;

export function CommandConsole() {
  const [scenarioKey, setScenarioKey] = useState<ScenarioKey>("logs");
  const [selected, setSelected] = useState<number | null>(null);
  const scenario = scenarios[scenarioKey];
  const correct = selected === scenario.answer;

  function switchScenario(next: ScenarioKey) {
    setScenarioKey(next);
    setSelected(null);
  }

  return (
    <div className="command-console relative overflow-hidden rounded-[22px] border border-red-300/15 bg-[#1a1c1e]/95 shadow-[0_35px_100px_rgba(0,0,0,.38)]">
      <div className="command-console__glow" />
      <div className="flex items-center justify-between border-b border-white/[0.07] bg-white/[0.022] px-4 py-3">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-red-500/80 shadow-[0_0_10px_rgba(239,68,68,.45)]" />
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-emerald-400/75 shadow-[0_0_10px_rgba(52,211,153,.35)]" />
        </div>
        <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.15em] text-slate-500">
          <span className="relative flex size-1.5"><span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" /><span className="relative size-1.5 rounded-full bg-emerald-400" /></span>
          LIVE_SKILL_CHECK
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-red-400">Günün mikro-missiyası</p>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.035em] text-white sm:text-2xl">Təhdidi 30 saniyəyə tap</h2>
            <p className="mt-1 text-xs text-slate-500">Cavabını seç və ani analiz al.</p>
          </div>
          <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-red-300/15 bg-red-300/[0.07] text-red-300">
            <Crosshair className="size-5 animate-[spin_8s_linear_infinite]" aria-hidden="true" />
          </span>
        </div>

        <div className="mt-5 flex gap-1 rounded-xl bg-black/30 p-1">
          {(Object.keys(scenarios) as ScenarioKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => switchScenario(key)}
              className={`flex-1 rounded-lg px-3 py-2 text-[11px] font-semibold transition-all ${scenarioKey === key ? "bg-white/[0.09] text-white shadow" : "text-slate-500 hover:text-slate-300"}`}
            >
              {scenarios[key].label}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-red-300/10 bg-[#141617] p-3 font-mono">
          <div className="mb-3 flex items-center gap-2 border-b border-white/[0.055] pb-2.5 text-[10px] text-slate-500">
            <Terminal className="size-3.5 text-emerald-400" />
            {scenario.prompt}
          </div>
          <div className="grid gap-1.5">
            {scenario.lines.map((line, index) => {
              const isSelected = selected === index;
              const isCorrect = isSelected && correct;
              const isWrong = isSelected && !correct;
              return (
                <button
                  key={line}
                  type="button"
                  onClick={() => setSelected(index)}
                  className={`group/line flex items-center gap-2 rounded-lg border px-2.5 py-2.5 text-left text-[10px] leading-4 transition-all sm:text-[11px] ${
                    isCorrect
                      ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-200"
                      : isWrong
                        ? "border-red-300/30 bg-red-300/[0.09] text-red-200"
                        : "border-transparent text-slate-500 hover:translate-x-1 hover:border-white/[0.07] hover:bg-white/[0.035] hover:text-slate-300"
                  }`}
                >
                  <span className={`size-1.5 shrink-0 rounded-full ${isCorrect ? "bg-emerald-400" : isWrong ? "bg-red-400" : "bg-slate-700 group-hover/line:bg-red-400"}`} />
                  <span className="min-w-0 flex-1 break-all">{line}</span>
                  {isCorrect && <CheckCircle2 className="size-3.5 shrink-0" />}
                  {isWrong && <XCircle className="size-3.5 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {selected !== null ? (
          <div className={`mt-4 rounded-xl border p-3.5 ${correct ? "border-emerald-300/15 bg-emerald-300/[0.055]" : "border-red-300/15 bg-red-300/[0.055]"}`} role="status">
            <div className="flex gap-3">
              {correct ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" /> : <ShieldAlert className="mt-0.5 size-4 shrink-0 text-red-400" />}
              <div>
                <p className={`text-xs font-semibold ${correct ? "text-emerald-200" : "text-red-200"}`}>{correct ? "Təhdid aşkarlandı · +25 XP" : "Bu siqnal var, amma daha kritikini tap"}</p>
                <p className="mt-1 text-[10px] leading-4 text-slate-500">{correct ? scenario.hint : "Sətirləri riskin real təsirinə görə yenidən müqayisə et."}</p>
              </div>
              {!correct && <button type="button" onClick={() => setSelected(null)} className="ml-auto grid size-7 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-white/[0.06] hover:text-white" aria-label="Yenidən cəhd et"><RotateCcw className="size-3.5" /></button>}
            </div>
          </div>
        ) : (
          <div className="mt-4 flex items-center justify-between text-[10px] text-slate-600">
            <span>Bir sətir seç</span>
            <span className="font-mono text-emerald-500">REWARD: 25 XP</span>
          </div>
        )}

        <Link href="/rooms" prefetch className="group mt-5 flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3 text-xs font-semibold text-slate-300 transition-all hover:border-emerald-300/20 hover:bg-emerald-300/[0.055] hover:text-emerald-200">
          Tam missiyalara keç
          <span className="flex items-center gap-2"><LinkLoadingIndicator /><span className="transition-transform group-hover:translate-x-1">→</span></span>
        </Link>
      </div>
    </div>
  );
}
