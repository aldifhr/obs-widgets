'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { SectionTitle } from '../lib/platforms'

export function WinLoss() {
  const searchParams = useSearchParams()
  const showWidget = searchParams.has('hide')
  const isDock = searchParams.has('dock')

  useEffect(() => {
    if (showWidget) {
      document.documentElement.style.background = 'transparent'
      document.body.style.background = 'transparent'
      document.body.style.minHeight = '100vh'
    }
  }, [showWidget])

  const [wins, setWins] = useState(() => {
    const v = searchParams.get('win')
    if (v !== null) return Math.max(0, Number(v) || 0)
    const s = typeof window !== 'undefined' ? localStorage.getItem('wl-wins') : null
    return s ? Number(s) : 0
  })
  const [losses, setLosses] = useState(() => {
    const v = searchParams.get('loss')
    if (v !== null) return Math.max(0, Number(v) || 0)
    const s = typeof window !== 'undefined' ? localStorage.getItem('wl-losses') : null
    return s ? Number(s) : 0
  })
  const accent = '#FFC53D'
  const [noBg, setNoBg] = useState(searchParams.has('nobg'))
  const [scale, setScale] = useState(() => {
    const v = Number(searchParams.get('scale'))
    return v > 0 ? v : 1
  })
  const [copied, setCopied] = useState(false)
  const bcRef = useRef<BroadcastChannel | null>(null)

  useEffect(() => { localStorage.setItem('wl-wins', String(wins)) }, [wins])
  useEffect(() => { localStorage.setItem('wl-losses', String(losses)) }, [losses])

  // BroadcastChannel for instant same-machine sync (dock <-> overlay)
  useEffect(() => {
    try {
      const bc = new BroadcastChannel('winloss')
      bcRef.current = bc
      bc.onmessage = (e) => {
        const d = e.data as { wins?: number; losses?: number }
        if (typeof d.wins === 'number') setWins(d.wins)
        if (typeof d.losses === 'number') setLosses(d.losses)
      }
      return () => bc.close()
    } catch {}
  }, [])

  const broadcast = (w: number, l: number) => {
    try { bcRef.current?.postMessage({ wins: w, losses: l }) } catch {}
    // also push to server for cross-device / API callers, fire-and-forget
    fetch('/api/winloss', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'set', wins: w, losses: l }) }).catch(() => {})
  }

  // SSE fallback for remote API triggers
  useEffect(() => {
    const es = new EventSource('/api/winloss')
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        if (data.kind === 'set') {
          setWins(data.wins ?? 0)
          setLosses(data.losses ?? 0)
        }
      } catch {}
    }
    return () => es.close()
  }, [])

  // storage event fallback
  useEffect(() => {
    const h = (e: StorageEvent) => {
      if (e.key === 'wl-wins' && e.newValue !== null) setWins(Number(e.newValue) || 0)
      if (e.key === 'wl-losses' && e.newValue !== null) setLosses(Number(e.newValue) || 0)
    }
    window.addEventListener('storage', h)
    return () => window.removeEventListener('storage', h)
  }, [])

  const doWin = (d: number) => {
    const nw = Math.max(0, wins + d)
    setWins(nw)
    broadcast(nw, losses)
  }
  const doLoss = (d: number) => {
    const nl = Math.max(0, losses + d)
    setLosses(nl)
    broadcast(wins, nl)
  }
  const doReset = () => {
    setWins(0); setLosses(0)
    broadcast(0, 0)
  }

  const total = wins + losses
  const winrate = total === 0 ? 0 : (wins / total) * 100

  const widgetParams = new URLSearchParams({
    scale: String(scale), hide: '1',
  })
  if (noBg) widgetParams.set('nobg', '1')
  const [widgetUrl, setWidgetUrl] = useState('')
  useEffect(() => { setWidgetUrl(`${window.location.origin}/winloss?${widgetParams.toString()}`) }, [widgetParams.toString()])
  const copyUrl = () => { navigator.clipboard.writeText(widgetUrl); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  const Widget = () => (
    <div className="flex flex-col items-center gap-2" style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}>
      <div className="flex gap-3">
        <div className="flex flex-col items-center">
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: 2, color: '#22c55e', fontWeight: 700 }}>WIN</div>
          <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 800, fontSize: 42, color: '#fff', lineHeight: 1 }}>{wins}</div>
        </div>
        <div style={{ width: 1, background: 'rgba(255,255,255,0.12)', margin: '8px 0' }} />
        <div className="flex flex-col items-center">
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: 2, color: '#ef4444', fontWeight: 700 }}>LOSS</div>
          <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 800, fontSize: 42, color: '#fff', lineHeight: 1 }}>{losses}</div>
        </div>
      </div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: '#888', letterSpacing: 1 }}>
        {total} MATCH • {winrate.toFixed(1)}% WR
      </div>
    </div>
  )

  if (showWidget) {
    return (
      <div className="flex items-center justify-center p-6" style={{ minHeight: '100vh' }}>
        {noBg ? <Widget /> : (
          <div className="rounded-2xl px-8 py-5" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', border: `1px solid ${accent}20` }}>
            <Widget />
          </div>
        )}
      </div>
    )
  }

  if (isDock) {
    return (
      <div className="min-h-screen bg-studio-900 p-4 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${accent}15`, color: accent, fontFamily: "'Fraunces', serif", fontSize: 14 }}>W</div>
          <div>
            <div className="text-white font-display font-semibold text-sm">Win / Loss Dock</div>
            <div className="text-zinc-500 text-[10px] font-mono">{total} match • {winrate.toFixed(1)}% WR</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-studio-800/50 border border-studio-border rounded-xl p-3 text-center">
            <div className="text-[10px] font-mono tracking-widest text-emerald-400 font-bold">WIN</div>
            <div className="text-white font-display font-bold text-3xl">{wins}</div>
            <div className="flex gap-1 mt-2">
              <button onClick={() => doWin(-1)} className="flex-1 h-8 rounded-lg bg-studio-700 text-white">−</button>
              <button onClick={() => doWin(1)} className="flex-1 h-8 rounded-lg text-black font-bold" style={{ background: accent }}>+</button>
            </div>
          </div>
          <div className="bg-studio-800/50 border border-studio-border rounded-xl p-3 text-center">
            <div className="text-[10px] font-mono tracking-widest text-red-400 font-bold">LOSS</div>
            <div className="text-white font-display font-bold text-3xl">{losses}</div>
            <div className="flex gap-1 mt-2">
              <button onClick={() => doLoss(-1)} className="flex-1 h-8 rounded-lg bg-studio-700 text-white">−</button>
              <button onClick={() => doLoss(1)} className="flex-1 h-8 rounded-lg bg-red-500 text-white font-bold">+</button>
            </div>
          </div>
        </div>
        <button onClick={doReset} className="w-full py-2 rounded-xl border border-studio-border bg-studio-800/50 text-red-400 text-xs font-medium hover:bg-studio-800">Reset</button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-studio-950 flex flex-col">
      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="flex-1 flex items-center justify-center p-8 min-h-[50vh] lg:min-h-0">
          <Widget />
        </div>

        <div className="w-full lg:w-[380px] bg-studio-900 border-l border-studio-border flex flex-col">
          <div className="p-6 border-b border-studio-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${accent}15`, color: accent }}>
                <span style={{ fontFamily: "'Fraunces', serif", fontSize: 14 }}>W</span>
              </div>
              <div>
                <h2 className="text-white font-display text-lg font-semibold leading-tight">Win / Loss</h2>
                <p className="text-zinc-500 text-xs font-mono">counter match</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <section>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <SectionTitle>Win</SectionTitle>
                  <div className="flex items-center gap-2">
                    <button onClick={() => doWin(-1)} className="w-9 h-9 rounded-xl border border-studio-border bg-studio-800/50 text-zinc-400 hover:bg-studio-800 hover:text-white flex items-center justify-center text-lg">−</button>
                    <div className="flex-1 text-center text-white font-display font-bold text-xl">{wins}</div>
                    <button onClick={() => doWin(1)} className="w-9 h-9 rounded-xl border border-studio-border bg-studio-800/50 text-zinc-400 hover:bg-studio-800 hover:text-white flex items-center justify-center text-lg">+</button>
                  </div>
                </div>
                <div>
                  <SectionTitle>Loss</SectionTitle>
                  <div className="flex items-center gap-2">
                    <button onClick={() => doLoss(-1)} className="w-9 h-9 rounded-xl border border-studio-border bg-studio-800/50 text-zinc-400 hover:bg-studio-800 hover:text-white flex items-center justify-center text-lg">−</button>
                    <div className="flex-1 text-center text-white font-display font-bold text-xl">{losses}</div>
                    <button onClick={() => doLoss(1)} className="w-9 h-9 rounded-xl border border-studio-border bg-studio-800/50 text-zinc-400 hover:bg-studio-800 hover:text-white flex items-center justify-center text-lg">+</button>
                  </div>
                </div>
              </div>
              <div className="text-center mt-3 text-zinc-500 text-xs font-mono">{total} match • {winrate.toFixed(1)}% WR</div>
            </section>

            <section>
              <SectionTitle>Scale <span className="text-zinc-600 font-mono font-normal ml-1">{scale.toFixed(1)}x</span></SectionTitle>
              <input type="range" min="0.5" max="2" step="0.1" value={scale} onChange={e => setScale(Number(e.target.value))} className="w-full h-1.5 bg-studio-700 rounded-full appearance-none cursor-pointer" style={{ accentColor: accent }} />
            </section>

            <section>
              <button onClick={() => setNoBg(n => !n)} className={`w-full py-2.5 rounded-xl text-xs font-medium border transition-all ${noBg ? 'border-white/30 bg-white/10 text-white' : 'border-studio-border bg-studio-800/50 text-zinc-500 hover:text-zinc-300'}`}>
                {noBg ? 'Background: Hidden' : 'Background: Visible'}
              </button>
            </section>

            <section>
              <button onClick={doReset} className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 active:scale-[0.98] border border-studio-border bg-studio-800/50 text-red-400 hover:bg-studio-800 hover:text-red-300 hover:border-red-400/15">
                Reset
              </button>
            </section>
          </div>

          <div className="p-6 border-t border-studio-border space-y-3">
            <button onClick={copyUrl} className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 active:scale-[0.98] text-studio-950" style={{ background: accent, boxShadow: `0 4px 20px ${accent}30` }}>
              {copied ? 'Copied!' : 'Copy Widget URL'}
            </button>
            <p className="text-zinc-600 text-[10px] font-mono break-all leading-relaxed">{widgetUrl}</p>
            <div className="pt-3 border-t border-studio-border">
              <p className="text-zinc-500 text-[10px] font-mono mb-1">OBS Dock URL:</p>
              <p className="text-zinc-600 text-[10px] font-mono break-all leading-relaxed">{typeof window !== 'undefined' ? `${window.location.origin}/winloss?dock=1` : ''}</p>
              <p className="text-zinc-600 text-[9px] mt-1">OBS → View → Docks → Custom Browser Docks → paste URL</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
