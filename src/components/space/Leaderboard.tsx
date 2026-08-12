import { Reveal, SceneTag } from "./Reveal";

const CREWS = [
  { rank: "01", crew: "NULL PARALLAX", layers: 6, score: 48210, delta: "+2" },
  { rank: "02", crew: "ORBITAL DECAY", layers: 6, score: 46980, delta: "—" },
  { rank: "03", crew: "QUIET ARRAY", layers: 5, score: 44105, delta: "+5" },
  { rank: "04", crew: "SEVENTH SIGNAL", layers: 5, score: 41870, delta: "-1" },
  { rank: "05", crew: "COLD APERTURE", layers: 4, score: 39420, delta: "+3" },
];

/** Scene 6c — the previous inquiry board, kept on file. */
export function Leaderboard() {
  return (
    <section id="board" className="relative mx-auto max-w-6xl px-6 py-32 sm:py-40">
      <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div>
          <Reveal>
            <SceneTag index="SCENE 06.C" title="prior attempts" />
          </Reveal>
          <Reveal delay={90}>
            <h2 className="mt-10 max-w-[14ch] font-display text-[clamp(1.9rem,5vw,3.4rem)] font-medium leading-[1.05]">
              Standings from the last inquiry.
            </h2>
            <p className="mt-6 max-w-[38ch] text-[15px] leading-[1.9] text-foreground/55">
              Results from Computer Week 2025. The board resets the moment your callsign
              is issued.
            </p>
          </Reveal>
        </div>

        <Reveal delay={180}>
          <div className="glass relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <span className="label-xs text-[9px]">stardust archive · cw2025 final</span>
              <span className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.28em] text-signal/80">
                <span className="anim-breathe h-1.5 w-1.5 rounded-full bg-signal" />
                sealed record
              </span>
            </div>

            <ul>
              {CREWS.map((c, i) => (
                <li
                  key={c.crew}
                  className="group grid grid-cols-[42px_1fr_auto] items-center gap-4 border-b border-border/60 px-6 py-5 transition-colors duration-500 hover:bg-signal/[0.05]"
                >
                  <span
                    className={`font-display text-xl tabular-nums ${i === 0 ? "text-glow text-signal" : "text-foreground/35"}`}
                  >
                    {c.rank}
                  </span>
                  <div>
                    <div className="font-mono text-[13px] tracking-[0.16em]">{c.crew}</div>
                    <div className="mt-2 flex gap-1">
                      {Array.from({ length: 7 }).map((_, k) => (
                        <span
                          key={k}
                          className={`h-[3px] w-6 ${k < c.layers ? "bg-signal/80" : "bg-border"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm tabular-nums text-foreground/85">
                      {c.score.toLocaleString()}
                    </div>
                    <div
                      className={`label-xs mt-1 text-[9px] ${c.delta.startsWith("-") ? "text-warning/80" : ""}`}
                    >
                      {c.delta}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
