import './shared/styles.css';
import './valorant.css';
import { loadConfig, type WidgetConfig } from '../shared/config.ts';
import { fetchMmr } from '../shared/api.ts';
import { RANK_ORDER } from '../shared/ranks.ts';

function escapeHtml(str: string) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function init() {
  const container = document.getElementById('app')!;
  const config = loadConfig();
  const params = new URLSearchParams(location.search);
  const name = params.get('name') || config.name;
  const tag = params.get('tag') || config.tag;
  const region = params.get('region') || config.region;

  container.innerHTML = `<div class="loading" style="color:#9ca3af;padding:14px 22px;font-size:14px">Menunggu data rank...</div>`;

  try {
    const data = await fetchMmr(name, tag, region);
    const rankInfo = RANK_ORDER.find(r => r.tier === data.tierNumber);
    const accent = rankInfo ? rankInfo.color : '#ff4655';
    const accentLight = rankInfo ? rankInfo.light : '#ff7b85';
    const accentGlow = rankInfo ? rankInfo.glow : 'rgba(255,70,85,0.28)';

    container.innerHTML = `
      <div class="card" style="--accent:${accent};--accent-light:${accentLight};--accent-glow:${accentGlow};--card-width:${config.cardWidth}px;--card-padding:${config.cardPadding};--card-radius:${config.cardRadius}px;--font-family:${config.fontFamily};--font-scale:${config.fontSizeScale};--card-opacity:${config.cardOpacity};--card-border:rgba(255,255,255,0.14);background-color:rgba(17,20,26,${config.cardOpacity})">
        <div style="position:relative;z-index:1">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div class="player-name" style="color:#e5e7eb;font-size:.875em;font-weight:700;letter-spacing:.3px">${escapeHtml(name)}<span class="player-tag" style="color:#6b7280;margin-left:6px;font-size:.75em;font-weight:500">#${escapeHtml(tag)}</span></div>
          </div>
          <div style="display:flex;align-items:center;gap:18px;margin-top:16px">
            <div class="rank-icon-wrap" style="flex-shrink:0;width:84px;height:84px;position:relative"><img src="${data.images.small}" alt="rank" style="width:100%;height:100%;filter:drop-shadow(0 4px 14px rgba(0,0,0,0.5))" /></div>
            <div class="tier" style="font-size:1.875em;font-weight:800;letter-spacing:.5px;line-height:1.1;text-shadow:0 2px 16px ${accentGlow}">${escapeHtml(data.tier)}</div>
          </div>
          <div style="margin-top:18px">
            <div style="display:flex;justify-content:space-between;align-items:baseline;font-size:.6875em;color:#9ca3af;font-weight:600;margin-bottom:.5em">
              <span>RR Progress</span>
              <span class="rr-num" style="color:var(--accent,#ff4655);font-variant-numeric:tabular-nums;font-size:1.0625em;font-weight:800">${data.rr} <small style="color:#6b7280;font-size:.6875em;font-weight:600">/ 100</small></span>
            </div>
            <div style="background:#ffffff1a;border-radius:99px;height:8px;position:relative;overflow:hidden">
              <div style="background:linear-gradient(90deg,${accent},${accentLight});width:${data.rr}%;height:100%;box-shadow:0 0 12px ${accentGlow};border-radius:99px"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  } catch {
    container.innerHTML = `<div class="error" style="color:#f87171;padding:14px 22px;font-size:14px">Gagal fetch data</div>`;
  }
}

init();
