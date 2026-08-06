import { useEffect, useRef, useState } from 'react';
import { commentParamsToConfig, type CommentItem } from '../comments/types';
import { connectEulerEvents } from '../euler/events';
import { trackEvent } from '../shared/analytics';
import CommentTicker from './CommentTicker';

type ConnStatus = 'idle' | 'connecting' | 'connected' | 'error';

export default function CommentWidget() {
  const config = commentParamsToConfig(new URLSearchParams(window.location.search));
  const [items, setItems] = useState<CommentItem[]>([]);
  const [status, setStatus] = useState<ConnStatus>('idle');
  const [statusMsg, setStatusMsg] = useState('');

  const idRef = useRef(0);
  const timersRef = useRef<Record<number, number>>({});

  useEffect(() => {
    trackEvent('comment_widget_loaded', { user: config.tiktokUser || 'none' });
  }, [config.tiktokUser]);

  useEffect(() => {
    if (!config.tiktokUser || !config.eulerKey) {
      setStatus('error');
      setStatusMsg('Isi TikTok username + Euler API key di customizer dulu.');
      return;
    }

    let disposed = false;
    let reconnectTimer: number | null = null;
    let conn: ReturnType<typeof connectEulerEvents> | null = null;

    const connect = () => {
      setStatus('connecting');
      setStatusMsg('');
      conn = connectEulerEvents(config.tiktokUser, config.eulerKey, {
        onEvent: (event) => {
          if (event.kind !== 'chat') return;
          const id = ++idRef.current;
          const item: CommentItem = {
            id,
            nickname: event.data.nickname,
            avatar: event.data.avatar,
            comment: event.data.comment,
          };
          setItems((prev) => [...prev, item].slice(-config.maxEntries));
          timersRef.current[id] = window.setTimeout(() => {
            setItems((prev) => prev.filter((i) => i.id !== id));
            delete timersRef.current[id];
          }, config.entryDurationSec * 1000);
        },
        onOpen: () => setStatus('connected'),
        onClose: (code) => {
          if (disposed || code === 1000) return;
          setStatus('connecting');
          setStatusMsg('Koneksi putus, mencoba lagi...');
          reconnectTimer = window.setTimeout(() => {
            reconnectTimer = null;
            connect();
          }, 5000);
        },
      });
    };

    connect();

    return () => {
      disposed = true;
      conn?.close();
      if (reconnectTimer !== null) window.clearTimeout(reconnectTimer);
      for (const t of Object.values(timersRef.current)) window.clearTimeout(t);
      timersRef.current = {};
    };
  }, [config.tiktokUser, config.eulerKey, config.maxEntries, config.entryDurationSec]);

  const showStatusPill =
    status === 'connecting' || status === 'error' || !config.tiktokUser || !config.eulerKey;

  return (
    <div className="shoutout-stage">
      <CommentTicker config={config} items={items} />
      {showStatusPill && (
        <div className={`shoutout-status ${status === 'error' ? 'shoutout-status-error' : ''}`}>
          {status === 'connecting'
            ? 'Menghubungkan ke TikTok...'
            : statusMsg || 'Widget belum dikonfigurasi.'}
        </div>
      )}
    </div>
  );
}
