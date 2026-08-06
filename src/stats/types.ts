export interface StatsConfig {
  tiktokUser: string;
  eulerKey: string;
  showViewers: boolean;
  showLikes: boolean;
  showFollowers: boolean;
  accent: string;
  fontFamily: string;
  fontSizeScale: number;
  position: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

export const DEFAULT_STATS_CONFIG: StatsConfig = {
  tiktokUser: '',
  eulerKey: '',
  showViewers: true,
  showLikes: true,
  showFollowers: true,
  accent: '#22d3ee',
  fontFamily: "'Inter', system-ui, sans-serif",
  fontSizeScale: 1,
  position: 'top-center',
};

export function statsConfigToParams(config: StatsConfig): URLSearchParams {
  const params = new URLSearchParams();
  if (config.tiktokUser) params.set('user', config.tiktokUser);
  if (config.eulerKey) params.set('euler', config.eulerKey);
  if (!config.showViewers) params.set('viewers', '0');
  if (!config.showLikes) params.set('likes', '0');
  if (!config.showFollowers) params.set('followers', '0');
  if (config.accent !== DEFAULT_STATS_CONFIG.accent) params.set('accent', config.accent);
  if (config.fontFamily !== DEFAULT_STATS_CONFIG.fontFamily)
    params.set('fontFamily', config.fontFamily);
  if (config.fontSizeScale !== DEFAULT_STATS_CONFIG.fontSizeScale)
    params.set('fontSizeScale', String(config.fontSizeScale));
  if (config.position !== DEFAULT_STATS_CONFIG.position) params.set('pos', config.position);
  return params;
}

export function statsParamsToConfig(params: URLSearchParams): StatsConfig {
  return {
    tiktokUser: params.get('user') ?? DEFAULT_STATS_CONFIG.tiktokUser,
    eulerKey: params.get('euler') ?? DEFAULT_STATS_CONFIG.eulerKey,
    showViewers: params.get('viewers') !== '0',
    showLikes: params.get('likes') !== '0',
    showFollowers: params.get('followers') !== '0',
    accent: params.get('accent') ?? DEFAULT_STATS_CONFIG.accent,
    fontFamily: params.get('fontFamily') ?? DEFAULT_STATS_CONFIG.fontFamily,
    fontSizeScale: parseFloat(
      params.get('fontSizeScale') ?? String(DEFAULT_STATS_CONFIG.fontSizeScale),
    ),
    position: (params.get('pos') as StatsConfig['position']) ?? DEFAULT_STATS_CONFIG.position,
  };
}

export interface StatsState {
  viewers: number;
  likes: number;
  followers: number;
}
