import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { FALLBACK_STATIC_CONFIG } from "@/lib/static-config";

export type TeamClue = {
  id: string;
  teamName: string;
  clue: string;
  accessCode: string;
};

const rowSchema = z.object({
  id: z.string().optional(),
  teamName: z.string().trim().min(1).max(80),
  clue: z.string().trim().min(1).max(200),
  accessCode: z.string().trim().min(1).max(80),
});

/** Static clue lookup function */
export const lookupAccessCode = createServerFn({ method: "POST" })
  .validator((data) => z.object({ clue: z.string().max(200) }).parse(data))
  .handler(async ({ data }) => {
    const clue = data.clue.trim().toLowerCase();
    if (!clue) return { found: false as const };

    const match = FALLBACK_STATIC_CONFIG.teamClues.find(
      (r) => r.clue.trim().toLowerCase() === clue,
    );

    if (match) {
      return {
        found: true as const,
        teamName: match.teamName,
        accessCode: match.accessCode,
      };
    }

    return { found: false as const };
  });

export const adminListTeamClues = createServerFn({ method: "GET" }).handler(async () => {
  return FALLBACK_STATIC_CONFIG.teamClues satisfies TeamClue[];
});

export const adminSaveTeamClue = createServerFn({ method: "POST" })
  .validator((data) => rowSchema.parse(data))
  .handler(async ({ data }) => {
    return { ok: true as const, message: "Static mode enabled" };
  });

export const adminDeleteTeamClue = createServerFn({ method: "POST" })
  .validator((data) => z.object({ id: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    return { ok: true as const, message: "Static mode enabled" };
  });
