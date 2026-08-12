import { Reveal } from "./Reveal";
import { resolveCtfUrl, isExternal } from "@/lib/ctf";

/** Final scene — hand-off into the case file. */
export function LaunchFooter({ ctfUrl }: { ctfUrl: string }) {
  const href = resolveCtfUrl(ctfUrl);
  const external = isExternal(href);

  return (
    <footer className="relative overflow-hidden border-t border-border">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[520px] [background:var(--grad-hero)]" />
      <div
        className="anim-orbit-slow pointer-events-none absolute -bottom-[520px] left-1/2 h-[900px] w-[900px] -translate-x-1/2 rounded-full border border-signal/12"
        aria-hidden="true"
      />
      <div
        className="anim-orbit-rev pointer-events-none absolute -bottom-[620px] left-1/2 h-[1200px] w-[1200px] -translate-x-1/2 rounded-full border border-violet/10"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-6 py-32 text-center sm:py-44">
        <Reveal>
          <span className="label-xs">end of briefing</span>
          <h2 className="mx-auto mt-8 max-w-[14ch] font-display text-[clamp(2.2rem,8vw,6rem)] font-medium leading-[0.98] tracking-[0.04em] text-glow">
            ACCESS CASE FILE
          </h2>
          <p className="mx-auto mt-7 max-w-[46ch] text-[15px] leading-[1.9] text-foreground/55">
            60 crews. One sealed archive. STARDUST is unsealed 17 August 2026.
          </p>

          <a
            href={href}
            {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
            className="group relative mt-12 inline-flex items-center gap-4 overflow-hidden rounded-full border border-signal/35 bg-signal/[0.07] px-10 py-4 font-mono text-[11px] uppercase tracking-[0.34em] transition-all duration-700 ease-[var(--ease-cine)] hover:border-signal/80 hover:bg-signal/[0.14]"
            style={{ boxShadow: "var(--glow-signal)" }}
          >
            <span className="relative z-10">Enter Archive</span>
            <span className="relative z-10 h-1.5 w-1.5 rounded-full bg-signal shadow-[0_0_14px_var(--signal)]" />
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-signal/25 to-transparent transition-transform duration-1000 ease-[var(--ease-cine)] group-hover:translate-x-full" />
          </a>
        </Reveal>

        <div className="mt-28 flex flex-col items-center gap-6 border-t border-border pt-10 sm:flex-row sm:justify-between">
          <span className="label-xs text-[9px]">Project STARDUST · Computer Week 2026</span>
          <span className="label-xs text-[9px]">
            file 71-Ω · asteria / mirror · declassified in part
          </span>
        </div>
      </div>
    </footer>
  );
}
