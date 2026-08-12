import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";

import {
  adminDeleteTeamClue,
  adminListTeamClues,
  adminSaveTeamClue,
  type TeamClue,
} from "@/lib/codes.functions";

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

  const load = async () => setRows(await list());

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function commit(row: TeamClue | Draft, id?: string) {
    setBusy(true);
    setNote(null);
    const res = await save({ data: { ...row, ...(id ? { id } : {}) } });
    setBusy(false);
    setNote(res.message);
    if (res.ok) {
      if (!id) setDraft(EMPTY);
      await load();
    }
  }

  async function drop(id: string) {
    setBusy(true);
    await remove({ data: { id } });
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
