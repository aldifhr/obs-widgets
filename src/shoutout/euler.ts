import { createWebSocketUrl, SchemaVersion, type ClientCloseCode } from '@eulerstream/euler-websocket-sdk';
import type { GiftEvent } from './types';

export interface EulerConnection {
  ws: WebSocket;
  close: () => void;
}

interface GiftMessageData {
  user?: {
    nickname?: string;
    uniqueId?: string;
    profilePicture?: { url?: string[] };
  };
  giftDetails?: {
    giftName?: string;
    diamondCount?: number;
    icon?: { url?: string[] };
  };
  repeatEnd?: number;
  repeatCount?: number;
  comboCount?: number;
}

export function buildEulerWsUrl(tiktokUser: string, apiKey: string): string {
  return createWebSocketUrl({
    uniqueId: tiktokUser,
    apiKey,
    features: {
      bundleEvents: true,
      schemaVersion: SchemaVersion.v2,
    },
  });
}

function firstUrl(url?: string[]): string {
  if (!url) return '';
  return url.find((u) => u && !u.startsWith('data:')) ?? url[0] ?? '';
}

function toGiftEvent(raw: GiftMessageData): GiftEvent {
  return {
    nickname: raw.user?.nickname ?? raw.user?.uniqueId ?? 'Anon',
    uniqueId: raw.user?.uniqueId ?? '',
    avatar: firstUrl(raw.user?.profilePicture?.url),
    giftName: raw.giftDetails?.giftName ?? 'gift',
    giftIcon: firstUrl(raw.giftDetails?.icon?.url),
    diamonds: raw.giftDetails?.diamondCount ?? 0,
    count: Math.max(1, raw.repeatCount ?? raw.comboCount ?? 1),
  };
}

/**
 * Some WebSocket transports deliver several JSON documents concatenated in a
 * single message (JSON Lines, back-to-back objects, or with binary separators
 * between them). JSON.parse only accepts one document, so scan forward to the
 * next JSON value start ({ or [) and recover each document boundary from the
 * reported error position ("Unexpected ... after JSON at position N").
 */
function parseJsonFrames(rawData: string): unknown[] {
  const frames: unknown[] = [];
  let input = rawData;
  while (true) {
    const start = input.search(/[{[]/);
    if (start === -1) break;
    const candidate = input.slice(start).trim();
    if (!candidate) break;
    try {
      frames.push(JSON.parse(candidate));
      break;
    } catch (e) {
      const m = e instanceof Error ? /position (\d+)/.exec(e.message) : null;
      if (!m) break;
      const cut = Number(m[1]);
      if (cut <= 0) break;
      const head = candidate.slice(0, cut);
      try {
        frames.push(JSON.parse(head));
      } catch {
        break;
      }
      input = candidate.slice(cut);
    }
  }
  return frames;
}

export interface EulerMessage {
  type?: string;
  data?: unknown;
}

/**
 * Extracts every typed message ({type, data}) from a raw WebSocket payload,
 * handling bundles, arrays, and multiple concatenated JSON documents.
 */
export function parseEulerMessages(rawData: string): EulerMessage[] {
  const out: EulerMessage[] = [];
  for (const parsed of parseJsonFrames(rawData)) {
    if (typeof parsed !== 'object' || parsed === null) continue;
    const bundle = parsed as {
      type?: string;
      data?: unknown;
      messages?: Array<{ type?: string; data?: unknown }>;
    };
    const messages: Array<{ type?: string; data?: unknown }> = Array.isArray(bundle)
      ? (bundle as Array<{ type?: string; data?: unknown }>)
      : bundle.messages ?? (bundle.type ? [bundle] : []);
    for (const msg of messages) {
      if (msg && typeof msg === 'object' && msg.type) out.push(msg);
    }
  }
  return out;
}

/**
 * Returns a final GiftEvent for each finished gift. Combo streaks fire
 * multiple messages (repeatEnd=0) then one final (repeatEnd=1) — we only
 * emit the final one so the overlay is not spammed per combo tick.
 */
export function parseGiftEvents(rawData: string): GiftEvent[] {
  const gifts: GiftEvent[] = [];
  for (const msg of parseEulerMessages(rawData)) {
    if (msg.type !== 'WebcastGiftMessage' || !msg.data) continue;
    const g = msg.data as GiftMessageData;
    const isFinal = (g.repeatEnd ?? 1) === 1;
    if (!isFinal) continue;
    gifts.push(toGiftEvent(g));
  }
  return gifts;
}

export interface EulerHandlers {
  onMessages: (messages: EulerMessage[]) => void;
  onOpen?: () => void;
  onClose?: (code: number, reason: string) => void;
}

export function openEulerConnection(
  tiktokUser: string,
  apiKey: string,
  handlers: EulerHandlers,
): EulerConnection {
  const ws = new WebSocket(buildEulerWsUrl(tiktokUser, apiKey));

  ws.onmessage = (ev) => {
    try {
      const data = typeof ev.data === 'string' ? ev.data : '';
      if (!data) return;
      const messages = parseEulerMessages(data);
      if (messages.length) handlers.onMessages(messages);
    } catch {
      // never let a malformed frame break the connection
    }
  };

  ws.onopen = () => handlers.onOpen?.();

  ws.onclose = (ev) => {
    const reason = getCloseReason(ev.code);
    handlers.onClose?.(ev.code, reason);
  };

  ws.onerror = () => {
    // onclose follows with the real close code
  };

  return {
    ws,
    close: () => {
      try {
        ws.close();
      } catch {
        // already closed
      }
    },
  };
}

export function connectEuler(
  tiktokUser: string,
  apiKey: string,
  handlers: {
    onGift: (gift: GiftEvent) => void;
    onOpen?: () => void;
    onClose?: (code: number, reason: string) => void;
  },
): EulerConnection {
  return openEulerConnection(tiktokUser, apiKey, {
    onMessages: (messages) => {
      for (const msg of messages) {
        if (msg.type !== 'WebcastGiftMessage' || !msg.data) continue;
        const g = msg.data as GiftMessageData;
        if ((g.repeatEnd ?? 1) !== 1) continue;
        handlers.onGift(toGiftEvent(g));
      }
    },
    onOpen: handlers.onOpen,
    onClose: handlers.onClose,
  });
}

const CLOSE_REASONS: Partial<Record<ClientCloseCode, string>> = {
  4404: 'Streamer sedang tidak live',
  4401: 'API key Euler invalid',
  4429: 'Terlalu banyak koneksi akun',
  4005: 'Stream TikTok berakhir',
  4500: 'Koneksi TikTok ditutup',
  4006: 'Koneksi tidak aktif',
  4400: 'Parameter koneksi invalid',
};

export function getCloseReason(code: number): string {
  return CLOSE_REASONS[code as ClientCloseCode] ?? `Koneksi tertutup (${code})`;
}
