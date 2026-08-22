'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { SectionTitle } from '../lib/platforms'
import { useTakoEvents } from '../lib/tako'
import type { TakoEvent } from '../lib/tako'

const fmtIDR = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

interface LedgerRow {
  name: string
  amount: number
  time: string
}

const themes = {
  light: {
    page: '#E9ECEF', card: '#fff', shadow: '0 12px 30px -14px #1B2A4A55',
    border: '#1B2A4A55', eyebrow: '#D4A017', total: '#1B2A4A',
    meter: '#1B2A4A15', meterFill: '#D4A017', sub: '#1B2A4A88',
    rowText: '#1B2A4A', rowBorder: '#1B2A4A22', rowAmt: '#D4A017',
    empty: '#1B2A4A66', stamp: '#B3312C',
  },
  dark: {
    page: '#111318', card: '#1B1D24', shadow: '0 12px 30px -14px #00000088',
    border: '#ffffff15', eyebrow: '#FFC53D', total: '#E8E9EE',
    meter: '#ffffff10', meterFill: '#FFC53D', sub: '#6b7280',
    rowText: '#D1D5DB', rowBorder: '#ffffff12', rowAmt: '#FFC53D',
    empty: '#6b7280', stamp: '#EF4444',
  },
}

export function LedgerTipjar() {
  const searchParams = useSearchParams()
  const showWidget = searchParams.has('hide')
  const [mode, setMode] = useState<'light' | 'dark'>((searchParams.get('mode') as 'light' | 'dark') || 'light')
  const [goal, setGoal] = useState(() => { const v = Number(searchParams.get('goal')); return v > 0 ? v : 500000 })
  const [copied, setCopied] = useState(false)
  const [total, setTotal] = useState(() => { const v = localStorage.getItem('ledger-total'); return v ? Number(v) : 0 })
  const [rows, setRows] = useState<LedgerRow[]>(() => { const v = localStorage.getItem('ledger-rows'); return v ? JSON.parse(v) : [] })
  const [toast, setToast] = useState<{ name: string; amount: number } | null>(null)
  const [pulse, setPulse] = useState(false)
  const [newRow, setNewRow] = useState<number | null>(null)
  const toastTimer = useRef<number>(0)
  const rowsRef = useRef<HTMLDivElement>(null)
  const t = themes[mode]

  useEffect(() => {
    if (showWidget) {
      document.documentElement.style.background = 'transparent'
      document.body.style.background = 'transparent'
      document.body.style.minHeight = '100vh'
    }
  }, [showWidget])

  const handleEvent = useCallback((e: TakoEvent) => {
    if (e.kind !== 'tip') return
    setTotal(t => t + e.amount)
    const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    setRows(r => [{ name: e.name, amount: e.amount, time: now }, ...r].slice(0, 20))
    setNewRow(Date.now())
    setTimeout(() => setNewRow(null), 500)
    if (rowsRef.current) rowsRef.current.scrollTop = 0
    setPulse(true)
    setTimeout(() => setPulse(false), 400)
    setToast({ name: e.name, amount: e.amount })
    clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 4000)
  }, [])

  const handleFakeTip = useCallback(() => {
    const amounts = [5000, 10000, 15000, 25000, 50000, 100000]
    const names = ['Budi', 'Sari', 'Raka', 'Dina', 'Andi', 'Maya']
    const i = Math.floor(Math.random() * amounts.length)
    handleEvent({ kind: 'tip', id: 'test-' + Date.now(), name: names[i], amount: amounts[i], message: '', method: 'qris', createdAt: new Date().toISOString(), at: Date.now() })
  }, [handleEvent])

  useTakoEvents('', handleEvent)

  const pct = Math.min(total / goal, 1)
  const reached = pct >= 1

  useEffect(() => {
    localStorage.setItem('ledger-total', String(total))
  }, [total])

  useEffect(() => {
    localStorage.setItem('ledger-rows', JSON.stringify(rows))
  }, [rows])

  const widgetParams = new URLSearchParams({ goal: String(goal), mode, hide: '1' })
  const [widgetUrl, setWidgetUrl] = useState('')
  useEffect(() => { setWidgetUrl(`${window.location.origin}/ledger?${widgetParams.toString()}`) }, [widgetParams.toString()])
  const copyUrl = () => { navigator.clipboard.writeText(widgetUrl); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  const Ledger = () => (
    <div style={{ width: '100%', maxWidth: 320, background: t.card, borderRadius: 4, boxShadow: t.shadow, display: 'flex', flexDirection: 'column', transition: 'background .3s', overflow: 'hidden' }}>
      <div style={{ padding: '18px 20px 10px', borderBottom: `1px dashed ${t.border}` }}>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: 2, color: t.eyebrow, fontWeight: 600 }}>BUKU TIP · LIVE</div>
        <div style={{ fontFamily: "'IBM Plex Sans Condensed', sans-serif", fontWeight: 700, fontSize: 30, color: t.total, animation: pulse ? 'ledger-pulse 0.4s ease' : undefined }}>{fmtIDR(total)}</div>
        <div style={{ height: 4, background: t.meter, marginTop: 10, position: 'relative', borderRadius: 2 }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct * 100}%`, background: t.meterFill, transition: 'width .6s', borderRadius: 2 }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: t.sub, marginTop: 4 }}>
          <span>{fmtIDR(total)}</span>
          <span>{fmtIDR(goal)}</span>
        </div>
      </div>
      <div ref={rowsRef} style={{ maxHeight: 210, overflowY: 'auto', padding: '6px 20px 14px', fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: t.rowText }}>
        {rows.length === 0 && <div style={{ color: t.empty, fontSize: 11, padding: '8px 0' }}>Belum ada transaksi.</div>}
        {rows.map((r, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '5px 0', borderBottom: `1px dotted ${t.rowBorder}`, animation: i === 0 && newRow ? 'ledger-row-in 0.4s ease' : undefined, background: i === 0 && newRow ? (mode === 'dark' ? '#ffffff08' : '#D4A01710') : undefined, borderRadius: 4 }}>
            <span>{r.time} · {r.name}</span>
            <span style={{ color: t.rowAmt, fontWeight: 600 }}>+{fmtIDR(r.amount)}</span>
          </div>
        ))}
      </div>
      {reached && (
        <div style={{ alignSelf: 'flex-end', margin: '0 20px 16px auto', fontFamily: "'IBM Plex Sans Condensed', sans-serif", fontWeight: 700, fontSize: 13, color: t.stamp, border: `2px solid ${t.stamp}`, padding: '4px 10px', borderRadius: 4, transform: 'rotate(-6deg)', letterSpacing: 2 }}>LUNAS</div>
      )}
      {toast && (
        <div style={{ padding: '8px 20px', background: mode === 'dark' ? '#ffffff08' : '#D4A01710', borderTop: `1px solid ${t.border}`, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: t.eyebrow, animation: 'ledger-toast-in 0.3s ease' }}>
          {toast.name} · {fmtIDR(toast.amount)}
        </div>
      )}
    </div>
  )

  if (showWidget) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Ledger />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-studio-950 flex flex-col">
      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="flex-1 flex items-center justify-center p-8 min-h-[50vh] lg:min-h-0">
          <Ledger />
        </div>

        <div className="w-full lg:w-[380px] bg-studio-900 border-l border-studio-border flex flex-col">
          <div className="p-6 border-b border-studio-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${t.eyebrow}15`, color: t.eyebrow }}>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}>$</span>
              </div>
              <div>
                <h2 className="text-white font-display text-lg font-semibold leading-tight">Ledger Tipjar</h2>
                <p className="text-zinc-500 text-xs font-mono">buku tip receipt style</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <section>
              <SectionTitle>Mode</SectionTitle>
              <div className="flex gap-2">
                {(['light', 'dark'] as const).map(m => (
                  <button key={m} onClick={() => setMode(m)} className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${mode === m ? 'border-white/30 bg-white/10 text-white' : 'border-studio-border bg-studio-800/50 text-zinc-500 hover:text-zinc-300'}`}>
                    {m === 'light' ? 'Light' : 'Dark'}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <SectionTitle>Goal</SectionTitle>
              <input type="number" value={goal} onChange={e => setGoal(Math.max(0, Number(e.target.value)))} className="w-full bg-studio-800/50 border border-studio-border rounded-xl px-3 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-white/20 transition-colors" />
            </section>

            <section>
              <button onClick={handleFakeTip} className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 active:scale-[0.98] border border-studio-border bg-studio-800/50 text-zinc-300 hover:bg-studio-800 hover:text-white hover:border-white/15">
                Test Tip
              </button>
            </section>
          </div>

          <div className="p-6 border-t border-studio-border">
            <button onClick={copyUrl} className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 active:scale-[0.98] text-studio-950" style={{ background: t.eyebrow, boxShadow: `0 4px 20px ${t.eyebrow}30` }}>
              {copied ? 'Copied!' : 'Copy Widget URL'}
            </button>
            <p className="text-zinc-600 text-[10px] mt-3 font-mono break-all leading-relaxed">{widgetUrl}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
