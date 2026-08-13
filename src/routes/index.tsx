import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { Starfield } from "@/components/space/Starfield";
import { BootSequence } from "@/components/space/BootSequence";
import { Hero } from "@/components/space/Hero";
import { Film } from "@/components/space/Film";
import { DEFAULT_STATS, type MissionStat } from "@/lib/mission";
import { loadStaticConfig } from "@/lib/static-config";

const TITLE = "STARDUST 2K26";
const DESC =
  "The 1971 ASTERIA mission went silent and the MIRROR records were sealed. Project STARDUST is declassified for 90 minutes. Ten levels. One key.";

export const Route = createFileRoute("/")({
  loader: async () => {
    if (typeof window !== "undefined") {
      const savedSettings = localStorage.getItem("stardust_event_settings");
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          if (parsed && parsed.startTime) return parsed;
        } catch {}
      }
    }

    return {
      startTime: "2026-11-14T09:00:00Z",
      ctfUrl: "/ctf",
      stats: DEFAULT_STATS,
    };
  },
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
  component: Index,
});

function Index() {
  const initialSettings = Route.useLoaderData();
  const [settings, setSettings] = useState<{
    startTime: string;
    ctfUrl: string;
    stats: MissionStat[];
  }>(initialSettings);

  const [booted, setBooted] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    // Query live settings from Supabase Cloud or localStorage directly on client mount
    (async () => {
      try {
        const config = await loadStaticConfig();
        setSettings(config.eventSettings);
        return;
      } catch {}

      const savedSettings = localStorage.getItem("stardust_event_settings");
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          if (parsed && parsed.startTime) {
            setSettings(parsed);
          }
        } catch {}
      }
    })();
  }, []);

  useEffect(() => {
    if (!booted) {
      document.body.style.overflow = "hidden";
      return;
    }
    document.body.style.overflow = "";
  }, [booted]);

  return (
    <div className="relative h-[100svh] w-full overflow-hidden bg-void">
      <div className="pointer-events-none fixed inset-0 z-0">
        <Starfield warp={!booted} />
      </div>
      <div className="pointer-events-none fixed inset-0 z-0 [background:var(--grad-violet)]" />
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.5] [background:radial-gradient(120%_90%_at_50%_50%,transparent_35%,#000_100%)]" />

      <BootSequence onDone={() => setBooted(true)} />

      <main className="relative z-10">
        <Hero
          ready={booted}
          startTime={settings.startTime}
          onBegin={() => setPlaying(true)}
        />
      </main>

      {playing && <Film stats={settings.stats} onExit={() => setPlaying(false)} />}
    </div>
  );
}
