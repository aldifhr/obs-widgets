'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { SectionTitle } from '../lib/platforms'

interface QueueEntry {
  name: string
  time: string
}

const themes = {
  light: {
    page: '#E9ECEF', card: '#fff', shadow: '0 12px 30px -14px #1B2A4A55',
    border: '#1B2A4A55', eyebrow: '#D4A017', total: '#1B2A4A',
    sub: '#1B2A4A88', rowText: '#1B2A4A', rowBorder: '#1B2A4A22',
    rowNum: '#D4A017', empty: '#1B2A4A66', stamp: '#B3312C',
    accent: '#D4A017',
  },
  dark: {
    page: '#111318', card: '#1B1D24', shadow: '0 12px 30px -14px #00000088',
    border: '#ffffff15', eyebrow: '#FFC53D', total: '#E8E9EE',
    sub: '#6b7280', rowText: '#D1D5DB', rowBorder: '#ffffff12',
    rowNum: '#FFC53D', empty: '#6b7280', stamp: '#EF4444',
    accent: '#FFC53D',
  },
}

export function QueueMabar() {
  const searchParams = useSearchParams()
  const showWidget = searchParams.has('hide')
  const [mode, setMode] = useState<'light' | 'dark'>((searchParams.get('mode') as 'light' | 'dark') || 'dark')
  const [maxQueue, setMaxQueue] = useState(() => { const v = Number(searchParams.get('max')); return v > 0 ? v : 5 })
  const [copied, setCopied] = useState(false)
  const [queue, setQueue] = useState<QueueEntry[]>(() => { const v = localStorage.getItem('mabar-queue'); return v ? JSON.parse(v) : [] })
  const [toast, setToast] = useState<string | null>(null)
  const [pulse, setPulse] = useState(false)
  const [newRow, setNewRow] = useState<number | null>(null)
  const [stamped, setStamped] = useState(false)
  const toastTimer = useRef<number>(0)
  const queueRef = useRef<HTMLDivElement>(null)
  const t = themes[mode]

  useEffect(() => {
    if (showWidget) {
      document.documentElement.style.background = 'transparent'
      document.body.style.background = 'transparent'
      document.body.style.minHeight = '100vh'
    }
  }, [showWidget])

  useEffect(() => {
    localStorage.setItem('mabar-queue', JSON.stringify(queue))
  }, [queue])

  const addToQueue = useCallback((name: string) => {
    if (queue.length >= maxQueue) return
    if (queue.some(q => q.name.toLowerCase() === name.toLowerCase())) return
    const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    setQueue(q => [...q, { name, time: now }])
    setNewRow(Date.now())
    setTimeout(() => setNewRow(null), 500)
    if (queueRef.current) queueRef.current.scrollTop = queueRef.current.scrollHeight
    setPulse(true)
    setTimeout(() => setPulse(false), 400)
    setToast(name)
    clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 3000)
  }, [queue, maxQueue])

  const removeFromQueue = useCallback((name: string) => {
    setQueue(q => q.filter(e => e.name.toLowerCase() !== name.toLowerCase()))
  }, [])

  const clearQueue = useCallback(() => {
    setQueue([])
    setStamped(false)
  }, [])

  const handleFakeJoin = useCallback(() => {
    const names = ['Budi', 'Sari', 'Raka', 'Dina', 'Andi', 'Maya', 'Reza', 'Luna', 'Fajar', 'Nisa']
    const available = names.filter(n => !queue.some(q => q.name === n))
    if (available.length === 0) return
    const name = available[Math.floor(Math.random() * available.length)]
    addToQueue(name)
  }, [queue, addToQueue])

  const full = queue.length >= maxQueue

  const widgetParams = new URLSearchParams({ mode, max: String(maxQueue), hide: '1' })
  const [widgetUrl, setWidgetUrl] = useState('')
  useEffect(() => { setWidgetUrl(`${window.location.origin}/mabar?${widgetParams.toString()}`) }, [widgetParams.toString()])
  const copyUrl = () => { navigator.clipboard.writeText(widgetUrl); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  const QueueCard = () => (
    <div style={{ width: '100%', maxWidth: 320, background: t.card, borderRadius: 4, boxShadow: t.shadow, display: 'flex', flexDirection: 'column', transition: 'background .3s', overflow: 'hidden' }}>
      <div style={{ padding: '18px 20px 10px', borderBottom: `1px dashed ${t.border}` }}>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: 2, color: t.eyebrow, fontWeight: 600 }}>ANTRIAN MABAR · LIVE</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
          <div style={{ fontFamily: "'IBM Plex Sans Condensed', sans-serif", fontWeight: 700, fontSize: 30, color: t.total, animation: pulse ? 'ledger-pulse 0.4s ease' : undefined }}>
            {queue.length}<span style={{ fontSize: 14, color: t.sub, fontWeight: 400 }}>/{maxQueue}</span>
          </div>
        </div>
        <div style={{ height: 4, background: t.sub + '15', marginTop: 10, position: 'relative', borderRadius: 2 }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${(queue.length / maxQueue) * 100}%`, background: full ? t.stamp : t.accent, transition: 'width .6s', borderRadius: 2 }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: t.sub, marginTop: 4 }}>
          <span>{queue.length} orang</span>
          <span>{maxQueue} slot</span>
        </div>
      </div>
      <div ref={queueRef} style={{ maxHeight: 210, overflowY: 'auto', padding: '6px 20px 14px', fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: t.rowText }}>
        {queue.length === 0 && <div style={{ color: t.empty, fontSize: 11, padding: '8px 0' }}>Belum ada yang antri.</div>}
        {queue.map((r, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: `1px dotted ${t.rowBorder}`, animation: i === queue.length - 1 && newRow ? 'ledger-row-in 0.4s ease' : undefined, background: i === queue.length - 1 && newRow ? (mode === 'dark' ? '#ffffff08' : '#D4A01710') : undefined, borderRadius: 4 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: t.rowNum, fontWeight: 700, fontSize: 10, minWidth: 16, textAlign: 'right' }}>#{i + 1}</span>
              <span>{r.name}</span>
            </span>
            <span style={{ color: t.sub, fontSize: 10 }}>{r.time}</span>
          </div>
        ))}
      </div>
      {stamped && (
        <div style={{ alignSelf: 'flex-end', margin: '0 20px 16px auto', fontFamily: "'IBM Plex Sans Condensed', sans-serif", fontWeight: 700, fontSize: 13, color: t.stamp, border: `2px solid ${t.stamp}`, padding: '4px 10px', borderRadius: 4, transform: 'rotate(-6deg)', letterSpacing: 2 }}>MULAI</div>
      )}
      {toast && (
        <div style={{ padding: '8px 20px', background: mode === 'dark' ? '#ffffff08' : '#D4A01710', borderTop: `1px solid ${t.border}`, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: t.eyebrow, animation: 'ledger-toast-in 0.3s ease' }}>
          {toast} masuk antrian
        </div>
      )}
    </div>
  )

  if (showWidget) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <QueueCard />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-studio-950 flex flex-col">
      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="flex-1 flex items-center justify-center p-8 min-h-[50vh] lg:min-h-0">
          <QueueCard />
        </div>

        <div className="w-full lg:w-[380px] bg-studio-900 border-l border-studio-border flex flex-col">
          <div className="p-6 border-b border-studio-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${t.eyebrow}15`, color: t.eyebrow }}>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}>🎮</span>
              </div>
              <div>
                <h2 className="text-white font-display text-lg font-semibold leading-tight">Queue Mabar</h2>
                <p className="text-zinc-500 text-xs font-mono">antrian main bareng receipt style</p>
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
              <SectionTitle>Max Slot</SectionTitle>
              <input type="number" value={maxQueue} min={1} max={20} onChange={e => setMaxQueue(Math.max(1, Math.min(20, Number(e.target.value))))} className="w-full bg-studio-800/50 border border-studio-border rounded-xl px-3 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-white/20 transition-colors" />
            </section>

            <section className="space-y-2">
              <SectionTitle>Test</SectionTitle>
              <button onClick={handleFakeJoin} disabled={full} className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 active:scale-[0.98] border border-studio-border bg-studio-800/50 text-zinc-300 hover:bg-studio-800 hover:text-white hover:border-white/15 disabled:opacity-30 disabled:cursor-not-allowed">
                {full ? 'Queue Full' : 'Test Join'}
              </button>
              <div className="flex gap-2">
                <button onClick={() => setStamped(s => !s)} className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-300 active:scale-[0.98] border border-studio-border bg-studio-800/50 text-zinc-300 hover:bg-studio-800 hover:text-white hover:border-white/15">
                  {stamped ? 'Unstamp' : 'Stamp MULAI'}
                </button>
                <button onClick={clearQueue} className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-300 active:scale-[0.98] border border-studio-border bg-studio-800/50 text-red-400 hover:bg-studio-800 hover:text-red-300 hover:border-red-400/15">
                  Clear
                </button>
              </div>
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
