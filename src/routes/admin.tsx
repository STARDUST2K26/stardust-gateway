import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  component: AdminDisabledPage,
});

function AdminDisabledPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Admin route disabled — redirect to home landing page
    navigate({ to: "/", replace: true });
  }, [navigate]);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-void px-6 text-center text-foreground font-mono">
      <div className="space-y-4 max-w-md">
        <span className="label-xs text-signal">[ ROUTE DISABLED ]</span>
        <h1 className="font-display text-2xl tracking-[0.12em] text-glow">
          ADMIN CONSOLE DEACTIVATED
        </h1>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Static file storage mode is active. Edit <code className="text-signal">public/stardust-config.json</code> to update site configuration and team clue records.
        </p>
        <div className="pt-4">
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-signal/40 bg-signal/10 px-6 py-2.5 text-xs text-signal hover:bg-signal/20 transition-colors"
          >
            &larr; Return to Homepage
          </a>
        </div>
      </div>
    </main>
  );
}
