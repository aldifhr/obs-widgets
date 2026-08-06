import type { CSSProperties } from 'react';
import type { GiftEvent, ShoutoutConfig } from '../shoutout/types';

interface Props {
  gift: GiftEvent;
  line: string;
  config: ShoutoutConfig;
}

export default function ShoutoutToast({ gift, line, config }: Props) {
  const positionMap: Record<ShoutoutConfig['position'], CSSProperties> = {
    'bottom-left': { alignItems: 'flex-end', justifyContent: 'flex-start' },
    'bottom-right': { alignItems: 'flex-end', justifyContent: 'flex-end' },
    'bottom-center': { alignItems: 'flex-end', justifyContent: 'center' },
    center: { alignItems: 'center', justifyContent: 'center' },
  };

  const style = {
    '--accent': config.accent,
    '--accent-light': config.accentLight,
    '--accent-glow': config.accentGlow,
    '--font-family': config.fontFamily,
    '--font-scale': config.fontSizeScale,
    animationDuration: `${config.durationSec}s`,
  } as CSSProperties;

  return (
    <div className="shoutout-anim" style={positionMap[config.position]}>
      <div className="shoutout-toast" style={style}>
        <span className="shoutout-ribbon" style={{ background: `linear-gradient(90deg, ${config.accent}, ${config.accentLight})` }} />
        {config.showAvatar && gift.avatar && (
          <img className="shoutout-avatar" src={gift.avatar} alt="" />
        )}
        <div className="shoutout-body">
          {config.showUsername && <div className="shoutout-nick">{gift.nickname}</div>}
          <div className="shoutout-gift">
            {config.showGift && gift.giftIcon && (
              <img className="shoutout-gift-icon" src={gift.giftIcon} alt="" />
            )}
            <span>{gift.giftName} ×{gift.count}</span>
            {config.showDiamonds && gift.diamonds > 0 && (
              <span className="shoutout-diamonds">
                <span className="shoutout-gem">◆</span> {gift.diamonds}
              </span>
            )}
          </div>
          {line && <div className="shoutout-line">{line}</div>}
        </div>
      </div>
    </div>
  );
}
