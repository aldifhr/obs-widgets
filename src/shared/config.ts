import { DEFAULT_CONFIG, type WidgetConfig } from './types';

export function configToParams(config: WidgetConfig): URLSearchParams {
  const params = new URLSearchParams();
  params.set('name', config.name);
  params.set('tag', config.tag);
  params.set('region', config.region);
  if (!config.showAvatar) params.set('avatar', '0');
  if (!config.showName) params.set('name', '0');
  if (!config.showChange) params.set('change', '0');
  if (!config.showStats) params.set('stats', '0');
  if (!config.showMatchHistory) params.set('history', '0');
  if (config.matchCount !== 5) params.set('matchCount', String(config.matchCount));
  if (config.refreshInterval !== 60) params.set('refresh', String(config.refreshInterval));
  if (config.accent !== '#ff4655') params.set('accent', config.accent);
  if (config.accentLight !== '#ff7b85') params.set('accentLight', config.accentLight);
  if (config.accentGlow !== 'rgba(255,70,85,0.28)') params.set('accentGlow', config.accentGlow);
  if (config.cardWidth !== 460) params.set('cardWidth', String(config.cardWidth));
  if (config.cardPadding !== '22px 24px') params.set('cardPadding', config.cardPadding);
  if (config.cardRadius !== 18) params.set('cardRadius', String(config.cardRadius));
  if (config.fontFamily !== "'Segoe UI', 'Bahnschrift', Arial, sans-serif") params.set('fontFamily', config.fontFamily);
  if (config.gridSize !== 34) params.set('gridSize', String(config.gridSize));
  if (!config.showGrid) params.set('grid', '0');
  if (config.fontSizeScale !== 1) params.set('fontSizeScale', String(config.fontSizeScale));
  if (config.cardOpacity !== 0.92) params.set('cardOpacity', String(config.cardOpacity));
  if (config.bgImage) params.set('bgImage', config.bgImage);
  if (config.bgOpacity !== 0) params.set('bgOpacity', String(config.bgOpacity));
  if (config.preset !== 'default') params.set('preset', config.preset);
  if (config.design !== 'classic') params.set('design', config.design);
  if (!config.sound) params.set('sound', '0');
  if (config.henrikKey) params.set('henrikKey', config.henrikKey);
  return params;
}

export function paramsToConfig(params: URLSearchParams): WidgetConfig {
  return {
    name: params.get('name') ?? DEFAULT_CONFIG.name,
    tag: params.get('tag') ?? DEFAULT_CONFIG.tag,
    region: params.get('region') ?? DEFAULT_CONFIG.region,
    showAvatar: params.get('avatar') !== '0',
    showName: params.get('name') !== '0',
    showChange: params.get('change') !== '0',
    showStats: params.get('stats') !== '0',
    showMatchHistory: params.get('history') !== '0',
    matchCount: parseInt(params.get('matchCount') ?? '5', 10),
    refreshInterval: parseInt(params.get('refresh') ?? '60', 10),
    accent: params.get('accent') ?? DEFAULT_CONFIG.accent,
    accentLight: params.get('accentLight') ?? DEFAULT_CONFIG.accentLight,
    accentGlow: params.get('accentGlow') ?? DEFAULT_CONFIG.accentGlow,
    cardWidth: parseInt(params.get('cardWidth') ?? String(DEFAULT_CONFIG.cardWidth), 10),
    cardPadding: params.get('cardPadding') ?? DEFAULT_CONFIG.cardPadding,
    cardRadius: parseInt(params.get('cardRadius') ?? String(DEFAULT_CONFIG.cardRadius), 10),
    fontFamily: params.get('fontFamily') ?? DEFAULT_CONFIG.fontFamily,
    gridSize: parseInt(params.get('gridSize') ?? String(DEFAULT_CONFIG.gridSize), 10),
    showGrid: params.get('grid') !== '0',
    fontSizeScale: parseFloat(params.get('fontSizeScale') ?? String(DEFAULT_CONFIG.fontSizeScale)),
    cardOpacity: parseFloat(params.get('cardOpacity') ?? String(DEFAULT_CONFIG.cardOpacity)),
    bgImage: params.get('bgImage') ?? DEFAULT_CONFIG.bgImage,
    bgOpacity: parseFloat(params.get('bgOpacity') ?? (params.get('bgImage') ? '0.35' : String(DEFAULT_CONFIG.bgOpacity))),
    preset: params.get('preset') ?? DEFAULT_CONFIG.preset,
    design: params.get('design') ?? DEFAULT_CONFIG.design,
    sound: params.get('sound') !== '0',
    henrikKey: params.get('henrikKey') ?? DEFAULT_CONFIG.henrikKey,
  };
}
