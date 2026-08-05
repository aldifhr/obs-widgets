import './shared/styles.css';

function render() {
  const app = document.getElementById('app')!;
  const params = new URLSearchParams(location.search);
  const city = params.get('city') || 'Jakarta';
  const width = params.get('w') || '340';

  app.innerHTML = `
    <div class="widget" style="--w:${width}px;--p:16px 18px;--r:14px">
      <div style="font-size:0.75em;color:#9ca3af;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:6px">Weather</div>
      <div id="weather-content" style="color:#e5e7eb">
        <div style="padding:6px 0;color:#9ca3af">Loading...</div>
      </div>
    </div>
  `;

  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
  fetch(geoUrl).then(r => r.json()).then(data => {
    const loc = data.results?.[0];
    if (!loc) throw new Error('City not found');
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current_weather=true`;
    return fetch(weatherUrl).then(r => r.json()).then(weather => ({ loc, weather }));
  }).then(({ loc, weather }) => {
    const c = weather.current_weather;
    const content = document.getElementById('weather-content')!;
    content.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:baseline">
        <div>
          <div style="font-size:1.4em;font-weight:800">${loc.name}</div>
          <div style="font-size:0.8em;color:#9ca3af">${loc.country || ''}</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:1.6em;font-weight:800;font-variant-numeric:tabular-nums">${Math.round(c.temperature)}°</div>
          <div style="font-size:0.75em;color:#9ca3af">Wind ${Math.round(c.windspeed)} km/h</div>
        </div>
      </div>
    `;
  }).catch(() => {
    document.getElementById('weather-content')!.innerHTML = `<div style="color:#f87171">Weather unavailable</div>`;
  });
}

render();
