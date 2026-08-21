import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PLATFORMS, PLATFORM_KEYS, SHAPE_MAP, toHex7, SectionTitle } from '../lib/platforms'
import type { Platform, Shape } from '../lib/platforms'

export function SocialFollowCustomizer() {
  const [searchParams] = useSearchParams()
  const [platform, setPlatform] = useState<Platform>((searchParams.get('platform') as Platform) || 'youtube')
  const [handle, setHandle] = useState(searchParams.get('handle') || '@faray')
  const [color, setColor] = useState(searchParams.get('color') || PLATFORMS[platform].color)
  const [textColor, setTextColor] = useState(() => {
    const v = searchParams.get('textColor')
    return v && /^#[0-9a-fA-F]{6}$/.test(v) ? v : '#FFFFFF'
  })
  const [bgColor, setBgColor] = useState(() => {
    const v = searchParams.get('bg')
    return v && /^#[0-9a-fA-F]{6}$/.test(v) ? v : '#000000'
  })
  const [size, setSize] = useState(Number(searchParams.get('size')) || 64)
  const [anim, setAnim] = useState(searchParams.get('anim') || 'pulse')
  const [shape, setShape] = useState<Shape>((searchParams.get('shape') as Shape) || 'pill')
  const [copied, setCopied] = useState(false)
  const [iconPhase, setIconPhase] = useState<'visible' | 'exiting' | 'entering'>('visible')
  const prevPlatform = useRef(platform)
  const showWidget = searchParams.has('hide')

  const p = PLATFORMS[platform]

  useEffect(() => {
    if (prevPlatform.current !== platform) {
      setIconPhase('exiting')
      const t = setTimeout(() => { setIconPhase('entering'); const t2 = setTimeout(() => setIconPhase('visible'), 200); return () => clearTimeout(t2) }, 200)
      prevPlatform.current = platform
      return () => clearTimeout(t)
    }
  }, [platform])

  const iconStyle = {
    transition: 'opacity 0.2s ease, transform 0.2s ease',
    opacity: iconPhase === 'exiting' ? 0 : 1,
    transform: iconPhase === 'exiting' ? 'scale(0.8)' : iconPhase === 'entering' ? 'scale(1.1)' : 'scale(1)',
  }

  const widgetParams = new URLSearchParams({
    platform, handle, color, textColor, bg: bgColor, size: String(size), anim, shape, hide: '1',
  })
  const widgetUrl = `${window.location.origin}/social-follow?${widgetParams.toString()}`
  const copyUrl = () => { navigator.clipboard.writeText(widgetUrl); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  const renderIcon = (icon: React.ReactNode, s: number) => {
    if (!React.isValidElement(icon)) return icon
    return React.cloneElement(icon as React.ReactElement<React.SVGProps<SVGSVGElement>>, {
      width: s,
      height: s,
      style: { display: 'block' },
    })
  }

  const animClass = anim === 'pulse' ? 'animate-[pulse_2s_ease-in-out_infinite]' : anim === 'bounce' ? 'animate-[bounce_1.5s_ease-in-out_infinite]' : anim === 'fade' ? 'animate-[fade_3s_ease-in-out_infinite]' : anim === 'slide' ? 'animate-[slide_2s_ease-in-out_infinite]' : ''

  const WidgetPill = ({ className = '' }: { className?: string }) => (
    <div className={`flex items-center border backdrop-blur-xl shadow-2xl ${SHAPE_MAP[shape]} ${animClass} ${className}`} style={{ gap: size * 0.3, padding: `${size * 0.3}px ${size * 0.5}px`, background: bgColor, boxShadow: `0 0 ${size * 0.6}px ${bgColor}60, 0 8px 32px rgba(0,0,0,0.5)` }}>
      <div style={{ color, flexShrink: 0, ...iconStyle }} className="drop-shadow-lg">{renderIcon(p.icon, size)}</div>
      <span className="text-white font-bold whitespace-nowrap drop-shadow" style={{ fontSize: size * 0.32, color: textColor }}>{handle}</span>
    </div>
  )

  if (showWidget) {
    return (
      <div className="flex items-center justify-center" style={{ background: bgColor, minHeight: '100vh' }}>
        <WidgetPill />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-studio-950 flex flex-col">
      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="flex-1 flex items-center justify-center p-8 min-h-[50vh] lg:min-h-0">
          <WidgetPill />
        </div>
        <div className="w-full lg:w-[380px] bg-studio-900 border-l border-studio-border flex flex-col">
          <div className="p-6 border-b border-studio-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}15`, color }}>{p.icon}</div>
              <div>
                <h2 className="text-white font-display text-lg font-semibold leading-tight">Social Follow</h2>
                <p className="text-zinc-500 text-xs font-mono">single platform</p>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <section>
              <SectionTitle>Platform</SectionTitle>
              <div className="grid grid-cols-4 gap-2">
                {PLATFORM_KEYS.map(k => (
                  <button key={k} onClick={() => { setPlatform(k); setColor(PLATFORMS[k].color) }} className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-300 ${platform === k ? 'border-white/15 bg-white/[0.07]' : 'border-studio-border bg-studio-800/50 hover:border-white/10'}`}>
                    <div className="w-5 h-5 transition-colors duration-300" style={{ color: platform === k ? PLATFORMS[k].color : '#555' }}>{PLATFORMS[k].icon}</div>
                    <span className={`text-[10px] font-medium transition-colors duration-300 ${platform === k ? 'text-zinc-200' : 'text-zinc-600'}`}>{PLATFORMS[k].name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </section>
            <section>
              <SectionTitle>Handle</SectionTitle>
              <input value={handle} onChange={e => setHandle(e.target.value)} className="w-full bg-studio-800/50 border border-studio-border rounded-xl px-3 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-white/20 transition-colors" placeholder="@username" />
            </section>
            <section>
              <SectionTitle>Icon Size <span className="text-zinc-600 font-mono font-normal ml-1">{size}px</span></SectionTitle>
              <input type="range" min="24" max="128" value={size} onChange={e => setSize(Number(e.target.value))} className="w-full h-1.5 bg-studio-700 rounded-full appearance-none cursor-pointer" style={{ accentColor: color }} />
              <div className="flex justify-between text-[10px] text-zinc-700 mt-1 font-mono"><span>24</span><span>128</span></div>
            </section>
            <section>
              <SectionTitle>Shape</SectionTitle>
              <div className="grid grid-cols-3 gap-2">
                {(['pill', 'rounded', 'square'] as const).map(s => (
                  <button key={s} onClick={() => setShape(s)} className={`flex items-center justify-center gap-2 py-2.5 text-xs font-medium capitalize transition-all border ${shape === s ? 'bg-white/10 text-white border-white/15' : 'bg-studio-800/50 text-zinc-500 border-studio-border hover:text-zinc-300'}`}>
                    <div className={`w-4 h-3 border border-current ${SHAPE_MAP[s]}`} />
                    {s}
                  </button>
                ))}
              </div>
            </section>
            <section>
              <SectionTitle>Colors</SectionTitle>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-zinc-500 text-[11px] block mb-1.5">Accent</label>
                  <div className="relative"><div className="absolute inset-0 rounded-xl border border-studio-border" style={{ background: color }} /><input type="color" value={color} onChange={e => setColor(e.target.value)} className="relative w-full h-10 rounded-xl cursor-pointer bg-transparent border-0" /></div>
                </div>
                <div>
                  <label className="text-zinc-500 text-[11px] block mb-1.5">Background</label>
                  <div className="relative"><div className="absolute inset-0 rounded-xl border border-studio-border" style={{ background: bgColor }} /><input type="color" value={toHex7(bgColor)} onChange={e => setBgColor(e.target.value)} className="relative w-full h-10 rounded-xl cursor-pointer bg-transparent border-0" /></div>
                </div>
                <div>
                  <label className="text-zinc-500 text-[11px] block mb-1.5">Text</label>
                  <div className="relative"><div className="absolute inset-0 rounded-xl border border-studio-border" style={{ background: textColor }} /><input type="color" value={toHex7(textColor)} onChange={e => setTextColor(e.target.value)} className="relative w-full h-10 rounded-xl cursor-pointer bg-transparent border-0" /></div>
                </div>
              </div>
            </section>
            <section>
              <SectionTitle>Animation</SectionTitle>
              <div className="grid grid-cols-5 gap-1.5">
                {(['none', 'pulse', 'bounce', 'fade', 'slide'] as const).map(a => (
                  <button key={a} onClick={() => setAnim(a)} className={`py-1.5 rounded-lg text-[11px] font-medium capitalize transition-all border ${anim === a ? 'bg-white/10 text-white border-white/15' : 'bg-studio-800/50 text-zinc-500 border-studio-border hover:text-zinc-300'}`}>{a}</button>
                ))}
              </div>
            </section>
          </div>
          <div className="p-6 border-t border-studio-border">
            <button onClick={copyUrl} className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 active:scale-[0.98] text-white" style={{ background: color, boxShadow: `0 4px 20px ${color}30` }}>{copied ? 'Copied!' : 'Copy Widget URL'}</button>
            <p className="text-zinc-600 text-[10px] mt-3 font-mono break-all leading-relaxed">{widgetUrl}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
