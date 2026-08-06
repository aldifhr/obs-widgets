import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_JOIN_CONFIG, type JoinConfig, type JoinEvent } from '../join/types';
import JoinToast from '../components/JoinToast';

const inputCls =
  'w-full rounded-lg border border-[#262a33] bg-[#0f1115] px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 focus:border-[#16a34a] focus:outline-none';
const labelCls = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400';

const VIEWERS = [
  { id: 'budisantoso', name: 'BudiSantoso' },
  { id: 'mbak_intan', name: 'Mbak_Intan' },
  { id: 'gaming_rizki', name: 'gaming_rizki' },
  { id: 'putrinadia', name: 'PutriNadia' },
  { id: 'mrlegend', name: 'MrLegend' },
  { id: 'rakaaa', name: 'Raka' },
  { id: 'deameii', name: 'dea_meii' },
  { id: 'andik', name: 'Andi_K' },
  { id: 'salsabila', name: 'Salsabila' },
  { id: 'tommyspeed', name: 'tommy_speed' },
  { id: 'vinacantik', name: 'VinaCantik' },
  { id: 'kakekkuadrat', name: 'KakekKuadrat' },
];

const POSITIONS: Array<{ value: JoinConfig['position']; label: string }> = [
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-center', label: 'Bottom Center' },
  { value: 'bottom-right', label: 'Bottom Right' },
  { value: 'center', label: 'Center' },
];

interface LogEntry {
  id: number;
  join: JoinEvent;
  time: string;
}

function randomJoin(): JoinEvent {
  const viewer = VIEWERS[Math.floor(Math.random() * VIEWERS.length)];
  return {
    nickname: viewer.name,
    uniqueId: viewer.id,
    avatar: `https://i.pravatar.cc/128?u=${viewer.id}`,
    memberCount: 0,
  };
}

