import { useMemo, useState } from 'react';
import { DEFAULT_SHOUTOUT_CONFIG, type GiftEvent, type ShoutoutConfig } from '../shoutout/types';
import { shoutoutConfigToParams } from '../shoutout/config';
import { generateShoutout, resolveLlmBaseUrl, templateShoutout } from '../shoutout/llm';
import ShoutoutToast from '../components/ShoutoutToast';

const inputCls =
  'w-full rounded-lg border border-[#262a33] bg-[#0f1115] px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 focus:border-[#fe2c55] focus:outline-none';
const labelCls = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400';

const POSITIONS: Array<{ value: ShoutoutConfig['position']; label: string }> = [
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-center', label: 'Bottom Center' },
  { value: 'bottom-right', label: 'Bottom Right' },
  { value: 'center', label: 'Center' },
];

const VOICE_PRESETS = [
  'Semangat, ramah, bahasa Indonesia kasual, singkat, tanpa emoji berlebihan',
  'Hiper, heboh, bahasa gaul anak muda, singkat dan enerjik',
  'Tenang, sopan, profesional, bahasa Indonesia baku, singkat',
  'Lucu, santai, sedikit bercanda, bahasa Indonesia kasual, singkat',
  'Short, warm, enthusiastic, in English',
];

const FONTS = [
  { value: "'Inter', system-ui, sans-serif", label: 'Inter' },
  { value: "'Segoe UI', 'Bahnschrift', Arial, sans-serif", label: 'Segoe UI' },
  { value: "'Poppins', system-ui, sans-serif", label: 'Poppins' },
  { value: "'Georgia', serif", label: 'Georgia' },
  { value: "'Courier New', monospace", label: 'Monospace' },
];

