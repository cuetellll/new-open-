import { useEffect, useRef } from 'react';

/**
 * v2.6 · جشن اتصال: یه انفجار ذرات رنگی از وسط دکمه‌ی اتصال.
 * هر بار که `fire` عوض بشه یه انفجار جدید.
 */
export default function Confetti({ fire, colors, reduce }: { fire: number; colors: string[]; reduce?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!fire || reduce) return;
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d')!;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const box = cv.getBoundingClientRect();
    cv.width = box.width * dpr; cv.height = box.height * dpr;
    const core = document.querySelector('.core')?.getBoundingClientRect();
    const ox = core ? core.left + core.width / 2 - box.left : box.width / 2;
    const oy = core ? core.top + core.height / 2 - box.top : box.height / 2;
    const ps = Array.from({ length: 140 }, () => {
      const a = Math.random() * Math.PI * 2, v = 180 + Math.random() * 520;
      return {
        x: ox, y: oy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 160,
        c: colors[Math.floor(Math.random() * colors.length)],
        s: 3 + Math.random() * 5, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 14,
        kind: Math.random() < 0.3 ? 1 : 0,
      };
    });
    const t0 = performance.now(); let last = t0, raf = 0;
    const frame = (now: number) => {
      const dt = Math.min(48, now - last) / 1000; last = now;
      const k = (now - t0) / 1800;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, box.width, box.height);
      if (k >= 1) return;
      for (const p of ps) {
        p.vy += 620 * dt; p.vx *= 1 - 1.6 * dt; p.vy *= 1 - 0.9 * dt;
        p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
        ctx.globalAlpha = 1 - k * k;
        ctx.fillStyle = p.c;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        if (p.kind) { ctx.beginPath(); ctx.arc(0, 0, p.s / 2, 0, Math.PI * 2); ctx.fill(); }
        else ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
        ctx.restore();
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); ctx.clearRect(0, 0, cv.width, cv.height); };
  }, [fire]); // eslint-disable-line
  return <canvas ref={ref} className="confetti" aria-hidden />;
}
