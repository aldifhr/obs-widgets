import type { CSSProperties } from 'react';
import type { JoinConfig, JoinEvent } from '../join/types';

interface Props {
  join: JoinEvent;
  config: JoinConfig;
}

export default function JoinToast({ join, config }: Props) {
  const positionMap: Record<JoinConfig['position'], CSSProperties> = {
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
        {config.showAvatar && join.avatar && (
          <img className="shoutout-avatar" src={join.avatar} alt="" />
        )}
        <div className="shoutout-body">
          {config.showUsername && (
            <div className="shoutout-nick">{join.nickname.slice(0, config.maxLength)}</div>
          )}
          <div className="shoutout-gift">
            <span>Gabung di live!</span>
            {config.showMemberCount && typeof join.memberCount === 'number' && (
              <span className="shoutout-diamonds">
                <span className="shoutout-gem">+</span> {join.memberCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
