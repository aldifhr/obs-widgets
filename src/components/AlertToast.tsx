import type { CSSProperties } from 'react';
import type { AlertConfig } from '../euler/alert';
import type { SocialEvent } from '../euler/events';

interface Props {
  config: AlertConfig;
  event: SocialEvent;
  badge: string;
  message: string;
}

export default function AlertToast({ config, event, badge, message }: Props) {
  const positionMap: Record<AlertConfig['position'], CSSProperties> = {
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
        <span
          className="shoutout-ribbon"
          style={{ background: `linear-gradient(90deg, ${config.accent}, ${config.accentLight})` }}
        />
        {config.showAvatar && event.avatar && (
          <img className="shoutout-avatar" src={event.avatar} alt="" />
        )}
        <div className="shoutout-body">
          {config.showUsername && <div className="shoutout-nick">{event.nickname}</div>}
          <div className="shoutout-gift">
            <span>{message}</span>
            {config.showCount && typeof event.count === 'number' && event.count > 0 && (
              <span className="shoutout-diamonds">
                <span className="shoutout-gem">+</span> {event.count}
              </span>
            )}
          </div>
          <div className="shoutout-line">{badge}</div>
        </div>
      </div>
    </div>
  );
}
