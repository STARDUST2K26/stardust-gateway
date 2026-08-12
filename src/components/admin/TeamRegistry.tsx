import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";

import {
  adminDeleteTeamClue,
  adminListTeamClues,
  adminSaveTeamClue,
  type TeamClue,
} from "@/lib/codes.functions";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";

const inputClass =
  "w-full rounded-sm border border-signal/20 bg-void/60 px-3 py-2.5 font-mono text-xs tracking-[0.08em] text-foreground outline-none transition-colors duration-300 focus:border-signal/60";

const buttonClass =
  "inline-flex items-center gap-3 rounded-full border border-signal/30 bg-signal/[0.06] px-6 py-2.5 font-mono text-[10px] uppercase tracking-[0.3em] text-foreground transition-all duration-500 ease-[var(--ease-cine)] hover:border-signal/70 hover:bg-signal/[0.14] disabled:opacity-40";

type Draft = { teamName: string; clue: string; accessCode: string };

const EMPTY: Draft = { teamName: "", clue: "", accessCode: "" };

/** Spreadsheet-style registry mapping a recovered clue to a team and its next-day code. */
export function TeamRegistry() {
  const list = useServerFn(adminListTeamClues);
  const save = useServerFn(adminSaveTeamClue);
  const remove = useServerFn(adminDeleteTeamClue);

  const [rows, setRows] = useState<TeamClue[]>([]);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const load = async () => {
    // 1. Direct Supabase load
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("team_clues")
          .select("id, team_name, clue, access_code")
          .order("team_name", { ascending: true });

        if (!error && data) {
          setRows(
            data.map((r: any) => ({
              id: String(r.id),
              teamName: r.team_name,
              clue: r.clue,
              accessCode: r.access_code,
            }))
          );
          return;
        }
      } catch (err) {
        console.warn("[TeamRegistry Supabase direct load error]:", err);
      }
    }

    // 2. Server RPC load
    try {
      const data = await list();
      if (Array.isArray(data)) {
        setRows(data);
        return;
      }
    } catch {}

    // 3. Local storage fallback
    const saved = localStorage.getItem("stardust_team_clues");
    if (saved) {
      try {
        setRows(JSON.parse(saved));
      } catch {}
    }
  };

  useEffect(() => {
    load();
  }, []);

  async function commit(row: TeamClue | Draft, id?: string) {
    setBusy(true);
    setNote(null);
    let msg = "Clue updated";
    let ok = false;

    // 1. Direct Supabase Cloud sync from browser
    if (isSupabaseConfigured()) {
      try {
        const payload = {
          team_name: row.teamName,
          clue: row.clue,
          access_code: row.accessCode,
          updated_at: new Date().toISOString(),
        };

        const { error } = id
          ? await supabase.from("team_clues").update(payload).eq("id", id)
          : await supabase.from("team_clues").insert(payload);

        if (!error) {
          ok = true;
          msg = "Clue synced to Supabase Cloud";
        }
      } catch (err) {
        console.warn("[TeamRegistry Supabase direct commit error]:", err);
      }
    }

    // 2. Server RPC / local storage fallback
    if (!ok) {
      try {
        const res = await save({ data: { ...row, ...(id ? { id } : {}) } });
        ok = Boolean(res && res.ok);
        if (res && res.message) msg = res.message;
      } catch {
        const current = [...rows];
        if (id) {
          const idx = current.findIndex((r) => r.id === id);
          if (idx !== -1) current[idx] = { ...current[idx], ...row };
        } else {
          const newEntry: TeamClue = {
            id: String(Date.now()),
            teamName: row.teamName,
            clue: row.clue,
            accessCode: row.accessCode,
          };
          current.push(newEntry);
        }
        localStorage.setItem("stardust_team_clues", JSON.stringify(current));
        setRows(current);
        ok = true;
        msg = "Clue saved to local storage";
      }
    }

    setBusy(false);
    setNote(msg);
    if (ok) {
      if (!id) setDraft(EMPTY);
      await load();
    }
  }

  async function drop(id: string) {
    setBusy(true);
    setNote(null);

    let ok = false;
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from("team_clues").delete().eq("id", id);
        if (!error) {
          ok = true;
          setNote("Entry deleted from Supabase Cloud");
        }
      } catch (err) {
        console.warn("[TeamRegistry Supabase direct drop error]:", err);
      }
    }

    if (!ok) {
      try {
        await remove({ data: { id } });
      } catch {
        const current = rows.filter((r) => r.id !== id);
        localStorage.setItem("stardust_team_clues", JSON.stringify(current));
        setRows(current);
      }
    }

    setBusy(false);
    await load();
  }

  return (
    <section className="glass space-y-5 rounded-md p-8">
      <h2 className="label-xs text-signal/80">clue registry · team access codes</h2>
      <p className="font-mono text-[11px] leading-[2] text-foreground/45">
        A team types the clue they found in the closing terminal. On a match they are shown
        their team name and the access code for the next day.
      </p>

      {note && (
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-signal">{note}</p>
      )}

      <div className="space-y-3 border-t border-border pt-6">
        <div className="hidden gap-3 sm:grid sm:grid-cols-[1fr_1.3fr_1fr_auto]">
          <span className="label-xs text-[9px]">team name</span>
          <span className="label-xs text-[9px]">clue found</span>
          <span className="label-xs text-[9px]">access code</span>
          <span />
        </div>

        {rows.map((row) => (
          <div key={row.id} className="grid gap-3 sm:grid-cols-[1fr_1.3fr_1fr_auto]">
            <input
              className={inputClass}
              value={row.teamName}
              aria-label="team name"
              onChange={(e) =>
                setRows((p) =>
                  p.map((r) => (r.id === row.id ? { ...r, teamName: e.target.value } : r)),
                )
              }
            />
            <input
              className={inputClass}
              value={row.clue}
              aria-label="clue found"
              onChange={(e) =>
                setRows((p) =>
                  p.map((r) => (r.id === row.id ? { ...r, clue: e.target.value } : r)),
                )
              }
            />
            <input
              className={inputClass}
              value={row.accessCode}
              aria-label="access code"
              onChange={(e) =>
                setRows((p) =>
                  p.map((r) => (r.id === row.id ? { ...r, accessCode: e.target.value } : r)),
                )
              }
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => commit(row, row.id)}
                className="font-mono text-[9px] uppercase tracking-[0.24em] text-foreground/60 transition-colors hover:text-signal disabled:opacity-40"
              >
                save
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => drop(row.id)}
                className="font-mono text-[9px] uppercase tracking-[0.24em] text-warning/70 transition-colors hover:text-warning disabled:opacity-40"
              >
                delete
              </button>
            </div>
          </div>
        ))}

        {rows.length === 0 && (
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/35">
            registry empty
          </p>
        )}
      </div>

      <div className="grid gap-3 border-t border-border pt-6 sm:grid-cols-[1fr_1.3fr_1fr]">
        <input
          className={inputClass}
          placeholder="TEAM NAME"
          aria-label="new team name"
          value={draft.teamName}
          onChange={(e) => setDraft((d) => ({ ...d, teamName: e.target.value }))}
        />
        <input
          className={inputClass}
          placeholder="clue found"
          aria-label="new clue"
          value={draft.clue}
          onChange={(e) => setDraft((d) => ({ ...d, clue: e.target.value }))}
        />
        <input
          className={inputClass}
          placeholder="ACCESS CODE"
          aria-label="new access code"
          value={draft.accessCode}
          onChange={(e) => setDraft((d) => ({ ...d, accessCode: e.target.value }))}
        />
      </div>

      <button
        type="button"
        className={buttonClass}
        disabled={busy || !draft.teamName || !draft.clue || !draft.accessCode}
        onClick={() => commit(draft)}
      >
        Add entry
      </button>
    </section>
  );
}
