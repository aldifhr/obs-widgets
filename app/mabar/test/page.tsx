'use client'

import { useState } from 'react'

export default function MabarTestPage() {
  const [result, setResult] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [inputName, setInputName] = useState('')

  const sendJoin = (n: string) => {
    if (!n.trim()) return
    window.dispatchEvent(new CustomEvent('mabar-test-join', { detail: { name: n.trim() } }))
    setResult(`Joined: ${n}`)
    setHistory(prev => [`[JOIN] ${n}`, ...prev.slice(0, 19)])
    setInputName('')
  }

  const presets = ['Budi', 'Sari', 'Raka', 'Dina', 'Andi', 'Maya', 'Reza', 'Luna', 'Fajar', 'Nisa']

  return (
    <div className="min-h-screen bg-studio-950 flex items-center justify-center p-8">
      <div className="max-w-lg w-full space-y-6">
        <div className="text-center">
          <p className="text-signal text-xs font-mono font-medium tracking-widest uppercase mb-2">Queue Mabar Test</p>
          <h1 className="text-white font-display text-2xl font-bold">Mabar Test Tool</h1>
          <p className="text-zinc-500 text-xs mt-1">Test antrian mabar — buka widget di tab lain</p>
        </div>

        <div className="bg-studio-900 border border-studio-border rounded-2xl p-5 space-y-4">
          <p className="text-zinc-400 text-xs font-medium">Quick Join</p>
          <div className="grid grid-cols-2 gap-2">
            {presets.map(n => (
              <button key={n} onClick={() => sendJoin(n)} className="py-2 px-3 rounded-xl text-xs font-medium border border-studio-border bg-studio-800/50 text-zinc-400 hover:bg-studio-800 hover:text-white hover:border-white/15 transition-all active:scale-[0.95]">
                {n}
              </button>
            ))}
          </div>

          <p className="text-zinc-400 text-xs font-medium pt-2">Custom Name</p>
          <div className="flex gap-2">
            <input value={inputName} onChange={e => setInputName(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendJoin(inputName)} placeholder="Nama pemain..." className="flex-1 bg-studio-800/50 border border-studio-border rounded-xl px-3 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-white/20 transition-colors" />
            <button onClick={() => sendJoin(inputName)} disabled={!inputName.trim()} className="px-4 py-2.5 rounded-xl text-xs font-medium border border-studio-border bg-studio-800/50 text-zinc-400 hover:bg-studio-800 hover:text-white hover:border-white/15 transition-all active:scale-[0.95] disabled:opacity-30">
              Join
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-studio-900 border border-studio-border rounded-2xl p-4">
            <p className="text-zinc-400 text-xs mb-1">Last</p>
            <code className="text-emerald-400 text-xs font-mono">{result}</code>
          </div>
        )}

        {history.length > 0 && (
          <div className="bg-studio-900 border border-studio-border rounded-2xl p-4">
            <p className="text-zinc-400 text-xs mb-2">History</p>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {history.map((h, i) => (
                <div key={i} className="text-zinc-500 text-xs font-mono">{h}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
