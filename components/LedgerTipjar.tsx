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

export function LedgerTipjar() {
  const searchParams = useSearchParams()
  const showWidget = searchParams.has('hide')
  const [goal, setGoal] = useState(() => { const v = Number(searchParams.get('goal')); return v > 0 ? v : 500000 })
  const [total, setTotal] = useState(0)
  const [rows, setRows] = useState<LedgerRow[]>([])
  const [toast, setToast] = useState('')
  const toastTimer = useRef<number>(0)

  useEffect(() => {
    if (showWidget) {
      document.documentElement.style.background = '#E9ECEF'
      document.body.style.background = '#E9ECEF'
      document.body.style.minHeight = '100vh'
    }
  }, [showWidget])

  const handleEvent = useCallback((e: TakoEvent) => {
    if (e.kind !== 'tip') return
    setTotal(t => t + e.amount)
    const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    setRows(r => [{ name: e.name, amount: e.amount, time: now }, ...r].slice(0, 20))
    setToast(`${e.name} · ${fmtIDR(e.amount)} ${e.message || ''}`)
    clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(''), 5000)
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
      : <div style={{ minHeight: '100vh', background: '#E9ECEF', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 16px 64px', fontFamily: "'Inter', sans-serif" }}>{children}</div>
  )

  return (
    <Wrapper>
      <div style={{ width: '100%', maxWidth: 320, background: '#fff', borderRadius: 4, boxShadow: '0 12px 30px -14px #1B2A4A55', display: 'flex', flexDirection: 'column' }}>
        {/* header */}
        <div style={{ padding: '18px 20px 10px', borderBottom: '1px dashed #1B2A4A55' }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: 2, color: '#D4A017', fontWeight: 600 }}>BUKU TIP · LIVE</div>
          <div style={{ fontFamily: "'IBM Plex Sans Condensed', sans-serif", fontWeight: 700, fontSize: 30, color: '#1B2A4A' }}>{fmtIDR(total)}</div>
          {/* meter */}
          <div style={{ height: 4, background: '#1B2A4A15', marginTop: 10, position: 'relative', borderRadius: 2 }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct * 100}%`, background: '#D4A017', transition: 'width .6s', borderRadius: 2 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: '#1B2A4A88', marginTop: 4 }}>
            <span>{fmtIDR(total)}</span>
            <span>{fmtIDR(goal)}</span>
          </div>
        </div>

        {/* rows */}
        <div style={{ maxHeight: 210, overflowY: 'auto', padding: '6px 20px 14px', fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: '#1B2A4A' }}>
          {rows.length === 0 && <div style={{ color: '#1B2A4A66', fontSize: 11, padding: '8px 0' }}>Belum ada transaksi.</div>}
          {rows.map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '5px 0', borderBottom: '1px dotted #1B2A4A22' }}>
              <span>{r.time} · {r.name}</span>
              <span style={{ color: '#D4A017', fontWeight: 600 }}>+{fmtIDR(r.amount)}</span>
            </div>
          ))}
        </div>

        {/* stamp */}
        {reached && (
          <div style={{ alignSelf: 'flex-end', margin: '0 20px 16px auto', fontFamily: "'IBM Plex Sans Condensed', sans-serif", fontWeight: 700, fontSize: 13, color: '#B3312C', border: '2px solid #B3312C', padding: '4px 10px', borderRadius: 4, transform: 'rotate(-6deg)', letterSpacing: 2 }}>LUNAS</div>
        )}
      </div>

      {!showWidget && (
        <button onClick={handleFakeTip} style={{ marginTop: 16, padding: '11px 18px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', background: '#fff', color: '#111318', fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          Kirim Tip Acak
        </button>
      )}
    </Wrapper>
  )
}
