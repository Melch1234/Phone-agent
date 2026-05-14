import 'dotenv/config'
import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import express from 'express'
import { WebSocketServer } from 'ws'
import { handleIncoming } from './api/incoming'
import { handleOperators } from './api/operators'
import { handleDeleteCall } from './api/calls'
import { handleScrape } from './api/scrape'
import { handleSettings } from './api/settings'
import { handleVoicePreview } from './api/voicePreview'
import { handleStream } from './api/stream'
import { handleAdminOperators } from './api/admin'
import { startBriefingCron } from './src/lib/briefing'

const dev = process.env.NODE_ENV !== 'production'
const port = parseInt(process.env.PORT || '3000', 10)

async function main() {
  const app = next({ dev })
  const handle = app.getRequestHandler()
  await app.prepare()

  const expressApp = express()
  expressApp.use(express.json())
  expressApp.use(express.urlencoded({ extended: false }))

  expressApp.post('/api/incoming', handleIncoming)
  expressApp.post('/api/operators', handleOperators)
  expressApp.delete('/api/calls', handleDeleteCall)
  expressApp.post('/api/scrape', handleScrape)
  expressApp.post('/api/settings', handleSettings)
  expressApp.get('/api/voice-preview', handleVoicePreview)
  expressApp.get('/api/admin/operators', handleAdminOperators)
  expressApp.patch('/api/admin/operators', handleAdminOperators)

  expressApp.all('/{*splat}', (req, res) => {
    const parsedUrl = parse(req.url!, true)
    handle(req, res, parsedUrl)
  })

  const server = createServer(expressApp)

  const wss = new WebSocketServer({ server })
  wss.on('connection', (ws, req) => {
    console.log('[wss] WebSocket connection received:', req.url)
    handleStream(ws, req)
  })

  startBriefingCron()

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`)
  })
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
