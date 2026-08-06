import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DEFAULT_COMMENT_CONFIG,
  type CommentConfig,
  type CommentItem,
} from '../comments/types';
import CommentTicker from '../components/CommentTicker';

const inputCls =
  'w-full rounded-lg border border-[#262a33] bg-[#0f1115] px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 focus:border-[#14b8a6] focus:outline-none';
const labelCls = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400';

const VIEWERS = [
  { id: 'budisantoso', name: 'BudiSantoso' },
  { id: 'mbak_intan', name: 'Mbak_Intan' },
  { id: 'gaming_rizki', name: 'gaming_rizki' },
  { id: 'putrinadia', name: 'PutriNadia' },
  { id: 'mrlegend', name: 'MrLegend' },
  { id: 'deameii', name: 'dea_meii' },
  { id: 'salsabila', name: 'Salsabila' },
];

const COMMENTS = [
  'gas terus bang!',
  'pertamaxx',
  'keren bgt streamingnya',
  'mau masuk ranTV nih',
  'W music dong',
  'haha lucu',
  'salam dari papua',
  'makin rame aja',
];

const POSITIONS: Array<{ value: CommentConfig['position']; label: string }> = [
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-center', label: 'Bottom Center' },
  { value: 'bottom-right', label: 'Bottom Right' },
  { value: 'center', label: 'Center' },
];

function randomComment(): CommentItem {
  const viewer = VIEWERS[Math.floor(Math.random() * VIEWERS.length)];
  return {
    id: 0,
    nickname: viewer.name,
    avatar: `https://i.pravatar.cc/64?u=${viewer.id}`,
    comment: COMMENTS[Math.floor(Math.random() * COMMENTS.length)],
  };
}

export default function CommentDemo() {
  const [display, setDisplay] = useState({
    position: DEFAULT_COMMENT_CONFIG.position,
    accent: DEFAULT_COMMENT_CONFIG.accent,
    fontScale: 1,
    maxEntries: DEFAULT_COMMENT_CONFIG.maxEntries,
    entryDurationSec: DEFAULT_COMMENT_CONFIG.entryDurationSec,
  });
  const [items, setItems] = useState<CommentItem[]>([]);
  const [autoplay, setAutoplay] = useState(true);
  const [intervalSec, setIntervalSec] = useState(3);

  const idRef = useRef(0);
  const timersRef = useRef<Record<number, number>>({});

  const pushComment = useCallback(() => {
    const c = randomComment();
    const id = ++idRef.current;
    const item: CommentItem = { ...c, id };
    setItems((prev) => [...prev, item].slice(-display.maxEntries));
    timersRef.current[id] = window.setTimeout(() => {
      setItems((prev) => prev.filter((i) => i.id !== id));
      delete timersRef.current[id];
    }, display.entryDurationSec * 1000);
  }, [display.maxEntries, display.entryDurationSec]);

  const pushRef = useRef(pushComment);
  pushRef.current = pushComment;

  useEffect(() => {
    if (!autoplay) return;
    const t = window.setInterval(() => pushRef.current(), intervalSec * 1000);
    return () => window.clearInterval(t);
  }, [autoplay, intervalSec]);

  useEffect(
    () => () => {
      for (const t of Object.values(timersRef.current)) window.clearTimeout(t);
    },
    [],
  );

  const buildConfig = useCallback(
    (): CommentConfig => ({
      ...DEFAULT_COMMENT_CONFIG,
      position: display.position,
      accent: display.accent,
      fontSizeScale: display.fontScale,
      maxEntries: display.maxEntries,
      entryDurationSec: display.entryDurationSec,
    }),
    [display.position, display.accent, display.fontScale, display.maxEntries, display.entryDurationSec],
  );

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-10 text-gray-200">
      <header className="mb-8">
        <h1 className="text-2xl font-black tracking-tight text-white">Comment Ticker — Demo</h1>
        <p className="mt-1 text-sm text-gray-400">
          Simulasi komentar viewer yang masuk ke feed overlay.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <section className="rounded-2xl border border-[#1f232b] bg-[#0f1115] p-5">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-400">Simulasi</h2>

          <label className="mb-3 flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="accent-[#14b8a6]"
              checked={autoplay}
              onChange={(e) => setAutoplay(e.target.checked)}
            />
            Auto komentar setiap {intervalSec}s
          </label>

          <label className={labelCls}>Interval Komentar</label>
          <input
            type="range"
            className="mb-3 w-full accent-[#14b8a6]"
            min={1}
            max={10}
            step={1}
            value={intervalSec}
            onChange={(e) => setIntervalSec(parseInt(e.target.value, 10))}
          />

          <button
            onClick={() => pushRef.current()}
            className="w-full rounded-lg bg-white/10 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/15"
          >
            Kirim Komentar Sekarang
          </button>

          <h2 className="mb-3 mt-6 text-sm font-bold uppercase tracking-wider text-gray-400">
            Perilaku & Desain
          </h2>

          <label className={labelCls}>Max Komentar · {display.maxEntries}</label>
          <input
            type="range"
            className="mb-3 w-full accent-[#14b8a6]"
            min={1}
            max={8}
            step={1}
            value={display.maxEntries}
            onChange={(e) => setDisplay((s) => ({ ...s, maxEntries: parseInt(e.target.value, 10) }))}
          />

          <label className={labelCls}>Lama Tampil · {display.entryDurationSec}s</label>
          <input
            type="range"
            className="mb-3 w-full accent-[#14b8a6]"
            min={4}
            max={30}
            step={1}
            value={display.entryDurationSec}
            onChange={(e) => setDisplay((s) => ({ ...s, entryDurationSec: parseInt(e.target.value, 10) }))}
          />

          <label className={labelCls}>Posisi</label>
          <select
            className={`${inputCls} mb-3`}
            value={display.position}
            onChange={(e) => setDisplay((s) => ({ ...s, position: e.target.value as CommentConfig['position'] }))}
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
            className="w-full accent-[#14b8a6]"
            min={0.8}
            max={1.4}
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
              {autoplay ? '● LIVE SIMULATION' : '◻ PAUSED'}
            </div>
            <CommentTicker config={buildConfig()} items={items} />
          </div>
        </section>
      </div>
    </div>
  );
}