export default function JoinDemo() {
  const [display, setDisplay] = useState({
    position: 'bottom-left' as JoinConfig['position'],
    accent: '#16a34a',
    accentLight: '#4ade80',
    fontScale: 1,
    durationSec: 4,
    cooldownSec: 3,
    sound: true,
  });
  const [autoplay, setAutoplay] = useState(true);
  const [intervalSec, setIntervalSec] = useState(4);
  const [toast, setToast] = useState<{ id: number; join: JoinEvent } | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);

  const idRef = useRef(0);
  const memberCountRef = useRef(1234);
  const toastTimerRef = useRef<number | null>(null);
  const lastShowAtRef = useRef(0);

  const buildConfig = useCallback(
    (): JoinConfig => ({
      ...DEFAULT_JOIN_CONFIG,
      position: display.position,
      accent: display.accent,
      accentLight: display.accentLight,
      fontSizeScale: display.fontScale,
      durationSec: display.durationSec,
      cooldownSec: display.cooldownSec,
      sound: display.sound,
    }),
    [display.position, display.accent, display.accentLight, display.fontScale, display.durationSec, display.cooldownSec, display.sound],
  );

  const showToast = useCallback(
    (id: number, join: JoinEvent) => {
      setToast({ id, join });
      if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = window.setTimeout(() => {
        toastTimerRef.current = null;
        setToast((t) => (t && t.id === id ? null : t));
      }, display.durationSec * 1000);
    },
    [display.durationSec],
  );

  const fire = useCallback(() => {
    const now = Date.now();
    if (now - lastShowAtRef.current < display.cooldownSec * 1000) return;
    lastShowAtRef.current = now;
    const join = randomJoin();
    const id = ++idRef.current;
    memberCountRef.current += 1;
    join.memberCount = memberCountRef.current;
    showToast(id, join);
    setLog((l) =>
      [
        {
          id,
          join,
          time: new Date().toLocaleTimeString(),
        },
        ...l,
      ].slice(0, 20),
    );
  }, [showToast, display.cooldownSec]);

  const fireRef = useRef(fire);
  fireRef.current = fire;

  useEffect(() => {
    if (!autoplay) return;
    const t = window.setInterval(() => fireRef.current(), intervalSec * 1000);
    return () => window.clearInterval(t);
  }, [autoplay, intervalSec]);

  useEffect(
    () => () => {
      if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    },
    [],
  );

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-10 text-gray-200">
      <header className="mb-8">
        <h1 className="text-2xl font-black tracking-tight text-white">Join Viewer — Live Demo</h1>
        <p className="mt-1 text-sm text-gray-400">
          Simulasi viewer baru join live TikTok, tampil sebagai alert overlay seperti di OBS.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <section className="rounded-2xl border border-[#1f232b] bg-[#0f1115] p-5">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-400">
            Simulasi
          </h2>

          <div className="mb-3 space-y-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="accent-[#16a34a]"
                checked={autoplay}
                onChange={(e) => setAutoplay(e.target.checked)}
              />
              Auto join viewer setiap {intervalSec}s
            </label>
          </div>

          <label className={labelCls}>Interval Join</label>
          <input
            type="range"
            className="mb-3 w-full accent-[#16a34a]"
            min={1}
            max={12}
            step={1}
            value={intervalSec}
            onChange={(e) => setIntervalSec(parseInt(e.target.value, 10))}
          />

          <button
            onClick={() => fireRef.current()}
            className="w-full rounded-lg bg-white/10 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/15"
          >
            Simulasi Join Sekarang
          </button>

          <h2 className="mb-3 mt-6 text-sm font-bold uppercase tracking-wider text-gray-400">
            Perilaku Overlay
          </h2>

          <label className={labelCls}>Cooldown antar Join · {display.cooldownSec}s</label>
          <input
            type="range"
            className="mb-3 w-full accent-[#16a34a]"
            min={1}
            max={30}
            step={1}
            value={display.cooldownSec}
            onChange={(e) => setDisplay((s) => ({ ...s, cooldownSec: parseInt(e.target.value, 10) }))}
          />

          <label className={labelCls}>Durasi Tampil · {display.durationSec}s</label>
          <input
            type="range"
            className="mb-3 w-full accent-[#16a34a]"
            min={2}
            max={12}
            step={0.5}
            value={display.durationSec}
            onChange={(e) => setDisplay((s) => ({ ...s, durationSec: parseFloat(e.target.value) }))}
          />

          <h2 className="mb-3 mt-6 text-sm font-bold uppercase tracking-wider text-gray-400">
            Desain Overlay
          </h2>

          <label className={labelCls}>Posisi</label>
          <select
            className={`${inputCls} mb-3`}
            value={display.position}
            onChange={(e) => setDisplay((s) => ({ ...s, position: e.target.value as JoinConfig['position'] }))}
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
            className="w-full accent-[#16a34a]"
            min={0.8}
            max={1.4}
            step={0.05}
            value={display.fontScale}
            onChange={(e) => setDisplay((s) => ({ ...s, fontScale: parseFloat(e.target.value) }))}
          />
        </section>

        <section className="space-y-4">
          <div className="rounded-2xl border border-[#1f232b] bg-[#0f1115] p-5">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-400">
              Preview Overlay (simulasi TikTok Live)
            </h2>
            <div className="demo-canvas relative aspect-video overflow-hidden rounded-xl bg-[radial-gradient(700px_350px_at_50%_0%,#151a22,#08090c)]">
              <div className="pointer-events-none absolute left-3 top-3 rounded-md bg-black/40 px-2 py-1 text-[11px] font-bold text-white/70">
                {autoplay ? '● LIVE SIMULATION' : '◻ PAUSED'}
              </div>
              {toast && <JoinToast join={toast.join} config={buildConfig()} />}
            </div>
          </div>

          <div className="rounded-2xl border border-[#1f232b] bg-[#0f1115] p-5">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-400">
              Riwayat Join
            </h2>
            {log.length === 0 ? (
              <p className="text-sm text-gray-500">
                Belum ada viewer. Simulasi join atau nyalakan auto mode di atas.
              </p>
            ) : (
              <ul className="space-y-2.5">
                {log.map((e) => (
                  <li key={e.id} className="flex items-center gap-3 rounded-lg border border-[#262a33] bg-[#14171c] p-3 text-sm">
                    <img
                      src={e.join.avatar}
                      alt=""
                      className="h-8 w-8 rounded-full border border-[#16a34a] object-cover"
                    />
                    <span className="font-bold text-white">{e.join.nickname}</span>
                    <span className="rounded-full bg-[#16a34a]/20 px-2 py-0.5 text-[11px] font-bold text-emerald-300">
                      JOIN
                    </span>
                    <span className="ml-auto text-xs text-gray-500">
                      {e.join.memberCount} online · {e.time}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
