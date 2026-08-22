'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { SectionTitle } from '../lib/platforms'
import { useTakoEvents } from '../lib/tako'
import type { TakoEvent } from '../lib/tako'

const MAX_COINS = 40
const MILESTONES = [0.25, 0.5, 0.75, 1]

function GlassJarSvg({ pct, liquidColor, flash }: { pct: number; liquidColor: string; flash: boolean }) {
  return (
    <svg viewBox="0 0 140 190" className="w-full h-auto" style={{ maxWidth: 160 }}>
      <defs>
        <clipPath id="gj-clip"><rect x={8} y={32} width={124} height={148} rx={14} /></clipPath>
        <linearGradient id="gj-liquid" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={liquidColor} />
          <stop offset="100%" stopColor={`${liquidColor}cc`} />
        </linearGradient>
      </defs>
      <rect x={22} y={8} width={96} height={16} rx={6} fill="#B08655" />
      <rect x={22} y={18} width={96} height={4} fill="#8a6640" />
      <rect x={6} y={22} width={128} height={160} rx={16} fill="rgba(255,255,255,0.3)" stroke="rgba(58,37,64,0.2)" strokeWidth={2.5}
        style={{ filter: flash ? `drop-shadow(0 0 12px ${liquidColor})` : 'drop-shadow(0 18px 30px -12px rgba(58,37,64,0.15))' }} />
      <g clipPath="url(#gj-clip)">
        <rect x={8} y={32 + 148 * (1 - pct)} width={124} height={148 * pct} fill="url(#gj-liquid)"
          style={{ transition: 'height 0.9s cubic-bezier(.22,.9,.3,1), y 0.9s cubic-bezier(.22,.9,.3,1)' }} />
        {pct > 0.02 && (
          <ellipse cx={70} cy={32 + 148 * (1 - pct)} rx={64} ry={6} fill={liquidColor} opacity={0.5}>
            <animate attributeName="cy" values={`${32 + 148 * (1 - pct)};${29 + 148 * (1 - pct)};${32 + 148 * (1 - pct)}`} dur="3.2s" repeatCount="indefinite" />
          </ellipse>
        )}
      </g>
      <rect x={16} y={30} width={8} height={120} rx={4} fill="rgba(255,255,255,0.35)" />
      <rect x={28} y={30} width={4} height={40} rx={2} fill="rgba(255,255,255,0.2)" />
      <rect x={68} y={28} width={3} height={100} rx={1.5} fill="rgba(255,255,255,0.12)" />
      <rect x={108} y={30} width={6} height={80} rx={3} fill="rgba(255,255,255,0.08)" />
    </svg>
  )
}

function CoinDrop({ color, id }: { color: string; id: string }) {
  return (
    <div
      key={id}
      className="absolute gj-coin-drop gj-anim"
      style={{
        left: '50%',
        top: '0%',
        width: 14,
        height: 14,
        borderRadius: '50%',
        background: `radial-gradient(circle at 35% 35%, ${color}, ${color}aa)`,
        boxShadow: `0 0 6px ${color}60`,
        transform: 'translateX(-50%)',
        animationDuration: '0.65s',
        animationFillMode: 'both',
      }}
    />
  )
}

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  const filled = Math.round(pct * 10)
  return (
    <div className="flex gap-[2px]">
      {Array.from({ length: 10 }, (_, i) => (
        <div
          key={i}
          className="h-2 flex-1 transition-all duration-500"
          style={{
            background: i < filled ? color : 'rgba(255,255,255,0.08)',
            boxShadow: i < filled ? `0 0 4px ${color}40` : 'none',
          }}
        />
      ))}
    </div>
  )
}

