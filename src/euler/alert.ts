export interface AlertConfig {
  tiktokUser: string;
  eulerKey: string;
  cooldownSec: number;
  durationSec: number;
  showAvatar: boolean;
  showUsername: boolean;
  showCount: boolean;
  sound: boolean;
  accent: string;
  accentLight: string;
  accentGlow: string;
  fontFamily: string;
  fontSizeScale: number;
  position: 'bottom-left' | 'bottom-right' | 'bottom-center' | 'center';
}

export const DEFAULT_ALERT_CONFIG: AlertConfig = {
  tiktokUser: '',
  eulerKey: '',
  cooldownSec: 5,
  durationSec: 4,
  showAvatar: true,
  showUsername: true,
  showCount: true,
  sound: true,
  accent: '#3b82f6',
  accentLight: '#60a5fa',
  accentGlow: 'rgba(59,130,246,0.45)',
  fontFamily: "'Inter', system-ui, sans-serif",
  fontSizeScale: 1,
  position: 'bottom-left',
};

export const SHARE_ALERT_COLORS = {
  accent: '#8b5cf6',
  accentLight: '#a78bfa',
  accentGlow: 'rgba(139,92,246,0.45)',
};

export function alertConfigToParams(config: AlertConfig): URLSearchParams {
  const params = new URLSearchParams();
  if (config.tiktokUser) params.set('user', config.tiktokUser);
  if (config.eulerKey) params.set('euler', config.eulerKey);
  if (config.cooldownSec !== DEFAULT_ALERT_CONFIG.cooldownSec)
    params.set('cooldown', String(config.cooldownSec));
  if (config.durationSec !== DEFAULT_ALERT_CONFIG.durationSec)
    params.set('duration', String(config.durationSec));
  if (!config.showAvatar) params.set('avatar', '0');
  if (!config.showUsername) params.set('nick', '0');
  if (!config.showCount) params.set('count', '0');
  if (!config.sound) params.set('sound', '0');
  if (config.accent !== DEFAULT_ALERT_CONFIG.accent) params.set('accent', config.accent);
  if (config.accentLight !== DEFAULT_ALERT_CONFIG.accentLight)
    params.set('accentLight', config.accentLight);
  if (config.accentGlow !== DEFAULT_ALERT_CONFIG.accentGlow)
    params.set('accentGlow', config.accentGlow);
  if (config.fontFamily !== DEFAULT_ALERT_CONFIG.fontFamily)
    params.set('fontFamily', config.fontFamily);
  if (config.fontSizeScale !== DEFAULT_ALERT_CONFIG.fontSizeScale)
    params.set('fontSizeScale', String(config.fontSizeScale));
  if (config.position !== DEFAULT_ALERT_CONFIG.position) params.set('pos', config.position);
  return params;
}

export function alertParamsToConfig(params: URLSearchParams, defaults: AlertConfig = DEFAULT_ALERT_CONFIG): AlertConfig {
  return {
    tiktokUser: params.get('user') ?? defaults.tiktokUser,
    eulerKey: params.get('euler') ?? defaults.eulerKey,
    cooldownSec: parseInt(params.get('cooldown') ?? String(defaults.cooldownSec), 10),
    durationSec: parseFloat(params.get('duration') ?? String(defaults.durationSec)),
    showAvatar: params.get('avatar') !== '0',
    showUsername: params.get('nick') !== '0',
    showCount: params.get('count') !== '0',
    sound: params.get('sound') !== '0',
    accent: params.get('accent') ?? defaults.accent,
    accentLight: params.get('accentLight') ?? defaults.accentLight,
    accentGlow: params.get('accentGlow') ?? defaults.accentGlow,
    fontFamily: params.get('fontFamily') ?? defaults.fontFamily,
    fontSizeScale: parseFloat(params.get('fontSizeScale') ?? String(defaults.fontSizeScale)),
    position: (params.get('pos') as AlertConfig['position']) ?? defaults.position,
  };
}
