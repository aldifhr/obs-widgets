import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_SHOUTOUT_CONFIG, type GiftEvent, type ShoutoutConfig } from '../shoutout/types';
import { generateShoutoutDetailed, resolveLlmBaseUrl, templateShoutout, testLlm } from '../shoutout/llm';
import ShoutoutToast from '../components/ShoutoutToast';

const inputCls =
  'w-full rounded-lg border border-[#262a33] bg-[#0f1115] px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 focus:border-[#fe2c55] focus:outline-none';
const labelCls = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400';

const PROVIDERS = [
  { label: 'OpenAI', base: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
  { label: 'Gemini', base: 'https://generativelanguage.googleapis.com/v1beta/openai', model: 'gemini-2.0-flash' },
  { label: 'Groq', base: 'https://api.groq.com/openai/v1', model: 'llama-3.3-70b-versatile' },
  { label: 'DeepSeek', base: 'https://api.deepseek.com/v1', model: 'deepseek-chat' },
  { label: 'Ollama', base: 'http://localhost:11434/v1', model: 'llama3.2' },
];

const VOICE_PRESETS = [
  'Semangat, ramah, bahasa Indonesia kasual, singkat, tanpa emoji berlebihan',
  'Hiper, heboh, bahasa gaul anak muda, singkat dan enerjik',
  'Tenang, sopan, profesional, bahasa Indonesia baku, singkat',
  'Lucu, santai, sedikit bercanda, bahasa Indonesia kasual, singkat',
  'Short, warm, enthusiastic, in English',
];

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

const GIFTS = [
  { name: 'Rose', diamonds: 1 },
  { name: 'TikTok', diamonds: 1 },
  { name: 'Sweet Heart', diamonds: 1 },
  { name: 'Hand Heart', diamonds: 5 },
  { name: 'GG', diamonds: 5 },
  { name: 'Crown', diamonds: 10 },
  { name: 'Galaxy', diamonds: 50 },
  { name: 'Universe', diamonds: 100 },
  { name: 'Lion', diamonds: 500 },
];

const POSITIONS: Array<{ value: ShoutoutConfig['position']; label: string }> = [
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-center', label: 'Bottom Center' },
  { value: 'bottom-right', label: 'Bottom Right' },
  { value: 'center', label: 'Center' },
];

interface LogEntry {
  id: number;
  gift: GiftEvent;
  text: string;
  status: 'generating' | 'done';
  source: 'llm' | 'template';
}

function randomGift(): GiftEvent {
  const viewer = VIEWERS[Math.floor(Math.random() * VIEWERS.length)];
  const g = GIFTS[Math.floor(Math.random() * GIFTS.length)];
  const r = Math.random();
  const count = g.diamonds >= 50 ? 1 : r < 0.25 ? 10 : r < 0.55 ? 5 : 1;
  return {
    nickname: viewer.name,
    uniqueId: viewer.id,
    avatar: `https://i.pravatar.cc/128?u=${viewer.id}`,
    giftName: g.name,
    giftIcon: '',
    diamonds: g.diamonds,
    count,
  };
}

export default function ShoutoutDemo() {
  const [llm, setLlm] = useState({
    baseUrl: 'https://api.openai.com/v1',
    key: '',
    model: 'gpt-4o-mini',
    voice: VOICE_PRESETS[0],
    maxLength: 140,
  });
  const [display, setDisplay] = useState({
    position: 'bottom-left' as ShoutoutConfig['position'],
    accent: '#fe2c55',
    accentLight: '#ff7ea6',
    fontScale: 1,
    durationSec: 6.5,
    sound: true,
  });
  const [autoplay, setAutoplay] = useState(true);
  const [intervalSec, setIntervalSec] = useState(5);
  const [useProxy, setUseProxy] = useState(false);
  const [toast, setToast] = useState<{ id: number; gift: GiftEvent; line: string } | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [testState, setTestState] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [testResult, setTestResult] = useState('');
  const [testError, setTestError] = useState('');

  const idRef = useRef(0);
  const toastTimerRef = useRef<number | null>(null);

  const buildConfig = useCallback(
    (): ShoutoutConfig => ({
      ...DEFAULT_SHOUTOUT_CONFIG,
      llmBaseUrl: llm.baseUrl,
      llmKey: llm.key,
      llmModel: llm.model,
      llmUseProxy: useProxy,
      voice: llm.voice,
      maxLength: llm.maxLength,
      position: display.position,
      accent: display.accent,
      accentLight: display.accentLight,
      fontSizeScale: display.fontScale,
      durationSec: display.durationSec,
      sound: display.sound,
    }),
    [llm.baseUrl, llm.key, llm.model, llm.voice, llm.maxLength, useProxy, display.position, display.accent, display.accentLight, display.fontScale, display.durationSec, display.sound],
  );

  const showToast = useCallback(
    (id: number, gift: GiftEvent, line: string) => {
      setToast({ id, gift, line });
      if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = window.setTimeout(() => {
        toastTimerRef.current = null;
        setToast((t) => (t && t.id === id ? null : t));
      }, display.durationSec * 1000);
    },
    [display.durationSec],
  );

  const fire = useCallback(() => {
    const gift = randomGift();
    const id = ++idRef.current;
    showToast(id, gift, templateShoutout(gift));
    setLog((l) =>
      [{ id, gift, text: '', status: 'generating' as const, source: 'llm' as const }, ...l].slice(0, 20),
    );

    generateShoutoutDetailed(gift, buildConfig())
      .then((res) => {
        setLog((l) => l.map((e) => (e.id === id ? { ...e, text: res.text, status: 'done', source: res.source } : e)));
        setToast((t) => (t && t.id === id ? { ...t, line: res.text } : t));
      })
      .catch(() => {
        setLog((l) =>
          l.map((e) =>
            e.id === id
              ? { ...e, status: 'done' as const, source: 'template' as const, text: templateShoutout(gift) }
              : e,
          ),
        );
      });
  }, [showToast, buildConfig]);

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

  const runTest = async () => {
    setTestState('loading');
    setTestResult('');
    setTestError('');
    const res = await testLlm(buildConfig());
    if (res.ok) {
      setTestState('ok');
      setTestResult(res.text ?? '');
    } else {
      setTestState('error');
      setTestError(res.error ?? 'Gagal');
    }
  };

  const setProvider = (p: { base: string; model: string }) =>
    setLlm((s) => ({ ...s, baseUrl: p.base, model: p.model }));

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-10 text-gray-200">
      <header className="mb-8">
        <h1 className="text-2xl font-black tracking-tight text-white">AI Shoutout — Live Demo</h1>
        <p className="mt-1 text-sm text-gray-400">
          Simulasi gift TikTok + ucapan terima kasih yang benar-benar digenerate AI. Isi kredensial
          LLM di panel, lalu coba.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <section className="rounded-2xl border border-[#1f232b] bg-[#0f1115] p-5">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-400">
            LLM (OpenAI-compatible)
          </h2>

          <div className="mb-3 flex flex-wrap gap-1.5">
            {PROVIDERS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setProvider(p)}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  llm.baseUrl === p.base
                    ? 'border-[#fe2c55] bg-[#fe2c55]/10 text-white'
                    : 'border-[#262a33] text-gray-400 hover:border-[#fe2c55] hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <label className={labelCls}>Base URL</label>
          <input
            className={`${inputCls} mb-1 font-mono`}
            value={llm.baseUrl}
            onChange={(e) => setLlm((s) => ({ ...s, baseUrl: e.target.value.trim() }))}
            placeholder="https://api.openai.com/v1"
          />
          <label className="mb-3 flex cursor-pointer items-center gap-2 text-xs text-gray-400">
            <input
              type="checkbox"
              className="accent-[#fe2c55]"
              checked={useProxy}
              onChange={(e) => setUseProxy(e.target.checked)}
            />
            Lewati CORS via proxy dev (untuk gateway yang nolak preflight)
          </label>
          <p className="mb-3 text-[11px] text-gray-500">
            Efektif dipakai: {resolveLlmBaseUrl(buildConfig())}
          </p>

          <label className={labelCls}>API Key</label>
          <input
            type="password"
            className={`${inputCls} mb-3 font-mono`}
            value={llm.key}
            onChange={(e) => setLlm((s) => ({ ...s, key: e.target.value.trim() }))}
            placeholder="sk-..."
          />

          <label className={labelCls}>Model</label>
          <input
            className={`${inputCls} mb-3 font-mono`}
            value={llm.model}
            onChange={(e) => setLlm((s) => ({ ...s, model: e.target.value.trim() }))}
            placeholder="gpt-4o-mini"
          />

          <label className={labelCls}>Gaya Ucapan (voice)</label>
          <textarea
            className={`${inputCls} mb-3 min-h-[64px] resize-y`}
            value={llm.voice}
            onChange={(e) => setLlm((s) => ({ ...s, voice: e.target.value }))}
          />
          <div className="mb-3 flex flex-wrap gap-1.5">
            {VOICE_PRESETS.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setLlm((s) => ({ ...s, voice: v }))}
                className="rounded-full border border-[#262a33] px-2.5 py-1 text-[11px] font-medium text-gray-400 transition-colors hover:border-[#fe2c55] hover:text-white"
              >
                {v.split(',')[0]}
              </button>
            ))}
          </div>

          <label className={labelCls}>Max Panjang Teks · {llm.maxLength} char</label>
          <input
            type="range"
            className="mb-3 w-full accent-[#fe2c55]"
            min={60}
            max={240}
            step={10}
            value={llm.maxLength}
            onChange={(e) => setLlm((s) => ({ ...s, maxLength: parseInt(e.target.value, 10) }))}
          />

          <button
            onClick={runTest}
            disabled={testState === 'loading'}
            className="w-full rounded-lg bg-[#fe2c55] py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#ff4d6f] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {testState === 'loading' ? 'Test LLM...' : 'Test Koneksi LLM'}
          </button>
          {testState === 'ok' && (
            <p className="mt-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-300">
              Berhasil! AI: “{testResult}”
            </p>
          )}
          {testState === 'error' && (
            <p className="mt-2 rounded-lg border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-300">
              {testError}
            </p>
          )}

          <h2 className="mb-3 mt-6 text-sm font-bold uppercase tracking-wider text-gray-400">
            Simulasi
          </h2>

          <div className="mb-3 space-y-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="accent-[#fe2c55]"
                checked={autoplay}
                onChange={(e) => setAutoplay(e.target.checked)}
              />
              Auto kirim gift setiap {intervalSec}s
            </label>
          </div>

          <label className={labelCls}>Interval Gift</label>
          <input
            type="range"
            className="mb-3 w-full accent-[#fe2c55]"
            min={2}
            max={15}
            step={1}
            value={intervalSec}
            onChange={(e) => setIntervalSec(parseInt(e.target.value, 10))}
          />

          <button
            onClick={() => fireRef.current()}
            className="w-full rounded-lg bg-white/10 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/15"
          >
            Kirim Gift Sekarang
          </button>

          <h2 className="mb-3 mt-6 text-sm font-bold uppercase tracking-wider text-gray-400">
            Desain Overlay
          </h2>

          <label className={labelCls}>Posisi</label>
          <select
            className={`${inputCls} mb-3`}
            value={display.position}
            onChange={(e) => setDisplay((s) => ({ ...s, position: e.target.value as ShoutoutConfig['position'] }))}
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
            className="mb-3 w-full accent-[#fe2c55]"
            min={0.8}
            max={1.4}
            step={0.05}
            value={display.fontScale}
            onChange={(e) => setDisplay((s) => ({ ...s, fontScale: parseFloat(e.target.value) }))}
          />

          <label className={labelCls}>Durasi Tampil · {display.durationSec}s</label>
          <input
            type="range"
            className="w-full accent-[#fe2c55]"
            min={3}
            max={15}
            step={0.5}
            value={display.durationSec}
            onChange={(e) => setDisplay((s) => ({ ...s, durationSec: parseFloat(e.target.value) }))}
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
              {toast && <ShoutoutToast gift={toast.gift} line={toast.line} config={buildConfig()} />}
            </div>
          </div>

          <div className="rounded-2xl border border-[#1f232b] bg-[#0f1115] p-5">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-400">
              Riwayat Shoutout (output AI asli)
            </h2>
            {log.length === 0 ? (
              <p className="text-sm text-gray-500">
                Belum ada gift. Kirim gift atau nyalakan auto mode di atas.
              </p>
            ) : (
              <ul className="space-y-2.5">
                {log.map((e) => (
                  <li key={e.id} className="rounded-lg border border-[#262a33] bg-[#14171c] p-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-bold text-white">{e.gift.nickname}</span>
                      <span className="text-gray-400">
                        {e.gift.giftName} ×{e.gift.count}
                      </span>
                      {e.gift.diamonds > 0 && (
                        <span className="rounded-full bg-[#fe2c55]/20 px-2 py-0.5 text-[11px] font-bold text-[#ff7ea6]">
                          ◆ {e.gift.diamonds}
                        </span>
                      )}
                      {e.status === 'generating' ? (
                        <span className="ml-auto animate-pulse rounded-full bg-amber-500/20 px-2 py-0.5 text-[11px] font-bold text-amber-300">
                          AI menulis...
                        </span>
                      ) : (
                        <span
                          className={`ml-auto rounded-full px-2 py-0.5 text-[11px] font-bold ${
                            e.source === 'llm'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {e.source === 'llm' ? 'AI' : 'template'}
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-sm italic text-gray-300">
                      {e.status === 'generating' ? 'Menghasilkan teks...' : `“${e.text}”`}
                    </p>
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
