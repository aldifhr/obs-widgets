import { useEffect, useState } from 'react';

export default function CountdownWidget() {
  const params = new URLSearchParams(window.location.search);
  const target = params.get('to') || '';
  const label = params.get('label') || 'Event';
  const width = params.get('w') || '380';

  const [now, setNow] = useState(() => Date.now());
  const targetDate = new Date(target);
  const valid = !!target && !isNaN(targetDate.getTime());

  useEffect(() => {
    if (!valid) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [valid]);

  const dateLabel = valid ? targetDate.toLocaleString() : '';

  let display = '--:--:--';
  if (!valid) {
    display = 'Set ?to=ISO_DATE';
  } else {
    let diff = Math.max(0, Math.floor((targetDate.getTime() - now) / 1000));
    const d = Math.floor(diff / 86400);
    diff %= 86400;
    const h = Math.floor(diff / 3600);
    diff %= 3600;
    const m = Math.floor(diff / 60);
    const s = diff % 60;
    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    parts.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    display = parts.join(' ');
  }

  return (
    <div
      className="rounded-2xl border border-white/10 border-l-4 border-l-[#a78bfa] bg-gradient-to-br from-[#11141a]/90 to-[#0b0d11]/90 p-[18px_20px] shadow-[0_18px_50px_rgba(0,0,0,0.54),inset_0_1px_rgba(255,255,255,0.06)] backdrop-blur"
      style={{ width: `${width}px` }}
    >
      <div className="mb-2 text-[0.75em] font-semibold uppercase tracking-[1.5px] text-[#9ca3af]">{label}</div>
      <div className="text-[1.6em] font-extrabold leading-[1.2] tracking-[0.5px]">{display}</div>
      <div className="mt-1 text-[0.8em] text-[#9ca3af]">{dateLabel}</div>
    </div>
  );
}
