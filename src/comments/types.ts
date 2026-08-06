export interface CommentConfig {
  tiktokUser: string;
  eulerKey: string;
  maxEntries: number;
  entryDurationSec: number;
  showAvatar: boolean;
  showUsername: boolean;
  accent: string;
  fontFamily: string;
  fontSizeScale: number;
  position: 'bottom-left' | 'bottom-right' | 'bottom-center' | 'center';
}

export const DEFAULT_COMMENT_CONFIG: CommentConfig = {
  tiktokUser: '',
  eulerKey: '',
  maxEntries: 5,
  entryDurationSec: 12,
  showAvatar: true,
  showUsername: true,
  accent: '#14b8a6',
  fontFamily: "'Inter', system-ui, sans-serif",
  fontSizeScale: 1,
  position: 'bottom-left',
};

export function commentConfigToParams(config: CommentConfig): URLSearchParams {
  const params = new URLSearchParams();
  if (config.tiktokUser) params.set('user', config.tiktokUser);
  if (config.eulerKey) params.set('euler', config.eulerKey);
  if (config.maxEntries !== DEFAULT_COMMENT_CONFIG.maxEntries)
    params.set('maxEntries', String(config.maxEntries));
  if (config.entryDurationSec !== DEFAULT_COMMENT_CONFIG.entryDurationSec)
    params.set('entryDuration', String(config.entryDurationSec));
  if (!config.showAvatar) params.set('avatar', '0');
  if (!config.showUsername) params.set('nick', '0');
  if (config.accent !== DEFAULT_COMMENT_CONFIG.accent) params.set('accent', config.accent);
  if (config.fontFamily !== DEFAULT_COMMENT_CONFIG.fontFamily)
    params.set('fontFamily', config.fontFamily);
  if (config.fontSizeScale !== DEFAULT_COMMENT_CONFIG.fontSizeScale)
    params.set('fontSizeScale', String(config.fontSizeScale));
  if (config.position !== DEFAULT_COMMENT_CONFIG.position) params.set('pos', config.position);
  return params;
}

export function commentParamsToConfig(params: URLSearchParams): CommentConfig {
  return {
    tiktokUser: params.get('user') ?? DEFAULT_COMMENT_CONFIG.tiktokUser,
    eulerKey: params.get('euler') ?? DEFAULT_COMMENT_CONFIG.eulerKey,
    maxEntries: parseInt(
      params.get('maxEntries') ?? String(DEFAULT_COMMENT_CONFIG.maxEntries),
      10,
    ),
    entryDurationSec: parseFloat(
      params.get('entryDuration') ?? String(DEFAULT_COMMENT_CONFIG.entryDurationSec),
    ),
    showAvatar: params.get('avatar') !== '0',
    showUsername: params.get('nick') !== '0',
    accent: params.get('accent') ?? DEFAULT_COMMENT_CONFIG.accent,
    fontFamily: params.get('fontFamily') ?? DEFAULT_COMMENT_CONFIG.fontFamily,
    fontSizeScale: parseFloat(
      params.get('fontSizeScale') ?? String(DEFAULT_COMMENT_CONFIG.fontSizeScale),
    ),
    position: (params.get('pos') as CommentConfig['position']) ?? DEFAULT_COMMENT_CONFIG.position,
  };
}

export interface CommentItem {
  id: number;
  nickname: string;
  avatar: string;
  comment: string;
}
