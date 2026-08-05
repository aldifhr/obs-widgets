import './shared/styles.css';
const app = document.getElementById('app')!;
app.innerHTML = `
  <div class="hub">
    <h1>OBS Widgets</h1>
    <p class="sub">Pick a widget below, then copy its URL into OBS Browser Source.</p>
    <div class="grid">
      <a class="card" href="/widgets/valorant" style="--accent:#ff4655">
        <h3>Valorant Rank</h3>
        <p>Live rank + RR with map backgrounds and accents.</p>
      </a>
      <a class="card" href="/widgets/prayer" style="--accent:#22d3ee">
        <h3>Prayer Times</h3>
        <p>Daily prayer times with countdown to next salah.</p>
      </a>
      <a class="card" href="/widgets/countdown" style="--accent:#a78bfa">
        <h3>Countdown</h3>
        <p>Simple event countdown, configurable via query params.</p>
      </a>
      <a class="card" href="/widgets/weather" style="--accent:#34d399">
        <h3>Weather</h3>
        <p>Compact weather by city, auto-refresh via Open-Meteo.</p>
      </a>
      <a class="card" href="/widgets/crypto" style="--accent:#fbbf24">
        <h3>Crypto Ticker</h3>
        <p>Price + 24h change for BTC, ETH, SOL via CoinGecko.</p>
      </a>
    </div>
  </div>
`;
