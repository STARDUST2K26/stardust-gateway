import { useEffect, useMemo, useRef, useState } from "react";

const LINES = [
  { t: "> mounting sealed archive · project stardust …", d: 100 },
  { t: "> declassification order 71-Ω accepted", d: 140 },
  { t: "> locating asteria records …", d: 150 },
  { t: "> mirror relay index recovered", d: 120 },
  { t: "", d: 50 },
  { t: "  MISSION           ASTERIA / 1971", d: 60 },
  { t: "  RELAY             MIRROR", d: 60 },
  { t: "  CLASSIFICATION    Ω", d: 80 },
  { t: "  FILE INTEGRITY    0.02%", d: 100 },
  { t: "", d: 50 },
  { t: "> inquiry failed — agencies, laboratories, intelligence", d: 140 },
  { t: "> reassigning case file to civilian analysts", d: 140 },
  { t: "> opening the record …", d: 160 },
];

/**
 * Fast-loading typed console startup sequence over dark void.
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
      setTimeout(() => !cancelled && setPhase("gone"), 300);
    };

    const runLine = () => {
      const line = LINES[idx.current];
      if (!line) return finish();
      let i = 0;
      const speed = line.t.startsWith("  ") ? 3 : 5;
      const tick = () => {
        if (cancelled) return;
        i += 2; // Type 2 characters at once for high-speed terminal feel
        if (i > line.t.length) i = line.t.length;
        setTyped(line.t.slice(0, i));
        if (i < line.t.length) {
          timer = setTimeout(tick, speed);
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
    timer = setTimeout(runLine, 100);

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
      className="fixed inset-0 z-[90] flex items-center justify-center bg-[#000000] px-6 transition-opacity duration-300 ease-out"
      style={{ opacity: phase === "flash" ? 0 : 1, pointerEvents: phase === "flash" ? "none" : "auto" }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.16] grid-floor" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-signal/50 blur-[1px]" style={{ animation: "scanline 6s linear infinite" }} />

      <div className="relative w-full max-w-[720px] font-mono text-[12px] leading-[1.9] tracking-[0.06em] text-signal/85 sm:text-[13px]">
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
        click or press any key to skip
      </div>
    </div>
  );
}
