import { readFileSync } from 'node:fs'
import WebSocket from 'ws'

let env = {}
try {
  const f = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
  for (const line of f.split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i === -1) continue
    env[t.slice(0, i).trim()] = t.slice(i + 1).trim()
  }
} catch {}

const USERNAME = process.env.TIKTOK_USERNAME || env.TIKTOK_USERNAME
const API_KEY = process.env.TIKTOK_API_KEY || env.TIKTOK_API_KEY
const LIKE_VALUE = Number(process.env.LIKE_VALUE || env.LIKE_VALUE || 1000)
const WEBHOOK = process.env.WEBHOOK_URL || `http://localhost:${process.env.PORT || 8787}/api/tako/webhook`
const COOLDOWN = 3000

if (!USERNAME || !API_KEY) {
  console.error('[tiktok] Set TIKTOK_USERNAME and TIKTOK_API_KEY in .env')
  process.exit(1)
}

console.log(`[tiktok] Monitoring @${USERNAME} likes (Rp${LIKE_VALUE.toLocaleString('id-ID')} each)`)

const ws = new WebSocket(`wss://api.tik.tools?uniqueId=${USERNAME}&apiKey=${API_KEY}`)
let lastLike = 0
let likeBuffer = 0
let flushTimer = null

function flushLikes() {
  if (likeBuffer <= 0) return
  const total = likeBuffer * LIKE_VALUE
  likeBuffer = 0
  const body = JSON.stringify({
    event: 'payment.success',
    data: {
      id: 'like-' + Date.now(),
      status: 'success',
      amount: total,
      price: 0,
      paymentMethod: 'like',
      createdAt: new Date().toISOString(),
      relatedGiftId: null,
      name: 'TikTok Likes',
      message: '',
    },
  })
  fetch(WEBHOOK, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body })
    .then(() => console.log(`[tiktok] ${likeBuffer || '?'} likes flushed → Rp${total.toLocaleString('id-ID')}`))
    .catch(e => console.error('[tiktok] webhook error:', e.message))
}

ws.on('message', raw => {
  try {
    const msg = JSON.parse(raw.toString())
    if (msg.event === 'like') {
      const count = msg.data?.likeCount || 1
      likeBuffer += count
      console.log(`[tiktok] ❤️  +${count} like (buffer: ${likeBuffer})`)
      clearTimeout(flushTimer)
      flushTimer = setTimeout(flushLikes, COOLDOWN)
    }
  } catch {}
})

ws.on('open', () => console.log('[tiktok] Connected to TikTok LIVE'))
ws.on('close', () => console.log('[tiktok] Disconnected'))
ws.on('error', e => console.error('[tiktok] Error:', e.message))

process.on('SIGINT', () => { flushLikes(); ws.close(); process.exit() })
process.on('SIGTERM', () => { flushLikes(); ws.close(); process.exit() })
