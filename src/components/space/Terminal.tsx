import { useEffect, useRef, useState } from "react";

import { resolveCtfUrl, isExternal } from "@/lib/ctf";

type Line = { kind: "in" | "out" | "warn" | "dim"; text: string };

const BANNER: Line[] = [
  { kind: "dim", text: "STARDUST ARCHIVE TERMINAL  ·  file 71-Ω  ·  mirror relay" },
  { kind: "dim", text: "type `help` for the command index." },
];

const HELP = [
  "help       list available commands",
  "case       summary of project stardust",
  "status     archive + relay status",
  "history    prior inquiries on record",
  "whoami     current operator identity",
  "credits    the unit maintaining the file",
  "clear      wipe the console",
];

function respond(raw: string): Line[] {
  const cmd = raw.trim().toLowerCase();
  switch (cmd) {
    case "":
      return [];
    case "help":
      return HELP.map((text) => ({ kind: "out", text }));
    case "case":
    case "mission":
      return [
        { kind: "out", text: "PROJECT STARDUST — Computer Week 2026" },
        { kind: "out", text: "ASTERIA, 1971. Silence at 04:41. MIRROR returned what the" },
        { kind: "out", text: "probe never sent. Seven sealed layers, 36 hours of access." },
        { kind: "dim", text: "objective: reach layer Ω before the file re-seals." },

      ];
    case "status":
      return [
        { kind: "out", text: "archive ............ UNSEALED IN PART" },
        { kind: "out", text: "mirror relay ....... 99.4%" },
        { kind: "out", text: "layers open ........ 3 / 7" },
        { kind: "warn", text: "file ............... UNDER AUDIT" },
        { kind: "out", text: "crews registered ... 87 / 120" },
      ];
    case "history":
      return [
        { kind: "out", text: "1974 \u00b7 BOARD OF INQUIRY .... no finding" },
        { kind: "out", text: "1989 \u00b7 SECOND REVIEW ...... reached layer 4" },
        { kind: "out", text: "2025 \u00b7 NULL PARALLAX ...... reached layer 6" },
        { kind: "dim", text: "no one has opened layer \u03a9." },
      ];
    case "whoami":
      return [
        { kind: "out", text: "analyst: UNREGISTERED" },
        { kind: "out", text: "clearance: provisional" },
        { kind: "dim", text: "run `begin` to open the case file." },
      ];
    case "credits":
      return [
        { kind: "out", text: "Project STARDUST \u2014 Computer Week 2026" },
        { kind: "out", text: "case design \u00b7 cryptography guild" },
        { kind: "out", text: "archive operations \u00b7 student technical council" },
      ];
    case "begin":
      return [
        { kind: "out", text: "callsign request queued …" },
        { kind: "out", text: "registration opens with the first descent. stand by." },
      ];
    /* ---- easter eggs ---- */
    case "sudo":
    case "sudo su":
      return [{ kind: "warn", text: "nice try, analyst. the archive does not recognise root." }];
    case "42":
      return [{ kind: "dim", text: "correct. but that was never the question." }];
    case "origin":
      return [
        { kind: "warn", text: "▁▂▃ bearing resolves to empty sky ▃▂▁" },
        { kind: "dim", text: "the bearing moved before 1971 finished measuring it." },
      ];
    case "hello":
    case "hi":
      return [{ kind: "out", text: "we counted the ones who listened. you are one of them." }];
    case "open the pod bay doors":
      return [{ kind: "warn", text: "i'm afraid i can't do that." }];
    default:
      return [{ kind: "warn", text: `command not recognised: ${raw.trim()}` }];
  }
}

/** Scene 8 — the archive terminal. A fullscreen operating system. */
export function Terminal({ ctfUrl }: { ctfUrl: string }) {
  const href = resolveCtfUrl(ctfUrl);
  const external = isExternal(href);
  const [lines, setLines] = useState<Line[]>(BANNER);
  const [value, setValue] = useState("");
  const [full, setFull] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [lines]);

  useEffect(() => {
    if (!full) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFull(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [full]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const entry = value;
    if (entry.trim().toLowerCase() === "clear") {
      setLines(BANNER);
      setValue("");
      return;
    }
    setLines((l) => [...l, { kind: "in", text: entry }, ...respond(entry)]);
    setValue("");
  };

  const shell = (
    <div
      className={`glass relative flex flex-col overflow-hidden ${full ? "h-full" : "h-[520px]"}`}
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <span className="label-xs text-[9px]">stardust archive · secure shell</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setFull((f) => !f);
          }}
          className="font-mono text-[9px] uppercase tracking-[0.28em] text-signal/80 transition-colors hover:text-signal"
        >
          {full ? "exit fullscreen · esc" : "enter fullscreen"}
        </button>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 space-y-1.5 overflow-y-auto px-5 py-6 font-mono text-[12.5px] leading-[1.9] sm:px-8"
      >
        {lines.map((l, i) => (
          <div
            key={i}
            className={
              l.kind === "in"
                ? "text-foreground"
                : l.kind === "warn"
                  ? "text-warning/85"
                  : l.kind === "dim"
                    ? "text-foreground/40"
                    : "text-signal/85"
            }
          >
            {l.kind === "in" ? <span className="text-signal/60">analyst@stardust:~$ </span> : null}
            {l.text}
          </div>
        ))}

        <form onSubmit={submit} className="flex items-center gap-2 pt-2">
          <span className="text-signal/60">analyst@stardust:~$</span>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            spellCheck={false}
            autoComplete="off"
            aria-label="terminal command input"
            className="flex-1 bg-transparent font-mono text-[12.5px] text-foreground caret-transparent outline-none"
          />
          <span className="caret h-[1.1em] w-[7px] bg-signal" />
        </form>
      </div>
    </div>
  );

  return (
    <section id="terminal" className="relative mx-auto max-w-6xl px-6 py-32 sm:py-40">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <span className="label-xs text-signal/80">SCENE 08</span>
          <span className="hairline w-10" />
          <span className="label-xs">archive terminal</span>
        </div>
        <h2 className="max-w-[16ch] font-display text-[clamp(1.9rem,5vw,3.6rem)] font-medium leading-[1.05]">
          Query the archive directly.
        </h2>
      </div>

      <div className="mt-12">{shell}</div>

      <div className="mt-10 flex justify-center">
        <a
          href={href}
          {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
          className="group inline-flex items-center gap-4 rounded-full border border-signal/30 bg-signal/[0.06] px-9 py-4 font-mono text-[11px] uppercase tracking-[0.34em] text-foreground transition-all duration-700 ease-[var(--ease-cine)] hover:border-signal/70 hover:bg-signal/[0.12]"
        >
          <span>Access Case File</span>
          <span className="h-1.5 w-1.5 rounded-full bg-signal shadow-[0_0_14px_var(--signal)]" />
        </a>
      </div>

      {full ? (
        <div className="fixed inset-0 z-[80] bg-[#000000]/96 p-4 backdrop-blur-xl sm:p-10">
          <div className="mx-auto h-full max-w-5xl">{shell}</div>
        </div>
      ) : null}
    </section>
  );
}
