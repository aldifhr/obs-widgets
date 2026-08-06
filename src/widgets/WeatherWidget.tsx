import { useEffect, useState } from 'react';

interface WeatherData {
  name: string;
  country?: string;
  temperature: number;
  windspeed: number;
}

export default function WeatherWidget() {
  const params = new URLSearchParams(window.location.search);
  const city = params.get('city') || 'Jakarta';
  const width = params.get('w') || '340';

  const [data, setData] = useState<WeatherData | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
    fetch(geoUrl)
      .then((r) => r.json())
      .then((geo) => {
        const loc = geo.results?.[0];
        if (!loc) throw new Error('City not found');
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current_weather=true`;
        return fetch(weatherUrl).then((r) => r.json()).then((weather) => ({
          name: loc.name,
          country: loc.country,
          temperature: weather.current_weather.temperature,
          windspeed: weather.current_weather.windspeed,
        }));
      })
      .then((w) => active && setData(w))
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, [city]);

  let content;
  if (failed) {
    content = <div className="text-red-400">Weather unavailable</div>;
  } else if (!data) {
    content = <div className="py-1.5 text-[#9ca3af]">Loading...</div>;
  } else {
    content = (
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-[1.4em] font-extrabold">{data.name}</div>
          <div className="text-[0.8em] text-[#9ca3af]">{data.country || ''}</div>
        </div>
        <div className="text-right">
          <div className="text-[1.6em] font-extrabold tabular-nums">{Math.round(data.temperature)}°</div>
          <div className="text-[0.75em] text-[#9ca3af]">Wind {Math.round(data.windspeed)} km/h</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border border-white/10 border-l-4 border-l-[#34d399] bg-gradient-to-br from-[#11141a]/90 to-[#0b0d11]/90 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.54),inset_0_1px_rgba(255,255,255,0.06)] backdrop-blur"
      style={{ width: `${width}px` }}
    >
      <div className="mb-1.5 text-[0.75em] font-semibold uppercase tracking-[1.5px] text-[#9ca3af]">Weather</div>
      <div className="text-[#e5e7eb]">{content}</div>
    </div>
  );
}
