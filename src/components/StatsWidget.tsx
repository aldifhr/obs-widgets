import { useEffect, useRef, useState } from 'react';
import { statsParamsToConfig, type StatsState } from '../stats/types';
import { connectEulerEvents } from '../euler/events';
import { trackEvent } from '../shared/analytics';
import StatsBar from './StatsBar';

type ConnStatus = 'idle' | 'connecting' | 'connected' | 'error';

export default function StatsWidget() {
  const config = statsParamsToConfig(new URLSearchParams(window.location.search));
  const [stats, setStats] = useState<StatsState>({ viewers: 0, likes: 0, followers: 0 });
  const [status, setStatus] = useState<ConnStatus>('idle');
  const [statusMsg, setStatusMsg] = useState('');

  const followersRef = useRef(0);

  useEffect(() => {
    trackEvent('stats_widget_loaded', { user: config.tiktokUser || 'none' });
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
          if (event.kind === 'viewers') {
            setStats((s) => ({ ...s, viewers: event.data.viewerCount || event.data.totalUser || s.viewers }));
          } else if (event.kind === 'like') {
            setStats((s) => ({
              ...s,
              likes: event.data.totalLikeCount > 0 ? event.data.totalLikeCount : s.likes,
            }));
          } else if (event.kind === 'follow') {
            followersRef.current += 1;
            setStats((s) => ({ ...s, followers: s.followers + 1 }));
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
      <StatsBar config={config} stats={stats} />
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
