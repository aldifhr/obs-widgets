export type WidgetId = 'social-follow' | 'social-rotator'

const WIDGETS = [
  { id: 'social-follow' as const, name: 'Social Follow', desc: 'Single platform — show your handle with an animated icon' },
  { id: 'social-rotator' as const, name: 'Social Rotator', desc: 'Cycle through multiple platforms with smooth transitions' },
]

export function Collection({ onSelect }: { onSelect: (id: WidgetId) => void }) {
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
