'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { SectionTitle } from '../lib/platforms'

export function WinLoss() {
  const searchParams = useSearchParams()
  const showWidget = searchParams.has('hide')

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

  useEffect(() => { localStorage.setItem('wl-wins', String(wins)) }, [wins])
  useEffect(() => { localStorage.setItem('wl-losses', String(losses)) }, [losses])

  const total = wins + losses
  const winrate = total === 0 ? 0 : (wins / total) * 100

  const widgetParams = new URLSearchParams({
    win: String(wins), loss: String(losses),
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
                    <button onClick={() => setWins(v => Math.max(0, v - 1))} className="w-9 h-9 rounded-xl border border-studio-border bg-studio-800/50 text-zinc-400 hover:bg-studio-800 hover:text-white flex items-center justify-center text-lg">−</button>
                    <div className="flex-1 text-center text-white font-display font-bold text-xl">{wins}</div>
                    <button onClick={() => setWins(v => v + 1)} className="w-9 h-9 rounded-xl border border-studio-border bg-studio-800/50 text-zinc-400 hover:bg-studio-800 hover:text-white flex items-center justify-center text-lg">+</button>
                  </div>
                </div>
                <div>
                  <SectionTitle>Loss</SectionTitle>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setLosses(v => Math.max(0, v - 1))} className="w-9 h-9 rounded-xl border border-studio-border bg-studio-800/50 text-zinc-400 hover:bg-studio-800 hover:text-white flex items-center justify-center text-lg">−</button>
                    <div className="flex-1 text-center text-white font-display font-bold text-xl">{losses}</div>
                    <button onClick={() => setLosses(v => v + 1)} className="w-9 h-9 rounded-xl border border-studio-border bg-studio-800/50 text-zinc-400 hover:bg-studio-800 hover:text-white flex items-center justify-center text-lg">+</button>
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
              <button onClick={() => { setWins(0); setLosses(0) }} className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 active:scale-[0.98] border border-studio-border bg-studio-800/50 text-red-400 hover:bg-studio-800 hover:text-red-300 hover:border-red-400/15">
                Reset
              </button>
            </section>
          </div>

          <div className="p-6 border-t border-studio-border">
            <button onClick={copyUrl} className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 active:scale-[0.98] text-studio-950" style={{ background: accent, boxShadow: `0 4px 20px ${accent}30` }}>
              {copied ? 'Copied!' : 'Copy Widget URL'}
            </button>
            <p className="text-zinc-600 text-[10px] mt-3 font-mono break-all leading-relaxed">{widgetUrl}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
