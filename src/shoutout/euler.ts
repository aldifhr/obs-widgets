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
 * Returns a final GiftEvent for each finished gift. Combo streaks fire
 * multiple messages (repeatEnd=0) then one final (repeatEnd=1) — we only
 * emit the final one so the overlay is not spammed per combo tick.
 */
export function parseGiftEvents(rawData: string): GiftEvent[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawData);
  } catch {
    return [];
  }
  if (typeof parsed !== 'object' || parsed === null) return [];

  const bundle = parsed as {
    type?: string;
    data?: unknown;
    messages?: Array<{ type?: string; data?: unknown }>;
  };

  const messages: Array<{ type?: string; data?: unknown }> = Array.isArray(bundle)
    ? (bundle as Array<{ type?: string; data?: unknown }>)
    : bundle.messages ?? (bundle.type ? [bundle] : []);

  const gifts: GiftEvent[] = [];
  for (const msg of messages) {
    if (msg.type !== 'WebcastGiftMessage' || !msg.data) continue;
    const g = msg.data as GiftMessageData;
    const isFinal = (g.repeatEnd ?? 1) === 1;
    if (!isFinal) continue;
    gifts.push(toGiftEvent(g));
  }
  return gifts;
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
  const ws = new WebSocket(buildEulerWsUrl(tiktokUser, apiKey));

  ws.onmessage = (ev) => {
    const data = typeof ev.data === 'string' ? ev.data : '';
    if (!data) return;
    const gifts = parseGiftEvents(data);
    gifts.forEach(handlers.onGift);
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
