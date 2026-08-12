import { z } from "zod";

export type MissionStat = { label: string; value: string };

/** Headline figures on the case-file landing page. Editable from /admin. */
export const DEFAULT_STATS: MissionStat[] = [
  { label: "INVESTIGATORS", value: "120" },
  { label: "HOURS OF ACCESS", value: "36" },
  { label: "SEALED LAYERS", value: "07" },
  { label: "FILES RECOVERED", value: "0.02%" },
];

export const statsSchema = z.array(
  z.object({ label: z.string().max(40), value: z.string().max(20) }),
);
