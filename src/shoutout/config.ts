import { DEFAULT_SHOUTOUT_CONFIG, type ShoutoutConfig } from './types';

export function shoutoutConfigToParams(config: ShoutoutConfig): URLSearchParams {
  const params = new URLSearchParams();
  if (config.tiktokUser) params.set('user', config.tiktokUser);
  if (config.eulerKey) params.set('euler', config.eulerKey);
  if (config.llmBaseUrl !== DEFAULT_SHOUTOUT_CONFIG.llmBaseUrl)
    params.set('llmBase', config.llmBaseUrl);
  if (config.llmKey) params.set('llmKey', config.llmKey);
  if (config.llmModel !== DEFAULT_SHOUTOUT_CONFIG.llmModel)
    params.set('llmModel', config.llmModel);
  if (config.llmUseProxy) params.set('llmProxy', '1');
  if (config.voice !== DEFAULT_SHOUTOUT_CONFIG.voice) params.set('voice', config.voice);
  if (config.maxLength !== DEFAULT_SHOUTOUT_CONFIG.maxLength)
    params.set('maxLen', String(config.maxLength));
  if (config.minDiamonds !== DEFAULT_SHOUTOUT_CONFIG.minDiamonds)
    params.set('minDiamonds', String(config.minDiamonds));
  if (config.cooldownSec !== DEFAULT_SHOUTOUT_CONFIG.cooldownSec)
    params.set('cooldown', String(config.cooldownSec));
  if (config.durationSec !== DEFAULT_SHOUTOUT_CONFIG.durationSec)
    params.set('duration', String(config.durationSec));
  if (!config.showAvatar) params.set('avatar', '0');
  if (!config.showGift) params.set('gift', '0');
  if (!config.showDiamonds) params.set('diamonds', '0');
  if (!config.showUsername) params.set('nick', '0');
  if (!config.sound) params.set('sound', '0');
  if (config.accent !== DEFAULT_SHOUTOUT_CONFIG.accent) params.set('accent', config.accent);
  if (config.accentLight !== DEFAULT_SHOUTOUT_CONFIG.accentLight)
    params.set('accentLight', config.accentLight);
  if (config.accentGlow !== DEFAULT_SHOUTOUT_CONFIG.accentGlow)
    params.set('accentGlow', config.accentGlow);
  if (config.fontFamily !== DEFAULT_SHOUTOUT_CONFIG.fontFamily)
    params.set('fontFamily', config.fontFamily);
  if (config.fontSizeScale !== DEFAULT_SHOUTOUT_CONFIG.fontSizeScale)
    params.set('fontSizeScale', String(config.fontSizeScale));
  if (config.position !== DEFAULT_SHOUTOUT_CONFIG.position) params.set('pos', config.position);
  return params;
}

export function shoutoutParamsToConfig(params: URLSearchParams): ShoutoutConfig {
  return {
    tiktokUser: params.get('user') ?? DEFAULT_SHOUTOUT_CONFIG.tiktokUser,
    eulerKey: params.get('euler') ?? DEFAULT_SHOUTOUT_CONFIG.eulerKey,
    llmBaseUrl: params.get('llmBase') ?? DEFAULT_SHOUTOUT_CONFIG.llmBaseUrl,
    llmKey: params.get('llmKey') ?? DEFAULT_SHOUTOUT_CONFIG.llmKey,
    llmModel: params.get('llmModel') ?? DEFAULT_SHOUTOUT_CONFIG.llmModel,
    llmUseProxy: params.get('llmProxy') === '1',
    voice: params.get('voice') ?? DEFAULT_SHOUTOUT_CONFIG.voice,
    maxLength: parseInt(params.get('maxLen') ?? String(DEFAULT_SHOUTOUT_CONFIG.maxLength), 10),
    minDiamonds: parseInt(
      params.get('minDiamonds') ?? String(DEFAULT_SHOUTOUT_CONFIG.minDiamonds),
      10,
    ),
    cooldownSec: parseInt(
      params.get('cooldown') ?? String(DEFAULT_SHOUTOUT_CONFIG.cooldownSec),
      10,
    ),
    durationSec: parseFloat(
      params.get('duration') ?? String(DEFAULT_SHOUTOUT_CONFIG.durationSec),
    ),
    showAvatar: params.get('avatar') !== '0',
    showGift: params.get('gift') !== '0',
    showDiamonds: params.get('diamonds') !== '0',
    showUsername: params.get('nick') !== '0',
    sound: params.get('sound') !== '0',
    accent: params.get('accent') ?? DEFAULT_SHOUTOUT_CONFIG.accent,
    accentLight: params.get('accentLight') ?? DEFAULT_SHOUTOUT_CONFIG.accentLight,
    accentGlow: params.get('accentGlow') ?? DEFAULT_SHOUTOUT_CONFIG.accentGlow,
    fontFamily: params.get('fontFamily') ?? DEFAULT_SHOUTOUT_CONFIG.fontFamily,
    fontSizeScale: parseFloat(
      params.get('fontSizeScale') ?? String(DEFAULT_SHOUTOUT_CONFIG.fontSizeScale),
    ),
    position: (params.get('pos') as ShoutoutConfig['position']) ??
      DEFAULT_SHOUTOUT_CONFIG.position,
  };
}
