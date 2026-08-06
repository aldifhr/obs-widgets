import { DEFAULT_JOIN_CONFIG, type JoinConfig } from './types';

export function joinConfigToParams(config: JoinConfig): URLSearchParams {
  const params = new URLSearchParams();
  if (config.tiktokUser) params.set('user', config.tiktokUser);
  if (config.eulerKey) params.set('euler', config.eulerKey);
  if (config.maxLength !== DEFAULT_JOIN_CONFIG.maxLength)
    params.set('maxLen', String(config.maxLength));
  if (config.cooldownSec !== DEFAULT_JOIN_CONFIG.cooldownSec)
    params.set('cooldown', String(config.cooldownSec));
  if (config.durationSec !== DEFAULT_JOIN_CONFIG.durationSec)
    params.set('duration', String(config.durationSec));
  if (!config.showAvatar) params.set('avatar', '0');
  if (!config.showMemberCount) params.set('memberCount', '0');
  if (!config.showUsername) params.set('nick', '0');
  if (!config.sound) params.set('sound', '0');
  if (config.accent !== DEFAULT_JOIN_CONFIG.accent) params.set('accent', config.accent);
  if (config.accentLight !== DEFAULT_JOIN_CONFIG.accentLight)
    params.set('accentLight', config.accentLight);
  if (config.accentGlow !== DEFAULT_JOIN_CONFIG.accentGlow)
    params.set('accentGlow', config.accentGlow);
  if (config.fontFamily !== DEFAULT_JOIN_CONFIG.fontFamily)
    params.set('fontFamily', config.fontFamily);
  if (config.fontSizeScale !== DEFAULT_JOIN_CONFIG.fontSizeScale)
    params.set('fontSizeScale', String(config.fontSizeScale));
  if (config.position !== DEFAULT_JOIN_CONFIG.position) params.set('pos', config.position);
  return params;
}

export function joinParamsToConfig(params: URLSearchParams): JoinConfig {
  return {
    tiktokUser: params.get('user') ?? DEFAULT_JOIN_CONFIG.tiktokUser,
    eulerKey: params.get('euler') ?? DEFAULT_JOIN_CONFIG.eulerKey,
    maxLength: parseInt(params.get('maxLen') ?? String(DEFAULT_JOIN_CONFIG.maxLength), 10),
    cooldownSec: parseInt(
      params.get('cooldown') ?? String(DEFAULT_JOIN_CONFIG.cooldownSec),
      10,
    ),
    durationSec: parseFloat(
      params.get('duration') ?? String(DEFAULT_JOIN_CONFIG.durationSec),
    ),
    showAvatar: params.get('avatar') !== '0',
    showMemberCount: params.get('memberCount') !== '0',
    showUsername: params.get('nick') !== '0',
    sound: params.get('sound') !== '0',
    accent: params.get('accent') ?? DEFAULT_JOIN_CONFIG.accent,
    accentLight: params.get('accentLight') ?? DEFAULT_JOIN_CONFIG.accentLight,
    accentGlow: params.get('accentGlow') ?? DEFAULT_JOIN_CONFIG.accentGlow,
    fontFamily: params.get('fontFamily') ?? DEFAULT_JOIN_CONFIG.fontFamily,
    fontSizeScale: parseFloat(
      params.get('fontSizeScale') ?? String(DEFAULT_JOIN_CONFIG.fontSizeScale),
    ),
    position: (params.get('pos') as JoinConfig['position']) ?? DEFAULT_JOIN_CONFIG.position,
  };
}
