import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DEFAULT_ALERT_CONFIG,
  SHARE_ALERT_COLORS,
  alertParamsToConfig,
  type AlertConfig,
} from '../euler/alert';
import { connectEulerEvents, type SocialEvent } from '../euler/events';
import { playGiftChime } from '../shoutout/sound';
import { trackEvent } from '../shared/analytics';
import AlertToast from './AlertToast';

interface ToastItem {
  id: number;
  event: SocialEvent;
}

type ConnStatus = 'idle' | 'connecting' | 'connected' | 'error';

const KIND_TEXT: Record<'follow' | 'share', { badge: string; message: string }> = {
  follow: { badge: 'FOLLOW', message: 'Baru aja follow!' },
  share: { badge: 'SHARE', message: 'Share live-mu!' },
};

export default function AlertWidget({ kind }: { kind: 'follow' | 'share' }) {
  const defaults: AlertConfig =
    kind === 'share'
      ? { ...DEFAULT_ALERT_CONFIG, ...SHARE_ALERT_COLORS }
      : DEFAULT_ALERT_CONFIG;
  const config = alertParamsToConfig(new URLSearchParams(window.location.search), defaults);
  const [current, setCurrent] = useState<ToastItem | null>(null);
  const [status, setStatus] = useState<ConnStatus>('idle');
  const [statusMsg, setStatusMsg] = useState('');

  const queueRef = useRef<ToastItem[]>([]);
  const lastShowAtRef = useRef(0);
  const idRef = useRef(0);
  const showTimerRef = useRef<number | null>(null);

  useEffect(() => {
    trackEvent(`${kind}_widget_loaded`, { user: config.tiktokUser || 'none' });
  }, [config.tiktokUser, kind]);

  const showNext = useCallback(() => {
    if (showTimerRef.current !== null) return;
    const next = queueRef.current.shift();
    if (!next) {
      setCurrent(null);
      return;
    }
    setCurrent(next);
    if (config.sound) playGiftChime();
    trackEvent(`${kind}_shown`);
    showTimerRef.current = window.setTimeout(() => {
      showTimerRef.current = null;
      showNext();
    }, config.durationSec * 1000);
  }, [config.sound, config.durationSec, kind]);

  const enqueue = useCallback(
    (event: SocialEvent) => {
      const now = Date.now();
      if (now - lastShowAtRef.current < config.cooldownSec * 1000) return;
      lastShowAtRef.current = now;
      queueRef.current.push({ id: ++idRef.current, event });
      showNext();
    },
    [config.cooldownSec, showNext],
  );

  const onEventRef = useRef(enqueue);
  onEventRef.current = enqueue;

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
          if (event.kind === kind) onEventRef.current(event.data);
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
      if (showTimerRef.current !== null) {
        window.clearTimeout(showTimerRef.current);
        showTimerRef.current = null;
      }
    };
  }, [config.tiktokUser, config.eulerKey, kind]);

  const showStatusPill =
    status === 'connecting' || status === 'error' || !config.tiktokUser || !config.eulerKey;

  return (
    <div className="shoutout-stage">
      {current && (
        <AlertToast
          config={config}
          event={current.event}
          badge={KIND_TEXT[kind].badge}
          message={KIND_TEXT[kind].message}
        />
      )}
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
