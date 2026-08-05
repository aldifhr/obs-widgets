import './shared/styles.css';

type PrayerMethod = 'Makkah' | 'Egypt' | 'Karachi' | 'ISNA';

const METHODS: Record<string, number> = { 'Makkah': 10, 'Egypt': 5, 'Karachi': 1, 'ISNA': 2 };

function getPrayerTimes(lat: number, lng: number, method: PrayerMethod) {
  const today = new Date();
  const url = `https://api.aladhan.com/v1/timings/${Math.floor(today.getTime()/1000)}?latitude=${lat}&longitude=${lng}&method=${METHODS[method] || 2}`;
  return fetch(url).then(r => r.json()).then(data => data.data.timings);
}

function getNextPrayer(timings: Record<string, string>) {
  const names = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();
  
  for (const name of names) {
    if (!timings[name]) continue;
    const [h, m] = timings[name].split(':').map(Number);
    if (h * 60 + m > current) {
      const diff = (h * 60 + m) - current;
      const dh = Math.floor(diff / 60);
      const dm = diff % 60;
      return { name, time: timings[name], diff: `${dh}h ${dm}m` };
    }
  }
  
  const fajr = timings['Fajr'];
  if (fajr) {
    const [h, m] = fajr.split(':').map(Number);
    const diff = (24 * 60 - current) + (h * 60 + m);
    const dh = Math.floor(diff / 60);
    const dm = diff % 60;
    return { name: 'Fajr', time: fajr, diff: `${dh}h ${dm}m` };
  }
  return null;
}

function render() {
  const app = document.getElementById('app')!;
  const params = new URLSearchParams(location.search);
  const lat = parseFloat(params.get('lat') || '0');
  const lng = parseFloat(params.get('lng') || '0');
  const city = params.get('city') || 'Location';
  const method = (params.get('method') || 'ISNA') as PrayerMethod;

  app.innerHTML = `
    <div class="widget" style="--w:340px;--p:18px 20px;--r:14px">
      <div style="font-size:0.75em;color:#9ca3af;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px">Prayer Times</div>
      <div id="prayer-content" style="color:#e5e7eb">
        <div style="padding:8px 0;color:#9ca3af">Loading...</div>
      </div>
    </div>
  `;

  if (!lat || !lng) {
    document.getElementById('prayer-content')!.innerHTML = `<div style="color:#f87171">Set ?lat=&lng=</div>`;
    return;
  }

  getPrayerTimes(lat, lng, method).then(timings => {
    const next = getNextPrayer(timings);
    const names = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const rows = names.map(n => {
      const time = timings[n] || '--:--';
      const active = next && next.name === n;
      return `<div style="display:flex;justify-content:space-between;padding:5px 0;font-size:0.95em;font-weight:${active ? 700 : 500};color:${active ? '#fff' : '#d1d5db'}">
        <span>${n}</span>
        <span style="font-variant-numeric:tabular-nums;font-weight:700">${time}</span>
      </div>`;
    }).join('');

    let nextHtml = '';
    if (next) {
      nextHtml = `<div style="margin-top:10px;padding:10px;border-radius:10px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12)">
        <div style="font-size:0.7em;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:1px">Next Prayer</div>
        <div style="font-size:1.3em;font-weight:800;margin-top:2px">${next.name}</div>
        <div style="font-size:0.8em;color:#9ca3af">in ${next.diff} · ${next.time}</div>
      </div>`;
    }

    document.getElementById('prayer-content')!.innerHTML = `
      <div style="font-size:0.7em;color:#9ca3af;font-weight:600;margin-bottom:6px">${city} · ${method}</div>
      ${rows}
      ${nextHtml}
    `;
  }).catch(() => {
    document.getElementById('prayer-content')!.innerHTML = `<div style="color:#f87171">Failed to load prayer times</div>`;
  });
}

render();
