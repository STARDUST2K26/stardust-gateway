import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

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

/** Public: a team types the clue they recovered and gets their own row back. */
export const lookupAccessCode = createServerFn({ method: "POST" })
  .validator((data) => z.object({ clue: z.string().max(200) }).parse(data))
  .handler(async ({ data }) => {
    const clue = data.clue.trim().toLowerCase();
    if (!clue) return { found: false as const };

    // 1. Try Supabase
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: rows, error } = await supabaseAdmin
        .from("team_clues")
        .select("team_name, clue, access_code");

      if (!error && rows && rows.length > 0) {
        const match = rows.find((r) => r.clue.trim().toLowerCase() === clue);
        if (match) {
          return {
            found: true as const,
            teamName: match.team_name,
            accessCode: match.access_code,
          };
        }
        return { found: false as const };
      }
    } catch (err) {
      console.warn("[lookupAccessCode] Supabase error, checking local store:", err);
    }

    // 2. Fallback to local store
    try {
      const { getDb } = await import("@/lib/store.server");
      const db = getDb();
      const match = db.teamClues.find((r) => r.clue.trim().toLowerCase() === clue);
      if (match) {
        return {
          found: true as const,
          teamName: match.teamName,
          accessCode: match.accessCode,
        };
      }
    } catch (err) {
      console.warn("[lookupAccessCode] local store error:", err);
    }

    return { found: false as const };
  });

export const adminListTeamClues = createServerFn({ method: "GET" }).handler(async () => {
  const { requireAdmin } = await import("@/lib/admin.server");
  await requireAdmin();

  // 1. Try Supabase
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("team_clues")
      .select("id, team_name, clue, access_code")
      .order("team_name", { ascending: true });

    if (!error && data) {
      return data.map((r) => ({
        id: r.id,
        teamName: r.team_name,
        clue: r.clue,
        accessCode: r.access_code,
      })) satisfies TeamClue[];
    }
  } catch (err) {
    console.warn("[adminListTeamClues] Supabase error, using local store:", err);
  }

  // 2. Fallback local store
  const { getDb } = await import("@/lib/store.server");
  const db = getDb();
  return db.teamClues satisfies TeamClue[];
});

export const adminSaveTeamClue = createServerFn({ method: "POST" })
  .validator((data) => rowSchema.parse(data))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("@/lib/admin.server");
    await requireAdmin();

    // 1. Try Supabase
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const payload = {
        team_name: data.teamName,
        clue: data.clue,
        access_code: data.accessCode,
        updated_at: new Date().toISOString(),
      };

      const { error } = data.id
        ? await supabaseAdmin.from("team_clues").update(payload).eq("id", data.id)
        : await supabaseAdmin.from("team_clues").insert(payload);

      if (!error) {
        // Also sync local store
        const { getDb, saveDb } = await import("@/lib/store.server");
        const db = getDb();
        if (data.id) {
          const idx = db.teamClues.findIndex((r) => r.id === data.id);
          if (idx !== -1) db.teamClues[idx] = { id: data.id, teamName: data.teamName, clue: data.clue, accessCode: data.accessCode };
        } else {
          db.teamClues.push({ id: `clue-${Date.now()}`, teamName: data.teamName, clue: data.clue, accessCode: data.accessCode });
        }
        saveDb(db);

        return { ok: true as const, message: "Registry updated in Supabase Cloud" };
      }
    } catch (err) {
      console.warn("[adminSaveTeamClue] Supabase error, saving locally:", err);
    }

    // 2. Fallback local store
    const { getDb, saveDb } = await import("@/lib/store.server");
    const db = getDb();
    if (data.id) {
      const idx = db.teamClues.findIndex((r) => r.id === data.id);
      if (idx !== -1) db.teamClues[idx] = { id: data.id, teamName: data.teamName, clue: data.clue, accessCode: data.accessCode };
    } else {
      const newId = `clue-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      db.teamClues.push({ id: newId, teamName: data.teamName, clue: data.clue, accessCode: data.accessCode });
    }
    saveDb(db);

    return { ok: true as const, message: "Registry updated in local storage" };
  });

export const adminDeleteTeamClue = createServerFn({ method: "POST" })
  .validator((data) => z.object({ id: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("@/lib/admin.server");
    await requireAdmin();

    // 1. Try Supabase
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error } = await supabaseAdmin.from("team_clues").delete().eq("id", data.id);
      if (!error) {
        const { getDb, saveDb } = await import("@/lib/store.server");
        const db = getDb();
        db.teamClues = db.teamClues.filter((r) => r.id !== data.id);
        saveDb(db);
        return { ok: true as const, message: "Entry removed from Supabase Cloud" };
      }
    } catch (err) {
      console.warn("[adminDeleteTeamClue] Supabase error, deleting locally:", err);
    }

    // 2. Fallback local store
    const { getDb, saveDb } = await import("@/lib/store.server");
    const db = getDb();
    db.teamClues = db.teamClues.filter((r) => r.id !== data.id);
    saveDb(db);

    return { ok: true as const, message: "Entry removed from local storage" };
  });
