import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { DEFAULT_STATS, statsSchema } from "@/lib/mission";

export const getEventSettings = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("event_settings")
      .select("start_time, ctf_url, stats")
      .eq("id", 1)
      .maybeSingle();

    if (!error && data) {
      const parsed = statsSchema.safeParse(data.stats);
      return {
        startTime: data.start_time ?? "2026-11-14T09:00:00Z",
        ctfUrl: data.ctf_url ?? "/ctf",
        stats: parsed.success && parsed.data.length ? parsed.data : DEFAULT_STATS,
      };
    }
  } catch (err) {
    console.warn("[getEventSettings] Supabase error, using local store:", err);
  }

  // Fallback to local store
  const { getDb } = await import("@/lib/store.server");
  const db = getDb();
  return db.eventSettings;
});

export const getAdminStatus = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { getAdminSession } = await import("@/lib/admin.server");
    const session = await getAdminSession();
    return { authenticated: Boolean(session.data.admin) };
  } catch (err) {
    console.warn("[getAdminStatus] fallback:", err);
    return { authenticated: false };
  }
});

export const adminLogin = createServerFn({ method: "POST" })
  .validator((data) => z.object({ callsign: z.string(), password: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const inputCallsign = data.callsign.trim().toUpperCase();

    // 1. Try Supabase
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { getAdminSession, verifyPassword } = await import("@/lib/admin.server");

      const { data: row, error } = await supabaseAdmin
        .from("admin_credentials")
        .select("callsign, password_hash")
        .eq("id", 1)
        .maybeSingle();

      if (!error && row) {
        if (row.callsign.trim().toUpperCase() === inputCallsign) {
          const match = await verifyPassword(data.password, row.password_hash);
          if (match) {
            const session = await getAdminSession();
            await session.update({ admin: true });
            return { ok: true as const };
          }
        }
        return { ok: false as const };
      }
    } catch (err) {
      console.warn("[adminLogin] Supabase unavailable, checking local store:", err);
    }

    // 2. Fallback to local store
    try {
      const { getDb, saveDb } = await import("@/lib/store.server");
      const { getAdminSession, verifyPassword, hashPassword } = await import("@/lib/admin.server");

      const db = getDb();
      if (db.adminCredentials.callsign.trim().toUpperCase() === inputCallsign) {
        let valid = false;
        if (!db.adminCredentials.passwordHash) {
          if (data.password === "STARDUST2026!" || data.password === "admin") {
            valid = true;
            db.adminCredentials.passwordHash = await hashPassword(data.password);
            saveDb(db);
          }
        } else {
          valid = await verifyPassword(data.password, db.adminCredentials.passwordHash);
        }

        if (valid) {
          const session = await getAdminSession();
          await session.update({ admin: true });
          return { ok: true as const };
        }
      }
    } catch (err) {
      console.error("[adminLogin] local store error:", err);
    }

    return { ok: false as const };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  try {
    const { getAdminSession } = await import("@/lib/admin.server");
    const session = await getAdminSession();
    await session.clear();
  } catch {
    // Ignore clear error
  }
  return { ok: true as const };
});

export const adminUpdateSettings = createServerFn({ method: "POST" })
  .validator((data) =>
    z
      .object({
        startTime: z.string().min(1),
        ctfUrl: z.string().max(500),
        stats: statsSchema.max(8),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("@/lib/admin.server");
    await requireAdmin();

    const when = new Date(data.startTime);
    if (Number.isNaN(when.getTime())) return { ok: false as const, message: "Invalid start time" };

    const url = data.ctfUrl.trim();
    if (url && !/^https?:\/\//i.test(url) && !url.startsWith("/")) {
      return { ok: false as const, message: "Link must start with http://, https:// or /" };
    }

    // Update Supabase if available
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error } = await supabaseAdmin
        .from("event_settings")
        .upsert({
          id: 1,
          start_time: when.toISOString(),
          ctf_url: url,
          stats: data.stats,
          updated_at: new Date().toISOString(),
        });

      if (!error) {
        // Also sync local store
        const { getDb, saveDb } = await import("@/lib/store.server");
        const db = getDb();
        db.eventSettings = { startTime: when.toISOString(), ctfUrl: url, stats: data.stats };
        saveDb(db);
        return { ok: true as const, message: "Case parameters updated in Supabase Cloud" };
      }
    } catch (err) {
      console.warn("[adminUpdateSettings] Supabase write failed, falling back to local store:", err);
    }

    // Fallback to local store
    const { getDb, saveDb } = await import("@/lib/store.server");
    const db = getDb();
    db.eventSettings = { startTime: when.toISOString(), ctfUrl: url, stats: data.stats };
    saveDb(db);

    return { ok: true as const, message: "Case parameters updated in local storage" };
  });

export const adminChangePassword = createServerFn({ method: "POST" })
  .validator((data) =>
    z.object({ currentPassword: z.string(), newPassword: z.string().min(8) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { requireAdmin, verifyPassword, hashPassword } = await import("@/lib/admin.server");
    await requireAdmin();

    const newHash = await hashPassword(data.newPassword);

    // Update Supabase if available
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: row } = await supabaseAdmin
        .from("admin_credentials")
        .select("password_hash")
        .eq("id", 1)
        .maybeSingle();

      if (row && (await verifyPassword(data.currentPassword, row.password_hash))) {
        await supabaseAdmin
          .from("admin_credentials")
          .update({ password_hash: newHash, updated_at: new Date().toISOString() })
          .eq("id", 1);

        // Sync local store
        const { getDb, saveDb } = await import("@/lib/store.server");
        const db = getDb();
        db.adminCredentials.passwordHash = newHash;
        saveDb(db);

        return { ok: true as const, message: "Access code rotated in Supabase Cloud" };
      }
    } catch (err) {
      console.warn("[adminChangePassword] Supabase update fallback to local:", err);
    }

    // Fallback to local store
    const { getDb, saveDb } = await import("@/lib/store.server");
    const db = getDb();

    let valid = false;
    if (!db.adminCredentials.passwordHash) {
      valid = data.currentPassword === "STARDUST2026!" || data.currentPassword === "admin";
    } else {
      valid = await verifyPassword(data.currentPassword, db.adminCredentials.passwordHash);
    }

    if (!valid) {
      return { ok: false as const, message: "Current password is incorrect" };
    }

    db.adminCredentials.passwordHash = newHash;
    saveDb(db);

    return { ok: true as const, message: "Access code rotated in local storage" };
  });