const SAMPLE_GIFT: GiftEvent = {
  nickname: 'BudiSantoso',
  uniqueId: 'budisantoso',
  avatar: '',
  giftName: 'Rose',
  giftIcon: '',
  diamonds: 50,
  count: 10,
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

export default function ShoutoutCustomizer() {
  const [config, setConfig] = useState<ShoutoutConfig>({ ...DEFAULT_SHOUTOUT_CONFIG });
  const [copied, setCopied] = useState(false);
  const [previewGift, setPreviewGift] = useState<GiftEvent>(SAMPLE_GIFT);
  const [previewLine, setPreviewLine] = useState<string>(() => templateShoutout(SAMPLE_GIFT));
  const [testing, setTesting] = useState(false);

  const set = <K extends keyof ShoutoutConfig>(key: K, value: ShoutoutConfig[K]) =>
    setConfig((c) => ({ ...c, [key]: value }));

  const setColor = (key: 'accent' | 'accentLight', value: string) =>
    setConfig((c) => ({ ...c, [key]: value }));

  const url = useMemo(() => {
    const u = new URL('/shoutout.html', location.origin);
    shoutoutConfigToParams(config).forEach((v, k) => u.searchParams.set(k, v));
    return u.toString();
  }, [config]);

  const test = async () => {
    setTesting(true);
    try {
      const line = await generateShoutout(previewGift, config);
      setPreviewLine(line);
    } finally {
      setTesting(false);
    }
  };

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

  const reset = () => setConfig({ ...DEFAULT_SHOUTOUT_CONFIG });

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-10 text-gray-200">
      <header className="mb-8">
        <h1 className="text-2xl font-black tracking-tight text-white">AI Shoutout Customizer</h1>
        <p className="mt-1 text-sm text-gray-400">
          Deteksi gift TikTok via Euler Stream, generate ucapan terima kasih dengan LLM, tampilkan di
          OBS.
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
            <p className="mt-1 text-xs text-gray-500">
              Username TikTok yang mau didengar gift-nya (tanpa @).
            </p>
          </Field>

          <Field label="Euler Stream API Key">
            <input
              className={`${inputCls} font-mono`}
              value={config.eulerKey}
              onChange={(e) => set('eulerKey', e.target.value.trim())}
              placeholder="euler_..."
            />
            <p className="mt-1 text-xs text-gray-500">
              Ambil di dashboard eulerstream.com. Key terlihat siapa saja yang buka URL widget.
            </p>
          </Field>

          <h2 className="mb-4 mt-6 text-sm font-bold uppercase tracking-wider text-gray-400">
            LLM (OpenAI-compatible)
          </h2>

          <Field label="Base URL">
            <input
              className={`${inputCls} font-mono`}
              value={config.llmBaseUrl}
              onChange={(e) => set('llmBaseUrl', e.target.value.trim())}
              placeholder="https://api.openai.com/v1"
            />
            <p className="mt-1 text-xs text-gray-500">
              {config.llmUseProxy ? 'Efektif: ' + resolveLlmBaseUrl(config) : 'Bisa diisi `/llm-proxy/v1` untuk lewat reverse proxy.'}
            </p>
          </Field>

          <Field label="Proxy CORS">
            <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-300">
              <input
                type="checkbox"
                className="accent-[#fe2c55]"
                checked={config.llmUseProxy}
                onChange={(e) => set('llmUseProxy', e.target.checked)}
              />
              Lewati CORS via `/llm-proxy` (same-origin, tanpa preflight)
            </label>
            <p className="mt-1 text-xs text-gray-500">
              Untuk gateway yang menolak preflight OPTIONS. Wajib ada proxy `/llm-proxy` → LLM server
              (Vite dev otomatis; produksi pakai reverse proxy nginx).
            </p>
          </Field>

          <Field label="API Key">
            <input
              className={`${inputCls} font-mono`}
              value={config.llmKey}
              onChange={(e) => set('llmKey', e.target.value.trim())}
              placeholder="sk-..."
            />
            <p className="mt-1 text-xs text-gray-500">
              Bisa OpenAI, Gemini (OpenAI-compatible), Groq, Ollama, dll. Kosongkan untuk pakai
              template bawaan.
            </p>
          </Field>

          <Field label="Model">
            <input
              className={`${inputCls} font-mono`}
              value={config.llmModel}
              onChange={(e) => set('llmModel', e.target.value.trim())}
              placeholder="gpt-4o-mini"
            />
          </Field>

          <Field label="Gaya Ucapan (voice)">
            <textarea
              className={`${inputCls} min-h-[64px] resize-y`}
              value={config.voice}
              onChange={(e) => set('voice', e.target.value)}
            />
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {VOICE_PRESETS.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => set('voice', v)}
                  className="rounded-full border border-[#262a33] px-2.5 py-1 text-[11px] font-medium text-gray-400 transition-colors hover:border-[#fe2c55] hover:text-white"
                >
                  {v.split(',')[0]}
                </button>
              ))}
            </div>
          </Field>

          <Field label={`Max Panjang Teks · ${config.maxLength} char`}>
            <input
              type="range"
              className="w-full accent-[#fe2c55]"
              min={60}
              max={240}
              step={10}
              value={config.maxLength}
              onChange={(e) => set('maxLength', parseInt(e.target.value, 10))}
            />
          </Field>

          <h2 className="mb-4 mt-6 text-sm font-bold uppercase tracking-wider text-gray-400">
            Pemicu Gift
          </h2>

          <Field label={`Min Diamonds · ${config.minDiamonds}`}>
            <input
              type="range"
              className="w-full accent-[#fe2c55]"
              min={1}
              max={1000}
              step={1}
              value={config.minDiamonds}
              onChange={(e) => set('minDiamonds', parseInt(e.target.value, 10))}
            />
          </Field>

          <Field label={`Cooldown antar Shoutout · ${config.cooldownSec}s`}>
            <input
              type="range"
              className="w-full accent-[#fe2c55]"
              min={2}
              max={60}
              step={1}
              value={config.cooldownSec}
              onChange={(e) => set('cooldownSec', parseInt(e.target.value, 10))}
            />
          </Field>

          <Field label={`Durasi Tampil · ${config.durationSec}s`}>
            <input
              type="range"
              className="w-full accent-[#fe2c55]"
              min={3}
              max={15}
              step={0.5}
              value={config.durationSec}
              onChange={(e) => set('durationSec', parseFloat(e.target.value))}
            />
          </Field>

          <div className="mb-4 space-y-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="accent-[#fe2c55]"
                checked={config.showAvatar}
                onChange={(e) => set('showAvatar', e.target.checked)}
              />
              Show avatar
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="accent-[#fe2c55]"
                checked={config.showGift}
                onChange={(e) => set('showGift', e.target.checked)}
              />
              Show gift icon
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="accent-[#fe2c55]"
                checked={config.showDiamonds}
                onChange={(e) => set('showDiamonds', e.target.checked)}
              />
              Show diamonds
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="accent-[#fe2c55]"
                checked={config.showUsername}
                onChange={(e) => set('showUsername', e.target.checked)}
              />
              Show username
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="accent-[#fe2c55]"
                checked={config.sound}
                onChange={(e) => set('sound', e.target.checked)}
              />
              Play chime sound
            </label>
          </div>

          <h2 className="mb-4 mt-6 text-sm font-bold uppercase tracking-wider text-gray-400">
            Desain
          </h2>

          <Field label="Posisi">
            <select className={inputCls} value={config.position} onChange={(e) => set('position', e.target.value as ShoutoutConfig['position'])}>
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
            <select className={inputCls} value={config.fontFamily} onChange={(e) => set('fontFamily', e.target.value)}>
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
              className="w-full accent-[#fe2c55]"
              min={0.8}
              max={1.4}
              step={0.05}
              value={config.fontSizeScale}
              onChange={(e) => set('fontSizeScale', parseFloat(e.target.value))}
            />
          </Field>

          <button
            onClick={copy}
            disabled={!url}
            className="w-full rounded-lg bg-[#fe2c55] py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#ff4d6f] disabled:cursor-not-allowed disabled:opacity-40"
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
          <div className="shoutout-preview relative min-h-[260px] overflow-hidden rounded-xl bg-[radial-gradient(600px_300px_at_50%_0%,#151a22,#08090c)]">
            <ShoutoutToast gift={previewGift} line={previewLine} config={config} />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={test}
              disabled={testing}
              className="rounded-lg bg-[#fe2c55] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#ff4d6f] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {testing ? 'Generate...' : 'Test Shoutout'}
            </button>
            <p className="text-xs text-gray-500">
              Tombol ini memanggil LLM yang dikonfigurasi (atau template bila LLM kosong).
            </p>
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
                className="shrink-0 rounded-lg bg-[#fe2c55] px-4 text-sm font-bold text-white transition-colors hover:bg-[#ff4d6f] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Paste ke OBS Browser Source. Widget menampilkan shoutout saat ada gift TikTok masuk.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
