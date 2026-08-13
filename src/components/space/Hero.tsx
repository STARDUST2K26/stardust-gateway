import { useEffect, useState } from "react";

function pad(n: number) {
  return String(Math.max(0, n)).padStart(2, "0");
}

/** The only scene on the landing page: the case-file title card. */
export function Hero({
  ready,
  startTime,
  onBegin,
}: {
  ready: boolean;
  startTime: string;
  onBegin: () => void;
}) {
  const TARGET = new Date(startTime).getTime();


  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = TARGET - Date.now();
      setT({
        d: Math.floor(diff / 86400000),
        h: Math.floor(diff / 3600000) % 24,
        m: Math.floor(diff / 60000) % 60,
        s: Math.floor(diff / 1000) % 60,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [TARGET]);

  return (
    <section
      id="hero"
      className="relative flex min-h-[100svh] w-full max-w-full flex-col items-center justify-center overflow-x-clip px-5 text-center sm:px-6"
    >
      <div
        className="w-full max-w-full transition-all duration-[1600ms] ease-[var(--ease-cine)]"
        style={{
          opacity: ready ? 1 : 0,
          transform: ready ? "none" : "scale(1.06) translateY(26px)",
          filter: ready ? "blur(0)" : "blur(14px)",
        }}
      >
        <div className="mb-10 flex flex-col items-center gap-3">
          <span className="label-xs text-signal/80">classified · file 71-Ω · declassified 2026</span>
          <span className="hairline w-40" />
        </div>

        <h1 className="anim-glitch mx-auto max-w-full whitespace-nowrap pl-[0.16em] font-display text-[clamp(1.9rem,11.4vw,10rem)] font-semibold leading-[0.9] tracking-[0.16em] text-glow">
          STARDUST
        </h1>

        <p className="mx-auto mt-8 max-w-[52ch] font-mono text-[11px] uppercase leading-[2.4] tracking-[0.34em] text-muted-foreground sm:text-xs">
          STARDUST · Computer Week 2026
        </p>

        <p className="mx-auto mt-7 max-w-[54ch] text-sm leading-[1.9] text-foreground/60">
          In 1971 the ASTERIA mission stopped transmitting. The records were sealed,
          the MIRROR system was buried, and every institutional inquiry failed. The
          investigation is now yours.
        </p>

        <div className="mt-12 flex flex-col items-center gap-8">
          <button
            type="button"
            onClick={onBegin}
            className="group relative inline-flex items-center gap-4 overflow-hidden rounded-full border border-signal/30 bg-signal/[0.06] px-9 py-4 font-mono text-[11px] uppercase tracking-[0.34em] text-foreground transition-all duration-700 ease-[var(--ease-cine)] hover:border-signal/70 hover:bg-signal/[0.12]"
            style={{ boxShadow: "var(--glow-signal)" }}
          >
            <span className="relative z-10">Register Access Code</span>
            <span className="relative z-10 h-1.5 w-1.5 rounded-full bg-signal shadow-[0_0_14px_var(--signal)]" />
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-signal/25 to-transparent transition-transform duration-1000 ease-[var(--ease-cine)] group-hover:translate-x-full" />
          </button>

          <div className="flex items-center gap-6 font-mono text-xs text-foreground/80 sm:gap-9">
            {[
              ["DAYS", t.d],
              ["HRS", t.h],
              ["MIN", t.m],
              ["SEC", t.s],
            ].map(([label, value]) => (
              <div key={label as string} className="flex flex-col items-center gap-2">
                <span className="text-xl tabular-nums tracking-[0.12em] sm:text-2xl">
                  {pad(value as number)}
                </span>
                <span className="label-xs text-[9px]">{label as string}</span>
              </div>
            ))}
          </div>

          <span className="label-xs text-[9px] text-foreground/35">
            {/* until the archive is unsealed */}
          </span>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3">
        <span className="label-xs text-[9px]">{/* the briefing plays on entry */}</span>
        <span className="h-10 w-px bg-gradient-to-b from-signal/70 to-transparent" />
      </div>

    </section>
  );
}
