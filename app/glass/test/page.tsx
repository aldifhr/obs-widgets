'use client'

import { useState } from 'react'

export default function GlassTestPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [history, setHistory] = useState<string[]>([])

  const sendTip = async (n: string, a: number, m: string) => {
    setLoading(true)
    setResult('sending...')
    try {
      const r = await fetch('/api/tako/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'payment.success',
          data: { id: 'test-' + Date.now(), status: 'success', amount: a, price: a, paymentMethod: 'qris', createdAt: new Date().toISOString(), relatedGiftId: null, name: n, message: m },
        }),
      })
      const t = await r.text()
      setResult(t)
      setHistory(prev => [`[TIP] ${n} Rp${a.toLocaleString('id-ID')} ${m ? '- ' + m : ''}`, ...prev.slice(0, 19)])
    } catch (e: unknown) {
      setResult(String(e))
    }
    setLoading(false)
  }

  const sendLike = async (n: string, count: number) => {
    setLoading(true)
    try {
      const r = await fetch('/api/tako/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'like', data: { user: n, count } }),
      })
      const t = await r.text()
      setResult(t)
      setHistory(prev => [`[LIKE] ${n} x${count}`, ...prev.slice(0, 19)])
    } catch (e: unknown) {
      setResult(String(e))
    }
    setLoading(false)
  }

  const sendGift = async (n: string, gift: string, diamonds: number) => {
    setLoading(true)
    try {
      const r = await fetch('/api/tako/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'gift', data: { user: n, giftName: gift, diamondCount: diamonds, repeatCount: 1 } }),
      })
      const t = await r.text()
      setResult(t)
      setHistory(prev => [`[GIFT] ${n} ${gift} (${diamonds}💎)`, ...prev.slice(0, 19)])
    } catch (e: unknown) {
      setResult(String(e))
    }
    setLoading(false)
  }

  const tips = [
    { name: 'Budi', amount: 10000, message: 'Mantap!' },
    { name: 'Sari', amount: 25000, message: 'Semangat!' },
    { name: 'Raka', amount: 50000, message: 'GGWP!' },
    { name: 'Dina', amount: 100000, message: 'Lanjut!' },
  ]

  const likes = [
    { name: 'Viewer1', count: 5 },
    { name: 'Viewer2', count: 10 },
    { name: 'Viewer3', count: 25 },
  ]

  const gifts = [
    { name: 'Budi', gift: 'Rose', diamonds: 1 },
    { name: 'Sari', gift: 'Heart', diamonds: 5 },
    { name: 'Raka', gift: 'Fire', diamonds: 15 },
    { name: 'Dina', gift: 'Coffee', diamonds: 10 },
  ]

  return (
    <div className="min-h-screen bg-studio-950 flex items-center justify-center p-8">
      <div className="max-w-lg w-full space-y-6">
        <div className="text-center">
          <p className="text-signal text-xs font-mono font-medium tracking-widest uppercase mb-2">Glass Tipjar Test</p>
          <h1 className="text-white font-display text-2xl font-bold">Webhook Test Tool</h1>
          <p className="text-zinc-500 text-xs mt-1">Test tip, like, gift ke glass tipjar</p>
        </div>

        <div className="bg-studio-900 border border-studio-border rounded-2xl p-5 space-y-4">
          <p className="text-zinc-400 text-xs font-medium">Tips</p>
          <div className="grid grid-cols-2 gap-2">
            {tips.map(p => (
              <button key={p.name} onClick={() => sendTip(p.name, p.amount, p.message)} disabled={loading} className="py-2 px-3 rounded-xl text-xs font-medium border border-studio-border bg-studio-800/50 text-zinc-400 hover:bg-studio-800 hover:text-white hover:border-white/15 transition-all active:scale-[0.95] disabled:opacity-50">
                {p.name} · Rp{p.amount.toLocaleString('id-ID')}
              </button>
            ))}
          </div>

          <p className="text-zinc-400 text-xs font-medium pt-2">Likes</p>
          <div className="grid grid-cols-3 gap-2">
            {likes.map(p => (
              <button key={p.name} onClick={() => sendLike(p.name, p.count)} disabled={loading} className="py-2 px-3 rounded-xl text-xs font-medium border border-studio-border bg-studio-800/50 text-zinc-400 hover:bg-studio-800 hover:text-white hover:border-white/15 transition-all active:scale-[0.95] disabled:opacity-50">
                {p.name} · ❤️ x{p.count}
              </button>
            ))}
          </div>

          <p className="text-zinc-400 text-xs font-medium pt-2">Gifts</p>
          <div className="grid grid-cols-2 gap-2">
            {gifts.map(p => (
              <button key={p.name + p.gift} onClick={() => sendGift(p.name, p.gift, p.diamonds)} disabled={loading} className="py-2 px-3 rounded-xl text-xs font-medium border border-studio-border bg-studio-800/50 text-zinc-400 hover:bg-studio-800 hover:text-white hover:border-white/15 transition-all active:scale-[0.95] disabled:opacity-50">
                {p.name} · {p.gift} ({p.diamonds}💎)
              </button>
            ))}
          </div>
        </div>

        {result && (
          <div className="bg-studio-900 border border-studio-border rounded-2xl p-4">
            <p className="text-zinc-400 text-xs mb-1">Last Response</p>
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
