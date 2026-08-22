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
const WEBHOOK = process.env.WEBHOOK_URL || `http://localhost:${process.env.PORT || 8787}/api/tako/webhook`
const COOLDOWN = 3000

if (!USERNAME || !API_KEY) {
  console.error('[tiktok] Set TIKTOK_USERNAME and TIKTOK_API_KEY in .env')
  process.exit(1)
}

console.log(`[tiktok] Monitoring @${USERNAME} likes`)

let likeBuffer = 0
let flushTimer = null

function flushLikes() {
  if (likeBuffer <= 0) return
  const count = likeBuffer
  likeBuffer = 0
  const body = JSON.stringify({
    event: 'like',
    data: { count, at: Date.now() },
  })
  fetch(WEBHOOK, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body })
    .then(() => console.log(`[tiktok] ❤️  ${count} likes flushed`))
    .catch(e => console.error('[tiktok] webhook error:', e.message))
}

async function connect() {
  const j = await fetch(`https://api.tik.tools/authentication/jwt?apiKey=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ allowed_creators: [USERNAME], expire_after: 600, max_websockets: 1 }),
  }).then(r => r.json())

  const token = j.data?.token
  if (!token) { console.error('[tiktok] Auth failed:', j); return }

  const ws = new WebSocket(`wss://api.tik.tools?uniqueId=${USERNAME}&jwtKey=${encodeURIComponent(token)}`)

  ws.on('open', () => console.log(`[tiktok] Connected to @${USERNAME}`))

  ws.on('message', raw => {
    try {
      const msg = JSON.parse(raw.toString())
      if (msg.event === 'like') {
        const count = msg.data?.likeCount || 1
        likeBuffer += count
        console.log(`[tiktok] ❤️  +${count} (buffer: ${likeBuffer})`)
        clearTimeout(flushTimer)
        flushTimer = setTimeout(flushLikes, COOLDOWN)
      }
    } catch {}
  })

  ws.on('close', () => {
    console.log('[tiktok] Disconnected, reconnecting in 5s...')
    setTimeout(connect, 5000)
  })

  ws.on('error', e => console.error('[tiktok] Error:', e.message))
}

connect()

process.on('SIGINT', () => { flushLikes(); process.exit() })
process.on('SIGTERM', () => { flushLikes(); process.exit() })
