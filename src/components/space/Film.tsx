import { useCallback, useEffect, useRef, useState } from "react";

import { CodeTerminal } from "./CodeTerminal";
import type { MissionStat } from "@/lib/mission";
import type { StaticTeamClue } from "@/lib/static-config";
import dishImg from "@/assets/film-dish.jpg";
import probeImg from "@/assets/film-probe.jpg";
import controlImg from "@/assets/film-control.jpg";
import dossierImg from "@/assets/film-dossier-doc.png";

type Act = {
  id: string;
  kicker: string;
  title: string;
  lines: string[];
  image?: string;
  contain?: boolean;
  duration: number;
};

const ACTS: Act[] = [
  {
    id: "act-01",
    kicker: "reel 01 · 14 november 1971",
    title: "FORTY-ONE MINUTES AFTER FINAL BURN",
    lines: [
      "The ASTERIA probe stopped answering.",
      "The telemetry did not degrade. It was cut.",
    ],
    image: dishImg,
    duration: 7200,
  },
  {
    id: "act-02",
    kicker: "reel 02 · asteria",
    title: "ASTERIA DID NOT FAIL. IT WAS SILENCED.",
    lines: [
      "No decay curve. No debris signature. No wreckage on any track.",
      "Goldstone logged a carrier that ended mid-frame — a sound no failure makes.",
    ],
    image: probeImg,
    duration: 7800,
  },
  {
    id: "act-03",
    kicker: "reel 03 · the mirror system",
    title: "SOMETHING ANSWERED ON A CHANNEL NOBODY WAS USING",
    lines: [
      "MIRROR was an experimental relay. It was never supposed to be listening.",
      "It returned material we did not transmit — resolving only when queried in the order it expects.",
      "That is not concealment. That is examination.",
    ],
    image: controlImg,
    duration: 8600,
  },
  {
    id: "act-04",
    kicker: "reel 04 · recovered records",
    title: "FRAGMENTS PULLED FROM THE SEALED FILE",
    lines: [
      "LOG 001 · 04:41 GMT — carrier terminated mid-frame. Inconsistent with vehicle failure.",
      "LOG 027 · UNATTRIBUTED — ▁▂ we counted the ones who kept listening ▂▁ ██ nine remained ██",
      "LOG 033 · DIRECTORATE — inquiry closed. Material sealed for fifty-five years.",
    ],
    image: dossierImg,
    contain: true,
    duration: 9200,
  },
  {
    id: "act-stats",
    kicker: "reel 05 · case parameters",
    title: "THE FILE, IN NUMBERS",
    lines: [],
    duration: 6600,
  },
  {
    id: "act-06",
    kicker: "reel 06 · the seven layers",
    title: "THREE SEALED LAYERS. ONE KEY.",
    lines: [
      "Ciphers · forensic residue · hardware traces · network records.",
      "Each layer was sealed by a different hand, in a different year, for a different reason.",
      "Open them in order and the file opens itself.",
    ],
    duration: 8200,
  },
  {
    id: "act-07",
    kicker: "reel 07 · your orders",
    title: "THE INVESTIGATION IS NOW YOURS",
    lines: [
      "Three institutional inquiries returned nothing usable.",
      "The material has been handed to civilian analysts for thirty-six hours.",
      "Every access to the case file is logged against your callsign.",
    ],
    duration: 8000,
  },
  {
    id: "act-terminal",
    kicker: "reel 08 · verification",
    title: "ENTER THE CODE YOU FOUND",
    lines: [],
    duration: 0,
  },
];

const LAST = ACTS.length - 1;

/**
 * The film. Auto-plays act by act, click advances, Enter jumps to the
 * verification terminal, Esc returns to the title card.
 */
