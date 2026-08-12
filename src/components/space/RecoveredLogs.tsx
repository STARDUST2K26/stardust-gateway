import { Reveal, SceneTag } from "./Reveal";

const LOGS = [
  {
    id: "LOG 001",
    stamp: "14 NOV 1971 · 04:41 GMT",
    src: "GOLDSTONE / TRACK 3",
    body: "ASTERIA carrier terminated mid-frame. No decay curve, no debris signature. Loss is inconsistent with vehicle failure.",
    state: "RECOVERED",
  },
  {
    id: "LOG 014",
    stamp: "19 NOV 1971 · 07:52 GMT",
    src: "MIRROR PROGRAMME OFFICE",
    body: "The relay returned material we did not transmit. Layer two resolves only when queried in the order it expects. It is not concealment. It is examination.",
    state: "RECOVERED",
  },
  {
    id: "LOG 027",
    stamp: "02 DEC 1971 · 19:06 GMT",
    src: "UNATTRIBUTED",
    body: "▁▂ we counted the ones who kept listening ▂▁ ██ redacted ██ nine remained ██",
    state: "CORRUPTED",
  },
  {
    id: "LOG 033",
    stamp: "08 JAN 1972 · 23:59 GMT",
    src: "DIRECTORATE / STARDUST",
    body: "Inquiry closed. Material sealed for fifty-five years. Reassignment to non-institutional analysts authorised on expiry.",
    state: "SEALED",
  },
];

/** Scene 5 — Recovered records from the STARDUST archive. */
export function RecoveredLogs() {
  return (
    <section id="logs" className="relative mx-auto max-w-6xl px-6 py-32 sm:py-40">
      <Reveal>
        <SceneTag index="SCENE 05" title="recovered records" />
      </Reveal>

      <Reveal delay={100}>
        <h2 className="mt-12 max-w-[16ch] font-display text-[clamp(1.9rem,5vw,3.6rem)] font-medium leading-[1.05]">
          Fragments pulled from the sealed file.
        </h2>
      </Reveal>

      <div className="mt-16 space-y-px border-y border-border">
        {LOGS.map((log, i) => (
          <Reveal key={log.id} delay={140 + i * 90}>
            <article className="group relative grid gap-4 px-1 py-8 transition-colors duration-700 ease-[var(--ease-cine)] hover:bg-signal/[0.035] sm:grid-cols-[150px_1fr_120px] sm:items-baseline sm:gap-8 sm:px-6">
              <div>
                <div className="font-mono text-xs tracking-[0.2em] text-signal/85">{log.id}</div>
                <div className="label-xs mt-2 text-[9px]">{log.stamp}</div>
              </div>

              <div>
                <div className="label-xs text-[9px] text-foreground/40">{log.src}</div>
                <p
                  className={`mt-3 text-[15px] leading-[1.85] ${
                    log.state === "CORRUPTED"
                      ? "font-mono text-sm text-warning/75"
                      : "text-foreground/70"
                  }`}
                >
                  {log.body}
                </p>
              </div>

              <div className="sm:text-right">
                <span
                  className={`font-mono text-[10px] uppercase tracking-[0.28em] ${
                    log.state === "CORRUPTED" ? "text-warning/80" : "text-foreground/45"
                  }`}
                >
                  {log.state}
                </span>
              </div>

              <span className="pointer-events-none absolute inset-y-0 left-0 w-px scale-y-0 bg-signal/70 transition-transform duration-700 ease-[var(--ease-cine)] group-hover:scale-y-100" />
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
