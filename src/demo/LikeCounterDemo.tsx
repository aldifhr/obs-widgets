import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DEFAULT_LIKECOUNTER_CONFIG,
  type LikeCounterConfig,
} from '../likes/types';
import LikeCounter from '../components/LikeCounter';

const inputCls =
  'w-full rounded-lg border border-[#262a33] bg-[#0f1115] px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 focus:border-[#f43f5e] focus:outline-none';
const labelCls = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400';

const POSITIONS: Array<{ value: LikeCounterConfig['position']; label: string }> = [
  { value: 'bottom-right', label: 'Bottom Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-center', label: 'Bottom Center' },
  { value: 'center', label: 'Center' },
];

export default function LikeCounterDemo() {
  const [display, setDisplay] = useState({
    position: DEFAULT_LIKECOUNTER_CONFIG.position,
    accent: DEFAULT_LIKECOUNTER_CONFIG.accent,
    accentLight: DEFAULT_LIKECOUNTER_CONFIG.accentLight,
    fontScale: 1,
  });
  const [total, setTotal] = useState(567890);
  const [running, setRunning] = useState(true);

  const totalRef = useRef(567890);

  const tick = useCallback(() => {
    totalRef.current += Math.floor(Math.random() * 40) + 5;
    setTotal(totalRef.current);
  }, []);

  const tickRef = useRef(tick);
  tickRef.current = tick;

  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => tickRef.current(), 1500);
    return () => window.clearInterval(t);
  }, [running]);

  const buildConfig = useCallback(
    (): LikeCounterConfig => ({
      ...DEFAULT_LIKECOUNTER_CONFIG,
      position: display.position,
      accent: display.accent,
      accentLight: display.accentLight,
      fontSizeScale: display.fontScale,
    }),
    [display.position, display.accent, display.accentLight, display.fontScale],
  );

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-10 text-gray-200">
      <header className="mb-8">
        <h1 className="text-2xl font-black tracking-tight text-white">Like Counter — Demo</h1>
        <p className="mt-1 text-sm text-gray-400">Simulasi counter total like yang terus naik.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <section className="rounded-2xl border border-[#1f232b] bg-[#0f1115] p-5">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-400">Simulasi</h2>

          <label className="mb-3 flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="accent-[#f43f5e]"
              checked={running}
              onChange={(e) => setRunning(e.target.checked)}
            />
            Auto tambah like
          </label>

          <h2 className="mb-3 mt-6 text-sm font-bold uppercase tracking-wider text-gray-400">
            Desain Overlay
          </h2>

          <label className={labelCls}>Posisi</label>
          <select
            className={`${inputCls} mb-3`}
            value={display.position}
            onChange={(e) => setDisplay((s) => ({ ...s, position: e.target.value as LikeCounterConfig['position'] }))}
          >
            {POSITIONS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>

          <div className="mb-3 grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Accent</label>
              <input
                type="color"
                className="h-10 w-full cursor-pointer rounded-lg border border-[#262a33] bg-[#0f1115]"
                value={display.accent}
                onChange={(e) => setDisplay((s) => ({ ...s, accent: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelCls}>Accent Light</label>
              <input
                type="color"
                className="h-10 w-full cursor-pointer rounded-lg border border-[#262a33] bg-[#0f1115]"
                value={display.accentLight}
                onChange={(e) => setDisplay((s) => ({ ...s, accentLight: e.target.value }))}
              />
            </div>
          </div>

          <label className={labelCls}>Font Size · {display.fontScale.toFixed(2)}</label>
          <input
            type="range"
            className="w-full accent-[#f43f5e]"
            min={0.8}
            max={1.8}
            step={0.05}
            value={display.fontScale}
            onChange={(e) => setDisplay((s) => ({ ...s, fontScale: parseFloat(e.target.value) }))}
          />
        </section>

        <section className="rounded-2xl border border-[#1f232b] bg-[#0f1115] p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-400">
            Preview Overlay (simulasi TikTok Live)
          </h2>
          <div className="demo-canvas relative aspect-video overflow-hidden rounded-xl bg-[radial-gradient(700px_350px_at_50%_0%,#151a22,#08090c)]">
            <div className="pointer-events-none absolute left-3 top-3 rounded-md bg-black/40 px-2 py-1 text-[11px] font-bold text-white/70">
              {running ? '● LIVE SIMULATION' : '◻ PAUSED'}
            </div>
            <LikeCounter config={buildConfig()} total={total} />
          </div>
        </section>
      </div>
    </div>
  );
}
