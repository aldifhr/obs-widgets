import type { GiftEvent, ShoutoutConfig } from './types';

export interface LlmOptions {
  baseUrl: string;
  apiKey: string;
  model: string;
  voice: string;
  maxLength: number;
}

export function stripHost(url: string): string {
  try {
    return new URL(url).pathname.replace(/\/+$/, '') || '/v1';
  } catch {
    return url.replace(/^https?:\/\/[^/]+/, '').replace(/\/+$/, '') || '/v1';
  }
}

/**
 * Resolves the effective base URL. When `llmUseProxy` is enabled the request
 * goes to the same origin (`/llm-proxy/...`) so no CORS preflight is needed;
 * the host must proxy `/llm-proxy` to the real LLM server (Vite dev proxy or
 * a reverse proxy like nginx in production).
 */
export function resolveLlmBaseUrl(
  config: Pick<ShoutoutConfig, 'llmBaseUrl' | 'llmUseProxy'>,
): string {
  const base = config.llmBaseUrl.trim();
  if (!config.llmUseProxy) return base;
  return '/llm-proxy' + (base ? stripHost(base) : '/v1');
}

export function isLlmConfigured(config: ShoutoutConfig): boolean {
  return (config.llmUseProxy || !!config.llmBaseUrl) && !!config.llmKey && !!config.llmModel;
}

async function callOpenAiCompatible(input: GiftEvent, opts: LlmOptions): Promise<string> {
  const base = opts.baseUrl.trim().replace(/\/+$/, '');
  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${opts.apiKey}`,
    },
    body: JSON.stringify({
      model: opts.model,
      temperature: 0.9,
      max_tokens: Math.min(256, opts.maxLength + 80),
      messages: [
        {
          role: 'system',
          content:
            `Kamu adalah host livestream TikTok yang ramah dan asyik. Tugasmu hanya membuat SATU kalimat ucapan terima kasih ` +
            `atas gift yang masuk, gaya: ${opts.voice}. Maksimal ${opts.maxLength} karakter. ` +
            `Jangan pakai hashtag, jangan pakai tanda kutip pembuka/penutup, jangan sebutkan "AI". ` +
            `Tulis dalam bahasa Indonesia kasual.`,
        },
        {
          role: 'user',
          content:
            `${input.nickname} mengirim ${input.count}× ${input.giftName} ` +
            `(${input.diamonds} diamonds).`,
        },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`LLM request failed: ${res.status}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (typeof text !== 'string' || !text.trim()) {
    throw new Error('LLM returned empty text');
  }
  return text.trim().slice(0, opts.maxLength);
}

const TEMPLATES = [  'Makasih banyak {nickname}! Gift {gift} ×{count} bikin stream makin seru, lu emang the best!',
  'Wuih {nickname}, makasih gila-gilaan buat {gift} ×{count}! Kamu MVP hari ini!',
  'Terima kasih {nickname}! {gift} ×{count} masuk, doa terbaik buat yang ngasih!',
  'Luar biasa {nickname}, {gift} ×{count} datang! Salut banget sama dukunganmu!',
  'Waaah {nickname} ngirim {gift} ×{count}, makasih banget! Cepet banget masuknya!',
];

function pickTemplate(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return TEMPLATES[Math.abs(hash) % TEMPLATES.length];
}

export function templateShoutout(gift: GiftEvent): string {
  const tpl = pickTemplate(`${gift.uniqueId}:${gift.giftName}:${gift.count}`);
  return tpl
    .replace(/\{nickname\}/g, gift.nickname)
    .replace(/\{gift\}/g, gift.giftName)
    .replace(/\{count\}/g, String(gift.count));
}

/**
 * Generates a shoutout line via any OpenAI-compatible endpoint. Falls back
 * to a pre-written template when no LLM is configured or on any error so
 * the widget always has something to show.
 */
export async function generateShoutout(
  gift: GiftEvent,
  config: ShoutoutConfig,
): Promise<string> {
  return (await generateShoutoutDetailed(gift, config)).text;
}

export interface ShoutoutResult {
  text: string;
  source: 'llm' | 'template';
}

export async function generateShoutoutDetailed(
  gift: GiftEvent,
  config: ShoutoutConfig,
): Promise<ShoutoutResult> {
  if (isLlmConfigured(config)) {
    try {
      const text = await callOpenAiCompatible(gift, {
        baseUrl: resolveLlmBaseUrl(config),
        apiKey: config.llmKey,
        model: config.llmModel,
        voice: config.voice,
        maxLength: config.maxLength,
      });
      return { text, source: 'llm' };
    } catch {
      // fall back to template
    }
  }
  return { text: templateShoutout(gift), source: 'template' };
}

const TEST_GIFT: GiftEvent = {
  nickname: 'BudiSantoso',
  uniqueId: 'budisantoso',
  avatar: '',
  giftName: 'Lion',
  giftIcon: '',
  diamonds: 500,
  count: 1,
};

/**
 * Directly pings the configured LLM (no template fallback) so the demo can
 * surface real connection/API errors to the user.
 */
export async function testLlm(
  config: ShoutoutConfig,
): Promise<{ ok: boolean; text?: string; error?: string }> {
  if (!isLlmConfigured(config)) {
    return { ok: false, error: 'Isi Base URL, API Key, dan Model dulu.' };
  }
  try {
    const text = await callOpenAiCompatible(TEST_GIFT, {
      baseUrl: resolveLlmBaseUrl(config),
      apiKey: config.llmKey,
      model: config.llmModel,
      voice: config.voice,
      maxLength: config.maxLength,
    });
    return { ok: true, text };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
