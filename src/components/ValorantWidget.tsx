import { useCallback, useEffect, useRef, useState } from 'react';
import { paramsToConfig } from '../shared/config';
import { fetchMmr, fetchLastMatch } from '../shared/api';
import { trackEvent } from '../shared/analytics';
import {
  detectEvents,
  getStateKey,
  playEventSound,
  readState,
  writeState,
  type WidgetEvent,
} from '../shared/animations';
import type { RankDisplay } from '../shared/api';
import ValorantCard from './ValorantCard';
import EventOverlay from './EventOverlay';

export default function ValorantWidget() {
  const config = paramsToConfig(new URLSearchParams(window.location.search));
  const [data, setData] = useState<RankDisplay | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeEvent, setActiveEvent] = useState<WidgetEvent | null>(null);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    trackEvent('widget_loaded', { name: config.name, tag: config.tag });
  }, [config.name, config.tag]);

  const update = useCallback(async () => {
    try {
      const [mmr, lastMatch] = await Promise.all([
        fetchMmr(config.name, config.tag, config.region, config.henrikKey),
        fetchLastMatch(config.name, config.tag, config.region, config.henrikKey).catch(() => null),
      ]);

      const stateKey = getStateKey(config.name, config.tag, config.region);
      const prev = readState(stateKey);
      const events = detectEvents(prev, mmr, lastMatch);
      writeState(stateKey, {
        tierNumber: mmr.tierNumber,
        rr: mmr.rr,
        lastMatchId: lastMatch?.id ?? null,
      });

      setData(mmr);

      if (events.length) {
        events.forEach((event, i) => {
          const showTimer = window.setTimeout(() => {
            setActiveEvent(event);
            if (config.sound) playEventSound(event);
          }, i * 500);
          const hideTimer = window.setTimeout(() => setActiveEvent(null), i * 500 + 3500);
          timersRef.current.push(showTimer, hideTimer);
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch');
    }
  }, [config]);

  useEffect(() => {
    if (!config.name || !config.tag) {
      setError('Missing name/tag.');
      return;
    }
    update();
    const interval = window.setInterval(update, config.refreshInterval * 1000);
    return () => {
      window.clearInterval(interval);
      timersRef.current.forEach((t) => window.clearTimeout(t));
      timersRef.current = [];
    };
  }, [config, update]);

  if (error) {
    return <div className="px-[22px] py-3.5 text-sm text-red-400">{error}</div>;
  }

  if (!data) {
    return <div className="px-[22px] py-3.5 text-sm text-[#9ca3af]">Menunggu data rank...</div>;
  }

  return (
    <>
      <ValorantCard config={config} data={data} />
      {activeEvent && <EventOverlay event={activeEvent} />}
    </>
  );
}
