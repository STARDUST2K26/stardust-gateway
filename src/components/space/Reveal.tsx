import { useEffect, useRef, useState } from "react";

/** Reveals children on first intersection — cinematic drift-up, never re-fires. */
export function useReveal<T extends HTMLElement>(threshold = 0.22) {
  const ref = useRef<T | null>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setSeen(true);
            io.disconnect();
          }
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen, threshold]);

  return { ref, seen };
}

export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, seen } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`reveal ${seen ? "in-view" : ""} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/** Small monospace section marker used across every scene. */
export function SceneTag({ index, title }: { index: string; title: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="label-xs text-signal/80">{index}</span>
      <span className="hairline w-10 shrink-0" />
      <span className="label-xs">{title}</span>
    </div>
  );
}
