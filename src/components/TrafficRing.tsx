import { useEffect, useRef } from 'react';

type Props = { on: boolean; down: number; up: number; st: string; a2: string; reduce?: boolean };

/**
 * v2.6 · حلقه‌ی ترافیک زنده دور دکمه‌ی اتصال.
 * ذرات دانلود (رنگ وضعیت) ساعتگرد و ذرات آپلود (رنگ دوم تم) پادساعتگرد می‌چرخن؛
 * هرچی سرعت بیشتر باشه، ذرات بیشتر و تندتر میشن.
 */
export default function TrafficRing(p: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const props = useRef(p);
  props.current = p;

  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext('2d')!;
    let raf = 0, last = performance.now(), vis = 0;
    // شدت نرم‌شده تا با هر آپدیت ثانیه‌ای پرش نکنه
    let iD = 0, iU = 0;
    const N = 70;
    const parts = Array.from({ length: N }, (_, i) => ({
      a: Math.random() * Math.PI * 2,
      r: 0.78 + Math.random() * 0.2,
      s: 0.6 + Math.random() * 0.8,
      up: i % 3 === 0,
      k: 0, // ترتیب داخل گروه
      ph: Math.random() * Math.PI * 2,
    }));
    // ۲/۳ ذرات دانلودن، ۱/۳ آپلود
    const ND = parts.filter((q) => !q.up).length, NU = N - ND;
    parts.filter((q) => !q.up).forEach((q, j) => { q.k = j; });
    parts.filter((q) => q.up).forEach((q, j) => { q.k = j; });
    const lvl = (b: number) => Math.min(1, Math.log10(1 + b / 1024) / 4); // 0 تا ۱ (~10MB/s = ۱)

    const frame = (now: number) => {
      const P = props.current;
      const dt = Math.min(64, now - last) / 1000; last = now;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = cv.clientWidth, h = cv.clientHeight;
      if (cv.width !== Math.round(w * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      vis += ((P.on ? 1 : 0) - vis) * Math.min(1, dt * 4);
      iD += (lvl(P.down) - iD) * Math.min(1, dt * 2);
      iU += (lvl(P.up) - iU) * Math.min(1, dt * 2);
      if (vis > 0.01) {
        const cx = w / 2, cy = h / 2, R = Math.min(w, h) / 2;
        const showD = Math.round(ND * (0.2 + 0.8 * iD)), showU = Math.round(NU * (0.15 + 0.85 * iU));
        for (const q of parts) {
          const it = q.up ? iU : iD;
          if (q.k >= (q.up ? showU : showD)) continue;
          if (!P.reduce) q.a += (q.up ? -1 : 1) * dt * q.s * (0.35 + it * 3.2);
          const rr = R * (q.r + Math.sin(now / 600 + q.ph) * 0.015);
          const x = cx + Math.cos(q.a) * rr, y = cy + Math.sin(q.a) * rr;
          const col = q.up ? P.a2 : P.st;
          ctx.globalAlpha = vis * (0.35 + it * 0.65);
          ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 6 + it * 10;
          // دنباله‌ی کوتاه پشت هر ذره
          const tail = 0.05 + it * 0.22, dir = q.up ? 1 : -1;
          ctx.strokeStyle = col; ctx.lineWidth = 1.4 * q.s; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.arc(cx, cy, rr, q.a + (dir < 0 ? -tail : 0), q.a + (dir < 0 ? 0 : tail)); ctx.stroke();
          ctx.beginPath(); ctx.arc(x, y, 1.1 + q.s * 0.9, 0, Math.PI * 2); ctx.fill();
        }
        ctx.shadowBlur = 0; ctx.globalAlpha = 1;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={ref} className="traffic" aria-hidden />;
}
