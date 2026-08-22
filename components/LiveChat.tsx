'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { SectionTitle } from '../lib/platforms'

interface ChatMsg {
  id: string
  user: string
  message: string
  at: number
}

export function LiveChat() {
  const searchParams = useSearchParams()
  const showWidget = searchParams.has('hide')

  useEffect(() => {
    if (showWidget) {
      document.documentElement.style.background = 'transparent'
      document.body.style.background = 'transparent'
      document.body.style.minHeight = '100vh'
    }
  }, [showWidget])

  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [maxMsg, setMaxMsg] = useState(() => {
    const v = Number(searchParams.get('max'))
    return v > 0 ? v : 20
  })
  const [fontSize, setFontSize] = useState(() => {
    const v = Number(searchParams.get('fs'))
    return v > 0 ? v : 13
  })
  const [accent, setAccent] = useState(searchParams.get('accent') || '#FFC53D')
  const uiAccent = '#FFC53D'
  const [noBg, setNoBg] = useState(searchParams.has('nobg'))
  const [hideAfter, setHideAfter] = useState(() => {
    const v = Number(searchParams.get('hideAfter'))
    return v >= 0 ? v : 0
  })
  const listRef = useRef<HTMLDivElement>(null)

  const maxMsgRef = useRef(maxMsg)
  maxMsgRef.current = maxMsg
  const hideAfterRef = useRef(hideAfter)
  hideAfterRef.current = hideAfter

  const addMessage = (msg: ChatMsg) => {
    setMessages(m => [...m, msg].slice(-maxMsgRef.current))
    if (hideAfterRef.current > 0) {
      setTimeout(() => setMessages(m => m.filter(x => x.id !== msg.id)), hideAfterRef.current * 1000)
    }
  }

  useEffect(() => {
    const es = new EventSource('/api/tiktok/webhook')
    es.onmessage = (e) => {
      try {
        const d = JSON.parse(e.data)
        if (d.kind === 'chat') {
          addMessage({ id: d.id || String(Date.now()), user: d.user || 'someone', message: d.message || '', at: Date.now() })
        }
      } catch {}
    }
    es.onerror = () => es.close()
    return () => es.close()
  }, [])

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages])

  const [testUser, setTestUser] = useState('tester')
  const [testMsg, setTestMsg] = useState('halo bang!')
  const sendTest = async () => {
    const msg: ChatMsg = { id: String(Date.now()), user: testUser || 'tester', message: testMsg || 'halo', at: Date.now() }
    addMessage(msg)
    await fetch('/api/tiktok/webhook', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'chat', data: { user: testUser, message: testMsg } }) }).catch(() => {})
  }

  const widgetParams = new URLSearchParams({ max: String(maxMsg), fs: String(fontSize), accent, hideAfter: String(hideAfter), hide: '1' })
  if (noBg) widgetParams.set('nobg', '1')
  const [widgetUrl, setWidgetUrl] = useState('')
  useEffect(() => { setWidgetUrl(`${window.location.origin}/chat?${widgetParams.toString()}`) }, [widgetParams.toString()])
  const [copied, setCopied] = useState(false)
  const copyUrl = () => { navigator.clipboard.writeText(widgetUrl); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  const ChatList = () => (
    <div ref={listRef} className="flex flex-col gap-1.5 overflow-y-auto" style={{ width: 360, maxHeight: 400, padding: 8, scrollBehavior: 'smooth' }}>
      {messages.length === 0 && <div className="text-zinc-600 font-mono text-xs text-center py-8">Menunggu chat TikTok...</div>}
      {messages.map(m => (
        <div key={m.id} className="px-3 py-2 rounded-xl" style={{ background: noBg ? 'rgba(0,0,0,0.65)' : 'rgba(24,24,27,0.9)', border: `1px solid ${accent}15`, backdropFilter: 'blur(8px)', animation: 'chat-in 0.3s ease' }}>
          <span className="font-mono font-bold" style={{ color: accent, fontSize: fontSize - 1 }}>{m.user}</span>
          <span className="text-zinc-400 mx-1" style={{ fontSize: fontSize - 2 }}>•</span>
          <span className="text-white break-words" style={{ fontSize }}>{m.message}</span>
        </div>
      ))}
    </div>
  )

  if (showWidget) {
    return (
      <div className="flex p-4" style={{ minHeight: '100vh', alignItems: 'flex-end', justifyContent: 'flex-start' }}>
        <ChatList />
        <style>{`@keyframes chat-in { 0% { opacity:0; transform: translateY(8px) } 100% { opacity:1; transform: translateY(0) } }`}</style>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-studio-950 flex flex-col">
      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="flex-1 flex items-center justify-center p-8 min-h-[50vh] lg:min-h-0" style={{ background: '#09090b' }}>
          <ChatList />
          <style>{`@keyframes chat-in { 0% { opacity:0; transform: translateY(8px) } 100% { opacity:1; transform: translateY(0) } }`}</style>
        </div>

        <div className="w-full lg:w-[380px] bg-studio-900 border-l border-studio-border flex flex-col">
          <div className="p-6 border-b border-studio-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${uiAccent}15`, color: uiAccent }}>💬</div>
              <div>
                <h2 className="text-white font-display font-semibold">Live Chat</h2>
                <p className="text-zinc-500 text-xs font-mono">TikTok live chat overlay</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <section>
              <SectionTitle>Max Messages <span className="text-zinc-600 font-mono font-normal ml-1">{maxMsg}</span></SectionTitle>
              <input type="range" min={5} max={50} step={5} value={maxMsg} onChange={e => setMaxMsg(Number(e.target.value))} className="w-full h-1.5 bg-studio-700 rounded-full appearance-none cursor-pointer" style={{ accentColor: uiAccent }} />
            </section>
            <section>
              <SectionTitle>Font Size <span className="text-zinc-600 font-mono font-normal ml-1">{fontSize}px</span></SectionTitle>
              <input type="range" min={10} max={20} step={1} value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="w-full h-1.5 bg-studio-700 rounded-full appearance-none cursor-pointer" style={{ accentColor: uiAccent }} />
            </section>
            <section>
              <SectionTitle>Hide After (sec, 0 = never)</SectionTitle>
              <input type="number" min={0} max={60} value={hideAfter} onChange={e => setHideAfter(Math.max(0, Number(e.target.value)))} className="w-full bg-studio-800/50 border border-studio-border rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/20" />
            </section>
            <section>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <SectionTitle>Accent</SectionTitle>
                  <div className="relative"><div className="absolute inset-0 rounded-xl border border-studio-border" style={{ background: accent }} /><input type="color" value={accent} onChange={e => setAccent(e.target.value)} className="relative w-full h-10 rounded-xl cursor-pointer bg-transparent border-0" /></div>
                </div>
                <div className="flex items-end">
                  <button onClick={() => setNoBg(n => !n)} className={`w-full py-2.5 rounded-xl text-xs font-medium border transition-all ${noBg ? 'border-white/30 bg-white/10 text-white' : 'border-studio-border bg-studio-800/50 text-zinc-500 hover:text-zinc-300'}`}>{noBg ? 'No BG' : 'With BG'}</button>
                </div>
              </div>
            </section>
            <section>
              <SectionTitle>Test Chat</SectionTitle>
              <div className="flex gap-2">
                <input value={testUser} onChange={e => setTestUser(e.target.value)} placeholder="user" className="w-24 bg-studio-800/50 border border-studio-border rounded-xl px-3 py-2 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-white/20" />
                <input value={testMsg} onChange={e => setTestMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendTest()} placeholder="message" className="flex-1 bg-studio-800/50 border border-studio-border rounded-xl px-3 py-2 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-white/20" />
                <button onClick={sendTest} className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-white text-xs hover:bg-white/15">Send</button>
              </div>
            </section>
            <section>
              <button onClick={() => setMessages([])} className="w-full py-2 rounded-xl border border-studio-border bg-studio-800/50 text-zinc-400 text-xs hover:bg-studio-800 hover:text-white">Clear Chat</button>
            </section>
          </div>

          <div className="p-6 border-t border-studio-border">
            <button onClick={copyUrl} className="w-full py-3 rounded-xl font-semibold text-sm text-studio-950" style={{ background: uiAccent, boxShadow: `0 4px 20px ${uiAccent}30` }}>{copied ? 'Copied!' : 'Copy Widget URL'}</button>
            <p className="text-zinc-600 text-[10px] mt-3 font-mono break-all leading-relaxed">{widgetUrl}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
