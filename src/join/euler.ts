import { openEulerConnection, parseEulerMessages } from '../shoutout/euler';
import type { JoinEvent } from './types';

interface MemberMessageData {
  user?: {
    nickname?: string;
    uniqueId?: string;
    profilePicture?: { url?: string[] };
  };
  memberCount?: number;
  count?: number;
}

function firstUrl(url?: string[]): string {
  if (!url) return '';
  return url.find((u) => u && !u.startsWith('data:')) ?? url[0] ?? '';
}

function toJoinEvent(raw: MemberMessageData): JoinEvent {
  return {
    nickname: raw.user?.nickname ?? raw.user?.uniqueId ?? 'Anon',
    uniqueId: raw.user?.uniqueId ?? '',
    avatar: firstUrl(raw.user?.profilePicture?.url),
    memberCount: raw.memberCount ?? raw.count,
  };
}

export function parseJoinEvents(rawData: string): JoinEvent[] {
  const joins: JoinEvent[] = [];
  for (const msg of parseEulerMessages(rawData)) {
    if (msg.type !== 'WebcastMemberMessage' || !msg.data) continue;
    joins.push(toJoinEvent(msg.data as MemberMessageData));
  }
  return joins;
}

export interface JoinHandlers {
  onJoin: (join: JoinEvent) => void;
  onOpen?: () => void;
  onClose?: (code: number, reason: string) => void;
}

export function connectEulerJoin(
  tiktokUser: string,
  apiKey: string,
  handlers: JoinHandlers,
): { close: () => void; ws: WebSocket } {
  return openEulerConnection(tiktokUser, apiKey, {
    onMessages: (messages) => {
      for (const msg of messages) {
        if (msg.type !== 'WebcastMemberMessage' || !msg.data) continue;
        handlers.onJoin(toJoinEvent(msg.data as MemberMessageData));
      }
    },
    onOpen: handlers.onOpen,
    onClose: handlers.onClose,
  });
}
