import { useState } from "react";
import { Reveal, SceneTag } from "./Reveal";

const FAQS = [
  {
    q: "Who may request access to the file?",
    a: "Any crew of four students. No prior clearance is required — STARDUST was reassigned to civilians precisely because credentials stopped helping.",
  },
  {
    q: "Do we need advanced security experience?",
    a: "No. Layer I can be opened with curiosity and patience. The deeper folders reward experience but never require it.",
  },
  {
    q: "Where does the investigation actually take place?",
    a: "Not here. This page is the briefing. The case file itself lives in a separate secured archive, which will be provided to your crew after registration.",
  },
  {
    q: "What do we bring?",
    a: "A laptop per analyst, a charger, and a callsign. Everything else is issued with the file.",
  },
  {
    q: "Is there a cost?",
    a: "Access is free for enrolled students. Registration closes when 60 crews are logged.",
  },
];

/** Scene 7 — questions logged before the file was reassigned. */
export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative mx-auto max-w-6xl px-6 py-32 sm:py-40">
      <Reveal>
        <SceneTag index="SCENE 07" title="questions on record" />
      </Reveal>

      <div className="mt-14 grid gap-14 lg:grid-cols-[0.75fr_1.25fr]">
        <Reveal delay={90}>
          <h2 className="max-w-[12ch] font-display text-[clamp(1.9rem,5vw,3.4rem)] font-medium leading-[1.05]">
            Before you open it.
          </h2>
        </Reveal>

        <div className="border-t border-border">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={f.q} delay={140 + i * 70}>
                <div className="border-b border-border">
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="group flex w-full items-center justify-between gap-6 py-7 text-left"
                  >
                    <span className="flex items-baseline gap-5">
                      <span className="label-xs text-[9px] text-signal/70">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-display text-lg leading-snug tracking-[0.02em] transition-colors duration-500 group-hover:text-signal sm:text-xl">
                        {f.q}
                      </span>
                    </span>
                    <span className="relative h-3 w-3 shrink-0">
                      <span className="absolute left-0 top-1/2 h-px w-3 bg-foreground/60" />
                      <span
                        className="absolute left-1/2 top-0 h-3 w-px bg-foreground/60 transition-transform duration-500 ease-[var(--ease-cine)]"
                        style={{ transform: isOpen ? "scaleY(0)" : "scaleY(1)" }}
                      />
                    </span>
                  </button>
                  <div
                    className="grid transition-[grid-template-rows,opacity] duration-700 ease-[var(--ease-cine)]"
                    style={{ gridTemplateRows: isOpen ? "1fr" : "0fr", opacity: isOpen ? 1 : 0 }}
                  >
                    <div className="overflow-hidden">
                      <p className="max-w-[58ch] pb-8 pl-[52px] text-[14.5px] leading-[1.9] text-foreground/60">
                        {f.a}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
