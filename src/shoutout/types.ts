export interface ShoutoutConfig {
  tiktokUser: string;
  eulerKey: string;
  llmBaseUrl: string;
  llmKey: string;
  llmModel: string;
  llmUseProxy: boolean;
  voice: string;
  maxLength: number;
  minDiamonds: number;
  cooldownSec: number;
  durationSec: number;
  showAvatar: boolean;
  showGift: boolean;
  showDiamonds: boolean;
  showUsername: boolean;
  sound: boolean;
  accent: string;
  accentLight: string;
  accentGlow: string;
  fontFamily: string;
  fontSizeScale: number;
  position: 'bottom-left' | 'bottom-right' | 'bottom-center' | 'center';
}

export const DEFAULT_SHOUTOUT_CONFIG: ShoutoutConfig = {
  tiktokUser: '',
  eulerKey: '',
  llmBaseUrl: 'https://api.openai.com/v1',
  llmKey: '',
  llmModel: 'gpt-4o-mini',
  llmUseProxy: false,
  voice: 'Semangat, ramah, bahasa Indonesia kasual, singkat, tanpa emoji berlebihan',
  maxLength: 140,
  minDiamonds: 1,
  cooldownSec: 8,
  durationSec: 6.5,
  showAvatar: true,
  showGift: true,
  showDiamonds: true,
  showUsername: true,
  sound: true,
  accent: '#fe2c55',
  accentLight: '#ff7ea6',
  accentGlow: 'rgba(254,44,85,0.45)',
  fontFamily: "'Inter', system-ui, sans-serif",
  fontSizeScale: 1,
  position: 'bottom-left',
};

export interface GiftEvent {
  nickname: string;
  uniqueId: string;
  avatar: string;
  giftName: string;
  giftIcon: string;
  diamonds: number;
  count: number;
}
