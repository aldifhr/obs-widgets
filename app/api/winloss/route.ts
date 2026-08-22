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

  const type = body.type as string
  const delta = (body.delta as number) || 1

  if (type === 'win') {
    broadcast({ id: String(++nextId), kind: 'win', delta, at: Date.now() })
    return NextResponse.json({ ok: true })
  }
  if (type === 'loss') {
    broadcast({ id: String(++nextId), kind: 'loss', delta, at: Date.now() })
    return NextResponse.json({ ok: true })
  }
  if (type === 'reset') {
    broadcast({ id: String(++nextId), kind: 'reset', at: Date.now() })
    return NextResponse.json({ ok: true })
  }
  if (type === 'set') {
    const wins = Number(body.wins) || 0
    const losses = Number(body.losses) || 0
    broadcast({ id: String(++nextId), kind: 'set', wins, losses, at: Date.now() })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'type must be win|loss|reset|set' }, { status: 400 })
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const win = url.searchParams.get('win')
  const loss = url.searchParams.get('loss')
  const reset = url.searchParams.get('reset')

  // Allow GET for simple integration: /api/winloss?win=1
  if (win !== null || loss !== null || reset !== null) {
    if (reset !== null) broadcast({ id: String(++nextId), kind: 'reset', at: Date.now() })
    else if (win !== null) broadcast({ id: String(++nextId), kind: 'win', delta: Number(win) || 1, at: Date.now() })
    else if (loss !== null) broadcast({ id: String(++nextId), kind: 'loss', delta: Number(loss) || 1, at: Date.now() })
    return NextResponse.json({ ok: true })
  }

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
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
