export interface RankTier {
  min: number;
  max: number;
  name: string;
  key: string;
  color: string;
  colorLight: string;
  gradient: string;
}

export const RANK_TIERS: RankTier[] = [
  {
    min: 0,
    max: 999,
    name: 'Unranked',
    key: 'unranked',
    color: '#6b7280',
    colorLight: '#9ca3af',
    gradient: 'linear-gradient(135deg, #374151, #6b7280)',
  },
  {
    min: 1000,
    max: 1999,
    name: 'Iron',
    key: 'iron',
    color: '#9ca3af',
    colorLight: '#d1d5db',
    gradient: 'linear-gradient(135deg, #4b5563, #9ca3af)',
  },
  {
    min: 2000,
    max: 2999,
    name: 'Bronze',
    key: 'bronze',
    color: '#a16207',
    colorLight: '#fbbf24',
    gradient: 'linear-gradient(135deg, #78350f, #a16207)',
  },
  {
    min: 3000,
    max: 3999,
    name: 'Silver',
    key: 'silver',
    color: '#94a3b8',
    colorLight: '#e2e8f0',
    gradient: 'linear-gradient(135deg, #475569, #94a3b8)',
  },
  {
    min: 4000,
    max: 4999,
    name: 'Gold',
    key: 'gold',
    color: '#eab308',
    colorLight: '#fde047',
    gradient: 'linear-gradient(135deg, #92700c, #eab308)',
  },
  {
    min: 5000,
    max: 5999,
    name: 'Platinum',
    key: 'platinum',
    color: '#06b6d4',
    colorLight: '#67e8f9',
    gradient: 'linear-gradient(135deg, #0e7490, #06b6d4)',
  },
  {
    min: 6000,
    max: 6999,
    name: 'Diamond',
    key: 'diamond',
    color: '#60a5fa',
    colorLight: '#93c5fd',
    gradient: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
  },
  {
    min: 7000,
    max: 7999,
    name: 'Ascendant',
    key: 'ascendant',
    color: '#34d399',
    colorLight: '#6ee7b7',
    gradient: 'linear-gradient(135deg, #065f46, #10b981)',
  },
  {
    min: 8000,
    max: 8999,
    name: 'Immortal',
    key: 'immortal',
    color: '#f87171',
    colorLight: '#fca5a5',
    gradient: 'linear-gradient(135deg, #7f1d1d, #ef4444)',
  },
  {
    min: 9000,
    max: 999999,
    name: 'Radiant',
    key: 'radiant',
    color: '#ff4655',
    colorLight: '#ff7b85',
    gradient: 'linear-gradient(135deg, #991b1b, #ff4655)',
  },
];

export function getRankTier(rating: number): RankTier {
  return RANK_TIERS.find((t) => rating >= t.min && rating <= t.max) ?? RANK_TIERS[0];
}

export function formatRating(rating: number): string {
  return String(rating);
}
