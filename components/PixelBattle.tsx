'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'

interface Fighter {
  id: string
  name: string
  x: number
  y: number
  vx: number
  vy: number
  hp: number
  color: string
  facing: 1 | -1
  attacking: boolean
}

const COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3', '#A8D8EA', '#FFDAC1', '#B5EAD7']
const MAX_FIGHTERS = 10
const ARENA_W = 600
const ARENA_H = 280
const SIZE = 20

export function PixelBattle() {
  const searchParams = useSearchParams()
  const showWidget = searchParams.has('hide')

  useEffect(() => {
    if (showWidget) {
      document.documentElement.style.background = 'transparent'
      document.body.style.background = 'transparent'
      document.body.style.minHeight = '100vh'
    }
  }, [showWidget])

  const [fighters, setFighters] = useState<Fighter[]>([])
  const fightersRef = useRef<Fighter[]>([])
  fightersRef.current = fighters
  const rafRef = useRef<number>(0)

  // spawn / remove helpers
  const spawn = (name: string) => {
    setFighters(prev => {
      if (prev.length >= MAX_FIGHTERS) return prev
      if (prev.some(f => f.name.toLowerCase() === name.toLowerCase())) return prev
      const f: Fighter = {
        id: name + Date.now(),
        name,
        x: Math.random() * (ARENA_W - SIZE),
        y: Math.random() * (ARENA_H - SIZE),
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        hp: 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        facing: Math.random() > 0.5 ? 1 : -1,
        attacking: false,
      }
      return [...prev, f]
    })
  }

  const remove = (name: string) => {
    setFighters(prev => prev.filter(f => f.name.toLowerCase() !== name.toLowerCase()))
  }

  // mock TikTok chat integration via SSE + manual test
  useEffect(() => {
    // listen to tako webhook SSE for chat/viewer events (future)
    const es = new EventSource('/api/tako/webhook')
    es.onmessage = (e) => {
      try {
        const d = JSON.parse(e.data)
        if (d.kind === 'chat' || d.kind === 'viewer' || d.kind === 'member') {
          if (d.action === 'leave') remove(d.user || d.name)
          else spawn(d.user || d.name || 'Viewer')
        }
        // also treat gift/like as spawn trigger for now
        if (d.kind === 'gift' || d.kind === 'like') {
          const n = d.user || 'Viewer'
          if (!fightersRef.current.some(f => f.name === n)) spawn(n)
        }
      } catch {}
    }
    return () => es.close()
  }, [])

  // game loop: move + fight
  useEffect(() => {
    const tick = () => {
      setFighters(prev => {
        let next = prev.map(f => {
          let nx = f.x + f.vx
          let ny = f.y + f.vy
          let nvx = f.vx
          let nvy = f.vy
          if (nx < 0 || nx > ARENA_W - SIZE) { nvx *= -1; nx = Math.max(0, Math.min(ARENA_W - SIZE, nx)) }
          if (ny < 0 || ny > ARENA_H - SIZE) { nvy *= -1; ny = Math.max(0, Math.min(ARENA_H - SIZE, ny)) }
          // random jitter
          if (Math.random() < 0.02) { nvx += (Math.random() - 0.5) * 0.4; nvy += (Math.random() - 0.5) * 0.4 }
          nvx = Math.max(-1.5, Math.min(1.5, nvx))
          nvy = Math.max(-1.5, Math.min(1.5, nvy))
          const facing = nvx > 0 ? 1 as const : nvx < 0 ? -1 as const : f.facing
          return { ...f, x: nx, y: ny, vx: nvx, vy: nvy, facing, attacking: false }
        })

        // fight: if two fighters close, both lose hp and flash attacking
        for (let i = 0; i < next.length; i++) {
          for (let j = i + 1; j < next.length; j++) {
            const a = next[i], b = next[j]
            const dx = a.x - b.x, dy = a.y - b.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < SIZE + 6) {
              // push apart
              const push = 1.2
              const nx = dx / (dist || 1), ny = dy / (dist || 1)
              next[i] = { ...a, x: a.x + nx * push, y: a.y + ny * push, hp: Math.max(0, a.hp - 0.6), attacking: true }
              next[j] = { ...b, x: b.x - nx * push, y: b.y - ny * push, hp: Math.max(0, b.hp - 0.6), attacking: true }
              // bounce
              next[i].vx += nx * 0.3; next[i].vy += ny * 0.3
              next[j].vx -= nx * 0.3; next[j].vy -= ny * 0.3
            }
          }
        }
        // remove dead
        next = next.filter(f => f.hp > 0)
        return next
      })
      rafRef.current = requestAnimationFrame(tick) as unknown as number
    }
    // use interval ~ 30fps for less CPU than rAF
    const id = setInterval(tick, 33)
    return () => clearInterval(id)
  }, [])

  const [input, setInput] = useState('')
  const accent = '#FFC53D'

  const names = ['Budi', 'Sari', 'Raka', 'Dina', 'Andi', 'Maya', 'Reza', 'Luna', 'Fajar', 'Nisa', 'Joko', 'Tika']

  const PixelChar = ({ f }: { f: Fighter }) => (
    <div
      className="absolute select-none"
      style={{
        left: f.x,
        top: f.y,
        width: SIZE,
        height: SIZE,
        transform: `scaleX(${f.facing})`,
        imageRendering: 'pixelated',
        transition: 'filter 0.1s',
        filter: f.attacking ? 'brightness(1.6)' : 'none',
      }}
    >
      {/* head */}
      <div className="absolute" style={{ left: 6, top: 0, width: 8, height: 8, background: f.color, boxShadow: `inset -2px -2px 0 rgba(0,0,0,0.2)` }} />
      <div className="absolute" style={{ left: 7, top: 2, width: 2, height: 2, background: '#000' }} />
      <div className="absolute" style={{ left: 11, top: 2, width: 2, height: 2, background: '#000' }} />
      {/* body */}
      <div className="absolute" style={{ left: 4, top: 8, width: 12, height: 8, background: f.color, opacity: 0.9 }} />
      {/* arms */}
      <div className="absolute" style={{ left: 1, top: 9, width: 3, height: 6, background: f.color }} />
      <div className="absolute" style={{ left: 16, top: 9, width: 3, height: 6, background: f.color }} />
      {/* legs */}
      <div className="absolute" style={{ left: 5, top: 16, width: 4, height: 4, background: '#333' }} />
      <div className="absolute" style={{ left: 11, top: 16, width: 4, height: 4, background: '#333' }} />
      {/* hit effect */}
      {f.attacking && <div className="absolute" style={{ left: 18, top: 4, width: 4, height: 4, background: '#fff', boxShadow: '0 0 4px #fff' }} />}
    </div>
  )

  const Arena = () => (
    <div className="relative overflow-hidden" style={{ width: ARENA_W, height: ARENA_H, background: '#1a1a1e', border: '2px solid #2a2a2e', imageRendering: 'pixelated' }}>
      {/* grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
      {fighters.map(f => (
        <div key={f.id} className="absolute" style={{ left: f.x, top: f.y - 14, width: SIZE + 40, marginLeft: -20, textAlign: 'center', pointerEvents: 'none' }}>
          <div className="inline-flex flex-col items-center gap-0.5">
            <div className="px-1 py-0 rounded text-[7px] font-mono leading-none whitespace-nowrap" style={{ background: 'rgba(0,0,0,0.7)', color: '#fff', border: `1px solid ${f.color}60` }}>{f.name}</div>
            <div className="w-10 h-1 bg-black/60 rounded-full overflow-hidden">
              <div className="h-full transition-all" style={{ width: `${f.hp}%`, background: f.hp > 50 ? '#22c55e' : f.hp > 25 ? '#eab308' : '#ef4444' }} />
            </div>
          </div>
        </div>
      ))}
      {fighters.map(f => <PixelChar key={f.id + '-c'} f={f} />)}
      {fighters.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-zinc-600 font-mono text-xs">Menunggu viewer TikTok...</div>
      )}
    </div>
  )

  if (showWidget) {
    return (
      <div className="flex items-center justify-center p-4" style={{ minHeight: '100vh' }}>
        <Arena />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-studio-950 flex flex-col">
      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="flex-1 flex items-center justify-center p-8">
          <Arena />
        </div>
        <div className="w-full lg:w-[380px] bg-studio-900 border-l border-studio-border flex flex-col">
          <div className="p-6 border-b border-studio-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${accent}15`, color: accent }}>⚔️</div>
              <div>
                <h2 className="text-white font-display font-semibold">Pixel Battle</h2>
                <p className="text-zinc-500 text-xs font-mono">TikTok viewer fight • max 10</p>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="flex gap-2">
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (spawn(input.trim()), setInput(''))} placeholder="Nama viewer..." className="flex-1 bg-studio-800/50 border border-studio-border rounded-xl px-3 py-2 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-white/20" />
              <button onClick={() => { if (input.trim()) { spawn(input.trim()); setInput('') } }} className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-white text-xs hover:bg-white/15">Spawn</button>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {names.map(n => (
                <button key={n} onClick={() => spawn(n)} className="py-1.5 rounded-lg bg-studio-800/50 border border-studio-border text-zinc-400 text-xs hover:bg-studio-800 hover:text-white">{n}</button>
              ))}
            </div>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {fighters.map(f => (
                <div key={f.id} className="flex items-center justify-between bg-studio-800/30 border border-studio-border rounded-lg px-2 py-1.5">
                  <span className="text-zinc-300 text-xs font-mono flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: f.color }} /> {f.name} <span className="text-zinc-600">{Math.round(f.hp)} HP</span>
                  </span>
                  <button onClick={() => remove(f.name)} className="text-zinc-500 hover:text-red-400 text-xs">✕</button>
                </div>
              ))}
              {fighters.length === 0 && <div className="text-zinc-600 text-xs text-center py-2">Belum ada fighter</div>}
            </div>
            <div className="text-zinc-600 text-[10px] font-mono text-center">{fighters.length}/10 fighters • saling tabrak = berantem • HP 0 = mati</div>
          </div>
          <div className="p-6 border-t border-studio-border">
            <div className="bg-studio-800/30 border border-studio-border rounded-xl p-3">
              <p className="text-zinc-500 text-[10px] font-mono">Widget URL (OBS Browser Source):</p>
              <p className="text-zinc-400 text-[10px] font-mono break-all mt-1">{typeof window !== 'undefined' ? `${window.location.origin}/battle?hide=1` : ''}</p>
              <p className="text-zinc-600 text-[9px] mt-2">TikTok live chat auto spawn (via VPS tiktok-wss). Viewer leave = auto hilang.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
