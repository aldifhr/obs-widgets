import { NextResponse } from 'next/server'

const clients = new Set<ReadableStreamDefaultController>()
let nextId = 0

function broadcast(data: unknown) {
  const msg = `data: ${JSON.stringify(data)}\n\n`
  for (const ctrl of clients) {
    try { ctrl.enqueue(new TextEncoder().encode(msg)) } catch { clients.delete(ctrl) }
  }
}

export async function POST(req: Request) {
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }) }

  const event = body.event as string
  const d = (body.data as Record<string, unknown>) || {}

  if (event === 'chat') {
    const user = (d.user as string) || 'someone'
    broadcast({ id: String(++nextId), kind: 'chat', user, message: d.message || '', at: Date.now() })
    return NextResponse.json({ ok: true })
  }
  if (event === 'member' || event === 'follow') {
    const user = (d.user as string) || 'someone'
    broadcast({ id: String(++nextId), kind: 'member', user, action: (d.action as string) || 'join', at: Date.now() })
    return NextResponse.json({ ok: true })
  }
  if (event === 'gift') {
    const user = (d.user as string) || 'someone'
    broadcast({ id: String(++nextId), kind: 'gift', user, giftName: (d.giftName as string) || 'Gift', diamondCount: (d.diamondCount as number) || 0, repeatCount: (d.repeatCount as number) || 1, at: Date.now() })
    return NextResponse.json({ ok: true })
  }
  if (event === 'like') {
    const user = (d.user as string) || 'someone'
    broadcast({ id: String(++nextId), kind: 'like', user, count: (d.likeCount as number) || 1, at: Date.now() })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ ok: true, skipped: true })
}

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode('retry: 3000\n\n'))
      clients.add(controller)
      const hb = setInterval(() => {
        try { controller.enqueue(new TextEncoder().encode(': ping\n\n')) } catch { clearInterval(hb) }
      }, 25000)
      void hb
    },
    cancel(controller) {
      clients.delete(controller as unknown as ReadableStreamDefaultController)
    },
  })
  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
  })
}
