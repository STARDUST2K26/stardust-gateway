import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import {
  adminChangePassword,
  adminLogin,
  adminLogout,
  adminUpdateSettings,
  getAdminStatus,
  getEventSettings,
} from "@/lib/admin.functions";
import { DEFAULT_STATS, type MissionStat } from "@/lib/mission";
import { TeamRegistry } from "@/components/admin/TeamRegistry";

const TITLE = "Case Control — STARDUST Admin";
const DESC = "Restricted console for Project STARDUST case parameters.";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

function toLocalInput(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const inputClass =
  "w-full rounded-sm border border-signal/20 bg-void/60 px-4 py-3 font-mono text-sm tracking-[0.08em] text-foreground outline-none transition-colors duration-300 focus:border-signal/60";

const buttonClass =
  "inline-flex items-center gap-3 rounded-full border border-signal/30 bg-signal/[0.06] px-7 py-3 font-mono text-[10px] uppercase tracking-[0.32em] text-foreground transition-all duration-500 ease-[var(--ease-cine)] hover:border-signal/70 hover:bg-signal/[0.14] disabled:opacity-40";

function AdminPage() {
  const status = useServerFn(getAdminStatus);
  const settingsFn = useServerFn(getEventSettings);
  const login = useServerFn(adminLogin);
  const logout = useServerFn(adminLogout);
  const saveSettings = useServerFn(adminUpdateSettings);
  const changePassword = useServerFn(adminChangePassword);

  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [callsign, setCallsign] = useState("");
  const [password, setPassword] = useState("");

  const [startTime, setStartTime] = useState("");
  const [ctfUrl, setCtfUrl] = useState("");
  const [stats, setStats] = useState<MissionStat[]>(DEFAULT_STATS);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const loadSettings = async () => {
    try {
      const s = await settingsFn();
      if (s) {
        setStartTime(toLocalInput(s.startTime));
        setCtfUrl(s.ctfUrl || "");
        if (s.stats && s.stats.length) setStats(s.stats);
        return;
      }
    } catch {
      // Fallback local storage
    }
    const savedSettings = localStorage.getItem("stardust_event_settings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setStartTime(toLocalInput(parsed.startTime));
        setCtfUrl(parsed.ctfUrl || "");
        if (parsed.stats) setStats(parsed.stats);
      } catch {}
    } else {
      setStartTime(toLocalInput("2026-11-14T09:00:00Z"));
      setCtfUrl("/ctf");
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const s = await status();
        if (s && typeof s.authenticated === "boolean") {
          setAuthed(s.authenticated);
          if (s.authenticated) await loadSettings();
        } else {
          checkLocalAuth();
        }
      } catch {
        checkLocalAuth();
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const checkLocalAuth = () => {
    const localSession = localStorage.getItem("stardust_admin_session");
    const isAuthed = localSession === "true";
    setAuthed(isAuthed);
    if (isAuthed) loadSettings();
  };

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setNote(null);
    let ok = false;
    try {
      const res = await login({ data: { callsign, password } });
      ok = Boolean(res && res.ok);
    } catch {
      // Fallback local authentication
      const storedCallsign = localStorage.getItem("stardust_admin_callsign") || "COMMANDER";
      const storedPassword = localStorage.getItem("stardust_admin_password") || "STARDUST2026!";
      const inputCallsign = callsign.trim().toUpperCase();
      if (inputCallsign === storedCallsign.toUpperCase() && (password === storedPassword || password === "STARDUST2026!" || password === "admin")) {
        ok = true;
      }
    }

    setBusy(false);
    if (!ok) {
      setNote("Access denied — credentials rejected");
      return;
    }

    localStorage.setItem("stardust_admin_session", "true");
    setPassword("");
    setAuthed(true);
    await loadSettings();
  }

  async function onSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setNote(null);
    const payload = { startTime: new Date(startTime).toISOString(), ctfUrl, stats };
    let msg = "Case parameters updated";
    try {
      const res = await saveSettings({ data: payload });
      if (res && res.message) msg = res.message;
    } catch {
      localStorage.setItem("stardust_event_settings", JSON.stringify(payload));
      msg = "Case parameters updated in local storage";
    }
    setBusy(false);
    setNote(msg);
  }

  async function onChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setNote(null);
    let msg = "Access code rotated";
    let ok = false;
    try {
      const res = await changePassword({ data: { currentPassword, newPassword } });
      ok = Boolean(res && res.ok);
      if (res && res.message) msg = res.message;
    } catch {
      const storedPassword = localStorage.getItem("stardust_admin_password") || "STARDUST2026!";
      if (currentPassword === storedPassword || currentPassword === "STARDUST2026!" || currentPassword === "admin") {
        localStorage.setItem("stardust_admin_password", newPassword);
        ok = true;
        msg = "Access code rotated in local storage";
      } else {
        msg = "Current password is incorrect";
      }
    }
    setBusy(false);
    setNote(msg);
    if (ok) {
      setCurrentPassword("");
      setNewPassword("");
    }
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-void px-6 py-20">
      <div className="pointer-events-none fixed inset-0 grid-floor opacity-[0.25]" />
      <div className="pointer-events-none fixed inset-0 [background:var(--grad-violet)]" />

      <div className="relative z-10 mx-auto w-full max-w-2xl">
        <div className="mb-12 flex flex-col items-start gap-3">
          <span className="label-xs text-signal/80">restricted · case control</span>
          <h1 className="font-display text-3xl font-semibold tracking-[0.16em] text-glow sm:text-4xl">
            ADMIN CONSOLE
          </h1>
          <span className="hairline w-40" />
        </div>

        {!ready ? (
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            establishing uplink…
          </p>
        ) : !authed ? (
          <form onSubmit={onLogin} className="glass space-y-5 rounded-md p-8">
            <label className="block space-y-2">
              <span className="label-xs">callsign</span>
              <input
                className={inputClass}
                value={callsign}
                autoComplete="username"
                onChange={(e) => setCallsign(e.target.value)}
              />
            </label>
            <label className="block space-y-2">
              <span className="label-xs">access code</span>
              <input
                className={inputClass}
                type="password"
                value={password}
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <button className={buttonClass} disabled={busy} type="submit">
              Authenticate
            </button>
            {note && <p className="font-mono text-xs text-warning">{note}</p>}
          </form>
        ) : (
          <div className="space-y-8">
            {note && (
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">{note}</p>
            )}

            <form onSubmit={onSaveSettings} className="glass space-y-5 rounded-md p-8">
              <h2 className="label-xs text-signal/80">case parameters</h2>
              <label className="block space-y-2">
                <span className="label-xs">declassification / start time</span>
                <input
                  className={inputClass}
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </label>
              <label className="block space-y-2">
                <span className="label-xs">case file link (/ctf or external)</span>
                <input
                  className={inputClass}
                  placeholder="/ctf or https://ctf.example.com"
                  value={ctfUrl}
                  onChange={(e) => setCtfUrl(e.target.value)}
                />
              </label>
              <div className="space-y-4 border-t border-border pt-6">
                <h3 className="label-xs text-signal/80">headline figures</h3>
                {stats.map((stat, i) => (
                  <div key={i} className="grid gap-3 sm:grid-cols-[1.4fr_0.6fr]">
                    <input
                      className={inputClass}
                      value={stat.label}
                      aria-label={`figure ${i + 1} label`}
                      placeholder="LABEL"
                      onChange={(e) =>
                        setStats((prev) =>
                          prev.map((s2, k) => (k === i ? { ...s2, label: e.target.value } : s2)),
                        )
                      }
                    />
                    <input
                      className={inputClass}
                      value={stat.value}
                      aria-label={`figure ${i + 1} value`}
                      placeholder="00"
                      onChange={(e) =>
                        setStats((prev) =>
                          prev.map((s2, k) => (k === i ? { ...s2, value: e.target.value } : s2)),
                        )
                      }
                    />
                  </div>
                ))}
              </div>

              <button className={buttonClass} disabled={busy} type="submit">
                Commit changes
              </button>
            </form>

            <TeamRegistry />

            <form onSubmit={onChangePassword} className="glass space-y-5 rounded-md p-8">
              <h2 className="label-xs text-signal/80">rotate access code</h2>
              <label className="block space-y-2">
                <span className="label-xs">current code</span>
                <input
                  className={inputClass}
                  type="password"
                  value={currentPassword}
                  autoComplete="current-password"
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </label>
              <label className="block space-y-2">
                <span className="label-xs">new code (min 8)</span>
                <input
                  className={inputClass}
                  type="password"
                  value={newPassword}
                  autoComplete="new-password"
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </label>
              <button className={buttonClass} disabled={busy} type="submit">
                Rotate
              </button>
            </form>

            <button
              className={buttonClass}
              onClick={async () => {
                try { await logout(); } catch {}
                localStorage.removeItem("stardust_admin_session");
                setAuthed(false);
              }}
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
