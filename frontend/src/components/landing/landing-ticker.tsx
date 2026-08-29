const SIGNALS = [
  { tone: "bg-emerald-400", text: "PLATFORMA AKTİVDİR · MƏZMUN ARTIR" },
  { tone: "bg-red-400", text: "REAL VM YOXDUR · SSENARİ SİMULYASİYASI" },
  { tone: "bg-emerald-400", text: "OXU → PRAKTİKA → YOXLANIŞ → XAL" },
  { tone: "bg-red-400", text: "REYTİNQ SİNİF DAXİLİNDƏ QALIR" },
];

/// Reuses the dashboard ticker motif with static, verifiable claims — the public
/// page has no session to pull live counters from.
export function LandingTicker() {
  return (
    <div className="threat-ticker border-b border-white/[0.055] bg-black/30" aria-hidden="true">
      <div className="threat-ticker__track">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center gap-10 pr-10">
            {SIGNALS.map((signal) => (
              <span key={signal.text}>
                <i className={signal.tone} />
                {signal.text}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
