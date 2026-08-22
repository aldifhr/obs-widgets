import { NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'node:crypto'

const SECRET = process.env.TAKO_CALLBACK_SECRET || ''
const API_KEY = process.env.TAKO_API_KEY || ''
const clients = new Set<ReadableStreamDefaultController>()
let nextId = 0

function broadcast(data: unknown) {
  const msg = `data: ${JSON.stringify(data)}\n\n`
  for (const ctrl of clients) {
    try { ctrl.enqueue(new TextEncoder().encode(msg)) } catch { clients.delete(ctrl) }
  }
}

function verify(body: string, sig: string | undefined, origin: string | null, host: string | null): boolean {
  if (!SECRET) return true
  if (!sig) return !origin || origin.includes(host || '')
  try {
    const h = createHmac('sha256', SECRET).update(body).digest('hex')
    return timingSafeEqual(Buffer.from(h, 'hex'), Buffer.from(sig, 'hex'))
  } catch { return false }
}

async function fetchGift(giftId: string) {
  if (!API_KEY) return null
  try {
    const r = await fetch(`https://tako.id/api/v1/gift/${giftId}`, {
      headers: { Authorization: `Bearer ${API_KEY}`, 'User-Agent': 'obs-widgets/1.0' },
    })
    if (!r.ok) return null
    const j = await r.json() as Record<string, unknown>
    return (j.result as Record<string, unknown>) || null
  } catch { return null }
}

export async function POST(req: Request) {
  const raw = await req.text()
  const sig = req.headers.get('x-tako-signature') || undefined
  const origin = req.headers.get('origin')
  const host = req.headers.get('host')

  if (!verify(raw, sig, origin, host)) {
    return NextResponse.json({ error: 'invalid signature' }, { status: 403 })
  }

  let body: Record<string, unknown>
  try { body = JSON.parse(raw) } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }) }

  if (body.event === 'like') {
    const d = body.data as Record<string, unknown>
    const count = (d.likeCount as number) || 1
    const user = (d.user as string) || 'someone'
    const ev = { id: String(++nextId), kind: 'like', user, count, at: Date.now() }
    console.log(`[like] ${user} +${count}`)
    broadcast(ev)
    return NextResponse.json({ ok: true })
  }

  if (body.event === 'gift') {
    const d = body.data as Record<string, unknown>
    const user = (d.user as string) || 'someone'
    const giftName = (d.giftName as string) || 'Gift'
    const diamondCount = (d.diamondCount as number) || 0
    const repeatCount = (d.repeatCount as number) || 1
    const ev = { id: String(++nextId), kind: 'gift', user, giftName, diamondCount, repeatCount, at: Date.now() }
    console.log(`[gift] ${user} ${giftName} x${repeatCount} (${diamondCount}💎)`)
    broadcast(ev)
    return NextResponse.json({ ok: true })
  }

  if (body.event !== 'payment.success') {
    return NextResponse.json({ ok: true, skipped: true })
  }

  const d = body.data as Record<string, unknown>
  let name = (d.name as string) || 'Anonymous', message = (d.message as string) || '', amount = (d.amount as number) || 0

  if (d.relatedGiftId) {
    const gift = await fetchGift(d.relatedGiftId as string)
    if (gift) {
      name = (gift.gifterName as string) || name
      message = (gift.message as string) || message
      amount = (gift.amount as number) || amount
    }
  }

  const ev = { id: String(++nextId), kind: 'tip', name, amount, message, method: d.paymentMethod, at: Date.now() }
  console.log(`[tako] ${name} tip Rp${amount.toLocaleString('id-ID')}`)
  broadcast(ev)

  return NextResponse.json({ ok: true })
}

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode('retry: 3000\n\n'))
      clients.add(controller)
      const hb = setInterval(() => {
        try { controller.enqueue(new TextEncoder().encode(': ping\n\n')) } catch { clearInterval(hb) }
      }, 25000)
      // cleanup on cancel
      const originalCancel = controller.close.bind(controller)
      // We handle cleanup via the client set
      void originalCancel
    },
    cancel(controller) {
      clients.delete(controller as unknown as ReadableStreamDefaultController)
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
