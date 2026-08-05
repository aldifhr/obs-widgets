import type { WidgetConfig } from './types';
import type { RankDisplay } from './api';

const TIER_NAMES: Record<number, string> = {
  0: 'Unrated',
  3: 'Iron 1', 4: 'Iron 2', 5: 'Iron 3',
  6: 'Bronze 1', 7: 'Bronze 2', 8: 'Bronze 3',
  9: 'Silver 1', 10: 'Silver 2', 11: 'Silver 3',
  12: 'Gold 1', 13: 'Gold 2', 14: 'Gold 3',
  15: 'Platinum 1', 16: 'Platinum 2', 17: 'Platinum 3',
  18: 'Diamond 1', 19: 'Diamond 2', 20: 'Diamond 3',
  21: 'Ascendant 1', 22: 'Ascendant 2', 23: 'Ascendant 3',
  24: 'Immortal 1', 25: 'Immortal 2', 26: 'Immortal 3',
  27: 'Radiant',
};

export function getNextRankInfo(tierNumber: number, rr: number): { name: string; rrToNext: number } | null {
  if (rr >= 100 || !TIER_NAMES[tierNumber]) return null;
  const nextName = TIER_NAMES[tierNumber + 1];
  if (!nextName) return null;
  return { name: nextName, rrToNext: 100 - rr };
}

export function renderCard(container: HTMLElement, config: WidgetConfig, data: RankDisplay) {
  const showAvatar = config.showAvatar !== false;

  const nameHtml = `
    <div class="player-name">${escapeHtml(config.name)}<span class="player-tag">#${escapeHtml(config.tag)}</span></div>`;

  const rankIconHtml = showAvatar ? `
    <div class="rank-icon-wrap">
      <img src="${data.images.small}" alt="rank" />
    </div>` : '';

  const tierHtml = `<div class="tier">${escapeHtml(data.tier)}</div>`;

  const next = getNextRankInfo(data.tierNumber, data.rr);
  const nextRankHtml = next ? `
    <div class="rr-next">${next.rrToNext} RR lagi ke <b>${escapeHtml(next.name)}</b></div>` : '';

  const rrHtml = `
    <div class="rr-section">
      <div class="rr-head">
        <span>RR Progress</span>
        <span class="rr-num">${data.rr} <small>/ 100</small></span>
      </div>
      <div class="rr-bar"><div class="rr-bar-fill" style="width:${data.rr}%"></div></div>
      ${nextRankHtml}
    </div>`;

  const design = config.design || 'classic';

  let inner: string;
  switch (design) {
    case 'centered':
      inner = `
        ${rankIconHtml}
        ${tierHtml}
        ${nameHtml}
        ${rrHtml}`;
      break;
    case 'slim':
      inner = `
        ${rankIconHtml}
        <div class="s-identity">
          ${nameHtml}
          <div class="s-tier">${escapeHtml(data.tier)}</div>
        </div>
        <div class="s-rr">
          <div class="rr-bar"><div class="rr-bar-fill" style="width:${data.rr}%"></div></div>
          <span class="rr-num">${data.rr}</span>
        </div>`;
      break;
    case 'hero':
      inner = `
        <div class="h-badge">${rankIconHtml}</div>
        <div class="h-tier">${escapeHtml(data.tier)}</div>
        <div class="h-name">${nameHtml}</div>
        ${rrHtml}`;
      break;
    default:
      inner = `
        <div class="top"><div>${nameHtml}</div></div>
        <div class="main">
          ${rankIconHtml}
          <div>${tierHtml}</div>
        </div>
        ${rrHtml}`;
  }

  container.innerHTML = `<div class="card design-${design}">${inner}</div>`;

  container.classList.toggle('hide-grid', !config.showGrid);

  const card = container.querySelector('.card') as HTMLElement | null;
  if (card) {
    card.style.setProperty('--accent', config.accent);
    card.style.setProperty('--accent-light', config.accentLight);
    card.style.setProperty('--accent-glow', config.accentGlow);
    card.style.setProperty('--card-width', `${config.cardWidth}px`);
    card.style.setProperty('--card-padding', config.cardPadding);
    card.style.setProperty('--card-radius', `${config.cardRadius}px`);
    card.style.setProperty('--font-family', config.fontFamily);
    card.style.setProperty('--font-scale', `${config.fontSizeScale}`);
    card.style.setProperty('--card-opacity', `${config.cardOpacity}`);
    card.style.setProperty('--bg-image', config.bgImage ? `url("${config.bgImage}")` : 'none');
    card.style.setProperty('--bg-opacity', `${config.bgOpacity}`);
  }
}

function escapeHtml(str: string) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
