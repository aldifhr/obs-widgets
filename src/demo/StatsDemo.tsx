import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_STATS_CONFIG, type StatsConfig, type StatsState } from '../stats/types';
import StatsBar from '../components/StatsBar';

const inputCls =
  'w-full rounded-lg border border-[#262a33] bg-[#0f1115] px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 focus:border-[#22d3ee] focus:outline-none';
const labelCls = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400';

const POSITIONS: Array<{ value: StatsConfig['position']; label: string }> = [
  { value: 'top-center', label: 'Top Center' },
  { value: 'top-left', label: 'Top Left' },
  { value: 'top-right', label: 'Top Right' },
  { value: 'bottom-center', label: 'Bottom Center' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-right', label: 'Bottom Right' },
];

export default function StatsDemo() {
  const [display, setDisplay] = useState({
    position: DEFAULT_STATS_CONFIG.position,
    accent: DEFAULT_STATS_CONFIG.accent,
    fontScale: 1,
  });
  const [stats, setStats] = useState<StatsState>({ viewers: 842, likes: 12450, followers: 0 });
  const [running, setRunning] = useState(true);

  const likesRef = useRef(12450);
  const followersRef = useRef(0);

  const tick = useCallback(() => {
    setStats((s) => {
      const viewers = Math.max(300, Math.round(s.viewers + (Math.random() - 0.5) * 60));
      likesRef.current += Math.floor(Math.random() * 30) + 3;
      followersRef.current += Math.random() < 0.3 ? 1 : 0;
      return { viewers, likes: likesRef.current, followers: followersRef.current };
    });
  }, []);

  const tickRef = useRef(tick);
  tickRef.current = tick;

  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => tickRef.current(), 2000);
    return () => window.clearInterval(t);
  }, [running]);

  const buildConfig = useCallback(
    (): StatsConfig => ({
      ...DEFAULT_STATS_CONFIG,
      position: display.position,
      accent: display.accent,
      fontSizeScale: display.fontScale,
    }),
    [display.position, display.accent, display.fontScale],
  );

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-10 text-gray-200">
      <header className="mb-8">
        <h1 className="text-2xl font-black tracking-tight text-white">Live Stats Bar — Demo</h1>
        <p className="mt-1 text-sm text-gray-400">
          Simulasi viewer / like / follow yang bergerak real-time.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <section className="rounded-2xl border border-[#1f232b] bg-[#0f1115] p-5">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-400">Simulasi</h2>

          <label className="mb-3 flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="accent-[#22d3ee]"
              checked={running}
              onChange={(e) => setRunning(e.target.checked)}
            />
            Update statistik otomatis
          </label>

          <h2 className="mb-3 mt-6 text-sm font-bold uppercase tracking-wider text-gray-400">
            Desain Overlay
          </h2>

          <label className={labelCls}>Posisi</label>
          <select
            className={`${inputCls} mb-3`}
            value={display.position}
            onChange={(e) => setDisplay((s) => ({ ...s, position: e.target.value as StatsConfig['position'] }))}
          >
            {POSITIONS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>

          <label className={labelCls}>Accent</label>
          <input
            type="color"
            className="mb-3 h-10 w-full cursor-pointer rounded-lg border border-[#262a33] bg-[#0f1115]"
            value={display.accent}
            onChange={(e) => setDisplay((s) => ({ ...s, accent: e.target.value }))}
          />

          <label className={labelCls}>Font Size · {display.fontScale.toFixed(2)}</label>
          <input
            type="range"
            className="w-full accent-[#22d3ee]"
            min={0.8}
            max={1.6}
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
            <StatsBar config={buildConfig()} stats={stats} />
          </div>
          <p className="mt-3 text-xs text-gray-500">
            Nilai saat ini: {stats.viewers} viewers · {stats.likes} likes · {stats.followers} follows
            (sesi).
          </p>
        </section>
      </div>
    </div>
  );
}
