import { NextResponse } from 'next/server'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const DATA = join(process.cwd(), 'data', 'ledger.json')

function read() {
  try { return JSON.parse(readFileSync(DATA, 'utf8')) } catch { return [] }
}

function write(data: unknown[]) {
  writeFileSync(DATA, JSON.stringify(data, null, 2))
}

export async function GET() {
  return NextResponse.json(read())
}

export async function POST(req: Request) {
  const body = await req.json()
  const rows = read()
  const entry = {
    id: Date.now(),
    name: body.name || 'Anonymous',
    amount: body.amount || 0,
    message: body.message || '',
    time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    at: Date.now(),
  }
  rows.unshift(entry)
  write(rows.slice(0, 100))
  return NextResponse.json({ ok: true, entry })
}

export async function DELETE() {
  write([])
  return NextResponse.json({ ok: true })
}
