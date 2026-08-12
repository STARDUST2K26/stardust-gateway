import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CodeTerminal } from "@/components/space/CodeTerminal";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";

const TITLE = "CTF Case Files — STARDUST Classified Portal";
const DESC = "Project STARDUST CTF case files, declassified records, and fragment verification terminal.";

export const Route = createFileRoute("/ctf")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CtfPage,
});

function CtfPage() {
  const [ctfUrl, setCtfUrl] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");

  useEffect(() => {
    (async () => {
      if (isSupabaseConfigured()) {
        try {
          const { data } = await supabase
            .from("event_settings")
            .select("ctf_url, start_time")
            .eq("id", 1)
            .maybeSingle();

          if (data) {
            if (data.ctf_url) setCtfUrl(data.ctf_url);
            if (data.start_time) setStartTime(data.start_time);
            return;
          }
        } catch {}
      }

      const saved = localStorage.getItem("stardust_event_settings");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.ctfUrl) setCtfUrl(parsed.ctfUrl);
          if (parsed.startTime) setStartTime(parsed.startTime);
        } catch {}
      }
    })();
  }, []);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-void px-6 py-20 text-foreground">
      <div className="pointer-events-none fixed inset-0 grid-floor opacity-[0.25]" />
      <div className="pointer-events-none fixed inset-0 [background:var(--grad-violet)]" />

      <div className="relative z-10 mx-auto w-full max-w-4xl space-y-12">
        <div className="flex flex-col items-start gap-3">
          <Link to="/" className="label-xs text-signal/80 hover:underline">
            &larr; RETURN TO BRIEFING
          </Link>
          <h1 className="font-display text-4xl font-semibold tracking-[0.16em] text-glow sm:text-5xl">
            CTF CASE FILES
          </h1>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Project STARDUST · Classified Investigation Portal
          </p>
          <span className="hairline w-40" />
        </div>

        {ctfUrl && ctfUrl !== "/ctf" && (
          <div className="glass flex flex-col items-center justify-between gap-4 rounded-md p-6 sm:flex-row">
            <div>
              <span className="label-xs text-signal">EXTERNAL CTF PLATFORM UPLINK</span>
              <p className="mt-1 font-mono text-xs text-foreground/70">
                Direct access link configured for active competition round.
              </p>
            </div>
            <a
              href={ctfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 rounded-full border border-signal/40 bg-signal/10 px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] text-signal transition-all hover:bg-signal/20"
            >
              LAUNCH CTF PLATFORM &rarr;
            </a>
          </div>
        )}

        <section className="glass rounded-md p-8 space-y-6">
          <h2 className="label-xs text-signal/80">RECOVERED FRAGMENT VERIFICATION</h2>
          <p className="font-mono text-xs leading-[2] text-foreground/60">
            Enter recovered clue keys or fragment hashes from completed challenges to receive team access codes for subsequent mission stages.
          </p>
          <CodeTerminal />
        </section>

        <section className="grid gap-6 sm:grid-cols-2">
          <div className="glass rounded-md p-6 space-y-3">
            <span className="label-xs text-signal/70">REEL 01 · TELEMETRY LOGS</span>
            <h3 className="font-display text-lg tracking-[0.08em] text-glow">ASTERIA-71 CARRIER</h3>
            <p className="font-mono text-xs leading-[1.9] text-foreground/55">
              Carrier signal terminated mid-frame at 04:41 GMT. Carrier stability graph indicates non-accidental cutoff.
            </p>
          </div>
          <div className="glass rounded-md p-6 space-y-3">
            <span className="label-xs text-signal/70">REEL 03 · MIRROR RELAY</span>
            <h3 className="font-display text-lg tracking-[0.08em] text-glow">UNATTRIBUTED RESPONSE</h3>
            <p className="font-mono text-xs leading-[1.9] text-foreground/55">
              Experimental MIRROR channel received response material matching query structure. Sequence order enforced.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
