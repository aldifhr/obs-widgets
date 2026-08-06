export interface LikeCounterConfig {
  tiktokUser: string;
  eulerKey: string;
  showLabel: boolean;
  accent: string;
  accentLight: string;
  fontFamily: string;
  fontSizeScale: number;
  position: 'bottom-left' | 'bottom-right' | 'bottom-center' | 'center';
}

export const DEFAULT_LIKECOUNTER_CONFIG: LikeCounterConfig = {
  tiktokUser: '',
  eulerKey: '',
  showLabel: true,
  accent: '#f43f5e',
  accentLight: '#fb7185',
  fontFamily: "'Inter', system-ui, sans-serif",
  fontSizeScale: 1,
  position: 'bottom-right',
};

export function likeCounterConfigToParams(config: LikeCounterConfig): URLSearchParams {
  const params = new URLSearchParams();
  if (config.tiktokUser) params.set('user', config.tiktokUser);
  if (config.eulerKey) params.set('euler', config.eulerKey);
  if (!config.showLabel) params.set('label', '0');
  if (config.accent !== DEFAULT_LIKECOUNTER_CONFIG.accent) params.set('accent', config.accent);
  if (config.accentLight !== DEFAULT_LIKECOUNTER_CONFIG.accentLight)
    params.set('accentLight', config.accentLight);
  if (config.fontFamily !== DEFAULT_LIKECOUNTER_CONFIG.fontFamily)
    params.set('fontFamily', config.fontFamily);
  if (config.fontSizeScale !== DEFAULT_LIKECOUNTER_CONFIG.fontSizeScale)
    params.set('fontSizeScale', String(config.fontSizeScale));
  if (config.position !== DEFAULT_LIKECOUNTER_CONFIG.position) params.set('pos', config.position);
  return params;
}

export function likeCounterParamsToConfig(params: URLSearchParams): LikeCounterConfig {
  return {
    tiktokUser: params.get('user') ?? DEFAULT_LIKECOUNTER_CONFIG.tiktokUser,
    eulerKey: params.get('euler') ?? DEFAULT_LIKECOUNTER_CONFIG.eulerKey,
    showLabel: params.get('label') !== '0',
    accent: params.get('accent') ?? DEFAULT_LIKECOUNTER_CONFIG.accent,
    accentLight: params.get('accentLight') ?? DEFAULT_LIKECOUNTER_CONFIG.accentLight,
    fontFamily: params.get('fontFamily') ?? DEFAULT_LIKECOUNTER_CONFIG.fontFamily,
    fontSizeScale: parseFloat(
      params.get('fontSizeScale') ?? String(DEFAULT_LIKECOUNTER_CONFIG.fontSizeScale),
    ),
    position:
      (params.get('pos') as LikeCounterConfig['position']) ?? DEFAULT_LIKECOUNTER_CONFIG.position,
  };
}
