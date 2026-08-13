import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { statsSchema } from "@/lib/mission";
import { FALLBACK_STATIC_CONFIG } from "@/lib/static-config";

export const getEventSettings = createServerFn({ method: "GET" }).handler(async () => {
  return FALLBACK_STATIC_CONFIG.eventSettings;
});

export const getAdminStatus = createServerFn({ method: "GET" }).handler(async () => {
  return { authenticated: false };
});

export const adminLogin = createServerFn({ method: "POST" })
  .validator((data) => z.object({ callsign: z.string(), password: z.string() }).parse(data))
  .handler(async ({ data }) => {
    return { ok: false as const };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
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
    return { ok: false as const, message: "Admin console deactivated" };
  });

export const adminChangePassword = createServerFn({ method: "POST" })
  .validator((data) =>
    z.object({ currentPassword: z.string(), newPassword: z.string().min(8) }).parse(data),
  )
  .handler(async ({ data }) => {
    return { ok: false as const, message: "Admin console deactivated" };
  });
