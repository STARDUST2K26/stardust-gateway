import { useEffect, useState } from "react";
import { subscribeToSync } from "@/lib/sync";
import { loadStaticConfig } from "@/lib/static-config";

const DEFAULT_CLUES = [
  { id: "1", teamName: "ORION DECRYPTION TEAM", clue: "asteria-71-alpha", accessCode: "STARDUST-KEY-7109" },
  { id: "2", teamName: "SECTOR 4 RECOVERY", clue: "mirror-log-1971", accessCode: "STARDUST-KEY-9942" },
  { id: "3", teamName: "COMMAND PROTOCOL", clue: "stardust-2026", accessCode: "STARDUST-KEY-2026" },
];

export function CodeTerminal() {
  const [clue, setClue] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    status: "idle" | "success" | "error";
    message?: string;
    teamName?: string;
    accessCode?: string;
  }>({ status: "idle" });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToSync((type) => {
      if (type === "clues" && result.status !== "idle") {
        setResult({ status: "idle" });
      }
    });
    return () => unsubscribe();
  }, [result.status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const inputClue = clue.trim().toLowerCase();
    if (!inputClue || loading) return;

    setLoading(true);
    setResult({ status: "idle" });
    setCopied(false);

    let matchFound = false;
    let foundTeamName = "";
    let foundAccessCode = "";

    // 1. Static config / Local Storage first for backend-free deployments
    const stored = localStorage.getItem("stardust_team_clues");
    let allClues = DEFAULT_CLUES;
    try {
      const config = await loadStaticConfig();
      allClues = [...config.teamClues, ...DEFAULT_CLUES];
    } catch {}
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length) allClues = [...parsed, ...DEFAULT_CLUES];
      } catch {}
    }

    const localMatch = allClues.find((r) => r.clue.trim().toLowerCase() === inputClue);
    if (localMatch) {
      matchFound = true;
      foundTeamName = localMatch.teamName;
      foundAccessCode = localMatch.accessCode;
    }

    if (matchFound) {
      setResult({
        status: "success",
        teamName: foundTeamName,
        accessCode: foundAccessCode,
      });
    } else {
      setResult({
        status: "error",
        message: "UNRECOGNIZED FRAGMENT // NO RECORD FOUND IN STARDUST ARCHIVE",
      });
    }

    setLoading(false);
  };

  const copyCode = () => {
    if (result.accessCode) {
      navigator.clipboard.writeText(result.accessCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl text-left font-mono text-xs">
      <div className="rounded-lg border border-signal/40 bg-black/80 p-5 shadow-[0_0_30px_rgba(0,255,170,0.1)] backdrop-blur-md">
        <div className="mb-4 flex items-center justify-between border-b border-signal/20 pb-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-signal animate-pulse" />
            <span className="label-xs text-signal">VERIFICATION TERMINAL · REEL 08</span>
          </div>
          <span className="label-xs text-foreground/40">SECURE PROTOCOL</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="clue-input" className="block text-[10px] uppercase tracking-widest text-foreground/60 mb-1.5">
              ENTER RECOVERED CLUE OR FRAGMENT KEY:
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-signal font-bold">&gt;</span>
              <input
                id="clue-input"
                type="text"
                value={clue}
                onChange={(e) => setClue(e.target.value)}
                placeholder="e.g. ASTERIA-71-ALPHA"
                spellCheck={false}
                autoComplete="off"
                className="w-full rounded border border-signal/30 bg-void/90 py-2.5 pl-8 pr-4 font-mono text-xs text-foreground placeholder:text-muted-foreground/40 focus:border-signal focus:outline-none focus:ring-1 focus:ring-signal"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !clue.trim()}
            className="group relative flex w-full items-center justify-center gap-2 rounded border border-signal/40 bg-signal/10 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-signal transition-all hover:bg-signal/20 disabled:opacity-40 disabled:hover:bg-signal/10"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-signal border-t-transparent" />
                QUERYING ARCHIVE...
              </span>
            ) : (
              <span>VERIFY FRAGMENT</span>
            )}
          </button>
        </form>

        {result.status === "success" && (
          <div className="mt-5 rounded border border-signal/50 bg-signal/10 p-4 space-y-2 text-foreground">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-signal">
                [ ACCESS GRANTED · REGISTRY MATCH ]
              </span>
            </div>
            {result.teamName && (
              <div>
                <span className="text-foreground/50">TEAM: </span>
                <span className="font-semibold text-foreground">{result.teamName}</span>
              </div>
            )}
            {result.accessCode && (
              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-foreground/50">ACCESS CODE: </span>
                  <span className="font-bold text-signal tracking-widest text-sm">{result.accessCode}</span>
                </div>
                <button
                  type="button"
                  onClick={copyCode}
                  className="rounded border border-signal/40 bg-black/40 px-2.5 py-1 text-[10px] text-signal hover:bg-signal/20 transition-colors"
                >
                  {copied ? "COPIED!" : "COPY CODE"}
                </button>
              </div>
            )}
          </div>
        )}

        {result.status === "error" && (
          <div className="mt-5 rounded border border-destructive/50 bg-destructive/10 p-4 text-destructive">
            <div className="text-[10px] font-bold uppercase tracking-wider">
              [ ACCESS DENIED ]
            </div>
            <p className="mt-1 text-[11px] text-destructive/90">{result.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
