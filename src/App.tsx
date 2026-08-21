import { useState, useEffect, useRef, useCallback } from 'react'

const PLATFORMS = {
  youtube: {
    name: 'YouTube',
    color: '#FF0000',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
  twitch: {
    name: 'Twitch',
    color: '#9146FF',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/>
      </svg>
    ),
  },
  instagram: {
    name: 'Instagram',
    color: '#E4405F',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
  },
  tiktok: {
    name: 'TikTok',
    color: '#00f2ea',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
      </svg>
    ),
  },
  twitter: {
    name: 'X / Twitter',
    color: '#FFFFFF',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  discord: {
    name: 'Discord',
    color: '#5865F2',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.077 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/>
      </svg>
    ),
  },
  kick: {
    name: 'Kick',
    color: '#53FC19',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M2 2h6v6H2V2zm0 8h6v6H2v-6zm8-8h6v6h-6V2zm0 8h6v6h-6v-6zm8-8h6v6h-6V2zm0 8h6v6h-6v-6z"/>
      </svg>
    ),
  },
}

const PLATFORM_KEYS = Object.keys(PLATFORMS) as Platform[]
type Platform = keyof typeof PLATFORMS
type Transition = 'fade' | 'slide' | 'zoom'

const WIDGETS = [
  {
    id: 'social-follow',
    name: 'Social Follow',
    desc: 'Single platform — show your handle with an animated icon',
    category: 'Social',
  },
  {
    id: 'social-rotator',
    name: 'Social Rotator',
    desc: 'Cycle through multiple platforms with smooth transitions',
    category: 'Social',
  },
] as const

type WidgetId = (typeof WIDGETS)[number]['id']

/* ── Social Follow ── */

