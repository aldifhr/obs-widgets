import { useEffect, useState } from 'react';

type PrayerMethod = 'Makkah' | 'Egypt' | 'Karachi' | 'ISNA';

const METHODS: Record<string, number> = { Makkah: 10, Egypt: 5, Karachi: 1, ISNA: 2 };
const NAMES = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

interface NextPrayer {
  name: string;
  time: string;
  diff: string;
}

function getPrayerTimes(lat: number, lng: number, method: PrayerMethod) {
  const today = new Date();
  const url = `https://api.aladhan.com/v1/timings/${Math.floor(today.getTime() / 1000)}?latitude=${lat}&longitude=${lng}&method=${METHODS[method] || 2}`;
  return fetch(url).then((r) => r.json()).then((data) => data.data.timings as Record<string, string>);
}

function getNextPrayer(timings: Record<string, string>): NextPrayer | null {
  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();

  for (const name of NAMES) {
    if (!timings[name]) continue;
    const [h, m] = timings[name].split(':').map(Number);
    if (h * 60 + m > current) {
      const diff = h * 60 + m - current;
      return { name, time: timings[name], diff: `${Math.floor(diff / 60)}h ${diff % 60}m` };
    }
  }

  const fajr = timings['Fajr'];
  if (fajr) {
    const [h, m] = fajr.split(':').map(Number);
    const diff = 24 * 60 - current + h * 60 + m;
    return { name: 'Fajr', time: fajr, diff: `${Math.floor(diff / 60)}h ${diff % 60}m` };
  }
  return null;
}

export default function PrayerWidget() {
  const params = new URLSearchParams(window.location.search);
  const lat = parseFloat(params.get('lat') || '0');
  const lng = parseFloat(params.get('lng') || '0');
  const city = params.get('city') || 'Location';
  const method = (params.get('method') || 'ISNA') as PrayerMethod;

  const [timings, setTimings] = useState<Record<string, string> | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!lat || !lng) return;
    let active = true;
    getPrayerTimes(lat, lng, method)
      .then((t) => active && setTimings(t))
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, [lat, lng, method]);

  let content;
  if (!lat || !lng) {
    content = <div className="text-red-400">Set ?lat=&amp;lng=</div>;
  } else if (failed) {
    content = <div className="text-red-400">Failed to load prayer times</div>;
  } else if (!timings) {
    content = <div className="py-2 text-[#9ca3af]">Loading...</div>;
  } else {
    const next = getNextPrayer(timings);
    const rows = NAMES.map((n) => {
      const active = next?.name === n;
      return (
        <div
          key={n}
          className={`flex justify-between py-[5px] text-[0.95em] ${active ? 'font-bold text-white' : 'font-medium text-[#d1d5db]'}`}
        >
          <span>{n}</span>
          <span className="font-bold tabular-nums">{timings[n] || '--:--'}</span>
        </div>
      );
    });

    content = (
      <>
        <div className="mb-1.5 text-[0.7em] font-semibold text-[#9ca3af]">
          {city} · {method}
        </div>
        {rows}
        {next && (
          <div className="mt-2.5 rounded-[10px] border border-white/15 bg-white/10 p-2.5">
            <div className="text-[0.7em] font-semibold uppercase tracking-[1px] text-[#9ca3af]">Next Prayer</div>
            <div className="mt-0.5 text-[1.3em] font-extrabold">{next.name}</div>
            <div className="text-[0.8em] text-[#9ca3af]">
              in {next.diff} · {next.time}
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="w-[340px] rounded-2xl border border-white/10 border-l-4 border-l-[#22d3ee] bg-gradient-to-br from-[#11141a]/90 to-[#0b0d11]/90 p-[18px_20px] shadow-[0_18px_50px_rgba(0,0,0,0.54),inset_0_1px_rgba(255,255,255,0.06)] backdrop-blur">
      <div className="mb-2 text-[0.75em] font-semibold uppercase tracking-[1.5px] text-[#9ca3af]">Prayer Times</div>
      <div className="text-[#e5e7eb]">{content}</div>
    </div>
  );
}
