export interface JoinConfig {
  tiktokUser: string;
  eulerKey: string;
  maxLength: number;
  cooldownSec: number;
  durationSec: number;
  showAvatar: boolean;
  showMemberCount: boolean;
  showUsername: boolean;
  sound: boolean;
  accent: string;
  accentLight: string;
  accentGlow: string;
  fontFamily: string;
  fontSizeScale: number;
  position: 'bottom-left' | 'bottom-right' | 'bottom-center' | 'center';
}

export const DEFAULT_JOIN_CONFIG: JoinConfig = {
  tiktokUser: '',
  eulerKey: '',
  maxLength: 32,
  cooldownSec: 3,
  durationSec: 4,
  showAvatar: true,
  showMemberCount: true,
  showUsername: true,
  sound: true,
  accent: '#16a34a',
  accentLight: '#4ade80',
  accentGlow: 'rgba(22,163,74,0.45)',
  fontFamily: "'Inter', system-ui, sans-serif",
  fontSizeScale: 1,
  position: 'bottom-left',
};

export interface JoinEvent {
  nickname: string;
  uniqueId: string;
  avatar: string;
  memberCount?: number;
}