function Confetti({ color, burst }: { color: string; burst: number }) {
  const particles = useMemo(() => {
    const colors = [color, '#FF6B9D', '#00D4AA', '#FFD93D', '#6C5CE7', '#FF8A5C']
    return Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: 40 + Math.random() * 16,
      y: 30 + Math.random() * 10,
      dx: (Math.random() - 0.5) * 80,
      dy: -(40 + Math.random() * 60),
      rot: Math.random() * 720 - 360,
      size: 2 + Math.random() * 3,
      color: colors[i % colors.length],
      delay: Math.random() * 200,
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color, burst])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute gj-confetti gj-anim"
          style={{
            left: `${(p.x / 140) * 100}%`,
            top: `${(p.y / 190) * 100}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            '--dx': `${p.dx}px`,
            '--dy': `${p.dy}px`,
            '--rot': `${p.rot}deg`,
            animationDelay: `${p.delay}ms`,
            animationDuration: '1.2s',
            animationFillMode: 'forwards',
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}

function fmtIDR(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

export function GlassJar() {
  const searchParams = useSearchParams()
  const showWidget = searchParams.has('hide')

  useEffect(() => {
    if (showWidget) {
      document.documentElement.style.background = 'transparent'
      document.body.style.background = 'transparent'
      document.body.style.minHeight = '100vh'
    }
  }, [showWidget])

  const [server, setServer] = useState(searchParams.get('server') || '')
  const [goal, setGoal] = useState(() => {
    const v = Number(searchParams.get('goal'))
    return v > 0 ? v : 500000
  })
  const [liquidColor, setLiquidColor] = useState(searchParams.get('liquid') || '#FFC53D')
  const [noBg, setNoBg] = useState(searchParams.has('nobg'))
  const [scale, setScale] = useState(() => {
    const v = Number(searchParams.get('scale'))
    return v > 0 ? v : 1
  })
  const [toastDur, setToastDur] = useState(() => {
    const v = Number(searchParams.get('toast'))
    return v > 0 ? v : 5000
  })
  const [copied, setCopied] = useState(false)

  const [total, setTotal] = useState(0)
  const [toast, setToast] = useState<{ name: string; amount: number; message: string; id: string } | null>(null)
  const [flash, setFlash] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [confettiBurst, setConfettiBurst] = useState(0)
  const [milestone, setMilestone] = useState<string | null>(null)
  const [combo, setCombo] = useState(1)
  const [shake, setShake] = useState(false)
  const [coinDrops, setCoinDrops] = useState<{ id: string; color: string }[]>([])
  const [topSupporter, setTopSupporter] = useState<{ name: string; total: number } | null>(null)

  const toastTimer = useRef<number>(0)
  const milestoneTimer = useRef<number>(0)
  const lastTipAt = useRef<number>(0)
  const milestonesHit = useRef<Set<number>>(new Set())
  const supporterTotals = useRef<Map<string, number>>(new Map())

  const fireMilestone = useCallback((label: string) => {
    setMilestone(label)
    setShowConfetti(true)
    setConfettiBurst(b => b + 1)
    setTimeout(() => setShowConfetti(false), 1500)
    clearTimeout(milestoneTimer.current)
    milestoneTimer.current = window.setTimeout(() => setMilestone(null), 2600)
  }, [])

  const handleEvent = useCallback((e: TakoEvent) => {
    if (e.kind !== 'tip') return
    setTotal(t => t + e.amount)

    const dropCount = Math.max(1, Math.round(e.amount / 5000))
    const newDrops = Array.from({ length: dropCount }, (_, i) => ({
      id: e.id + '-drop-' + Date.now() + '-' + i,
      color: liquidColor,
    }))
    setCoinDrops(drops => [...drops, ...newDrops].slice(-MAX_COINS))
    setTimeout(() => {
      setCoinDrops(drops => drops.filter(d => !newDrops.some(nd => nd.id === d.id)))
    }, 800)

    setFlash(true)
    setTimeout(() => setFlash(false), 600)

    const now = Date.now()
    const isStreak = now - lastTipAt.current < 8000
    lastTipAt.current = now
    setCombo(c => (isStreak ? Math.min(c + 1, 9) : 1))

    const prevTotal = supporterTotals.current.get(e.name) || 0
    const nextTotal = prevTotal + e.amount
    supporterTotals.current.set(e.name, nextTotal)
    setTopSupporter(cur => (!cur || nextTotal > cur.total ? { name: e.name, total: nextTotal } : cur))

    if (e.amount >= Math.max(goal * 0.1, 50000)) {
      setShake(true)
      setTimeout(() => setShake(false), 450)
    }

    setToast({ name: e.name, amount: e.amount, message: e.message, id: e.id + '-' + now })
    clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), toastDur)
  }, [toastDur, goal, liquidColor])

  const handleFakeTip = useCallback(() => {
    const amounts = [5000, 10000, 15000, 25000, 50000, 100000]
    const names = ['Budi', 'Sari', 'Raka', 'Dina', 'Andi', 'Maya']
    const messages = ['Mantap!', 'Semangat!', 'Keren!', '', 'GGWP', 'Lanjut!']
    const i = Math.floor(Math.random() * amounts.length)
    handleEvent({
      kind: 'tip',
      id: 'test-' + Date.now(),
      name: names[i],
      amount: amounts[i],
      message: messages[i],
      method: 'qris',
      createdAt: new Date().toISOString(),
      at: Date.now(),
    })
  }, [handleEvent])

  const status = useTakoEvents(server, handleEvent)

  const pct = Math.min(total / goal, 1)

  useEffect(() => {
    for (const t of MILESTONES) {
      if (pct >= t && !milestonesHit.current.has(t)) {
        milestonesHit.current.add(t)
        fireMilestone(t === 1 ? 'TARGET TERCAPAI!' : `${Math.round(t * 100)}% MENUJU TARGET!`)
        break
      }
    }
  }, [pct, fireMilestone])

  useEffect(() => {
    milestonesHit.current.clear()
  }, [goal])

  const widgetParams = new URLSearchParams({
    server, goal: String(goal), liquid: liquidColor,
    scale: String(scale), toast: String(toastDur), hide: '1',
  })
  if (noBg) widgetParams.set('nobg', '1')
  const [widgetUrl, setWidgetUrl] = useState('')
  useEffect(() => { setWidgetUrl(`${window.location.origin}/glass?${widgetParams.toString()}`) }, [widgetParams.toString()])
  const copyUrl = () => { navigator.clipboard.writeText(widgetUrl); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  const Widget = ({ standalone }: { standalone?: boolean }) => (
    <div className="relative">
      <div
        className={shake ? 'gj-shake gj-anim' : ''}
        style={{ animationDuration: shake ? '450ms' : undefined }}
      >
        <div className="flex flex-col items-center gap-3" style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}>
          {topSupporter && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(0,0,0,0.5)', border: `1px solid ${liquidColor}40`, fontFamily: "'Fraunces', serif", fontSize: 11, color: liquidColor }}
            >
              <span>{'\u{1F451}'}</span>
              <span>{topSupporter.name}</span>
              <span style={{ color: '#888' }}>· {fmtIDR(topSupporter.total)}</span>
            </div>
          )}

          <div className="relative">
            {showConfetti && <Confetti color={liquidColor} burst={confettiBurst} />}
            <div className="w-48 relative flex justify-center">
              <GlassJarSvg pct={pct} liquidColor={liquidColor} flash={flash} />
              {coinDrops.map(d => (
                <CoinDrop key={d.id} id={d.id} color={d.color} />
              ))}
            </div>
          </div>

          <div className="text-center" style={{ fontFamily: "'Fraunces', serif", color: '#fff', fontSize: 14 }}>
            {fmtIDR(total)}
          </div>

          <div className="w-48">
            <ProgressBar pct={pct} color={liquidColor} />
            <div className="flex justify-between mt-1" style={{ fontFamily: "'Fraunces', serif", fontSize: 7, color: '#666' }}>
              <span>{fmtIDR(total)}</span>
              <span>{fmtIDR(goal)}</span>
            </div>
          </div>

          {milestone && (
            <div
              key={milestone + confettiBurst}
              className="gj-milestone-pop gj-anim px-3 py-1.5 rounded-lg"
              style={{
                background: `${liquidColor}20`,
                border: `1px solid ${liquidColor}`,
                fontFamily: "'Fraunces', serif",
                fontSize: 9,
                color: liquidColor,
                animationDuration: '2.4s',
              }}
            >
              {milestone}
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div
          key={toast.id}
          className="gj-toast-bar gj-anim absolute left-1/2 -translate-x-1/2"
          style={{
            bottom: -36,
            background: 'rgba(0,0,0,0.85)',
            border: `1px solid ${liquidColor}40`,
            padding: '6px 14px',
            borderRadius: 8,
            whiteSpace: 'nowrap',
            animationDuration: '0.3s',
          }}
        >
          {combo > 1 && (
            <span className="mr-1 px-1 py-0.5 rounded-full" style={{ background: liquidColor, color: '#000', fontFamily: "'Fraunces', serif", fontSize: 7 }}>
              x{combo}
            </span>
          )}
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: 9, color: liquidColor }}>
            {toast.name} · {fmtIDR(toast.amount)}
          </span>
        </div>
      )}
    </div>
  )

  if (showWidget) {
    const content = <Widget standalone />
    return (
      <div className="flex items-center justify-center p-6" style={{ minHeight: '100vh' }}>
        {noBg ? content : (
          <div className="rounded-2xl p-6 relative" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', border: `1px solid ${liquidColor}20` }}>
            {content}
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
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${liquidColor}15`, color: liquidColor }}>
                <span style={{ fontFamily: "'Fraunces', serif", fontSize: 14 }}>{'\u{1F48E}'}</span>
              </div>
              <div>
                <h2 className="text-white font-display text-lg font-semibold leading-tight">Glass Tipjar</h2>
                <p className="text-zinc-500 text-xs font-mono">tako.id webhook</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <section>
              <SectionTitle>Bridge Server</SectionTitle>
              <input
                value={server}
                onChange={e => setServer(e.target.value)}
                className="w-full bg-studio-800/50 border border-studio-border rounded-xl px-3 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-white/20 transition-colors font-mono text-xs"
                placeholder="http://localhost:8787 (default)"
              />
              <div className="flex items-center gap-2 mt-2">
                <div className={`w-2 h-2 rounded-full ${status === 'open' ? 'bg-emerald-400' : status === 'connecting' ? 'bg-amber-400' : 'bg-red-400'}`} />
                <span className="text-zinc-500 text-[10px] font-mono">{status === 'open' ? 'connected' : status === 'connecting' ? 'connecting...' : 'disconnected'}</span>
              </div>
            </section>

            <section>
              <SectionTitle>Goal</SectionTitle>
              <input
                type="number"
                value={goal}
                onChange={e => setGoal(Math.max(0, Number(e.target.value)))}
                className="w-full bg-studio-800/50 border border-studio-border rounded-xl px-3 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-white/20 transition-colors"
              />
            </section>

            <section>
              <SectionTitle>Scale <span className="text-zinc-600 font-mono font-normal ml-1">{scale.toFixed(1)}x</span></SectionTitle>
              <input type="range" min="0.5" max="2" step="0.1" value={scale} onChange={e => setScale(Number(e.target.value))} className="w-full h-1.5 bg-studio-700 rounded-full appearance-none cursor-pointer" style={{ accentColor: liquidColor }} />
            </section>

            <section>
              <SectionTitle>Toast Duration <span className="text-zinc-600 font-mono font-normal ml-1">{(toastDur / 1000).toFixed(1)}s</span></SectionTitle>
              <input type="range" min="2000" max="10000" step="500" value={toastDur} onChange={e => setToastDur(Number(e.target.value))} className="w-full h-1.5 bg-studio-700 rounded-full appearance-none cursor-pointer" style={{ accentColor: liquidColor }} />
            </section>

            <section>
              <button onClick={() => setNoBg(n => !n)} className={`w-full py-2.5 rounded-xl text-xs font-medium border transition-all ${noBg ? 'border-white/30 bg-white/10 text-white' : 'border-studio-border bg-studio-800/50 text-zinc-500 hover:text-zinc-300'}`}>
                {noBg ? 'Background: Hidden' : 'Background: Visible'}
              </button>
            </section>

            <section>
              <SectionTitle>Colors</SectionTitle>
              <div>
                <label className="text-zinc-500 text-[11px] block mb-1.5">Liquid</label>
                <div className="relative"><div className="absolute inset-0 rounded-xl border border-studio-border" style={{ background: liquidColor }} /><input type="color" value={liquidColor} onChange={e => setLiquidColor(e.target.value)} className="relative w-full h-10 rounded-xl cursor-pointer bg-transparent border-0" /></div>
              </div>
            </section>

            <section>
              <SectionTitle>Test</SectionTitle>
              <button onClick={handleFakeTip} className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 active:scale-[0.98] border border-studio-border bg-studio-800/50 text-zinc-300 hover:bg-studio-800 hover:text-white hover:border-white/15">
                Test Tip
              </button>
            </section>
          </div>

          <div className="p-6 border-t border-studio-border">
            <button onClick={copyUrl} className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 active:scale-[0.98] text-studio-950" style={{ background: liquidColor, boxShadow: `0 4px 20px ${liquidColor}30` }}>
              {copied ? 'Copied!' : 'Copy Widget URL'}
            </button>
            <p className="text-zinc-600 text-[10px] mt-3 font-mono break-all leading-relaxed">{widgetUrl}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export { GlassJar as GlassTipjar }
