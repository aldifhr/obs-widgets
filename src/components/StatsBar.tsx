import type { CSSProperties } from 'react';
import type { StatsConfig, StatsState } from '../stats/types';

interface Props {
  config: StatsConfig;
  stats: StatsState;
}

function fmt(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

export default function StatsBar({ config, stats }: Props) {
  const positionMap: Record<StatsConfig['position'], CSSProperties> = {
    'top-left': { alignItems: 'flex-start', justifyContent: 'flex-start' },
    'top-center': { alignItems: 'flex-start', justifyContent: 'center' },
    'top-right': { alignItems: 'flex-start', justifyContent: 'flex-end' },
    'bottom-left': { alignItems: 'flex-end', justifyContent: 'flex-start' },
    'bottom-center': { alignItems: 'flex-end', justifyContent: 'center' },
    'bottom-right': { alignItems: 'flex-end', justifyContent: 'flex-end' },
  };

  const style = {
    '--stats-accent': config.accent,
    '--font-family': config.fontFamily,
    '--font-scale': config.fontSizeScale,
  } as CSSProperties;

  return (
    <div className="stats-stage" style={{ fontFamily: config.fontFamily }}>
      <div className="stats-anim" style={positionMap[config.position]}>
        <div className="stats-bar" style={style}>
          {config.showViewers && (
            <div className="stats-chip">
              <span className="stats-icon">VIEWERS</span>
              <span className="stats-value">{fmt(stats.viewers)}</span>
            </div>
          )}
          {config.showLikes && (
            <div className="stats-chip">
              <span className="stats-icon">LIKES</span>
              <span className="stats-value">{fmt(stats.likes)}</span>
            </div>
          )}
          {config.showFollowers && (
            <div className="stats-chip">
              <span className="stats-icon">FOLLOWS</span>
              <span className="stats-value">{fmt(stats.followers)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
