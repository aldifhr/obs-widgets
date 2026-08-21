import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PLATFORMS, PLATFORM_KEYS, SHAPE_MAP, toHex7, SectionTitle } from '../lib/platforms'
import type { Platform, Transition, Shape } from '../lib/platforms'

export function SocialRotatorCustomizer() {
  const [searchParams] = useSearchParams()
  const showWidget = searchParams.has('hide')

  const parseList = (key: string, fallback: string[]) => {
    const v = searchParams.get(key)
    return v ? v.split(',').filter(Boolean) : fallback
  }

  const [enabled, setEnabled] = useState<Platform[]>(() => parseList('platforms', ['youtube', 'tiktok', 'instagram']) as Platform[])
  const [handles, setHandles] = useState<Record<Platform, string>>(() => {
    const single = searchParams.get('handle')
    const list = searchParams.get('handles')?.split(',')
    const result: Record<string, string> = {}
    PLATFORM_KEYS.forEach((k, i) => { result[k] = single || list?.[i] || `@${k}` })
    return result as Record<Platform, string>
  })
  const [interval, setInterval_] = useState(Number(searchParams.get('interval')) || 3000)
  const [transition, setTransition] = useState<Transition>((searchParams.get('transition') as Transition) || 'fade')
  const [transitionDuration, setTransitionDuration] = useState(Number(searchParams.get('transDuration')) || 350)
  const [textColor, setTextColor] = useState(() => {
    const v = searchParams.get('textColor')
    return v && /^#[0-9a-fA-F]{6}$/.test(v) ? v : '#FFFFFF'
  })
  const [bgColor, setBgColor] = useState(() => {
    const v = searchParams.get('bg')
    return v && /^#[0-9a-fA-F]{6}$/.test(v) ? v : '#000000'
  })
  const [size, setSize] = useState(Number(searchParams.get('size')) || 64)
  const [anim, setAnim] = useState(searchParams.get('anim') || 'none')
  const [shape, setShape] = useState<Shape>((searchParams.get('shape') as Shape) || 'pill')
  const [copied, setCopied] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)
  const [transDir, setTransDir] = useState<'in' | 'out'>('in')
  const timerRef = useRef<number | null>(null)

  const activePlatforms = enabled.length > 0 ? enabled : ['youtube'] as Platform[]
  const current = activePlatforms[activeIdx % activePlatforms.length]
  const p = PLATFORMS[current]

  const rotate = useCallback(() => {
    setTransDir('out')
    setTimeout(() => {
      setActiveIdx(i => (i + 1) % activePlatforms.length)
      setTransDir('in')
    }, transitionDuration)
  }, [activePlatforms.length, transitionDuration])

  useEffect(() => {
    if (showWidget && activePlatforms.length > 1) {
      timerRef.current = window.setInterval(rotate, interval)
      return () => { if (timerRef.current) clearInterval(timerRef.current) }
    }
  }, [showWidget, rotate, interval, activePlatforms.length])

  const togglePlatform = (k: Platform) => {
    setEnabled(prev => {
      if (prev.includes(k)) return prev.length > 1 ? prev.filter(x => x !== k) : prev
      return [...prev, k]
    })
  }

  const widgetParams = new URLSearchParams({
    platforms: activePlatforms.join(','),
    handles: activePlatforms.map(k => handles[k]).join(','),
    interval: String(interval), transition, transDuration: String(transitionDuration), textColor: bgColor === '#000000' ? textColor : textColor,
    bg: bgColor, size: String(size), anim, shape, hide: '1',
  })
  const widgetUrl = `${window.location.origin}/social-rotator?${widgetParams.toString()}`
  const copyUrl = () => { navigator.clipboard.writeText(widgetUrl); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  const animClass = anim === 'pulse' ? 'animate-[pulse_2s_ease-in-out_infinite]' : anim === 'bounce' ? 'animate-[bounce_1.5s_ease-in-out_infinite]' : anim === 'fade' ? 'animate-[fade_3s_ease-in-out_infinite]' : anim === 'slide' ? 'animate-[slide_2s_ease-in-out_infinite]' : ''

  const transDurationSec = transitionDuration / 1000
  const transStyle: React.CSSProperties = transition === 'fade'
    ? { transition: `opacity ${transDurationSec}s ease`, opacity: transDir === 'out' ? 0 : 1 }
    : transition === 'slide'
    ? { transition: `transform ${transDurationSec}s ease, opacity ${transDurationSec}s ease`, transform: transDir === 'out' ? 'translateX(-30px)' : 'translateX(0)', opacity: transDir === 'out' ? 0 : 1 }
    : { transition: `transform ${transDurationSec}s ease, opacity ${transDurationSec}s ease`, transform: transDir === 'out' ? 'scale(0.85)' : 'scale(1)', opacity: transDir === 'out' ? 0 : 1 }

  const renderIcon = (icon: React.ReactNode, s: number) => {
    if (!React.isValidElement(icon)) return icon
    return React.cloneElement(icon as React.ReactElement<React.SVGProps<SVGSVGElement>>, {
      width: s,
      height: s,
      style: { display: 'block' },
    })
  }

  const WidgetPreview = ({ standalone }: { standalone?: boolean }) => (
    <div className="flex flex-col items-center justify-center gap-8" style={{ minHeight: standalone ? '100vh' : undefined }}>
      <div className={`flex items-center border backdrop-blur-xl ${SHAPE_MAP[shape]} ${animClass}`} style={{ gap: size * 0.3, padding: `${size * 0.3}px ${size * 0.5}px`, background: bgColor, boxShadow: `0 0 ${size * 0.6}px ${bgColor}60, 0 8px 32px rgba(0,0,0,0.5)`, transition: 'box-shadow 0.5s ease, border-color 0.5s ease' }}>
        <div key={`icon-${current}`} style={{ color: p.color, flexShrink: 0, ...transStyle }} className="drop-shadow-lg">{renderIcon(p.icon, size)}</div>
        <div key={`handle-${current}`} style={{ ...transStyle, fontSize: size * 0.32, color: textColor }} className="text-white font-bold whitespace-nowrap drop-shadow">{handles[current]}</div>
      </div>
      {!standalone && activePlatforms.length > 1 && (
        <div className="flex items-center gap-2">
          {activePlatforms.map((k, i) => {
            const isActive = i === (activeIdx % activePlatforms.length)
            return (
              <div key={k} className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full transition-all duration-300" style={{ background: isActive ? PLATFORMS[k].color : '#333', boxShadow: isActive ? `0 0 10px ${PLATFORMS[k].color}80` : 'none', transform: isActive ? 'scale(1.4)' : 'scale(1)' }} />
                  <span className="text-[9px] font-mono transition-colors duration-300" style={{ color: isActive ? '#888' : '#444' }}>{PLATFORMS[k].name.split(' ')[0]}</span>
                </div>
                {i < activePlatforms.length - 1 && <div className="w-6 h-px bg-zinc-800 mb-3" />}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )

  if (showWidget) {
    return (
      <div className="flex items-center justify-center" style={{ background: bgColor, minHeight: '100vh' }}>
        <WidgetPreview standalone />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-studio-950 flex flex-col">
      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="flex-1 flex items-center justify-center p-8">
          <WidgetPreview />
        </div>

        <div className="w-full lg:w-[420px] bg-studio-900 border-l border-studio-border flex flex-col">
          <div className="p-6 border-b border-studio-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-signal/10 flex items-center justify-center flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-signal"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
              </div>
              <div>
                <h2 className="text-white font-display text-lg font-semibold leading-tight">Social Rotator</h2>
                <p className="text-zinc-500 text-xs font-mono">auto-cycle platforms</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <section>
              <SectionTitle>Platforms</SectionTitle>
              <div className="grid grid-cols-4 gap-2">
                {PLATFORM_KEYS.map(k => {
                  const active = enabled.includes(k)
                  return (
                    <button key={k} onClick={() => togglePlatform(k)} className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-300 ${active ? 'border-white/15 bg-white/[0.07]' : 'border-studio-border bg-studio-800/50 opacity-40 hover:opacity-70'}`}>
                      <div className="w-5 h-5" style={{ color: active ? PLATFORMS[k].color : '#555' }}>{PLATFORMS[k].icon}</div>
                      <span className={`text-[10px] font-medium ${active ? 'text-zinc-300' : 'text-zinc-600'}`}>{PLATFORMS[k].name.split(' ')[0]}</span>
                      {active && <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-signal" />}
                    </button>
                  )
                })}
              </div>
            </section>

            <section>
              <SectionTitle>Handles</SectionTitle>
              <div className="rounded-xl border border-studio-border divide-y divide-studio-border overflow-hidden">
                {enabled.map(k => (
                  <div key={k} className="flex items-center gap-3 bg-studio-800/40 px-3 py-2.5">
                    <div className="w-5 h-5 flex-shrink-0" style={{ color: PLATFORMS[k].color }}>{PLATFORMS[k].icon}</div>
                    <input value={handles[k]} onChange={e => setHandles(prev => ({ ...prev, [k]: e.target.value }))} className="flex-1 bg-transparent text-white text-sm placeholder-zinc-600 focus:outline-none" placeholder={`@${k}`} />
                  </div>
                ))}
              </div>
            </section>

            <section>
              <SectionTitle>Timing</SectionTitle>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-zinc-400 text-xs">Interval</label>
                    <span className="text-zinc-500 text-[11px] font-mono">{(interval / 1000).toFixed(1)}s</span>
                  </div>
                  <input type="range" min="1000" max="8000" step="500" value={interval} onChange={e => setInterval_(Number(e.target.value))} className="w-full h-1.5 bg-studio-700 rounded-full appearance-none cursor-pointer" style={{ accentColor: '#B4FF39' }} />
                  <div className="flex justify-between text-[10px] text-zinc-700 mt-1 font-mono"><span>1s</span><span>8s</span></div>
                </div>
                <div>
                  <label className="text-zinc-400 text-xs block mb-2">Transition</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['fade', 'slide', 'zoom'] as const).map(t => (
                      <button key={t} onClick={() => setTransition(t)} className={`py-2.5 rounded-xl text-xs font-medium capitalize transition-all border ${transition === t ? 'bg-white/10 text-white border-white/15' : 'bg-studio-800/50 text-zinc-500 border-studio-border hover:text-zinc-300'}`}>{t}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-zinc-400 text-xs">Transition Speed</label>
                    <span className="text-zinc-500 text-[11px] font-mono">{(transitionDuration / 1000).toFixed(1)}s</span>
                  </div>
                  <input type="range" min="100" max="1000" step="50" value={transitionDuration} onChange={e => setTransitionDuration(Number(e.target.value))} className="w-full h-1.5 bg-studio-700 rounded-full appearance-none cursor-pointer" style={{ accentColor: '#B4FF39' }} />
                  <div className="flex justify-between text-[10px] text-zinc-700 mt-1 font-mono"><span>0.1s</span><span>1s</span></div>
                </div>
              </div>
            </section>

            <section>
              <SectionTitle>Appearance</SectionTitle>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-zinc-400 text-xs">Icon Size</label>
                    <span className="text-zinc-500 text-[11px] font-mono">{size}px</span>
                  </div>
                  <input type="range" min="24" max="128" value={size} onChange={e => setSize(Number(e.target.value))} className="w-full h-1.5 bg-studio-700 rounded-full appearance-none cursor-pointer" style={{ accentColor: '#B4FF39' }} />
                  <div className="flex justify-between text-[10px] text-zinc-700 mt-1 font-mono"><span>24</span><span>128</span></div>
                </div>
                <div>
                  <label className="text-zinc-400 text-xs block mb-2">Shape</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['pill', 'rounded', 'square'] as const).map(s => (
                      <button key={s} onClick={() => setShape(s)} className={`flex items-center justify-center gap-2 py-2.5 text-xs font-medium capitalize transition-all border ${shape === s ? 'bg-white/10 text-white border-white/15' : 'bg-studio-800/50 text-zinc-500 border-studio-border hover:text-zinc-300'}`}>
                        <div className={`w-4 h-3 border border-current ${SHAPE_MAP[s]}`} />
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-zinc-400 text-xs block mb-2">Background</label>
                  <div className="relative"><div className="absolute inset-0 rounded-xl border border-studio-border" style={{ background: bgColor }} /><input type="color" value={toHex7(bgColor)} onChange={e => setBgColor(e.target.value)} className="relative w-full h-10 rounded-xl cursor-pointer bg-transparent border-0" /></div>
                </div>
                <div>
                  <label className="text-zinc-400 text-xs block mb-2">Text Color</label>
                  <div className="relative"><div className="absolute inset-0 rounded-xl border border-studio-border" style={{ background: textColor }} /><input type="color" value={toHex7(textColor)} onChange={e => setTextColor(e.target.value)} className="relative w-full h-10 rounded-xl cursor-pointer bg-transparent border-0" /></div>
                </div>
                <div>
                  <label className="text-zinc-400 text-xs block mb-2">Widget Animation</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {(['none', 'pulse', 'bounce', 'fade', 'slide'] as const).map(a => (
                      <button key={a} onClick={() => setAnim(a)} className={`py-1.5 rounded-lg text-[10px] font-medium capitalize transition-all border ${anim === a ? 'bg-white/10 text-white border-white/15' : 'bg-studio-800/50 text-zinc-600 border-studio-border hover:text-zinc-400'}`}>{a}</button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="p-6 border-t border-studio-border">
            <button onClick={copyUrl} className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 active:scale-[0.98] bg-signal text-studio-950 hover:brightness-110" style={{ boxShadow: '0 4px 20px #B4FF3930' }}>{copied ? 'Copied!' : 'Copy Widget URL'}</button>
            <p className="text-zinc-600 text-[10px] mt-3 font-mono break-all leading-relaxed">{widgetUrl}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
