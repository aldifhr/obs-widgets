export interface ValorantMmrResponse {
  data: {
    current_data: {
      currenttier: number;
      currenttierpatched: string;
      ranking_in_tier: number;
      images: {
        small: string;
        large: string;
        triangle: string;
      };
    };
    highest_rank: {
      season: string;
      tier: number;
      patched_tier: string;
    } | null;
  };
}

export interface RankDisplay {
  tier: string;
  tierNumber: number;
  rr: number;
  images: {
    small: string;
    large: string;
    triangle: string;
  };
}

export interface WidgetConfig {
  name: string;
  tag: string;
  region: string;
  showAvatar: boolean;
  showName: boolean;
  showChange: boolean;
  showStats: boolean;
  showMatchHistory: boolean;
  matchCount: number;
  refreshInterval: number;
  accent: string;
  accentLight: string;
  accentGlow: string;
  cardWidth: number;
  cardPadding: string;
  cardRadius: number;
  fontFamily: string;
  gridSize: number;
  showGrid: boolean;
  fontSizeScale: number;
  cardOpacity: number;
  bgImage: string;
  bgOpacity: number;
  preset: string;
  design: string;
  sound: boolean;
  henrikKey: string;
}

export const DEFAULT_CONFIG: WidgetConfig = {
  name: '',
  tag: '',
  region: 'ap',
  showAvatar: true,
  showName: true,
  showChange: true,
  showStats: true,
  showMatchHistory: true,
  matchCount: 5,
  refreshInterval: 60,
  accent: '#ff4655',
  accentLight: '#ff7b85',
  accentGlow: 'rgba(255,70,85,0.28)',
  cardWidth: 460,
  cardPadding: '22px 24px',
  cardRadius: 18,
  fontFamily: "'Segoe UI', 'Bahnschrift', Arial, sans-serif",
  gridSize: 34,
  showGrid: true,
  fontSizeScale: 1,
  cardOpacity: 0.92,
  bgImage: '',
  bgOpacity: 0,
  preset: 'default',
  design: 'classic',
  sound: true,
  henrikKey: '',
};
