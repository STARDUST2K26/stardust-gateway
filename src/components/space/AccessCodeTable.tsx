import { useEffect, useState } from "react";
import { loadStaticConfig, type StaticTeamClue } from "@/lib/static-config";

export function AccessCodeTable() {
  const [clues, setClues] = useState<StaticTeamClue[]>([]);
  const [filter, setFilter] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const config = await loadStaticConfig();
        if (config.teamClues && config.teamClues.length) {
          setClues(config.teamClues);
        }
      } catch (e) {
        console.warn("[AccessCodeTable] Failed to load static config:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = clues.filter((c) => {
    const term = filter.trim().toLowerCase();
    if (!term) return true;
    return (
      c.teamName.toLowerCase().includes(term) ||
      c.clue.toLowerCase().includes(term) ||
      c.accessCode.toLowerCase().includes(term)
    );
  });

  const copyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full space-y-4 font-mono text-xs text-left">
      <div className="flex flex-col justify-between gap-3 border-b border-signal/20 pb-4 sm:flex-row sm:items-center">
        <div>
          <span className="label-xs text-signal">TEAM CLUE & ACCESS CODE REGISTRY</span>
          <h2 className="font-display text-lg tracking-[0.08em] text-glow sm:text-xl">
            DECLASSIFIED CODES DIRECTORY
          </h2>
        </div>
        <div className="relative flex items-center min-w-[240px]">
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="FILTER BY TEAM OR CLUE..."
            spellCheck={false}
            className="w-full rounded border border-signal/30 bg-void/90 py-1.5 px-3 font-mono text-xs text-foreground placeholder:text-muted-foreground/40 focus:border-signal focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-signal/70 animate-pulse">
          LOADING ACCESS REGISTRY...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded border border-signal/20 bg-black/40 p-6 text-center text-muted-foreground">
          NO MATCHING TEAM CLUE RECORDS FOUND.
        </div>
      ) : (
        <div className="overflow-x-auto rounded border border-signal/30 bg-black/70 shadow-[0_0_20px_rgba(0,255,170,0.05)] backdrop-blur-md">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-signal/20 bg-signal/10 text-[10px] uppercase tracking-widest text-signal">
                <th className="py-3 px-4 font-semibold">#</th>
                <th className="py-3 px-4 font-semibold">TEAM NAME</th>
                <th className="py-3 px-4 font-semibold">RECOVERED CLUE</th>
                <th className="py-3 px-4 font-semibold">ACCESS CODE</th>
                <th className="py-3 px-4 font-semibold text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-signal/10">
              {filtered.map((row, idx) => (
                <tr
                  key={row.id || idx}
                  className="transition-colors hover:bg-signal/[0.06] group"
                >
                  <td className="py-3 px-4 text-foreground/40 text-[11px] font-bold">
                    {String(idx + 1).padStart(2, "0")}
                  </td>
                  <td className="py-3 px-4 font-bold text-foreground text-xs tracking-wider">
                    {row.teamName}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-signal/90 tracking-wide">
                    <span className="rounded bg-signal/10 px-2 py-0.5 border border-signal/20">
                      {row.clue}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-sm tracking-widest text-foreground">
                    {row.accessCode}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => copyCode(row.id || String(idx), row.accessCode)}
                      className="rounded border border-signal/40 bg-black/60 px-3 py-1 text-[10px] text-signal transition-colors hover:bg-signal/20 font-mono font-semibold uppercase tracking-wider"
                    >
                      {copiedId === (row.id || String(idx)) ? "COPIED!" : "COPY CODE"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
