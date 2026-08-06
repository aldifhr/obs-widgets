import { useCallback, useEffect, useRef, useState } from 'react';
import { joinParamsToConfig } from '../join/config';
import { connectEulerJoin } from '../join/euler';
import { playGiftChime } from '../shoutout/sound';
import type { JoinEvent } from '../join/types';
import { trackEvent } from '../shared/analytics';
import JoinToast from './JoinToast';

interface ToastItem {
  id: number;
  join: JoinEvent;
}

type ConnStatus = 'idle' | 'connecting' | 'connected' | 'error';

export default function JoinWidget() {
  const config = joinParamsToConfig(new URLSearchParams(window.location.search));
  const [current, setCurrent] = useState<ToastItem | null>(null);
  const [status, setStatus] = useState<ConnStatus>('idle');
  const [statusMsg, setStatusMsg] = useState('');

  const queueRef = useRef<ToastItem[]>([]);
  const lastShowAtRef = useRef(0);
  const idRef = useRef(0);
  const showTimerRef = useRef<number | null>(null);

  useEffect(() => {
    trackEvent('join_widget_loaded', { user: config.tiktokUser || 'none' });
  }, [config.tiktokUser]);

  const showNext = useCallback(() => {
    if (showTimerRef.current !== null) return;
    const next = queueRef.current.shift();
    if (!next) {
      setCurrent(null);
      return;
    }
    setCurrent(next);
    if (config.sound) playGiftChime();
    trackEvent('join_shown');
    showTimerRef.current = window.setTimeout(() => {
      showTimerRef.current = null;
      showNext();
    }, config.durationSec * 1000);
  }, [config.sound, config.durationSec]);

  const enqueue = useCallback(
    (join: JoinEvent) => {
      const now = Date.now();
      if (now - lastShowAtRef.current < config.cooldownSec * 1000) return;
      lastShowAtRef.current = now;
      queueRef.current.push({ id: ++idRef.current, join });
      showNext();
    },
    [config.cooldownSec, showNext],
  );

  const onJoinRef = useRef(enqueue);
  onJoinRef.current = enqueue;

  useEffect(() => {
    if (!config.tiktokUser || !config.eulerKey) {
      setStatus('error');
      setStatusMsg('Isi TikTok username + Euler API key di customizer dulu.');
      return;
    }

    let disposed = false;
    let reconnectTimer: number | null = null;
    let conn: ReturnType<typeof connectEulerJoin> | null = null;

    const connect = () => {
      setStatus('connecting');
      setStatusMsg('');
      conn = connectEulerJoin(config.tiktokUser, config.eulerKey, {
        onJoin: (join) => onJoinRef.current(join),
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
      if (showTimerRef.current !== null) {
        window.clearTimeout(showTimerRef.current);
        showTimerRef.current = null;
      }
    };
  }, [config.tiktokUser, config.eulerKey]);

  const showStatusPill =
    status === 'connecting' || status === 'error' || !config.tiktokUser || !config.eulerKey;

  return (
    <div className="shoutout-stage">
      {current && <JoinToast join={current.join} config={config} />}
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
