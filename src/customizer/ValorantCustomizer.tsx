import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_CONFIG, type WidgetConfig } from '../shared/types';
import { configToParams } from '../shared/config';
import { fetchMmr, type RankDisplay } from '../shared/api';
import ValorantCard from '../components/ValorantCard';

const REGIONS = ['ap', 'eu', 'na', 'kr', 'latam', 'br'];
const DESIGNS = ['classic', 'centered', 'slim', 'hero'];
const REFRESH_OPTIONS = [
  { value: 30, label: '30 seconds' },
  { value: 60, label: '1 minute' },
  { value: 180, label: '3 minutes' },
  { value: 300, label: '5 minutes' },
];

interface MapOption {
  uuid: string;
  displayName: string;
  backgroundImage: string;
  displayIcon?: string;
}

const inputCls =
  'w-full rounded-lg border border-[#262a33] bg-[#0f1115] px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 focus:border-[#ff4655] focus:outline-none';
const labelCls = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

export default function ValorantCustomizer() {
  const [config, setConfig] = useState<WidgetConfig>({ ...DEFAULT_CONFIG, name: 'the blessed one', tag: 'one' });
  const [data, setData] = useState<RankDisplay | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [maps, setMaps] = useState<MapOption[]>([]);

  const set = <K extends keyof WidgetConfig>(key: K, value: WidgetConfig[K]) =>
    setConfig((c) => ({ ...c, [key]: value }));

  useEffect(() => {
    let active = true;
    fetch('https://valorant-api.com/v1/maps')
      .then((r) => r.json())
      .then((j) => {
        if (!active) return;
        setMaps(
          (j.data || [])
            .filter((m: { backgroundImage?: string }) => m.backgroundImage)
            .map((m: MapOption) => ({
              uuid: m.uuid,
              displayName: m.displayName,
              backgroundImage: m.backgroundImage,
              displayIcon: m.displayIcon,
            })),
        );
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const pickMap = (backgroundImage: string) => {
    set('bgImage', backgroundImage);
    if (backgroundImage && config.bgOpacity === 0) set('bgOpacity', 0.35);
  };

  const url = useMemo(() => {
    const u = new URL('/valorant.html', location.origin);
    configToParams(config).forEach((v, k) => u.searchParams.set(k, v));
    return u.toString();
  }, [config]);

  useEffect(() => {
    if (!config.name || !config.tag) {
      setData(null);
      setError(null);
      return;
    }
    setLoading(true);
    const timer = window.setTimeout(() => {
      fetchMmr(config.name, config.tag, config.region, config.henrikKey)
        .then((d) => {
          setData(d);
          setError(null);
        })
        .catch(() => setError('Gagal fetch data'))
        .finally(() => setLoading(false));
    }, 600);
    return () => window.clearTimeout(timer);
  }, [config.name, config.tag, config.region, config.henrikKey]);

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

  const reset = () =>
    setConfig({ ...DEFAULT_CONFIG, name: 'the blessed one', tag: 'one' });

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-10 text-gray-200">
      <header className="mb-8">
        <h1 className="text-2xl font-black tracking-tight text-white">Valorant Rank Customizer</h1>
        <p className="mt-1 text-sm text-gray-400">
          Configure your widget, preview it live, then copy the URL into OBS Browser Source.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <section className="rounded-2xl border border-[#1f232b] bg-[#0f1115] p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-400">Settings</h2>

          <Field label="Riot Name + Tag">
            <input
              className={inputCls}
              value={config.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Name"
            />
            <input
              className={`${inputCls} mt-2`}
              value={config.tag}
              onChange={(e) => set('tag', e.target.value)}
              placeholder="#Tag"
            />
          </Field>

          <Field label="Region">
            <select className={inputCls} value={config.region} onChange={(e) => set('region', e.target.value)}>
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r.toUpperCase()}
                </option>
              ))}
            </select>
          </Field>

          <Field label="HDEV API Key">
            <input
              className={`${inputCls} font-mono`}
              value={config.henrikKey}
              onChange={(e) => set('henrikKey', e.target.value.trim())}
              placeholder="HDEV-..."
            />
            <p className="mt-1 text-xs text-gray-500">Your own Henrik API key, used by the widget for fetches.</p>
          </Field>

          <Field label="Design">
            <select className={inputCls} value={config.design} onChange={(e) => set('design', e.target.value)}>
              {DESIGNS.map((d) => (
                <option key={d} value={d}>
                  {d.charAt(0).toUpperCase() + d.slice(1)}
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
                onChange={(e) => set('accent', e.target.value)}
              />
            </Field>
            <Field label="Accent Light">
              <input
                type="color"
                className="h-10 w-full cursor-pointer rounded-lg border border-[#262a33] bg-[#0f1115]"
                value={config.accentLight}
                onChange={(e) => set('accentLight', e.target.value)}
              />
            </Field>
          </div>

          <Field label={`Card Width · ${config.cardWidth}px`}>
            <input
              type="range"
              className="w-full accent-[#ff4655]"
              min={300}
              max={800}
              step={10}
              value={config.cardWidth}
              onChange={(e) => set('cardWidth', parseInt(e.target.value, 10))}
            />
          </Field>

          <Field label={`Font Size · ${config.fontSizeScale.toFixed(2)}`}>
            <input
              type="range"
              className="w-full accent-[#ff4655]"
              min={0.8}
              max={1.4}
              step={0.05}
              value={config.fontSizeScale}
              onChange={(e) => set('fontSizeScale', parseFloat(e.target.value))}
            />
          </Field>

          <Field label="Map Background">
            <div className="max-h-48 space-y-1.5 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => pickMap('')}
                className={`flex w-full items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left text-sm transition-colors ${
                  !config.bgImage
                    ? 'border-[#ff4655] bg-[#ff4655]/10 text-white'
                    : 'border-[#262a33] text-gray-400 hover:bg-[#14171c]'
                }`}
              >
                None
              </button>
              {maps.map((m) => (
                <button
                  key={m.uuid}
                  type="button"
                  onClick={() => pickMap(m.backgroundImage)}
                  className={`flex w-full items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left text-sm transition-colors ${
                    config.bgImage === m.backgroundImage
                      ? 'border-[#ff4655] bg-[#ff4655]/10 text-white'
                      : 'border-[#262a33] text-gray-400 hover:bg-[#14171c]'
                  }`}
                >
                  {m.displayIcon && (
                    <img
                      src={m.displayIcon}
                      alt=""
                      className="h-5 w-5 shrink-0 rounded object-contain"
                      loading="lazy"
                    />
                  )}
                  {m.displayName}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Custom Background URL">
            <input
              className={inputCls}
              value={config.bgImage}
              onChange={(e) => set('bgImage', e.target.value)}
              placeholder="https://example.com/background.png"
            />
          </Field>

          <Field label={`Background Opacity · ${config.bgOpacity.toFixed(2)}`}>
            <input
              type="range"
              className="w-full accent-[#ff4655]"
              min={0}
              max={0.8}
              step={0.05}
              value={config.bgOpacity}
              onChange={(e) => set('bgOpacity', parseFloat(e.target.value))}
            />
          </Field>

          <Field label="Refresh Interval">
            <select
              className={inputCls}
              value={config.refreshInterval}
              onChange={(e) => set('refreshInterval', parseInt(e.target.value, 10))}
            >
              {REFRESH_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>

          <div className="mb-4 space-y-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="accent-[#ff4655]"
                checked={config.showAvatar}
                onChange={(e) => set('showAvatar', e.target.checked)}
              />
              Show rank icon
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="accent-[#ff4655]"
                checked={config.showGrid}
                onChange={(e) => set('showGrid', e.target.checked)}
              />
              Show background grid
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="accent-[#ff4655]"
                checked={config.sound}
                onChange={(e) => set('sound', e.target.checked)}
              />
              Play event sound
            </label>
          </div>

          <button
            onClick={copy}
            disabled={!url}
            className="w-full rounded-lg bg-[#ff4655] py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#ff5f6c] disabled:cursor-not-allowed disabled:opacity-40"
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
          <div className="flex min-h-[260px] items-center justify-center rounded-xl bg-[radial-gradient(600px_300px_at_50%_0%,#151a22,#08090c)] p-6">
            {!config.name || !config.tag ? (
              <p className="text-sm text-gray-500">Enter name + tag to preview</p>
            ) : error ? (
              <p className="text-sm text-red-400">{error}</p>
            ) : loading && !data ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : data ? (
              <ValorantCard config={config} data={data} />
            ) : null}
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
                className="shrink-0 rounded-lg bg-[#ff4655] px-4 text-sm font-bold text-white transition-colors hover:bg-[#ff5f6c] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Paste this URL into an OBS Browser Source to display your rank live.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
