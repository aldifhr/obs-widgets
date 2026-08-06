import { useCallback, useEffect, useRef, useState } from 'react';
import { shoutoutParamsToConfig } from '../shoutout/config';
import { connectEuler } from '../shoutout/euler';
import { generateShoutout, templateShoutout } from '../shoutout/llm';
import { playGiftChime } from '../shoutout/sound';
import type { GiftEvent } from '../shoutout/types';
import { trackEvent } from '../shared/analytics';
import ShoutoutToast from './ShoutoutToast';

interface ToastItem {
  id: number;
  gift: GiftEvent;
  line: string;
}

type ConnStatus = 'idle' | 'connecting' | 'connected' | 'error';

export default function ShoutoutWidget() {
  const config = shoutoutParamsToConfig(new URLSearchParams(window.location.search));
  const [current, setCurrent] = useState<ToastItem | null>(null);
  const [status, setStatus] = useState<ConnStatus>('idle');
  const [statusMsg, setStatusMsg] = useState('');

  const queueRef = useRef<ToastItem[]>([]);
  const lastShoutAtRef = useRef(0);
  const idRef = useRef(0);
  const showTimerRef = useRef<number | null>(null);

  useEffect(() => {
    trackEvent('shoutout_widget_loaded', { user: config.tiktokUser || 'none' });
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
    trackEvent('shoutout_shown');
    showTimerRef.current = window.setTimeout(() => {
      showTimerRef.current = null;
      showNext();
    }, config.durationSec * 1000);
  }, [config.sound, config.durationSec]);

  const enqueue = useCallback(
    (gift: GiftEvent) => {
      if (gift.diamonds < config.minDiamonds) return;
      const now = Date.now();
      if (now - lastShoutAtRef.current < config.cooldownSec * 1000) return;
      lastShoutAtRef.current = now;

      const item: ToastItem = { id: ++idRef.current, gift, line: templateShoutout(gift) };
      queueRef.current.push(item);

      generateShoutout(gift, config)
        .then((line) => {
          const idx = queueRef.current.findIndex((i) => i.id === item.id);
          if (idx >= 0) queueRef.current[idx].line = line;
          setCurrent((c) => (c && c.id === item.id ? { ...c, line } : c));
        })
        .catch(() => {});

      showNext();
    },
    [config, showNext],
  );

  const onGiftRef = useRef(enqueue);
  onGiftRef.current = enqueue;

  useEffect(() => {
    if (!config.tiktokUser || !config.eulerKey) {
      setStatus('error');
      setStatusMsg('Isi TikTok username + Euler API key di customizer dulu.');
      return;
    }

    let disposed = false;
    let reconnectTimer: number | null = null;
    let conn: ReturnType<typeof connectEuler> | null = null;

    const connect = () => {
      setStatus('connecting');
      setStatusMsg('');
      conn = connectEuler(config.tiktokUser, config.eulerKey, {
        onGift: (gift) => onGiftRef.current(gift),
        onOpen: () => setStatus('connected'),
        onClose: (code, reason) => {
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
      {current && <ShoutoutToast gift={current.gift} line={current.line} config={config} />}
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
