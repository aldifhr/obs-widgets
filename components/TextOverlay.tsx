'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { SectionTitle } from '../lib/platforms'

export function TextOverlay() {
  const sp = useSearchParams()
  const showWidget = sp.has('hide')
  useEffect(() => {
    if (showWidget) {
      document.documentElement.style.background = 'transparent'
      document.body.style.background = 'transparent'
      document.body.style.minHeight = '100vh'
    }
  }, [showWidget])

  const [text, setText] = useState(() => { const v = sp.get('text'); return v !== null ? v : 'HELLO WORLD' })
  const [color, setColor] = useState(() => { const v = sp.get('color'); return v !== null ? v : '#ffffff' })
  const [stroke, setStroke] = useState(() => { const v = sp.get('stroke'); return v !== null ? v : '#000000' })
  const [bg, setBg] = useState(() => { const v = sp.get('bg'); return v !== null ? v : 'transparent' })
  const [font, setFont] = useState(() => { const v = sp.get('font'); return v !== null ? v : 'display' })
  const [size, setSize] = useState(() => { const v = Number(sp.get('size')); return v > 0 ? v : 32 })
  const [anim, setAnim] = useState(() => { const v = sp.get('anim'); return v !== null ? v : 'none' })
  const [align, setAlign] = useState(() => { const v = sp.get('align'); return v !== null ? v : 'center' })

  const fontMap: Record<string, string> = { display: "'Space Grotesk', sans-serif", fraunces: "'Fraunces', serif", mono: "'JetBrains Mono', monospace", pixel: "'Press Start 2P', monospace" }
  const animMap: Record<string, string> = { none: 'none', pulse: 'text-pulse 2s ease-in-out infinite', glitch: 'text-glitch 0.8s ease-in-out infinite', wave: 'text-wave 2s ease-in-out infinite', float: 'text-float 3s ease-in-out infinite' }

  const widgetParams = new URLSearchParams({ text, color, stroke, bg, font, size: String(size), anim, align, hide: '1' })
  const [url, setUrl] = useState('')
  useEffect(() => { setUrl(`${window.location.origin}/text?${widgetParams.toString()}`) }, [widgetParams.toString()])
  const [copied, setCopied] = useState(false)
  const copy = () => { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  const Box = () => (
    <div style={{ background: bg === 'transparent' ? 'transparent' : bg, padding: bg === 'transparent' ? 0 : '8px 16px', borderRadius: 8, textAlign: align as any }}>
      <div
        style={{
          fontFamily: fontMap[font] || fontMap.display,
          fontSize: size,
          color,
          WebkitTextStroke: stroke !== 'transparent' ? `2px ${stroke}` : undefined,
          textShadow: anim !== 'none' ? `0 0 20px ${color}60` : undefined,
          animation: animMap[anim] || 'none',
          lineHeight: 1.1,
          fontWeight: 800,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {text}
      </div>
    </div>
  )

  if (showWidget) {
    return (
      <div className="flex items-center justify-center p-6" style={{ minHeight: '100vh', justifyContent: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center' }}>
        <Box />
        <style>{`@keyframes text-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}@keyframes text-glitch{0%,90%,100%{transform:translate(0);text-shadow:0 0 20px currentColor}92%{transform:translate(1px,-1px);text-shadow:2px 0 #ff0,-2px 0 #f0f}94%{transform:translate(-1px,1px)}}@keyframes text-wave{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}@keyframes text-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}`}</style>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-studio-950 flex flex-col">
      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="flex-1 flex items-center justify-center p-8" style={{ background: '#09090b' }}>
          <Box />
          <style>{`@keyframes text-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}@keyframes text-glitch{0%,90%,100%{transform:translate(0)}92%{transform:translate(1px,-1px)}94%{transform:translate(-1px,1px)}}@keyframes text-wave{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}@keyframes text-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}`}</style>
        </div>
        <div className="w-full lg:w-[380px] bg-studio-900 border-l border-studio-border flex flex-col">
          <div className="p-6 border-b border-studio-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#FFC53D15', color: '#FFC53D' }}>T</div>
              <div><h2 className="text-white font-display font-semibold">Text Overlay</h2><p className="text-zinc-500 text-xs font-mono">custom text OBS</p></div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <section><SectionTitle>Text</SectionTitle><textarea value={text} onChange={e => setText(e.target.value)} rows={3} className="w-full bg-studio-800/50 border border-studio-border rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/20 resize-none" /></section>
            <section>
              <SectionTitle>Font</SectionTitle>
              <div className="grid grid-cols-2 gap-2">{(['display','fraunces','mono','pixel'] as const).map(f=> <button key={f} onClick={()=>setFont(f)} className={`py-2 rounded-xl text-xs capitalize border ${font===f?'border-white/30 bg-white/10 text-white':'border-studio-border bg-studio-800/50 text-zinc-500'}`}>{f}</button>)}</div>
            </section>
            <section>
              <SectionTitle>Animation</SectionTitle>
              <div className="grid grid-cols-3 gap-2">{(['none','pulse','glitch','wave','float'] as const).map(a=> <button key={a} onClick={()=>setAnim(a)} className={`py-2 rounded-xl text-xs capitalize border ${anim===a?'border-white/30 bg-white/10 text-white':'border-studio-border bg-studio-800/50 text-zinc-500'}`}>{a}</button>)}</div>
            </section>
            <section>
              <SectionTitle>Align</SectionTitle>
              <div className="grid grid-cols-3 gap-2">{(['left','center','right'] as const).map(a=> <button key={a} onClick={()=>setAlign(a)} className={`py-2 rounded-xl text-xs capitalize border ${align===a?'border-white/30 bg-white/10 text-white':'border-studio-border bg-studio-800/50 text-zinc-500'}`}>{a}</button>)}</div>
            </section>
            <section>
              <SectionTitle>Size <span className="text-zinc-600 font-mono font-normal ml-1">{size}px</span></SectionTitle>
              <input type="range" min={12} max={96} step={2} value={size} onChange={e=>setSize(Number(e.target.value))} className="w-full h-1.5 bg-studio-700 rounded-full appearance-none cursor-pointer" style={{ accentColor: '#FFC53D' }} />
            </section>
            <section>
              <div className="grid grid-cols-3 gap-3">
                <div><SectionTitle>Color</SectionTitle><div className="relative"><div className="absolute inset-0 rounded-xl border border-studio-border" style={{ background: color }} /><input type="color" value={color} onChange={e=>setColor(e.target.value)} className="relative w-full h-10 rounded-xl cursor-pointer bg-transparent border-0" /></div></div>
                <div><SectionTitle>Stroke</SectionTitle><div className="relative"><div className="absolute inset-0 rounded-xl border border-studio-border" style={{ background: stroke }} /><input type="color" value={stroke} onChange={e=>setStroke(e.target.value)} className="relative w-full h-10 rounded-xl cursor-pointer bg-transparent border-0" /></div></div>
                <div><SectionTitle>BG</SectionTitle><div className="relative"><div className="absolute inset-0 rounded-xl border border-studio-border" style={{ background: bg === 'transparent' ? '#09090b' : bg }} /><input type="color" value={bg === 'transparent' ? '#09090b' : bg} onChange={e=>setBg(e.target.value)} className="relative w-full h-10 rounded-xl cursor-pointer bg-transparent border-0" /></div><button onClick={()=>setBg('transparent')} className="w-full mt-1 py-1 rounded-lg text-[10px] border border-studio-border bg-studio-800/50 text-zinc-500">Transparent</button></div>
              </div>
            </section>
          </div>
          <div className="p-6 border-t border-studio-border">
            <button onClick={copy} className="w-full py-3 rounded-xl font-semibold text-sm text-studio-950" style={{ background: '#FFC53D', boxShadow: '0 4px 20px #FFC53D30' }}>{copied?'Copied!':'Copy Widget URL'}</button>
            <p className="text-zinc-600 text-[10px] mt-3 font-mono break-all leading-relaxed">{url}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
