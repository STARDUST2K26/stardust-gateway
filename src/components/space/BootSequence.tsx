import { useEffect, useMemo, useRef, useState } from "react";

const LINES = [
  { t: "> mounting sealed archive · project stardust …", d: 420 },
  { t: "> declassification order 71-Ω accepted", d: 620 },
  { t: "> locating asteria records …", d: 700 },
  { t: "> mirror relay index recovered", d: 560 },
  { t: "", d: 180 },
  { t: "  MISSION           ASTERIA / 1971", d: 260 },
  { t: "  RELAY             MIRROR", d: 260 },
  { t: "  CLASSIFICATION    Ω", d: 300 },
  { t: "  FILE INTEGRITY    0.02%", d: 420 },
  { t: "", d: 180 },
  { t: "> inquiry failed — agencies, laboratories, intelligence", d: 620 },
  { t: "> reassigning case file to civilian analysts", d: 640 },
  { t: "> opening the record …", d: 700 },
];

/**
 * Scenes 1-3: silence, the seal breaks, the record opens.
 * A typed console over pure black that dissolves into the star field.
 */
export function BootSequence({ onDone }: { onDone: () => void }) {
  const [visible, setVisible] = useState<string[]>([]);
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState<"typing" | "flash" | "gone">("typing");
  const idx = useRef(0);
  const done = useRef(false);

  const reduce = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  useEffect(() => {
    if (reduce) {
      setPhase("gone");
      onDone();
      return;
    }
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const finish = () => {
      if (done.current) return;
      done.current = true;
      setPhase("flash");
      onDone();
      setTimeout(() => !cancelled && setPhase("gone"), 1400);
    };

    const runLine = () => {
      const line = LINES[idx.current];
      if (!line) return finish();
      let i = 0;
      const speed = line.t.startsWith("  ") ? 9 : 17;
      const tick = () => {
        if (cancelled) return;
        i++;
        setTyped(line.t.slice(0, i));
        if (i < line.t.length) {
          timer = setTimeout(tick, speed + Math.random() * 22);
        } else {
          timer = setTimeout(() => {
            if (cancelled) return;
            setVisible((v) => [...v, line.t]);
            setTyped("");
            idx.current++;
            runLine();
          }, line.d);
        }
      };
      tick();
    };

    const skip = () => finish();
    window.addEventListener("keydown", skip, { once: true });
    window.addEventListener("pointerdown", skip, { once: true });
    timer = setTimeout(runLine, 1200);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, [onDone, reduce]);

  if (phase === "gone") return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-[#000000] px-6 transition-opacity duration-[1200ms] ease-[var(--ease-cine)]"
      style={{ opacity: phase === "flash" ? 0 : 1, pointerEvents: phase === "flash" ? "none" : "auto" }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.16] grid-floor" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-signal/50 blur-[1px]" style={{ animation: "scanline 6s linear infinite" }} />

      <div className="relative w-full max-w-[720px] font-mono text-[12px] leading-[2.1] tracking-[0.06em] text-signal/85 sm:text-[13px]">
        {visible.map((l, i) => (
          <div key={i} className={l.startsWith("  ") ? "text-foreground/90" : ""}>
            {l || "\u00A0"}
          </div>
        ))}
        <div className={typed.startsWith("  ") ? "text-foreground/90" : ""}>
          {typed}
          <span className="caret ml-0.5 inline-block h-[1em] w-[7px] translate-y-[2px] bg-signal" />
        </div>
      </div>

      <div className="label-xs absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground/60">
        press any key to skip
      </div>
    </div>
  );
}
