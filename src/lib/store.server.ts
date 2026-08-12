import fs from "node:fs";
import path from "node:path";
import { DEFAULT_STATS, type MissionStat } from "@/lib/mission";

export type EventSettings = {
  startTime: string;
  ctfUrl: string;
  stats: MissionStat[];
};

export type TeamClue = {
  id: string;
  teamName: string;
  clue: string;
  accessCode: string;
};

export type DatabaseSchema = {
  eventSettings: EventSettings;
  adminCredentials: {
    callsign: string;
    passwordHash: string;
  };
  teamClues: TeamClue[];
};

const DEFAULT_DB: DatabaseSchema = {
  eventSettings: {
    startTime: "2026-11-14T09:00:00Z",
    ctfUrl: "/ctf",
    stats: DEFAULT_STATS,
  },
  adminCredentials: {
    callsign: "COMMANDER",
    passwordHash: "",
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

let dbCache: DatabaseSchema | null = null;

function getDbFilePath(): string {
  return path.join(process.cwd(), ".data", "db.json");
}

export function getDb(): DatabaseSchema {
  if (dbCache) return dbCache;

  const dbPath = getDbFilePath();
  try {
    if (fs.existsSync(dbPath)) {
      const raw = fs.readFileSync(dbPath, "utf-8");
      const parsed = JSON.parse(raw) as DatabaseSchema;
      dbCache = {
        eventSettings: {
          startTime: parsed.eventSettings?.startTime ?? DEFAULT_DB.eventSettings.startTime,
          ctfUrl: parsed.eventSettings?.ctfUrl ?? DEFAULT_DB.eventSettings.ctfUrl,
          stats: Array.isArray(parsed.eventSettings?.stats) && parsed.eventSettings.stats.length > 0
            ? parsed.eventSettings.stats
            : DEFAULT_STATS,
        },
        adminCredentials: {
          callsign: parsed.adminCredentials?.callsign ?? DEFAULT_DB.adminCredentials.callsign,
          passwordHash: parsed.adminCredentials?.passwordHash ?? "",
        },
        teamClues: Array.isArray(parsed.teamClues) ? parsed.teamClues : DEFAULT_DB.teamClues,
      };
      return dbCache;
    }
  } catch (err) {
    console.warn("[store.server] Failed to read db.json, using defaults:", err);
  }

  dbCache = JSON.parse(JSON.stringify(DEFAULT_DB));
  saveDb(dbCache!);
  return dbCache!;
}

export function saveDb(data: DatabaseSchema): void {
  dbCache = data;
  try {
    const dbPath = getDbFilePath();
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.warn("[store.server] Failed to save db.json to disk (in-memory mode):", err);
  }
}
