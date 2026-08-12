import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { Starfield } from "@/components/space/Starfield";
import { BootSequence } from "@/components/space/BootSequence";
import { Hero } from "@/components/space/Hero";
import { Film } from "@/components/space/Film";
import { getEventSettings } from "@/lib/admin.functions";
import { DEFAULT_STATS } from "@/lib/mission";

const TITLE = "STARDUST — Computer Week 2026 Classified Investigation";
const DESC =
  "The 1971 ASTERIA mission went silent and the MIRROR records were sealed. Project STARDUST is declassified for 36 hours. Seven layers. One key.";

export const Route = createFileRoute("/")({
  loader: async () => {
    try {
      const res = await getEventSettings();
      if (res && res.startTime) return res;
    } catch (err) {
      console.warn("[Route loader fallback]:", err);
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
  const settings = Route.useLoaderData();
  const [booted, setBooted] = useState(false);
  const [playing, setPlaying] = useState(false);

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
