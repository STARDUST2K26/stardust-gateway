import { Reveal, SceneTag, useReveal } from "./Reveal";

const PHASES = [
  { code: "P-01", name: "File Issued", time: "14 NOV · 09:00", note: "Callsigns assigned. Archive handshake." },
  { code: "P-02", name: "First Reading", time: "14 NOV · 13:30", note: "Layers I–III released to analysts." },
  { code: "P-03", name: "Blackout", time: "15 NOV · 02:00", note: "External networks severed. Offline forensics only." },
  { code: "P-04", name: "Deep Archive", time: "15 NOV · 10:00", note: "Layers IV–VI. MIRROR hardware records unseal." },
  { code: "P-05", name: "Final Folder", time: "15 NOV · 18:00", note: "Layer Ω. One key. One crew." },
];

/** Scene 6a — the investigation timeline drawn as the ASTERIA trajectory. */
export function FlightPath() {
  const { ref, seen } = useReveal<HTMLDivElement>(0.2);

  return (
    <section id="path" className="relative mx-auto max-w-6xl px-6 py-32 sm:py-40">
      <Reveal>
        <SceneTag index="SCENE 06" title="case timeline" />
      </Reveal>

      <Reveal delay={100}>
        <h2 className="mt-12 max-w-[18ch] font-display text-[clamp(1.9rem,5vw,3.6rem)] font-medium leading-[1.05]">
          Thirty-six hours of declassification.
        </h2>
      </Reveal>

      <div ref={ref} className="relative mt-20">
        <svg
          viewBox="0 0 1000 300"
          className="pointer-events-none absolute inset-x-0 top-1/2 hidden h-[300px] w-full -translate-y-1/2 lg:block"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="traj" x1="0" x2="1">
              <stop offset="0%" stopColor="var(--signal)" stopOpacity="0.05" />
              <stop offset="45%" stopColor="var(--signal)" stopOpacity="0.85" />
              <stop offset="100%" stopColor="var(--violet)" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          <path
            d="M10,230 C220,60 340,60 500,150 C660,240 780,240 990,70"
            fill="none"
            stroke="url(#traj)"
            strokeWidth="1.4"
            strokeDasharray="2200"
            strokeDashoffset={seen ? 0 : 2200}
            style={{ transition: "stroke-dashoffset 3.2s var(--ease-cine)" }}
          />
          <path
            d="M10,230 C220,60 340,60 500,150 C660,240 780,240 990,70"
            fill="none"
            stroke="var(--signal)"
            strokeWidth="6"
            opacity="0.07"
            filter="blur(6px)"
          />
        </svg>

        <ol className="relative grid gap-10 lg:grid-cols-5 lg:gap-4">
          {PHASES.map((p, i) => (
            <Reveal key={p.code} delay={200 + i * 130}>
              <li
                className="group relative flex gap-5 lg:flex-col lg:gap-6"
                style={{ transform: `translateY(${[70, -10, 40, 90, -20][i]}px)` }}
              >
                <div className="relative mt-1 flex h-3 w-3 shrink-0 items-center justify-center lg:mt-0">
                  <span className="absolute h-3 w-3 rounded-full border border-signal/60" />
                  <span
                    className="absolute h-3 w-3 rounded-full border border-signal/50"
                    style={{ animation: "pulseRing 3.4s var(--ease-cine) infinite", animationDelay: `${i * 400}ms` }}
                  />
                  <span className="h-1 w-1 rounded-full bg-signal shadow-[0_0_12px_var(--signal)]" />
                </div>

                <div className="lg:pr-4">
                  <div className="label-xs text-[9px] text-signal/80">{p.code}</div>
                  <h3 className="mt-2 font-display text-xl tracking-[0.03em] transition-colors duration-500 group-hover:text-glow">
                    {p.name}
                  </h3>
                  <div className="mt-2 font-mono text-[10px] tracking-[0.22em] text-foreground/45">
                    {p.time}
                  </div>
                  <p className="mt-3 max-w-[26ch] text-[13px] leading-[1.8] text-foreground/55">
                    {p.note}
                  </p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
