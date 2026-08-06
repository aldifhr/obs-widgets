import { openEulerConnection, type EulerMessage } from '../shoutout/euler';
import type { GiftEvent } from '../shoutout/types';
import type { JoinEvent } from '../join/types';

export interface SocialEvent {
  nickname: string;
  uniqueId: string;
  avatar: string;
  action: 'follow' | 'share';
  count?: number;
  shareTarget?: string;
}

export interface LikeEvent {
  nickname: string;
  uniqueId: string;
  avatar: string;
  likeCount: number;
  totalLikeCount: number;
}

export interface ViewersEvent {
  viewerCount: number;
  totalUser: number;
}

export interface ChatEvent {
  nickname: string;
  uniqueId: string;
  avatar: string;
  comment: string;
}

export type EulerEvent =
  | { kind: 'gift'; data: GiftEvent }
  | { kind: 'join'; data: JoinEvent }
  | { kind: 'follow'; data: SocialEvent }
  | { kind: 'share'; data: SocialEvent }
  | { kind: 'like'; data: LikeEvent }
  | { kind: 'viewers'; data: ViewersEvent }
  | { kind: 'chat'; data: ChatEvent };

interface RawUser {
  nickname?: string;
  uniqueId?: string;
  profilePicture?: { url?: string[] };
}

function userOf(raw: RawUser | undefined): { nickname: string; uniqueId: string; avatar: string } {
  const url = raw?.profilePicture?.url;
  const avatar = url?.find((u) => u && !u.startsWith('data:')) ?? url?.[0] ?? '';
  return {
    nickname: raw?.nickname ?? raw?.uniqueId ?? 'Anon',
    uniqueId: raw?.uniqueId ?? '',
    avatar,
  };
}

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Parses Euler messages into typed events. Returns an empty array when the
 * payload contains nothing relevant.
 */
export function parseEulerEvents(messages: EulerMessage[]): EulerEvent[] {
  const events: EulerEvent[] = [];
  for (const msg of messages) {
    switch (msg.type) {
      case 'WebcastGiftMessage': {
        const d = msg.data as any;
        if (!d) break;
        const isFinal = num(d.repeatEnd ?? 1) === 1;
        if (!isFinal) break;
        const u = userOf(d.user);
        const gd = d.giftDetails ?? {};
        events.push({
          kind: 'gift',
          data: {
            nickname: u.nickname,
            uniqueId: u.uniqueId,
            avatar: u.avatar,
            giftName: gd.giftName ?? 'gift',
            giftIcon: gd.icon?.url?.find((x: string) => !x.startsWith('data:')) ?? gd.icon?.url?.[0] ?? '',
            diamonds: num(gd.diamondCount),
            count: Math.max(1, num(d.repeatCount ?? d.comboCount ?? 1)),
          },
        });
        break;
      }
      case 'WebcastMemberMessage': {
        const d = msg.data as any;
        if (!d) break;
        const u = userOf(d.user);
        events.push({
          kind: 'join',
          data: {
            nickname: u.nickname,
            uniqueId: u.uniqueId,
            avatar: u.avatar,
            memberCount: d.memberCount !== undefined ? num(d.memberCount) : undefined,
          },
        });
        break;
      }
      case 'WebcastSocialMessage': {
        const d = msg.data as any;
        if (!d) break;
        const u = userOf(d.user);
        const action = num(d.action);
        if (action === 1) {
          events.push({
            kind: 'follow',
            data: {
              nickname: u.nickname,
              uniqueId: u.uniqueId,
              avatar: u.avatar,
              action: 'follow',
              count: num(d.followCount),
            },
          });
        } else if (action === 2) {
          events.push({
            kind: 'share',
            data: {
              nickname: u.nickname,
              uniqueId: u.uniqueId,
              avatar: u.avatar,
              action: 'share',
              count: num(d.shareCount),
              shareTarget: d.shareTarget ?? '',
            },
          });
        }
        break;
      }
      case 'WebcastLikeMessage': {
        const d = msg.data as any;
        if (!d) break;
        const u = userOf(d.user);
        events.push({
          kind: 'like',
          data: {
            nickname: u.nickname,
            uniqueId: u.uniqueId,
            avatar: u.avatar,
            likeCount: num(d.likeCount),
            totalLikeCount: num(d.totalLikeCount),
          },
        });
        break;
      }
      case 'WebcastRoomUserSeqMessage': {
        const d = msg.data as any;
        if (!d) break;
        events.push({
          kind: 'viewers',
          data: {
            viewerCount: num(d.viewerCount),
            totalUser: num(d.totalUser),
          },
        });
        break;
      }
      case 'WebcastChatMessage': {
        const d = msg.data as any;
        if (!d) break;
        const u = userOf(d.user);
        if (!d.comment) break;
        events.push({
          kind: 'chat',
          data: {
            nickname: u.nickname,
            uniqueId: u.uniqueId,
            avatar: u.avatar,
            comment: String(d.comment),
          },
        });
        break;
      }
    }
  }
  return events;
}

export interface EulerEventsHandlers {
  onEvent: (event: EulerEvent) => void;
  onOpen?: () => void;
  onClose?: (code: number, reason: string) => void;
}

export function connectEulerEvents(
  tiktokUser: string,
  apiKey: string,
  handlers: EulerEventsHandlers,
): { close: () => void; ws: WebSocket } {
  return openEulerConnection(tiktokUser, apiKey, {
    onMessages: (messages) => {
      for (const event of parseEulerEvents(messages)) {
        handlers.onEvent(event);
      }
    },
    onOpen: handlers.onOpen,
    onClose: handlers.onClose,
  });
}
