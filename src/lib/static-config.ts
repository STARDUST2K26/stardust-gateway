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
    startTime: "2026-08-17T05:00:00Z",
    ctfUrl: "/#/",
    stats: [
      { label: "INVESTIGATORS", value: "60" },
      { label: "TEAMS", value: "15" },
      { label: "HOURS OF ACCESS", value: "1.5" },
      { label: "SEALED LEVELS", value: "10" }
    ],
  },
  adminCredentials: {
    callsign: "CDR",
    password: "St@rdust2K26",
  },
  teamClues: [
    { id: "clue-1", teamName: "ALPHA", clue: "ushuaia", accessCode: "St@rDust!71" },
    { id: "clue-2", teamName: "BRAVO", clue: "tromso", accessCode: "C0sm1c#2027" },
    { id: "clue-3", teamName: "CHARLIE", clue: "kigali", accessCode: "M1rr0r@1971" },
    { id: "clue-4", teamName: "DELTA", clue: "longyearbyen", accessCode: "D33pSp@ce!" },
    { id: "clue-5", teamName: "ECHO", clue: "samarkand", accessCode: "V0id#S1gn@1" },
    { id: "clue-6", teamName: "FOXTROT", clue: "lalibela", accessCode: "0rb1t@171" },
    { id: "clue-7", teamName: "GOLF", clue: "torshavn", accessCode: "Tr@c3Th3St@r$" },
    { id: "clue-8", teamName: "HOTEL", clue: "windhoek", accessCode: "L0stM1ss10n!" },
    { id: "clue-9", teamName: "INDIA", clue: "dunedin", accessCode: "C0sm0s@1971" },
    { id: "clue-10", teamName: "JULIETT", clue: "merida", accessCode: "D@rkM@tter#" },
    { id: "clue-11", teamName: "KILO", clue: "kotor", accessCode: "St@rL1ght!" },
    { id: "clue-12", teamName: "LIMA", clue: "bishkek", accessCode: "F1n@lTr@c3" },
    { id: "clue-13", teamName: "MIKE", clue: "astana", accessCode: "L@stS1gn@1" },
    { id: "clue-14", teamName: "NOVEMBER", clue: "aizawl", accessCode: "Tr@nsm1ss10n#71" },
    { id: "clue-15", teamName: "ORION", clue: "itanagar", accessCode: "Ex0pl@n3t!27" }
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
