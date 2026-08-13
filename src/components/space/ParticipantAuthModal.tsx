import { useState, useEffect } from "react";
import { loadStaticConfig, type StaticTeamClue } from "@/lib/static-config";

export function ParticipantAuthModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (team: StaticTeamClue) => void;
}) {
  const [passwordInput, setPasswordInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setPasswordInput("");
      setErrorMsg("");
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = passwordInput.trim();
    if (!cleanInput || loading) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const config = await loadStaticConfig();
      const teams = config.teamClues;

      // Check if password matches accessCode (case-sensitive or exact) or clue
      const matchedTeam = teams.find(
        (t) =>
          t.accessCode === cleanInput ||
          t.accessCode.toLowerCase() === cleanInput.toLowerCase() ||
          t.clue.toLowerCase() === cleanInput.toLowerCase()
      );

      if (matchedTeam) {
        // Save session locally
        if (typeof window !== "undefined") {
          sessionStorage.setItem("stardust_active_team", JSON.stringify(matchedTeam));
        }
        onSuccess(matchedTeam);
      } else {
        setErrorMsg("INVALID ACCESS CODE OR PASSWORD // VERIFY YOUR TEAM CREDENTIALS");
      }
    } catch {
      setErrorMsg("AUTHENTICATION SYSTEM ERROR // TRY AGAIN");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md transition-all"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-xl border border-signal/40 bg-void/95 p-6 shadow-[0_0_50px_rgba(0,255,170,0.15)] sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between border-b border-signal/20 pb-4">
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-signal animate-pulse" />
            <h3 className="font-display text-sm uppercase tracking-[0.2em] text-glow">
              TEAM LOGIN PORTAL
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-xs text-foreground/40 hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <p className="mb-6 font-mono text-xs leading-relaxed text-foreground/70">
          Enter your team’s assigned password or access code to authenticate and launch the step phase.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="team-password-input"
              className="block font-mono text-[10px] uppercase tracking-widest text-foreground/60 mb-2"
            >
              TEAM ACCESS CODE / PASSWORD:
            </label>
            <div className="relative flex items-center">
              <input
                id="team-password-input"
                type={showPassword ? "text" : "password"}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="e.g. St@rDust!71"
                autoFocus
                spellCheck={false}
                autoComplete="off"
                className="w-full rounded border border-signal/30 bg-black/90 py-3 pl-4 pr-12 font-mono text-xs text-foreground placeholder:text-muted-foreground/30 focus:border-signal focus:outline-none focus:ring-1 focus:ring-signal"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 font-mono text-[10px] uppercase text-signal/70 hover:text-signal"
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="rounded border border-destructive/50 bg-destructive/10 p-3 font-mono text-[11px] text-destructive">
              <span className="font-bold">[ ACCESS DENIED ]</span>
              <p className="mt-1 text-[10px] text-destructive/80">{errorMsg}</p>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !passwordInput.trim()}
              className="group relative flex w-full items-center justify-center gap-2 rounded border border-signal/50 bg-signal/15 px-4 py-3 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-signal transition-all hover:bg-signal/25 disabled:opacity-40"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-signal border-t-transparent" />
                  AUTHENTICATING...
                </span>
              ) : (
                <span>AUTHENTICATE & ENTER STEP PHASE &rarr;</span>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 border-t border-signal/10 pt-4 text-center font-mono text-[9px] uppercase tracking-widest text-foreground/40">
          STARDUST 2K26 · INTERNAL AUTHENTICATION PROTOCOL
        </div>
      </div>
    </div>
  );
}
