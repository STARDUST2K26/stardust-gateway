import { DEFAULT_STATS, type MissionStat } from "@/lib/mission";

export type StaticTeamClue = {
  id: string;
  teamName: string;
  clue: string;
  accessCode: string;
};

export type StaticConfig = {
  eventSettings: {
    startTime: string;
    ctfUrl: string;
    stats: MissionStat[];
  };
  adminCredentials: {
    callsign: string;
    password: string;
  };
  teamClues: StaticTeamClue[];
};

export const FALLBACK_STATIC_CONFIG: StaticConfig = {
  eventSettings: {
    startTime: "2026-11-14T09:00:00Z",
    ctfUrl: "/ctf",
    stats: DEFAULT_STATS,
  },
  adminCredentials: {
    callsign: "COMMANDER",
    password: "STARDUST2026!",
  },
  teamClues: [
    {
      id: "clue-1",
      teamName: "ORION PHALANX",
      clue: "ASTERIA-71-ALPHA",
      accessCode: "KEY-7109-ALPHA",
    },
    {
      id: "clue-2",
      teamName: "CYGNUS INITIATIVE",
      clue: "MIRROR-SIGNAL-9",
      accessCode: "KEY-9942-BETA",
    },
    {
      id: "clue-3",
      teamName: "VANGUARD SEC",
      clue: "DEEPSPACE-OMEGA",
      accessCode: "KEY-0071-OMEGA",
    },
  ],
};

let configPromise: Promise<StaticConfig> | null = null;

export async function loadStaticConfig(): Promise<StaticConfig> {
  if (typeof window === "undefined") return FALLBACK_STATIC_CONFIG;
  if (!configPromise) {
    configPromise = fetch("./stardust-config.json", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Static config returned ${response.status}`);
        return normalizeStaticConfig((await response.json()) as Partial<StaticConfig>);
      })
      .catch((error) => {
        console.warn("[static-config] Falling back to bundled defaults:", error);
        return FALLBACK_STATIC_CONFIG;
      });
  }
  return configPromise;
}

function normalizeStaticConfig(config: Partial<StaticConfig>): StaticConfig {
  return {
    eventSettings: {
      startTime:
        typeof config.eventSettings?.startTime === "string"
          ? config.eventSettings.startTime
          : FALLBACK_STATIC_CONFIG.eventSettings.startTime,
      ctfUrl:
        typeof config.eventSettings?.ctfUrl === "string"
          ? config.eventSettings.ctfUrl
          : FALLBACK_STATIC_CONFIG.eventSettings.ctfUrl,
      stats:
        Array.isArray(config.eventSettings?.stats) && config.eventSettings.stats.length > 0
          ? config.eventSettings.stats
          : FALLBACK_STATIC_CONFIG.eventSettings.stats,
    },
    adminCredentials: {
      callsign:
        typeof config.adminCredentials?.callsign === "string"
          ? config.adminCredentials.callsign
          : FALLBACK_STATIC_CONFIG.adminCredentials.callsign,
      password:
        typeof config.adminCredentials?.password === "string"
          ? config.adminCredentials.password
          : FALLBACK_STATIC_CONFIG.adminCredentials.password,
    },
    teamClues: Array.isArray(config.teamClues)
      ? config.teamClues.filter(
          (row): row is StaticTeamClue =>
            typeof row?.id === "string" &&
            typeof row?.teamName === "string" &&
            typeof row?.clue === "string" &&
            typeof row?.accessCode === "string",
        )
      : FALLBACK_STATIC_CONFIG.teamClues,
  };
}
