import { useEffect, useState } from 'react';

interface CoinRow {
  symbol: string;
  price: string;
  change: number | null;
}

const SYMBOLS: Record<string, string> = { bitcoin: 'BTC', ethereum: 'ETH', solana: 'SOL' };

export default function CryptoWidget() {
  const params = new URLSearchParams(window.location.search);
  const ids = params.get('ids') || 'bitcoin,ethereum,solana';
  const width = params.get('w') || '420';

  const [rows, setRows] = useState<CoinRow[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;
    fetch(url)
      .then((r) => r.json())
      .then((data: Record<string, { usd?: number; usd_24h_change?: number }>) => {
        const list = Object.entries(data).map(([coin, info]) => {
          const symbol = SYMBOLS[coin] || coin.toUpperCase().slice(0, 4);
          const price =
            info.usd != null
              ? info.usd.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
              : '--';
          return { symbol, price, change: info.usd_24h_change ?? null };
        });
        active && setRows(list);
      })
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, [ids]);

  let content;
  if (failed) {
    content = <div className="text-red-400">CoinGecko unavailable</div>;
  } else if (!rows) {
    content = <div className="py-1.5 text-[#9ca3af]">Loading...</div>;
  } else if (rows.length === 0) {
    content = <div className="text-red-400">No data</div>;
  } else {
    content = rows.map(({ symbol, price, change }) => {
      const color = change == null ? '#9ca3af' : change >= 0 ? '#34d399' : '#f87171';
      const arrow = change == null ? '' : change >= 0 ? '▲' : '▼';
      return (
        <div key={symbol} className="flex justify-between py-[5px] text-[0.95em] font-medium">
          <span className="font-bold">{symbol}</span>
          <span className="mr-2 font-bold tabular-nums">{price}</span>
          <span className="min-w-[52px] text-right text-[0.85em] font-bold" style={{ color }}>
            {arrow} {change != null ? change.toFixed(1) : '0.0'}%
          </span>
        </div>
      );
    });
  }

  return (
    <div
      className="rounded-2xl border border-white/10 border-l-4 border-l-[#fbbf24] bg-gradient-to-br from-[#11141a]/90 to-[#0b0d11]/90 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.54),inset_0_1px_rgba(255,255,255,0.06)] backdrop-blur"
      style={{ width: `${width}px` }}
    >
      <div className="mb-2 text-[0.75em] font-semibold uppercase tracking-[1.5px] text-[#9ca3af]">Crypto</div>
      <div className="text-[#e5e7eb]">{content}</div>
    </div>
  );
}
