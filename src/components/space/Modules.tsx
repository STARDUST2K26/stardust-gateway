import { useRef } from "react";
import { Reveal, SceneTag } from "./Reveal";

const MODULES = [
  {
    id: "MOD-01",
    name: "Cryptanalysis",
    line: "Read what 1971 encrypted and forgot.",
    load: 0.86,
    hue: "var(--signal)",
  },
  {
    id: "MOD-02",
    name: "Digital Forensics",
    line: "Recover the half of the file that was erased.",
    load: 0.72,
    hue: "var(--primary)",
  },
  {
    id: "MOD-03",
    name: "Network Shadows",
    line: "Trace relay traffic that has no origin record.",
    load: 0.64,
    hue: "var(--signal)",
  },
  {
    id: "MOD-04",
    name: "Hardware Chamber",
    line: "Sealed boards, dead circuits, MIRROR hardware.",
    load: 0.91,
    hue: "var(--violet)",
  },
  {
    id: "MOD-05",
    name: "Reverse Engineering",
    line: "Disassemble the intent behind archived firmware.",
    load: 0.78,
    hue: "var(--primary)",
  },
  {
    id: "MOD-06",
    name: "Signal Intelligence",
    line: "Listen to the carrier beneath the carrier.",
    load: 0.55,
    hue: "var(--violet)",
  },
];

function Module({ mod, index }: { mod: (typeof MODULES)[number]; index: number }) {
  const ref = useRef<HTMLDivElement | null>(null);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
    el.style.transform = `perspective(1100px) rotateX(${(0.5 - py) * 7}deg) rotateY(${(px - 0.5) * 9}deg) translateZ(0)`;
  };

  const onLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = "perspective(1100px)";
  };

  return (
    <Reveal delay={index * 90}>
      <div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="group relative isolate h-full overflow-hidden border border-border/80 bg-hull/40 p-8 transition-[transform,border-color] duration-700 ease-[var(--ease-cine)] hover:border-signal/40"
        style={{ transform: "perspective(1100px)" }}
      >
        <span
          className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          style={{
            background: `radial-gradient(340px circle at var(--mx,50%) var(--my,50%), color-mix(in oklab, ${mod.hue} 22%, transparent), transparent 65%)`,
          }}
        />
        <span className="pointer-events-none absolute inset-0 -z-10 opacity-[0.05] grid-floor" />

        <div className="flex items-center justify-between">
          <span className="label-xs text-[9px] text-signal/80">{mod.id}</span>
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: mod.hue, boxShadow: `0 0 14px ${mod.hue}` }}
          />
        </div>

        <h3 className="mt-10 font-display text-2xl leading-tight tracking-[0.03em] sm:text-[28px]">
          {mod.name}
        </h3>
        <p className="mt-4 max-w-[26ch] text-[13.5px] leading-[1.8] text-foreground/55">
          {mod.line}
        </p>

        <div className="mt-12">
          <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.28em] text-foreground/40">
            <span>file integrity</span>
            <span>{Math.round(mod.load * 100)}%</span>
          </div>
          <div className="mt-3 h-px w-full bg-border">
            <div
              className="h-px transition-[width] duration-1000 ease-[var(--ease-cine)]"
              style={{ width: `${mod.load * 100}%`, background: mod.hue, boxShadow: `0 0 10px ${mod.hue}` }}
            />
          </div>
        </div>
      </div>
    </Reveal>
  );
}

/** Scene 6b — evidence categories held in the STARDUST file. */
export function Modules() {
  return (
    <section id="modules" className="relative mx-auto max-w-6xl px-6 py-32 sm:py-40">
      <Reveal>
        <SceneTag index="SCENE 06.B" title="evidence categories" />
      </Reveal>

      <Reveal delay={100}>
        <h2 className="mt-12 max-w-[20ch] font-display text-[clamp(1.9rem,5vw,3.6rem)] font-medium leading-[1.05]">
          Six categories of recovered evidence.
        </h2>
      </Reveal>

      <div className="mt-16 grid gap-px bg-border/50 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((m, i) => (
          <Module key={m.id} mod={m} index={i} />
        ))}
      </div>
    </section>
  );
}
