import { trackEvent } from '../shared/analytics';
import { fetchMmr, fetchLastMatch } from '../shared/api';
import { paramsToConfig } from '../shared/config';
import { renderCard } from '../shared/card';
import {
  detectEvents,
  getStateKey,
  playEvents,
  playEventSound,
  readState,
  writeState,
} from '../shared/animations';
import './widget.css';

function renderError(container: HTMLElement, message: string) {
  container.innerHTML = `<div class="loading error">${escapeHtml(message)}</div>`;
}

function renderLoading(container: HTMLElement) {
  container.innerHTML = `<div class="loading">Menunggu data rank...</div>`;
}

function escapeHtml(str: string) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function init() {
  const container = document.getElementById('app')!;
  const params = new URLSearchParams(window.location.search);
  const config = paramsToConfig(params);

  if (!config.name || !config.tag) {
    renderError(container, 'Missing name/tag.');
    return;
  }

  trackEvent('widget_loaded', { name: config.name, tag: config.tag });
  renderLoading(container);

  async function update() {
    try {
      const [data, lastMatch] = await Promise.all([
        fetchMmr(config.name, config.tag, config.region),
        fetchLastMatch(config.name, config.tag, config.region).catch(() => null),
      ]);

      const stateKey = getStateKey(config.name, config.tag, config.region);
      const prev = readState(stateKey);
      const events = detectEvents(prev, data, lastMatch);
      writeState(stateKey, {
        tierNumber: data.tierNumber,
        rr: data.rr,
        lastMatchId: lastMatch?.id ?? null,
      });

      renderCard(container, config, data);
      if (events.length) {
        playEvents(container, events);
        if (config.sound) events.forEach((e) => setTimeout(() => playEventSound(e), 0));
      }
    } catch (e) {
      renderError(container, e instanceof Error ? e.message : 'Failed to fetch');
    }
  }

  await update();
  setInterval(update, config.refreshInterval * 1000);
}

init();
