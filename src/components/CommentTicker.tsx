import type { CSSProperties } from 'react';
import type { CommentConfig, CommentItem } from '../comments/types';

interface Props {
  config: CommentConfig;
  items: CommentItem[];
}

export default function CommentTicker({ config, items }: Props) {
  const positionMap: Record<CommentConfig['position'], CSSProperties> = {
    'bottom-left': { alignItems: 'flex-end', justifyContent: 'flex-start' },
    'bottom-right': { alignItems: 'flex-end', justifyContent: 'flex-end' },
    'bottom-center': { alignItems: 'flex-end', justifyContent: 'center' },
    center: { alignItems: 'center', justifyContent: 'center' },
  };

  const style = {
    '--cm-accent': config.accent,
    '--font-family': config.fontFamily,
    '--font-scale': config.fontSizeScale,
  } as CSSProperties;

  return (
    <div className="shoutout-stage">
      <div className="shoutout-anim" style={positionMap[config.position]}>
        <div className="comment-feed" style={style}>
          {items.length === 0 && (
            <div className="comment-empty">Belum ada komentar...</div>
          )}
          {items.map((item) => (
            <div key={item.id} className="comment-item">
              {config.showAvatar && item.avatar && (
                <img className="comment-avatar" src={item.avatar} alt="" />
              )}
              <div className="comment-bubble">
                {config.showUsername && <span className="comment-name">{item.nickname}</span>}
                <span className="comment-text">{item.comment}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