function SocialFollowCustomizer() {
  const params = new URLSearchParams(window.location.search)
  const [platform, setPlatform] = useState<Platform>((params.get('platform') as Platform) || 'youtube')
  const [handle, setHandle] = useState(params.get('handle') || '@faray')
  const [color, setColor] = useState(params.get('color') || PLATFORMS[platform].color)
  const [bgColor, setBgColor] = useState(params.get('bg') || '#000000')
  const [size, setSize] = useState(Number(params.get('size')) || 64)
  const [anim, setAnim] = useState(params.get('anim') || 'pulse')
  const [copied, setCopied] = useState(false)
  const [iconPhase, setIconPhase] = useState<'visible' | 'exiting' | 'entering'>('visible')
  const prevPlatform = useRef(platform)
  const showWidget = !!params.get('hide')

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

  const widgetUrl = `${window.location.origin}${window.location.pathname}?widget=social-follow&platform=${platform}&handle=${encodeURIComponent(handle)}&color=${encodeURIComponent(color)}&bg=${encodeURIComponent(bgColor)}&size=${size}&anim=${anim}&hide=1`

  const copyUrl = () => { navigator.clipboard.writeText(widgetUrl); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  const animClass = anim === 'pulse' ? 'animate-[pulse_2s_ease-in-out_infinite]' : anim === 'bounce' ? 'animate-[bounce_1.5s_ease-in-out_infinite]' : anim === 'fade' ? 'animate-[fade_3s_ease-in-out_infinite]' : anim === 'slide' ? 'animate-[slide_2s_ease-in-out_infinite]' : ''

  if (showWidget) {
    return (
      <div className="flex items-center justify-center" style={{ background: bgColor, minHeight: '100vh' }}>
        <div className={`flex items-center rounded-full border border-white/10 backdrop-blur-xl ${animClass}`} style={{ gap: size * 0.3, padding: `${size * 0.3}px ${size * 0.5}px`, background: 'rgba(255,255,255,0.06)', boxShadow: `0 0 ${size * 0.4}px ${color}40` }}>
          <div style={{ width: size, height: size, color, flexShrink: 0, ...iconStyle }} className="drop-shadow-lg">{p.icon}</div>
          <span className="text-white font-bold whitespace-nowrap" style={{ fontSize: size * 0.32 }}>{handle}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-studio-950 flex flex-col">
      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="flex-1 flex items-center justify-center p-8 min-h-[50vh] lg:min-h-0" style={{ background: bgColor, transition: 'background 0.5s ease' }}>
          <div className={`flex items-center rounded-full border border-white/10 backdrop-blur-xl shadow-2xl ${animClass}`} style={{ gap: size * 0.3, padding: `${size * 0.3}px ${size * 0.5}px`, background: 'rgba(255,255,255,0.06)', boxShadow: `0 0 ${size * 0.6}px ${color}30, 0 8px 32px rgba(0,0,0,0.4)` }}>
            <div style={{ width: size, height: size, color, flexShrink: 0, ...iconStyle }} className="drop-shadow-lg">{p.icon}</div>
            <span className="text-white font-bold whitespace-nowrap drop-shadow" style={{ fontSize: size * 0.32 }}>{handle}</span>
          </div>
        </div>
        <div className="w-full lg:w-[380px] bg-studio-900 border-l border-studio-border p-6 overflow-y-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300" style={{ background: `${color}20`, color }}>{p.icon}</div>
            <div>
              <h2 className="text-white font-display text-lg font-semibold leading-tight">Social Follow</h2>
              <p className="text-zinc-500 text-xs font-mono">single platform</p>
            </div>
          </div>
          <div className="space-y-5">
            <Field label="Platform">
              <div className="grid grid-cols-4 gap-2">
                {PLATFORM_KEYS.map(k => (
                  <button key={k} onClick={() => { setPlatform(k); setColor(PLATFORMS[k].color) }} className={`relative flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all duration-300 ${platform === k ? 'border-white/20 bg-white/10' : 'border-studio-border bg-studio-800 hover:border-white/10 hover:bg-white/5'}`}>
                    <div className="w-5 h-5 transition-colors duration-300" style={{ color: platform === k ? PLATFORMS[k].color : undefined }}>{PLATFORMS[k].icon}</div>
                    <span className={`text-[10px] font-medium transition-colors duration-300 ${platform === k ? 'text-white' : 'text-zinc-500'}`}>{PLATFORMS[k].name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Handle"><input value={handle} onChange={e => setHandle(e.target.value)} className="w-full bg-studio-800 border border-studio-border rounded-xl px-3 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-white/20 transition-colors" placeholder="@username" /></Field>
            <Field label="Icon Size" hint={`${size}px`}>
              <input type="range" min="24" max="128" value={size} onChange={e => setSize(Number(e.target.value))} className="w-full h-1.5 bg-studio-700 rounded-full appearance-none cursor-pointer" style={{ accentColor: color }} />
              <div className="flex justify-between text-[10px] text-zinc-600 mt-1 font-mono"><span>24</span><span>128</span></div>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Accent"><div className="relative"><div className="absolute inset-0 rounded-xl border border-studio-border" style={{ background: color, transition: 'background 0.3s ease' }} /><input type="color" value={color} onChange={e => setColor(e.target.value)} className="relative w-full h-10 rounded-xl cursor-pointer bg-transparent border-0" /></div></Field>
              <Field label="Background"><div className="relative"><div className="absolute inset-0 rounded-xl border border-studio-border" style={{ background: bgColor, transition: 'background 0.3s ease' }} /><input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="relative w-full h-10 rounded-xl cursor-pointer bg-transparent border-0" /></div></Field>
            </div>
            <Field label="Animation">
              <div className="grid grid-cols-5 gap-1.5">
                {(['none', 'pulse', 'bounce', 'fade', 'slide'] as const).map(a => (
                  <button key={a} onClick={() => setAnim(a)} className={`py-1.5 rounded-lg text-[11px] font-medium capitalize transition-all ${anim === a ? 'bg-white/15 text-white border border-white/20' : 'bg-studio-800 text-zinc-500 border border-studio-border hover:text-zinc-300'}`}>{a}</button>
                ))}
              </div>
            </Field>
          </div>
          <div className="mt-8 pt-5 border-t border-studio-border">
            <button onClick={copyUrl} className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 active:scale-[0.98]" style={{ background: color, color: '#fff', boxShadow: `0 4px 20px ${color}40` }}>{copied ? 'Copied!' : 'Copy Widget URL'}</button>
            <p className="text-zinc-600 text-[10px] mt-3 font-mono break-all leading-relaxed">{widgetUrl}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Social Rotator ── */

function SocialRotatorCustomizer() {
  const params = new URLSearchParams(window.location.search)
  const showWidget = !!params.get('hide')

  const parseList = (key: string, fallback: string[]) => {
    const v = params.get(key)
    return v ? v.split(',').filter(Boolean) : fallback
  }

  const [enabled, setEnabled] = useState<Platform[]>(() => parseList('platforms', ['youtube', 'tiktok', 'instagram']) as Platform[])
  const [handles, setHandles] = useState<Record<Platform, string>>(() => {
    const single = params.get('handle')
    const list = params.get('handles')?.split(',')
    const result: Record<string, string> = {}
    PLATFORM_KEYS.forEach((k, i) => { result[k] = single || list?.[i] || `@${k}` })
    return result as Record<Platform, string>
  })
  const [interval, setInterval_] = useState(Number(params.get('interval')) || 3000)
  const [transition, setTransition] = useState<Transition>((params.get('transition') as Transition) || 'fade')
  const [bgColor, setBgColor] = useState(params.get('bg') || '#000000')
  const [size, setSize] = useState(Number(params.get('size')) || 64)
  const [anim, setAnim] = useState(params.get('anim') || 'none')
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
    }, 350)
  }, [activePlatforms.length])

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
    widget: 'social-rotator',
    platforms: activePlatforms.join(','),
    handles: activePlatforms.map(k => handles[k]).join(','),
    interval: String(interval),
    transition,
    bg: bgColor,
    size: String(size),
    anim,
    hide: '1',
  })
  const widgetUrl = `${window.location.origin}${window.location.pathname}?${widgetParams.toString()}`

  const copyUrl = () => { navigator.clipboard.writeText(widgetUrl); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  const animClass = anim === 'pulse' ? 'animate-[pulse_2s_ease-in-out_infinite]' : anim === 'bounce' ? 'animate-[bounce_1.5s_ease-in-out_infinite]' : anim === 'fade' ? 'animate-[fade_3s_ease-in-out_infinite]' : anim === 'slide' ? 'animate-[slide_2s_ease-in-out_infinite]' : ''

  const transStyle: React.CSSProperties = transition === 'fade'
    ? { transition: 'opacity 0.35s ease', opacity: transDir === 'out' ? 0 : 1 }
    : transition === 'slide'
    ? { transition: 'transform 0.35s ease, opacity 0.35s ease', transform: transDir === 'out' ? 'translateX(-30px)' : 'translateX(0)', opacity: transDir === 'out' ? 0 : 1 }
    : { transition: 'transform 0.35s ease, opacity 0.35s ease', transform: transDir === 'out' ? 'scale(0.85)' : 'scale(1)', opacity: transDir === 'out' ? 0 : 1 }

  const widget = (
    <div className="flex items-center justify-center" style={{ background: bgColor, minHeight: showWidget ? '100vh' : '50vh' }}>
      <div className={`flex items-center rounded-full border border-white/10 backdrop-blur-xl ${animClass}`} style={{ gap: size * 0.3, padding: `${size * 0.3}px ${size * 0.5}px`, background: 'rgba(255,255,255,0.06)', boxShadow: `0 0 ${size * 0.6}px ${p.color}30, 0 8px 32px rgba(0,0,0,0.4)`, transition: 'box-shadow 0.5s ease' }}>
        <div key={current} style={{ width: size, height: size, color: p.color, flexShrink: 0, ...transStyle }} className="drop-shadow-lg">{p.icon}</div>
        <div key={`handle-${current}`} style={{ ...transStyle, fontSize: size * 0.32 }} className="text-white font-bold whitespace-nowrap drop-shadow">{handles[current]}</div>
      </div>
    </div>
  )

  if (showWidget) return widget

  return (
    <div className="min-h-screen bg-studio-950 flex flex-col">
      <div className="flex-1 flex flex-col lg:flex-row">
        {widget}
        <div className="w-full lg:w-[400px] bg-studio-900 border-l border-studio-border p-6 overflow-y-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-signal"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
            </div>
            <div>
              <h2 className="text-white font-display text-lg font-semibold leading-tight">Social Rotator</h2>
              <p className="text-zinc-500 text-xs font-mono">auto-cycle platforms</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Platforms toggle */}
            <Field label="Platforms">
              <div className="grid grid-cols-4 gap-2">
                {PLATFORM_KEYS.map(k => {
                  const active = enabled.includes(k)
                  return (
                    <button key={k} onClick={() => togglePlatform(k)} className={`relative flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all duration-300 ${active ? 'border-white/20 bg-white/10' : 'border-studio-border bg-studio-800 opacity-40 hover:opacity-70'}`}>
                      <div className="w-5 h-5" style={{ color: active ? PLATFORMS[k].color : '#555' }}>{PLATFORMS[k].icon}</div>
                      <span className={`text-[10px] font-medium ${active ? 'text-white' : 'text-zinc-600'}`}>{PLATFORMS[k].name.split(' ')[0]}</span>
                      {active && <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-signal" />}
                    </button>
                  )
                })}
              </div>
            </Field>

            {/* Per-platform handles */}
            <Field label="Handles">
              <div className="space-y-2">
                {enabled.map(k => (
                  <div key={k} className="flex items-center gap-2">
                    <div className="w-5 h-5 flex-shrink-0" style={{ color: PLATFORMS[k].color }}>{PLATFORMS[k].icon}</div>
                    <input value={handles[k]} onChange={e => setHandles(prev => ({ ...prev, [k]: e.target.value }))} className="flex-1 bg-studio-800 border border-studio-border rounded-lg px-2.5 py-1.5 text-white text-xs placeholder-zinc-600 focus:outline-none focus:border-white/20 transition-colors" placeholder={`@${k}`} />
                  </div>
                ))}
              </div>
            </Field>

            {/* Interval */}
            <Field label="Interval" hint={`${(interval / 1000).toFixed(1)}s`}>
              <input type="range" min="1000" max="8000" step="500" value={interval} onChange={e => setInterval_(Number(e.target.value))} className="w-full h-1.5 bg-studio-700 rounded-full appearance-none cursor-pointer" style={{ accentColor: '#B4FF39' }} />
              <div className="flex justify-between text-[10px] text-zinc-600 mt-1 font-mono"><span>1s</span><span>8s</span></div>
            </Field>

            {/* Transition */}
            <Field label="Transition">
              <div className="grid grid-cols-3 gap-2">
                {(['fade', 'slide', 'zoom'] as const).map(t => (
                  <button key={t} onClick={() => setTransition(t)} className={`py-2 rounded-lg text-[11px] font-medium capitalize transition-all ${transition === t ? 'bg-white/15 text-white border border-white/20' : 'bg-studio-800 text-zinc-500 border border-studio-border hover:text-zinc-300'}`}>{t}</button>
                ))}
              </div>
            </Field>

            {/* Size */}
            <Field label="Icon Size" hint={`${size}px`}>
              <input type="range" min="24" max="128" value={size} onChange={e => setSize(Number(e.target.value))} className="w-full h-1.5 bg-studio-700 rounded-full appearance-none cursor-pointer" style={{ accentColor: '#B4FF39' }} />
              <div className="flex justify-between text-[10px] text-zinc-600 mt-1 font-mono"><span>24</span><span>128</span></div>
            </Field>

            {/* BG color */}
            <Field label="Background">
              <div className="relative"><div className="absolute inset-0 rounded-xl border border-studio-border" style={{ background: bgColor }} /><input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="relative w-full h-10 rounded-xl cursor-pointer bg-transparent border-0" /></div>
            </Field>

            {/* Widget animation */}
            <Field label="Widget Animation">
              <div className="grid grid-cols-5 gap-1.5">
                {(['none', 'pulse', 'bounce', 'fade', 'slide'] as const).map(a => (
                  <button key={a} onClick={() => setAnim(a)} className={`py-1.5 rounded-lg text-[11px] font-medium capitalize transition-all ${anim === a ? 'bg-white/15 text-white border border-white/20' : 'bg-studio-800 text-zinc-500 border border-studio-border hover:text-zinc-300'}`}>{a}</button>
                ))}
              </div>
            </Field>
          </div>

          <div className="mt-8 pt-5 border-t border-studio-border">
            <button onClick={copyUrl} className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 active:scale-[0.98] bg-signal text-studio-950" style={{ boxShadow: '0 4px 20px #B4FF3940' }}>{copied ? 'Copied!' : 'Copy Widget URL'}</button>
            <p className="text-zinc-600 text-[10px] mt-3 font-mono break-all leading-relaxed">{widgetUrl}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Shared ── */

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-zinc-400 text-xs font-medium">{label}</label>
        {hint && <span className="text-zinc-600 text-[11px] font-mono">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

function Collection({ onSelect }: { onSelect: (id: WidgetId) => void }) {
  return (
    <div className="min-h-screen bg-studio-950 flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <p className="text-signal text-xs font-mono font-medium tracking-widest uppercase mb-3">Widget Collection</p>
          <h1 className="text-white font-display text-4xl md:text-5xl font-bold tracking-tight">OBS Widgets</h1>
          <p className="text-zinc-500 mt-3 text-sm max-w-md mx-auto">Pick a widget, customize it, grab the URL, and drop it into your OBS scene.</p>
        </div>
        <div className="grid gap-4">
          {WIDGETS.map(w => (
            <button key={w.id} onClick={() => onSelect(w.id)} className="group w-full text-left p-5 rounded-2xl border border-studio-border bg-studio-900 hover:bg-studio-800 hover:border-white/10 transition-all duration-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-signal/10 flex items-center justify-center flex-shrink-0">
                  <div className="w-6 h-6 rounded-full bg-signal/30 group-hover:bg-signal/50 transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-display font-semibold text-base">{w.name}</h3>
                  <p className="text-zinc-500 text-sm mt-0.5">{w.desc}</p>
                </div>
                <div className="text-zinc-600 group-hover:text-zinc-400 transition-colors flex-shrink-0"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
              </div>
            </button>
          ))}
        </div>
        <p className="text-center text-zinc-700 text-xs mt-8 font-mono">v1.0 &middot; Built for OBS Browser Source</p>
      </div>
    </div>
  )
}

/* ── App ── */

function App() {
  const params = new URLSearchParams(window.location.search)
  const [activeWidget, setActiveWidget] = useState<WidgetId | null>(() => {
    if (params.get('hide')) {
      const w = params.get('widget')
      if (w === 'social-rotator') return 'social-rotator'
      return 'social-follow'
    }
    return null
  })

  if (activeWidget === 'social-rotator') return <SocialRotatorCustomizer />
  if (activeWidget === 'social-follow') return <SocialFollowCustomizer />
  return <Collection onSelect={setActiveWidget} />
}

export default App
