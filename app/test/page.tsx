'use client'

import { useState } from 'react'

const PRESETS = [
  { name: 'Sari', amount: 10000, message: 'Mantap!' },
  { name: 'Budi', amount: 25000, message: 'Semangat!' },
  { name: 'Raka', amount: 50000, message: 'GGWP!' },
  { name: 'Dina', amount: 100000, message: 'Lanjut bos!' },
  { name: 'Andi', amount: 15000, message: '' },
  { name: 'Maya', amount: 200000, message: 'Keren banget!' },
]

export default function TestPage() {
  const [name, setName] = useState('Sari')
  const [amount, setAmount] = useState(50000)
  const [message, setMessage] = useState('Mantap!')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [history, setHistory] = useState<string[]>([])

  const send = async (n?: string, a?: number, m?: string) => {
    const fName = n || name
    const fAmount = a || amount
    const fMsg = m ?? message
    setLoading(true)
    setResult('sending...')
    try {
      const r = await fetch('/api/tako/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'payment.success',
          data: {
            id: 'test-' + Date.now(),
            status: 'success',
            amount: fAmount,
            price: fAmount,
            paymentMethod: 'qris',
            createdAt: new Date().toISOString(),
            relatedGiftId: null,
            name: fName,
            message: fMsg,
          },
        }),
      })
      const t = await r.text()
      setResult(t)
      setHistory(prev => [`${fName} Rp${fAmount.toLocaleString('id-ID')} ${fMsg ? '- ' + fMsg : ''}`, ...prev.slice(0, 19)])
    } catch (e: unknown) {
      setResult(String(e))
    }
    setLoading(false)
  }

  const sendBatch = async () => {
    for (const p of PRESETS) {
      await send(p.name, p.amount, p.message)
      await new Promise(r => setTimeout(r, 800))
    }
  }

  return (
    <div className="min-h-screen bg-studio-950 flex items-center justify-center p-8">
      <div className="max-w-lg w-full space-y-6">
        <div className="text-center">
          <p className="text-signal text-xs font-mono font-medium tracking-widest uppercase mb-2">Tako Test</p>
          <h1 className="text-white font-display text-2xl font-bold">Webhook Test Tool</h1>
          <p className="text-zinc-500 text-xs mt-1">Kirim test tip ke overlay</p>
        </div>

        <div className="bg-studio-900 border border-studio-border rounded-2xl p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-zinc-400 text-xs block mb-1">Name</label>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-studio-800/50 border border-studio-border rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/20" />
            </div>
            <div>
              <label className="text-zinc-400 text-xs block mb-1">Amount (Rp)</label>
              <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full bg-studio-800/50 border border-studio-border rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/20" />
            </div>
          </div>
          <div>
            <label className="text-zinc-400 text-xs block mb-1">Message</label>
            <input value={message} onChange={e => setMessage(e.target.value)} className="w-full bg-studio-800/50 border border-studio-border rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/20" placeholder="optional" />
          </div>

          <div className="flex gap-2">
            <button onClick={() => send()} disabled={loading} className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-signal text-studio-950 hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-50">
              {loading ? 'Sending...' : 'Send Tip'}
            </button>
            <button onClick={sendBatch} disabled={loading} className="py-2.5 px-4 rounded-xl font-semibold text-sm border border-studio-border bg-studio-800/50 text-zinc-300 hover:bg-studio-800 hover:text-white hover:border-white/15 transition-all active:scale-[0.98] disabled:opacity-50">
              Batch x6
            </button>
          </div>
        </div>

        <div className="bg-studio-900 border border-studio-border rounded-2xl p-5">
          <p className="text-zinc-400 text-xs mb-2">Quick Presets</p>
          <div className="grid grid-cols-3 gap-2">
            {PRESETS.map(p => (
              <button key={p.name} onClick={() => send(p.name, p.amount, p.message)} disabled={loading} className="py-2 px-3 rounded-xl text-xs font-medium border border-studio-border bg-studio-800/50 text-zinc-400 hover:bg-studio-800 hover:text-white hover:border-white/15 transition-all active:scale-[0.95] disabled:opacity-50">
                {p.name}<br /><span className="text-signal">Rp{p.amount.toLocaleString('id-ID')}</span>
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
