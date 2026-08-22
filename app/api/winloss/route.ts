import { NextResponse } from 'next/server'

const clients = new Set<ReadableStreamDefaultController>()
let nextId = 0
let store = { wins: 0, losses: 0 }

function broadcast(data: unknown) {
  const msg = `data: ${JSON.stringify(data)}\n\n`
  for (const ctrl of clients) {
    try { ctrl.enqueue(new TextEncoder().encode(msg)) } catch { clients.delete(ctrl) }
  }
}

export async function POST(req: Request) {
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }) }

  const type = body.type as string
  const delta = (body.delta as number) || 1

  if (type === 'win') {
    store.wins = Math.max(0, store.wins + delta)
    broadcast({ id: String(++nextId), kind: 'set', wins: store.wins, losses: store.losses, at: Date.now() })
    return NextResponse.json({ ok: true, ...store })
  }
  if (type === 'loss') {
    store.losses = Math.max(0, store.losses + delta)
    broadcast({ id: String(++nextId), kind: 'set', wins: store.wins, losses: store.losses, at: Date.now() })
    return NextResponse.json({ ok: true, ...store })
  }
  if (type === 'reset') {
    store = { wins: 0, losses: 0 }
    broadcast({ id: String(++nextId), kind: 'set', wins: 0, losses: 0, at: Date.now() })
    return NextResponse.json({ ok: true, ...store })
  }
  if (type === 'set') {
    store.wins = Math.max(0, Number(body.wins) || 0)
    store.losses = Math.max(0, Number(body.losses) || 0)
    broadcast({ id: String(++nextId), kind: 'set', wins: store.wins, losses: store.losses, at: Date.now() })
    return NextResponse.json({ ok: true, ...store })
  }

  return NextResponse.json({ error: 'type must be win|loss|reset|set' }, { status: 400 })
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const win = url.searchParams.get('win')
  const loss = url.searchParams.get('loss')
  const reset = url.searchParams.get('reset')

  if (win !== null || loss !== null || reset !== null) {
    if (reset !== null) store = { wins: 0, losses: 0 }
    else if (win !== null) store.wins = Math.max(0, store.wins + (Number(win) || 1))
    else if (loss !== null) store.losses = Math.max(0, store.losses + (Number(loss) || 1))
    broadcast({ id: String(++nextId), kind: 'set', wins: store.wins, losses: store.losses, at: Date.now() })
    return NextResponse.json({ ok: true, ...store })
  }

  const stream = new ReadableStream({
    start(controller) {
      // send current state on connect
      controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ id: String(++nextId), kind: 'set', wins: store.wins, losses: store.losses, at: Date.now() })}\n\n`))
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
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
