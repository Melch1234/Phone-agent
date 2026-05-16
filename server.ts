import 'dotenv/config'
import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import express from 'express'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import { WebSocketServer } from 'ws'
import { handleIncoming } from './api/incoming'
import { handleDeleteCall } from './api/calls'
import { handleScrape } from './api/scrape'
import { handleSettings } from './api/settings'
import { handleVoicePreview } from './api/voicePreview'
import { handleStream } from './api/stream'
import { handleAdminOperators } from './api/admin'
import { handleContact } from './api/contact'
import { handleCheckout } from './api/checkout'
import { handleWebhook } from './api/webhook'
import { startBriefingCron } from './src/lib/briefing'
import { handleDashboardAuth, handleAdminAuth, handleLogin, handleForgotPin } from './api/auth'

const dev = process.env.NODE_ENV !== 'production'
const port = parseInt(process.env.PORT || '3000', 10)

async function main() {
  const app = next({ dev })
  const handle = app.getRequestHandler()
  await app.prepare()

  const expressApp = express()

  expressApp.use(helmet({ contentSecurityPolicy: false }))

  // Stripe webhook needs raw body before JSON middleware
  expressApp.post('/api/webhook', express.raw({ type: 'application/json' }), handleWebhook)

  expressApp.use(express.json())
  expressApp.use(express.urlencoded({ extended: false }))
  expressApp.use(cookieParser())

  // Rate limiters
  const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false })
  const forgotPinLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false })
  const checkoutLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false })

  expressApp.post('/api/auth/dashboard', handleDashboardAuth)
  expressApp.post('/api/auth/login', loginLimiter, handleLogin)
  expressApp.post('/api/auth/forgot-pin', forgotPinLimiter, handleForgotPin)
  expressApp.get('/api/auth/admin', handleAdminAuth)

  expressApp.post('/api/incoming', handleIncoming)
  expressApp.delete('/api/calls', handleDeleteCall)
  expressApp.post('/api/scrape', handleScrape)
  expressApp.post('/api/settings', handleSettings)
  expressApp.get('/api/voice-preview', handleVoicePreview)
  expressApp.get('/api/admin/operators', handleAdminOperators)
  expressApp.patch('/api/admin/operators', handleAdminOperators)
  expressApp.post('/api/contact', handleContact)
  expressApp.post('/api/checkout', checkoutLimiter, handleCheckout)

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
