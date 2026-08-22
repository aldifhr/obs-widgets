'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { SectionTitle } from '../lib/platforms'

export function StartingSoon() {
  const searchParams = useSearchParams()
  const showWidget = searchParams.has('hide')

  useEffect(() => {
    if (showWidget) {
      document.documentElement.style.background = 'transparent'
      document.body.style.background = 'transparent'
      document.body.style.minHeight = '100vh'
    }
  }, [showWidget])

  const [text, setText] = useState(searchParams.get('text') || 'STREAM STARTING SOON')
  const [sub, setSub] = useState(searchParams.get('sub') || 'stay tuned — we go live shortly')
  const [accent, setAccent] = useState(searchParams.get('accent') || '#FFC53D')
  const [textColor, setTextColor] = useState(searchParams.get('tc') || '#ffffff')
  const [font, setFont] = useState(searchParams.get('font') || 'display')
  const [anim, setAnim] = useState(searchParams.get('anim') || 'pulse')
  const [size, setSize] = useState(() => { const v = Number(searchParams.get('size')); return v > 0 ? v : 1 })
  const [noBg, setNoBg] = useState(searchParams.has('nobg'))
  const [countdown, setCountdown] = useState(() => {
    const v = Number(searchParams.get('cd'))
    return v > 0 ? v : 0
  })
  const [remaining, setRemaining] = useState(countdown * 60)

  useEffect(() => { setRemaining(countdown * 60) }, [countdown])
  useEffect(() => {
    if (remaining <= 0) return
    const t = setInterval(() => setRemaining(r => Math.max(0, r - 1)), 1000)
    return () => clearInterval(t)
  }, [remaining])

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const widgetParams = new URLSearchParams({ text, sub, accent, tc: textColor, font, anim, size: String(size), cd: String(countdown), hide: '1' })
  if (noBg) widgetParams.set('nobg', '1')
  const [widgetUrl, setWidgetUrl] = useState('')
  useEffect(() => { setWidgetUrl(`${window.location.origin}/starting?${widgetParams.toString()}`) }, [widgetParams.toString()])
  const [copied, setCopied] = useState(false)
  const copyUrl = () => { navigator.clipboard.writeText(widgetUrl); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  const fontMap: Record<string, string> = {
    display: "'Space Grotesk', sans-serif",
    pixel: "'Press Start 2P', monospace",
    mono: "'JetBrains Mono', monospace",
    fraunces: "'Fraunces', serif",
  }
  const animMap: Record<string, string> = {
    pulse: 'starting-pulse 2s ease-in-out infinite',
    glitch: 'starting-glitch 0.8s ease-in-out infinite',
    wave: 'starting-wave 2s ease-in-out infinite',
    none: 'none',
  }

  const Screen = () => (
    <div className="flex flex-col items-center justify-center gap-4 text-center px-8" style={{ minHeight: showWidget ? '100vh' : 320, transform: `scale(${size})`, transformOrigin: 'center center' }}>
      <div
        className="font-black tracking-tight"
        style={{
          fontFamily: fontMap[font] || fontMap.display,
          fontSize: 'clamp(28px, 6vw, 56px)',
          color: textColor,
          textShadow: `0 0 30px ${accent}40, 0 0 60px ${accent}20`,
          animation: animMap[anim] || animMap.pulse,
          lineHeight: 1.1,
        }}
      >
        {text}
      </div>
      {sub && (
        <div className="font-mono text-xs tracking-widest uppercase" style={{ color: accent, opacity: 0.9 }}>
          {sub}
        </div>
      )}
      {countdown > 0 && (
        <div className="mt-2 font-mono font-bold tracking-widest" style={{ fontSize: 'clamp(24px, 5vw, 40px)', color: textColor }}>
          {fmt(remaining)}
        </div>
      )}
      <div className="mt-4 flex gap-1">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: accent, opacity: 0.6, animation: `starting-dot 1.2s ease-in-out ${i * 0.2}s infinite` }} />
        ))}
      </div>
    </div>
  )

  if (showWidget) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '100vh', background: noBg ? 'transparent' : '#09090b' }}>
        <Screen />
        <style>{`
          @keyframes starting-pulse { 0%,100% { transform: scale(1); opacity: 1 } 50% { transform: scale(1.02); opacity: 0.95 } }
          @keyframes starting-dot { 0%,80%,100% { transform: scale(1); opacity: 0.4 } 40% { transform: scale(1.4); opacity: 1 } }
          @keyframes starting-glitch { 0%,90%,100% { transform: translate(0); text-shadow: 0 0 30px ${accent}40 } 92% { transform: translate(1px,-1px); text-shadow: 2px 0 ${accent}, -2px 0 #ff00ff } 94% { transform: translate(-1px,1px) } 96% { transform: translate(0) } }
          @keyframes starting-wave { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-4px) } }
        `}</style>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-studio-950 flex flex-col">
      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="flex-1 flex items-center justify-center p-8 min-h-[50vh] lg:min-h-0" style={{ background: noBg ? 'transparent' : '#09090b' }}>
          <Screen />
          <style>{`
            @keyframes starting-pulse { 0%,100% { transform: scale(1); opacity: 1 } 50% { transform: scale(1.02); opacity: 0.95 } }
            @keyframes starting-dot { 0%,80%,100% { transform: scale(1); opacity: 0.4 } 40% { transform: scale(1.4); opacity: 1 } }
            @keyframes starting-glitch { 0%,90%,100% { transform: translate(0); text-shadow: 0 0 30px ${accent}40 } 92% { transform: translate(1px,-1px); text-shadow: 2px 0 ${accent}, -2px 0 #ff00ff } 94% { transform: translate(-1px,1px) } 96% { transform: translate(0) } }
            @keyframes starting-wave { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-4px) } }
          `}</style>
        </div>

        <div className="w-full lg:w-[380px] bg-studio-900 border-l border-studio-border flex flex-col">
          <div className="p-6 border-b border-studio-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${accent}15`, color: accent }}>
                <span style={{ fontFamily: "'Fraunces', serif", fontSize: 14 }}>▶</span>
              </div>
              <div>
                <h2 className="text-white font-display text-lg font-semibold leading-tight">Starting Soon</h2>
                <p className="text-zinc-500 text-xs font-mono">animated text screen</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <section>
              <SectionTitle>Text</SectionTitle>
              <input value={text} onChange={e => setText(e.target.value)} className="w-full bg-studio-800/50 border border-studio-border rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/20" />
            </section>
            <section>
              <SectionTitle>Subtext</SectionTitle>
              <input value={sub} onChange={e => setSub(e.target.value)} className="w-full bg-studio-800/50 border border-studio-border rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/20" placeholder="optional" />
            </section>
            <section>
              <SectionTitle>Countdown (minutes, 0 = off)</SectionTitle>
              <input type="number" min={0} max={120} value={countdown} onChange={e => setCountdown(Math.max(0, Number(e.target.value)))} className="w-full bg-studio-800/50 border border-studio-border rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/20" />
            </section>
            <section>
              <SectionTitle>Font</SectionTitle>
              <div className="grid grid-cols-2 gap-2">
                {(['display', 'fraunces', 'mono', 'pixel'] as const).map(f => (
                  <button key={f} onClick={() => setFont(f)} className={`py-2 rounded-xl text-xs font-medium border capitalize transition-all ${font === f ? 'border-white/30 bg-white/10 text-white' : 'border-studio-border bg-studio-800/50 text-zinc-500 hover:text-zinc-300'}`}>{f}</button>
                ))}
              </div>
            </section>

            <section>
              <SectionTitle>Animation</SectionTitle>
              <div className="grid grid-cols-2 gap-2">
                {(['pulse', 'glitch', 'wave', 'none'] as const).map(a => (
                  <button key={a} onClick={() => setAnim(a)} className={`py-2 rounded-xl text-xs font-medium border capitalize transition-all ${anim === a ? 'border-white/30 bg-white/10 text-white' : 'border-studio-border bg-studio-800/50 text-zinc-500 hover:text-zinc-300'}`}>{a}</button>
                ))}
              </div>
            </section>

            <section>
              <SectionTitle>Size <span className="text-zinc-600 font-mono font-normal ml-1">{size.toFixed(1)}x</span></SectionTitle>
              <input type="range" min={0.5} max={2} step={0.1} value={size} onChange={e => setSize(Number(e.target.value))} className="w-full h-1.5 bg-studio-700 rounded-full appearance-none cursor-pointer" style={{ accentColor: accent }} />
            </section>

            <section>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <SectionTitle>Text Color</SectionTitle>
                  <div className="relative"><div className="absolute inset-0 rounded-xl border border-studio-border" style={{ background: textColor }} /><input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="relative w-full h-10 rounded-xl cursor-pointer bg-transparent border-0" /></div>
                </div>
                <div>
                  <SectionTitle>Accent</SectionTitle>
                  <div className="relative"><div className="absolute inset-0 rounded-xl border border-studio-border" style={{ background: accent }} /><input type="color" value={accent} onChange={e => setAccent(e.target.value)} className="relative w-full h-10 rounded-xl cursor-pointer bg-transparent border-0" /></div>
                </div>
              </div>
            </section>
            <section>
              <button onClick={() => setNoBg(n => !n)} className={`w-full py-2.5 rounded-xl text-xs font-medium border transition-all ${noBg ? 'border-white/30 bg-white/10 text-white' : 'border-studio-border bg-studio-800/50 text-zinc-500 hover:text-zinc-300'}`}>
                {noBg ? 'Background: Transparent' : 'Background: Black'}
              </button>
            </section>
          </div>

          <div className="p-6 border-t border-studio-border">
            <button onClick={copyUrl} className="w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] text-studio-950" style={{ background: accent, boxShadow: `0 4px 20px ${accent}30` }}>
              {copied ? 'Copied!' : 'Copy Widget URL'}
            </button>
            <p className="text-zinc-600 text-[10px] mt-3 font-mono break-all leading-relaxed">{widgetUrl}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