export function Film({
  stats,
  activeTeam,
  onExit,
}: {
  stats: MissionStat[];
  activeTeam?: StaticTeamClue | null;
  onExit: () => void;
}) {
  const [i, setI] = useState(0);
  const [prevImage, setPrevImage] = useState<{ src: string; contain?: boolean; key: number } | null>(
    null,
  );
  const lastImage = useRef<{ src: string; contain?: boolean } | null>(null);
  const act = ACTS[i]!;
  const atTerminal = i === LAST;

  const next = useCallback(() => setI((v) => Math.min(LAST, v + 1)), []);

  useEffect(() => {
    if (!act.duration) return;
    const id = setTimeout(next, act.duration);
    return () => clearTimeout(id);
  }, [act, next]);

  // cross-dissolve: keep the outgoing frame alive while the new one blooms in
  useEffect(() => {
    if (lastImage.current && lastImage.current.src !== act.image) {
      setPrevImage({ ...lastImage.current, key: Date.now() });
    }
    lastImage.current = act.image ? { src: act.image, contain: act.contain } : null;
  }, [act]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onExit();
      if (e.key === "Enter" && !atTerminal) {
        e.preventDefault();
        setI(LAST);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [atTerminal, onExit]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-void"
      onClick={() => {
        if (!atTerminal) next();
      }}
    >
      {activeTeam && (
        <div className="absolute top-4 left-5 sm:left-8 z-30 flex items-center gap-2 rounded border border-signal/40 bg-black/80 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-signal shadow-[0_0_15px_rgba(0,255,170,0.2)]">
          <span className="h-2 w-2 rounded-full bg-signal animate-pulse" />
          <span>AUTHENTICATED: TEAM {activeTeam.teamName}</span>
        </div>
      )}
      <div className="anim-gate-weave absolute inset-0">
        {/* outgoing frame */}
        {prevImage && (
          <div key={prevImage.key} className="anim-img-out pointer-events-none absolute inset-0">
            <img
              src={prevImage.src}
              alt=""
              className={`h-full w-full grayscale contrast-125 ${
                prevImage.contain ? "object-contain opacity-70" : "object-cover opacity-40"
              }`}
            />
          </div>
        )}

        {/* incoming frame */}
        {act.image && (
          <div key={`${act.id}-img`} className="anim-img-in pointer-events-none absolute inset-0">
            <img
              src={act.image}
              alt=""
              width={1536}
              height={864}
              className={`anim-kenburns-pan h-full w-full grayscale contrast-125 ${
                act.contain ? "object-contain opacity-70" : "object-cover opacity-40"
              }`}
            />
            <div
              className={
                act.contain
                  ? "absolute inset-0 bg-void/70"
                  : "absolute inset-0 [background:radial-gradient(90%_70%_at_50%_50%,transparent_10%,var(--void)_92%)]"
              }
            />
          </div>
        )}

        {/* projector texture */}
        <div className="film-grain anim-grain-drift pointer-events-none absolute -inset-[6%] opacity-[0.09]" />
        <div className="scanlines anim-flicker pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute inset-0 [background:radial-gradient(120%_90%_at_50%_45%,transparent_35%,rgb(0_0_0/0.85)_100%)]" />
        <div className="anim-lamp pointer-events-none absolute inset-0 [background:radial-gradient(60%_45%_at_50%_40%,rgb(255_255_255/0.05),transparent_70%)]" />
        {/* emulsion scratch */}
        <div className="anim-scratch pointer-events-none absolute inset-y-0 left-[8%] w-px bg-foreground/40" />
      </div>

      {/* reel change flash */}
      <div key={`${act.id}-flash`} className="anim-reel-flash pointer-events-none absolute inset-0 bg-foreground/25" />

      {/* letterbox */}
      <div className="anim-shutter-top pointer-events-none absolute inset-x-0 top-0 z-20 bg-void" />
      <div className="anim-shutter-top pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-void" />

      {/* chapter progress */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex gap-1 px-4 pt-4">
        {ACTS.map((a, k) => (
          <span
            key={a.id}
            className={`h-px flex-1 transition-all duration-1000 ease-[var(--ease-cine)] ${
              k <= i ? "bg-signal/70 shadow-[0_0_10px_var(--signal)]" : "bg-foreground/15"
            }`}
          />
        ))}
      </div>

      <div className="relative z-10 flex h-full w-full items-center justify-center px-5 py-20 sm:px-10">
        <div key={act.id} className="w-full max-w-4xl text-center">
          <span
            className="anim-line-in label-xs block text-[9px] text-signal/70"
            style={{ animationDelay: "260ms" }}
          >
            {act.kicker}
          </span>
          <span
            className="anim-line-in hairline mx-auto mt-5 block w-24"
            style={{ animationDelay: "420ms" }}
          />

          <h2 className="anim-title-in mx-auto mt-8 max-w-[20ch] font-display text-[clamp(1.5rem,4.6vw,3.4rem)] font-medium leading-[1.06] tracking-[0.06em] text-glow">
            {act.title}
          </h2>

          {act.lines.length > 0 && (
            <div className="mx-auto mt-9 max-w-[62ch] space-y-4">
              {act.lines.map((line, k) => (
                <p
                  key={line}
                  className="anim-line-in font-mono text-[12.5px] leading-[2.1] text-foreground/60 sm:text-[13px]"
                  style={{ animationDelay: `${1100 + k * 460}ms` }}
                >
                  {line}
                </p>
              ))}
            </div>
          )}

          {act.id === "act-stats" && (
            <div className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-px border border-border bg-border/60 sm:grid-cols-4">
              {stats.map((s, k) => (
                <div
                  key={s.label}
                  className="anim-line-in glass px-4 py-8"
                  style={{ animationDelay: `${900 + k * 320}ms` }}
                >
                  <div className="font-display text-3xl tracking-[0.04em] text-glow">{s.value}</div>
                  <div className="label-xs mt-3 text-[9px]">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {atTerminal && (
            <div className="anim-film-in mt-10" onClick={(e) => e.stopPropagation()}>
              <CodeTerminal />
            </div>
          )}
        </div>
      </div>


      {/* controls */}
      <div className="absolute inset-x-0 bottom-4 z-20 flex items-center justify-between px-5 sm:px-8">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onExit();
          }}
          className="font-mono text-[9px] uppercase tracking-[0.32em] text-foreground/35 transition-colors duration-500 hover:text-signal"
        >
          Esc · close file
        </button>

        <span className="font-mono text-[9px] uppercase tracking-[0.32em] text-foreground/30">
          {atTerminal ? "awaiting fragment" : "click · next  ·  enter · skip to terminal"}
        </span>
      </div>
    </div>
  );
}
