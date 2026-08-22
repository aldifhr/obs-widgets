import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { createServer } from 'node:http'

const PORT = process.env.PORT || 8788
const DATA = join(process.cwd(), 'ledger.json')

function read() {
  if (!existsSync(DATA)) return []
  try { return JSON.parse(readFileSync(DATA, 'utf8')) } catch { return [] }
}

function write(data) {
  writeFileSync(DATA, JSON.stringify(data, null, 2))
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

const server = createServer((req, res) => {
  cors(res)

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    return res.end()
  }

  if (req.url === '/ledger' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify(read()))
  }

  if (req.url === '/ledger' && req.method === 'POST') {
    let body = ''
    req.on('data', c => body += c)
    req.on('end', () => {
      try {
        const data = JSON.parse(body)
        const rows = read()
        const entry = {
          id: Date.now(),
          name: data.name || 'Anonymous',
          amount: data.amount || 0,
          message: data.message || '',
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          at: Date.now(),
        }
        rows.unshift(entry)
        write(rows.slice(0, 200))
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ ok: true, entry }))
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'bad json' }))
      }
    })
    return
  }

  if (req.url === '/ledger' && req.method === 'DELETE') {
    write([])
    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ ok: true }))
  }

  res.writeHead(404)
  res.end('not found')
})

server.listen(PORT, () => console.log(`Ledger API running on :${PORT}`))
