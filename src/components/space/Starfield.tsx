import { useEffect, useRef } from "react";

type Star = { x: number; y: number; z: number; pz: number; c: number };

/**
 * Deep-space camera. Stars stream past the viewport, accelerating during the
 * transmission boot and settling into a slow cruise. Speed also reacts to
 * scroll velocity so the page reads as continuous forward flight.
 */
export function Starfield({ warp = false }: { warp?: boolean }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const warpRef = useRef(warp);
  warpRef.current = warp;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let stars: Star[] = [];
    let raf = 0;
    let speed = 0.4;
    let scrollBoost = 0;
    let lastScroll = window.scrollY;

    const HUES = [214, 220, 268, 200];

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.floor(Math.min(900, (w * h) / 1600));
      stars = Array.from({ length: count }, () => spawn(true));
    };

    const spawn = (initial = false): Star => ({
      x: (Math.random() - 0.5) * w * 1.7,
      y: (Math.random() - 0.5) * h * 1.7,
      z: initial ? Math.random() * w : w,
      pz: 0,
      c: HUES[Math.floor(Math.random() * HUES.length)]!,
    });

    const onScroll = () => {
      const dy = window.scrollY - lastScroll;
      lastScroll = window.scrollY;
      scrollBoost = Math.min(2.4, scrollBoost + Math.abs(dy) * 0.012);
    };

    const draw = () => {
      raf = requestAnimationFrame(draw);
      const target = (warpRef.current ? 14 : 0.9) + scrollBoost;
      speed += (target - speed) * 0.045;
      scrollBoost *= 0.93;

      ctx.fillStyle = "rgba(0, 0, 0, 0.36)";
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i]!;
        s.pz = s.z;
        s.z -= speed * 2.4;
        if (s.z < 1) {
          stars[i] = spawn();
          continue;
        }
        const k = 128 / s.z;
        const x = cx + s.x * k;
        const y = cy + s.y * k;
        if (x < -60 || x > w + 60 || y < -60 || y > h + 60) {
          stars[i] = spawn();
          continue;
        }
        const pk = 128 / s.pz;
        const px = cx + s.x * pk;
        const py = cy + s.y * pk;

        const depth = 1 - s.z / w;
        const size = Math.max(0.35, depth * 2.1);
        const alpha = Math.min(1, 0.12 + depth * 1.05);

        ctx.strokeStyle = `hsla(0, 0%, ${72 + depth * 20}%, ${alpha})`;
        ctx.lineWidth = size;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });
    if (reduce) {
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, w, h);
      for (const s of stars) {
        ctx.fillStyle = `hsla(0,0%,92%,0.65)`;
        ctx.fillRect(w / 2 + s.x * (128 / s.z), h / 2 + s.y * (128 / s.z), 1.4, 1.4);
      }
    } else {
      raf = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return <canvas ref={ref} className="h-full w-full" aria-hidden="true" />;
}
