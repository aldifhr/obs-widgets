import { useMemo, useState } from 'react';
import { DEFAULT_STATS_CONFIG, statsConfigToParams, type StatsConfig, type StatsState } from '../stats/types';
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

const FONTS = [
  { value: "'Inter', system-ui, sans-serif", label: 'Inter' },
  { value: "'Segoe UI', 'Bahnschrift', Arial, sans-serif", label: 'Segoe UI' },
  { value: "'Poppins', system-ui, sans-serif", label: 'Poppins' },
  { value: "'Georgia', serif", label: 'Georgia' },
  { value: "'Courier New', monospace", label: 'Monospace' },
];

const SAMPLE_STATS: StatsState = { viewers: 1234, likes: 567890, followers: 12345 };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

export default function StatsCustomizer() {
  const [config, setConfig] = useState<StatsConfig>({ ...DEFAULT_STATS_CONFIG });
  const [copied, setCopied] = useState(false);

  const set = <K extends keyof StatsConfig>(key: K, value: StatsConfig[K]) =>
    setConfig((c) => ({ ...c, [key]: value }));

  const url = useMemo(() => {
    const u = new URL('/stats.html', location.origin);
    statsConfigToParams(config).forEach((v, k) => u.searchParams.set(k, v));
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

  const reset = () => setConfig({ ...DEFAULT_STATS_CONFIG });

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-10 text-gray-200">
      <header className="mb-8">
        <h1 className="text-2xl font-black tracking-tight text-white">Live Stats Bar Customizer</h1>
        <p className="mt-1 text-sm text-gray-400">
          Panel viewer / like / follow real-time dari TikTok (Euler Stream) untuk OBS.
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

          <h2 className="mb-4 mt-6 text-sm font-bold uppercase tracking-wider text-gray-400">
            Statistik
          </h2>

          <div className="mb-4 space-y-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="accent-[#22d3ee]"
                checked={config.showViewers}
                onChange={(e) => set('showViewers', e.target.checked)}
              />
              Show viewers
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="accent-[#22d3ee]"
                checked={config.showLikes}
                onChange={(e) => set('showLikes', e.target.checked)}
              />
              Show total likes
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="accent-[#22d3ee]"
                checked={config.showFollowers}
                onChange={(e) => set('showFollowers', e.target.checked)}
              />
              Show follows (sesi)
            </label>
            <p className="text-xs text-gray-500">
              Follows dihitung dari event follow selama sesi live (TikTok tidak mengirim total
              followers).
            </p>
          </div>

          <h2 className="mb-4 mt-6 text-sm font-bold uppercase tracking-wider text-gray-400">
            Desain
          </h2>

          <Field label="Posisi">
            <select
              className={inputCls}
              value={config.position}
              onChange={(e) => set('position', e.target.value as StatsConfig['position'])}
            >
              {POSITIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Accent">
            <input
              type="color"
              className="h-10 w-full cursor-pointer rounded-lg border border-[#262a33] bg-[#0f1115]"
              value={config.accent}
              onChange={(e) => set('accent', e.target.value)}
            />
          </Field>

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
              className="w-full accent-[#22d3ee]"
              min={0.8}
              max={1.6}
              step={0.05}
              value={config.fontSizeScale}
              onChange={(e) => set('fontSizeScale', parseFloat(e.target.value))}
            />
          </Field>

          <button
            onClick={copy}
            disabled={!url}
            className="w-full rounded-lg bg-[#22d3ee] py-2.5 text-sm font-bold text-black transition-colors hover:bg-[#67e8f9] disabled:cursor-not-allowed disabled:opacity-40"
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
            <StatsBar config={config} stats={SAMPLE_STATS} />
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
                className="shrink-0 rounded-lg bg-[#22d3ee] px-4 text-sm font-bold text-black transition-colors hover:bg-[#67e8f9] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Paste ke OBS Browser Source. Panel memperbarui viewer/like/follow secara real-time.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
