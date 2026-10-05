import { useEffect, useRef, useState } from 'react';

/** خط آخر حرف‌به‌حرف تایپ میشه، مثل ترمینال واقعی */
function TypeLine({ text }: { text: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    let i = 0;
    const id = window.setInterval(() => { i += 2; setN(i); if (i >= text.length) window.clearInterval(id); }, 14);
    return () => window.clearInterval(id);
  }, [text]);
  return <>{text.slice(0, n)}</>;
}

/**
 * v2.6 · ترمینال هکری موقع اتصال: لاگ زنده‌ی Aether (یا مراحل مدل ۱) به سبک ماتریکس.
 */
export default function Terminal({ lines, secs, title }: { lines: string[]; secs?: number; title: string }) {
  const body = useRef<HTMLDivElement>(null);
  useEffect(() => { body.current?.scrollTo({ top: 1e6 }); }, [lines]);
  const shown = lines.slice(-6);
  return (
    <div className="term" dir="ltr">
      <div className="term-h">
        <i /><i /><i />
        <span>{title}</span>
        {secs !== undefined && <b className="mono">{secs}s</b>}
      </div>
      <div className="term-b mono" ref={body}>
        {shown.map((l, i) => (
          <div key={lines.length - shown.length + i} className={`tl ${l.startsWith('✓') ? 'ok' : l.toLowerCase().includes('error') || l.toLowerCase().includes('fail') ? 'err' : ''}`}>
            <span className="tp">{l.startsWith('✓') ? '' : '›'}</span>
            {i === shown.length - 1 ? <TypeLine text={l} /> : l}
            {i === shown.length - 1 && <span className="caret" />}
          </div>
        ))}
        {!shown.length && <div className="tl"><span className="tp">›</span><span className="caret" /></div>}
      </div>
    </div>
  );
}
