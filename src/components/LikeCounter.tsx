import type { CSSProperties } from 'react';
import type { LikeCounterConfig } from '../likes/types';

interface Props {
  config: LikeCounterConfig;
  total: number;
}

function fmt(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

export default function LikeCounter({ config, total }: Props) {
  const positionMap: Record<LikeCounterConfig['position'], CSSProperties> = {
    'bottom-left': { alignItems: 'flex-end', justifyContent: 'flex-start' },
    'bottom-right': { alignItems: 'flex-end', justifyContent: 'flex-end' },
    'bottom-center': { alignItems: 'flex-end', justifyContent: 'center' },
    center: { alignItems: 'center', justifyContent: 'center' },
  };

  const style = {
    '--lc-accent': config.accent,
    '--lc-accent-light': config.accentLight,
    '--font-family': config.fontFamily,
    '--font-scale': config.fontSizeScale,
  } as CSSProperties;

  return (
    <div className="shoutout-stage">
      <div className="shoutout-anim" style={positionMap[config.position]}>
        <div className="like-counter" style={style}>
          <span className="like-heart">&#10084;</span>
          <div className="like-body">
            <span className="like-value">{fmt(total)}</span>
            {config.showLabel && <span className="like-label">LIKES</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
