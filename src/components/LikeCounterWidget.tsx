import { useEffect, useRef, useState } from 'react';
import { likeCounterParamsToConfig } from '../likes/types';
import { connectEulerEvents } from '../euler/events';
import { trackEvent } from '../shared/analytics';
import LikeCounter from './LikeCounter';

type ConnStatus = 'idle' | 'connecting' | 'connected' | 'error';

export default function LikeCounterWidget() {
  const config = likeCounterParamsToConfig(new URLSearchParams(window.location.search));
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<ConnStatus>('idle');
  const [statusMsg, setStatusMsg] = useState('');

  const totalRef = useRef(0);

  useEffect(() => {
    trackEvent('likecounter_widget_loaded', { user: config.tiktokUser || 'none' });
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
          if (event.kind !== 'like') return;
          if (event.data.totalLikeCount > totalRef.current) {
            totalRef.current = event.data.totalLikeCount;
            setTotal(event.data.totalLikeCount);
          } else if (event.data.likeCount > 0) {
            totalRef.current += event.data.likeCount;
            setTotal(totalRef.current);
          }
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
    };
  }, [config.tiktokUser, config.eulerKey]);

  const showStatusPill =
    status === 'connecting' || status === 'error' || !config.tiktokUser || !config.eulerKey;

  return (
    <div className="shoutout-stage">
      <LikeCounter config={config} total={total} />
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
