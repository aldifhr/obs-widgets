import { useMemo, useState } from 'react';
import {
  DEFAULT_LIKECOUNTER_CONFIG,
  likeCounterConfigToParams,
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

const FONTS = [
  { value: "'Inter', system-ui, sans-serif", label: 'Inter' },
  { value: "'Segoe UI', 'Bahnschrift', Arial, sans-serif", label: 'Segoe UI' },
  { value: "'Poppins', system-ui, sans-serif", label: 'Poppins' },
  { value: "'Georgia', serif", label: 'Georgia' },
  { value: "'Courier New', monospace", label: 'Monospace' },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

export default function LikeCounterCustomizer() {
  const [config, setConfig] = useState<LikeCounterConfig>({ ...DEFAULT_LIKECOUNTER_CONFIG });
  const [copied, setCopied] = useState(false);

  const set = <K extends keyof LikeCounterConfig>(key: K, value: LikeCounterConfig[K]) =>
    setConfig((c) => ({ ...c, [key]: value }));

  const setColor = (key: 'accent' | 'accentLight', value: string) =>
    setConfig((c) => ({ ...c, [key]: value }));

  const url = useMemo(() => {
    const u = new URL('/likes.html', location.origin);
    likeCounterConfigToParams(config).forEach((v, k) => u.searchParams.set(k, v));
    return u.toString();
  }, [config]);

  const copy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable
    }
  };

  const reset = () => setConfig({ ...DEFAULT_LIKECOUNTER_CONFIG });

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-10 text-gray-200">
      <header className="mb-8">
        <h1 className="text-2xl font-black tracking-tight text-white">Like Counter Customizer</h1>
        <p className="mt-1 text-sm text-gray-400">
          Counter total like TikTok (Euler Stream) yang tampil besar di OBS.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <section className="rounded-2xl border border-[#1f232b] bg-[#0f1115] p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-400">TikTok</h2>

          <Field label="TikTok Username">
            <input
              className={inputCls}
              value={config.tiktokUser}
              onChange={(e) => set('tiktokUser', e.target.value.trim())}
              placeholder="mis. tv_asahi_news"
            />
          </Field>

          <Field label="Euler Stream API Key">
            <input
              className={`${inputCls} font-mono`}
              value={config.eulerKey}
              onChange={(e) => set('eulerKey', e.target.value.trim())}
              placeholder="euler_..."
            />
          </Field>

          <div className="mb-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="accent-[#f43f5e]"
                checked={config.showLabel}
                onChange={(e) => set('showLabel', e.target.checked)}
              />
              Show label "LIKES"
            </label>
          </div>

          <h2 className="mb-4 mt-6 text-sm font-bold uppercase tracking-wider text-gray-400">
            Desain
          </h2>

          <Field label="Posisi">
            <select
              className={inputCls}
              value={config.position}
              onChange={(e) => set('position', e.target.value as LikeCounterConfig['position'])}
            >
              {POSITIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Accent">
              <input
                type="color"
                className="h-10 w-full cursor-pointer rounded-lg border border-[#262a33] bg-[#0f1115]"
                value={config.accent}
                onChange={(e) => setColor('accent', e.target.value)}
              />
            </Field>
            <Field label="Accent Light">
              <input
                type="color"
                className="h-10 w-full cursor-pointer rounded-lg border border-[#262a33] bg-[#0f1115]"
                value={config.accentLight}
                onChange={(e) => setColor('accentLight', e.target.value)}
              />
            </Field>
          </div>

          <Field label="Font Family">
            <select
              className={inputCls}
              value={config.fontFamily}
              onChange={(e) => set('fontFamily', e.target.value)}
            >
              {FONTS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label={`Font Size · ${config.fontSizeScale.toFixed(2)}`}>
            <input
              type="range"
              className="w-full accent-[#f43f5e]"
              min={0.8}
              max={1.8}
              step={0.05}
              value={config.fontSizeScale}
              onChange={(e) => set('fontSizeScale', parseFloat(e.target.value))}
            />
          </Field>

          <button
            onClick={copy}
            disabled={!url}
            className="w-full rounded-lg bg-[#f43f5e] py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#fb7185] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {copied ? 'Copied!' : 'Copy Widget URL'}
          </button>
          <button
            onClick={reset}
            className="mt-2 w-full rounded-lg border border-[#262a33] py-2.5 text-sm font-semibold text-gray-300 transition-colors hover:bg-[#14171c]"
          >
            Restore defaults
          </button>
        </section>

        <section className="rounded-2xl border border-[#1f232b] bg-[#0f1115] p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-400">Preview</h2>
          <div className="shoutout-preview relative min-h-[220px] overflow-hidden rounded-xl bg-[radial-gradient(600px_300px_at_50%_0%,#151a22,#08090c)]">
            <LikeCounter config={config} total={567890} />
          </div>

          <div className="mt-4">
            <label className={labelCls}>Widget URL</label>
            <div className="flex gap-2">
              <input
                readOnly
                value={url}
                onFocus={(e) => e.target.select()}
                className={`${inputCls} flex-1 font-mono text-xs`}
              />
              <button
                onClick={copy}
                disabled={!url}
                className="shrink-0 rounded-lg bg-[#f43f5e] px-4 text-sm font-bold text-white transition-colors hover:bg-[#fb7185] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Paste ke OBS Browser Source. Counter bertambah tiap like masuk.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
