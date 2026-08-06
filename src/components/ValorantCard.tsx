import type { CSSProperties, ReactNode } from 'react';
import type { WidgetConfig } from '../shared/types';
import type { RankDisplay } from '../shared/api';

const TIER_NAMES: Record<number, string> = {
  0: 'Unrated',
  3: 'Iron 1', 4: 'Iron 2', 5: 'Iron 3',
  6: 'Bronze 1', 7: 'Bronze 2', 8: 'Bronze 3',
  9: 'Silver 1', 10: 'Silver 2', 11: 'Silver 3',
  12: 'Gold 1', 13: 'Gold 2', 14: 'Gold 3',
  15: 'Platinum 1', 16: 'Platinum 2', 17: 'Platinum 3',
  18: 'Diamond 1', 19: 'Diamond 2', 20: 'Diamond 3',
  21: 'Ascendant 1', 22: 'Ascendant 2', 23: 'Ascendant 3',
  24: 'Immortal 1', 25: 'Immortal 2', 26: 'Immortal 3',
  27: 'Radiant',
};

function getNextRankInfo(tierNumber: number, rr: number): { name: string; rrToNext: number } | null {
  if (rr >= 100 || !TIER_NAMES[tierNumber]) return null;
  const nextName = TIER_NAMES[tierNumber + 1];
  if (!nextName) return null;
  return { name: nextName, rrToNext: 100 - rr };
}

interface ValorantCardProps {
  config: WidgetConfig;
  data: RankDisplay;
}

export default function ValorantCard({ config, data }: ValorantCardProps) {
  const showAvatar = config.showAvatar !== false;
  const next = getNextRankInfo(data.tierNumber, data.rr);
  const design = config.design || 'classic';

  const style = {
    '--accent': config.accent,
    '--accent-light': config.accentLight,
    '--accent-glow': config.accentGlow,
    '--card-width': `${config.cardWidth}px`,
    '--card-padding': config.cardPadding,
    '--card-radius': `${config.cardRadius}px`,
    '--font-family': config.fontFamily,
    '--font-scale': `${config.fontSizeScale}`,
    '--card-opacity': `${config.cardOpacity}`,
    '--bg-image': config.bgImage ? `url("${config.bgImage}")` : 'none',
    '--bg-opacity': `${config.bgOpacity}`,
  } as CSSProperties;

  const nameHtml = (
    <div className="text-[0.875em] font-bold tracking-[0.3px] text-[#e5e7eb]">
      {config.name}
      <span className="ml-1.5 text-[0.75em] font-medium text-[#6b7280]">#{config.tag}</span>
    </div>
  );

  const rankSize = design === 'slim' ? 'vc-rank-sm' : design === 'centered' ? 'vc-rank-md' : design === 'hero' ? 'vc-rank-hero' : '';
  const rankIcon = showAvatar ? (
    <div className={`vc-rank ${rankSize}`}>
      <img src={data.images.small} alt="rank" />
    </div>
  ) : null;

  const tierHtml = (
    <div
      className="text-[1.875em] font-extrabold leading-[1.1] tracking-[0.5px]"
      style={{ textShadow: `0 2px 16px ${config.accentGlow}` }}
    >
      {data.tier}
    </div>
  );

  const rrSection = (
    <div className="mt-[18px]">
      <div className="mb-[0.5em] flex items-baseline justify-between text-[0.6875em] font-semibold text-[#9ca3af]">
        <span>RR Progress</span>
        <span className="text-[1.0625em] font-extrabold tabular-nums" style={{ color: config.accent }}>
          {data.rr} <small className="text-[0.6875em] font-semibold text-[#6b7280]">/ 100</small>
        </span>
      </div>
      <div className="vc-rr-bar">
        <div className="vc-rr-fill" style={{ width: `${data.rr}%` }} />
      </div>
      {next && (
        <div className="mt-2 text-center text-[11px] font-semibold text-[#9ca3af]">
          {next.rrToNext} RR lagi ke{' '}
          <b style={{ color: config.accent }} className="font-extrabold">
            {next.name}
          </b>
        </div>
      )}
    </div>
  );

  let inner: ReactNode;
  switch (design) {
    case 'centered':
      inner = (
        <div className="flex flex-col items-center gap-3.5 text-center">
          {rankIcon}
          {tierHtml}
          {nameHtml}
          <div className="w-full">{rrSection}</div>
        </div>
      );
      break;
    case 'slim':
      inner = (
        <div className="flex items-center gap-3.5">
          {rankIcon}
          <div className="min-w-0 flex-1">
            {nameHtml}
            <div className="mt-0.5 text-[12px] font-bold" style={{ color: config.accent }}>
              {data.tier}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2.5">
            <div className="vc-rr-bar !h-1.5 !w-[110px]">
              <div className="vc-rr-fill" style={{ width: `${data.rr}%` }} />
            </div>
            <span className="min-w-[26px] text-right text-[14px] font-extrabold tabular-nums" style={{ color: config.accent }}>
              {data.rr}
            </span>
          </div>
        </div>
      );
      break;
    case 'hero':
      inner = (
        <div className="relative pt-[26px]">
          <div className="absolute right-2 top-2">{rankIcon}</div>
          <div
            className="mb-1 text-[44px] font-black leading-none tracking-[0.5px]"
            style={{ textShadow: `0 2px 20px ${config.accentGlow}` }}
          >
            {data.tier}
          </div>
          <div className="text-[13px]">{nameHtml}</div>
          {rrSection}
        </div>
      );
      break;
    default:
      inner = (
        <>
          <div className="flex items-center justify-between">{nameHtml}</div>
          <div className="mt-4 flex items-center gap-[18px]">
            {rankIcon}
            <div>{tierHtml}</div>
          </div>
          {rrSection}
        </>
      );
  }

  return (
    <div className={`vc-card${config.showGrid ? '' : ' vc-hide-grid'}`} style={style}>
      {inner}
    </div>
  );
}
