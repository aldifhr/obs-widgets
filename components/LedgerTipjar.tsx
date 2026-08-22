'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
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
    page: '#E9ECEF',
    card: '#fff',
    shadow: '0 12px 30px -14px #1B2A4A55',
    border: '#1B2A4A55',
    eyebrow: '#D4A017',
    total: '#1B2A4A',
    meter: '#1B2A4A15',
    meterFill: '#D4A017',
    sub: '#1B2A4A88',
    rowText: '#1B2A4A',
    rowBorder: '#1B2A4A22',
    rowAmt: '#D4A017',
    empty: '#1B2A4A66',
    stamp: '#B3312C',
  },
  dark: {
    page: '#111318',
    card: '#1B1D24',
    shadow: '0 12px 30px -14px #00000088',
    border: '#ffffff15',
    eyebrow: '#FFC53D',
    total: '#E8E9EE',
    meter: '#ffffff10',
    meterFill: '#FFC53D',
    sub: '#6b7280',
    rowText: '#D1D5DB',
    rowBorder: '#ffffff12',
    rowAmt: '#FFC53D',
    empty: '#6b7280',
    stamp: '#EF4444',
  },
}

export function LedgerTipjar() {
  const searchParams = useSearchParams()
  const showWidget = searchParams.has('hide')
  const mode = (searchParams.get('mode') as 'light' | 'dark') || 'light'
  const t = themes[mode]

  const [goal, setGoal] = useState(() => { const v = Number(searchParams.get('goal')); return v > 0 ? v : 500000 })
  const [total, setTotal] = useState(0)
  const [rows, setRows] = useState<LedgerRow[]>([])
  const toastTimer = useRef<number>(0)

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
    clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => {}, 5000)
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

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    showWidget
      ? <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>{children}</div>
      : <div style={{ minHeight: '100vh', background: t.page, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 16px 64px', fontFamily: "'Inter', sans-serif", transition: 'background .3s' }}>{children}</div>
  )

  return (
    <Wrapper>
      <div style={{ width: '100%', maxWidth: 320, background: t.card, borderRadius: 4, boxShadow: t.shadow, display: 'flex', flexDirection: 'column', transition: 'background .3s' }}>
        <div style={{ padding: '18px 20px 10px', borderBottom: `1px dashed ${t.border}` }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: 2, color: t.eyebrow, fontWeight: 600 }}>BUKU TIP · LIVE</div>
          <div style={{ fontFamily: "'IBM Plex Sans Condensed', sans-serif", fontWeight: 700, fontSize: 30, color: t.total }}>{fmtIDR(total)}</div>
          <div style={{ height: 4, background: t.meter, marginTop: 10, position: 'relative', borderRadius: 2 }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct * 100}%`, background: t.meterFill, transition: 'width .6s', borderRadius: 2 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: t.sub, marginTop: 4 }}>
            <span>{fmtIDR(total)}</span>
            <span>{fmtIDR(goal)}</span>
          </div>
        </div>

        <div style={{ maxHeight: 210, overflowY: 'auto', padding: '6px 20px 14px', fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: t.rowText }}>
          {rows.length === 0 && <div style={{ color: t.empty, fontSize: 11, padding: '8px 0' }}>Belum ada transaksi.</div>}
          {rows.map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '5px 0', borderBottom: `1px dotted ${t.rowBorder}` }}>
              <span>{r.time} · {r.name}</span>
              <span style={{ color: t.rowAmt, fontWeight: 600 }}>+{fmtIDR(r.amount)}</span>
            </div>
          ))}
        </div>

        {reached && (
          <div style={{ alignSelf: 'flex-end', margin: '0 20px 16px auto', fontFamily: "'IBM Plex Sans Condensed', sans-serif", fontWeight: 700, fontSize: 13, color: t.stamp, border: `2px solid ${t.stamp}`, padding: '4px 10px', borderRadius: 4, transform: 'rotate(-6deg)', letterSpacing: 2 }}>LUNAS</div>
        )}
      </div>

      {!showWidget && (
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button onClick={handleFakeTip} style={{ padding: '11px 18px', borderRadius: 10, border: `1px solid ${mode === 'dark' ? '#ffffff15' : 'rgba(0,0,0,0.15)'}`, background: mode === 'dark' ? '#ffffff10' : '#fff', color: mode === 'dark' ? '#E8E9EE' : '#111318', fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Kirim Tip Acak
          </button>
        </div>
      )}
    </Wrapper>
  )
}
