'use client'

import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-studio-950 flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <p className="text-signal text-xs font-mono font-medium tracking-widest uppercase mb-3">Widget</p>
          <h1 className="text-white font-display text-4xl md:text-5xl font-bold tracking-tight">Overlay Stream OBS</h1>
        </div>
        <div className="grid gap-4">
          <button onClick={() => router.push('/glass')} className="group w-full text-left p-5 rounded-2xl border border-studio-border bg-studio-900 hover:bg-studio-800 hover:border-white/10 transition-all duration-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-signal/10 flex items-center justify-center flex-shrink-0">
                <div className="w-6 h-6 rounded-full bg-signal/30 group-hover:bg-signal/50 transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-display font-semibold text-base">Glass Tipjar</h3>
                <p className="text-zinc-500 text-sm mt-0.5">Glass Tipjar</p>
              </div>
              <div className="text-zinc-600 group-hover:text-zinc-400 transition-colors flex-shrink-0"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
            </div>
          </button>
        </div>
        <p className="text-center text-zinc-700 text-xs mt-8 font-mono">v1.0 &middot; Built for OBS Browser Source</p>
      </div>
    </div>
  )
}
