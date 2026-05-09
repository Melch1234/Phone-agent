# Phone AI Agent — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production phone AI agent SaaS for tour operators — Twilio handles inbound calls, OpenAI Realtime API runs the conversation, Supabase stores calls and leads, Resend sends morning briefings.

**Architecture:** Single Next.js custom server on Railway. Express handles the Twilio webhook and WebSocket audio bridge; Next.js serves all web pages. One process, one deploy, no platform juggling.

**Tech Stack:** Next.js 14, Express, `ws`, OpenAI Realtime API (gpt-4o-realtime-preview), Twilio Voice + SMS, Supabase, Resend, node-cron, TypeScript, Vitest

---

## File Map

```
phone-agent/
├── server.ts                          # Express entry point — registers routes, WS server, starts Next.js
├── next.config.ts                     # Next.js config (output: standalone disabled, custom server)
├── tsconfig.json
├── tsconfig.server.json               # Separate tsconfig for server-side files (no JSX)
├── package.json
├── railway.toml                       # Railway deploy config
├── .env.example
├── vitest.config.ts
├── supabase/
│   └── migrations/
│       └── 001_initial.sql            # operators, calls, leads schema
├── src/
│   ├── types/
│   │   └── index.ts                   # Operator, Call, Lead interfaces
│   ├── lib/
│   │   ├── supabase.ts                # Supabase client (singleton)
│   │   ├── twilio.ts                  # TwiML builder + SMS sender
│   │   ├── resend.ts                  # Email sender (briefing + notifications)
│   │   ├── briefing.ts                # Morning briefing builder + cron scheduler
│   │   └── openai.ts                  # GPT-4o call summariser (not Realtime)
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                   # Landing page (ported from phone-agent-landing.html)
│   │   ├── onboard/
│   │   │   └── page.tsx               # 5-step onboarding wizard
│   │   ├── onboard/
│   │   │   └── success/
│   │   │       └── page.tsx           # Post-submit confirmation
│   │   └── dashboard/
│   │       └── [operatorId]/
│   │           └── page.tsx           # Operator dashboard (token-authenticated)
│   └── app/
│       └── globals.css
├── api/
│   ├── incoming.ts                    # POST /api/incoming — returns TwiML to start stream
│   ├── operators.ts                   # POST /api/operators — creates operator from onboard form
│   └── stream.ts                      # WebSocket /stream — Twilio ↔ OpenAI Realtime bridge
└── __tests__/
    ├── twiml.test.ts                  # TwiML generation
    ├── urgency.test.ts                # Urgency keyword detection
    ├── briefing.test.ts               # Email body builder
    └── summarise.test.ts              # GPT-4o call summariser (mocked)
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.server.json`
- Create: `next.config.ts`
- Create: `vitest.config.ts`
- Create: `railway.toml`
- Create: `.env.example`
- Create: `src/types/index.ts`

- [ ] **Step 1: Initialise the project**

```bash
cd /Users/joshmelcher/phone-agent
npm init -y
```

- [ ] **Step 2: Install all dependencies**

```bash
npm install next@14 react react-dom express ws twilio openai @supabase/supabase-js resend node-cron jsonwebtoken
npm install --save-dev typescript @types/node @types/react @types/react-dom @types/express @types/ws @types/node-cron @types/jsonwebtoken vitest @vitejs/plugin-react tsx
```

- [ ] **Step 3: Write `package.json` scripts**

Replace the `scripts` section:

```json
{
  "scripts": {
    "dev": "tsx watch server.ts",
    "build": "next build",
    "start": "node server.js",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 4: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "dom"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 5: Write `tsconfig.server.json`**

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "CommonJS",
    "jsx": "react",
    "noEmit": false,
    "outDir": "dist"
  },
  "include": ["server.ts", "api/**/*.ts", "src/lib/**/*.ts", "src/types/**/*.ts"]
}
```

- [ ] **Step 6: Write `next.config.ts`**

```typescript
import type { NextConfig } from 'next'

const config: NextConfig = {
  // Custom server — do not use `output: 'standalone'`
}

export default config
```

- [ ] **Step 7: Write `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
})
```

- [ ] **Step 8: Write `railway.toml`**

```toml
[build]
builder = "NIXPACKS"
buildCommand = "npm run build"

[deploy]
startCommand = "node server.js"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3

[[services]]
name = "phone-agent"
```

- [ ] **Step 9: Write `.env.example`**

```bash
# Twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=       # your sending number for SMS alerts

# OpenAI
OPENAI_API_KEY=

# Supabase
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Resend
RESEND_API_KEY=

# App
STREAM_HOST=              # yourapp.railway.app (no protocol)
YOUR_NOTIFICATION_EMAIL=  # where new signup alerts go
NODE_ENV=development
PORT=3000
```

- [ ] **Step 10: Write `src/types/index.ts`**

```typescript
export interface Operator {
  id: string
  business_name: string
  owner_name: string
  email: string
  alert_phone: string
  twilio_number: string | null
  greeting: string | null
  faq: string
  active: boolean
  plan: 'starter' | 'growth' | 'agency'
  dashboard_token: string
  created_at: string
}

export interface Lead {
  name: string
  party_size: number | null
  tour_date: string | null
  notes: string | null
}

export interface Call {
  id: string
  operator_id: string
  caller_number: string
  duration_seconds: number
  transcript: string
  summary: string
  urgent: boolean
  leads: Lead[]
  created_at: string
}

export interface OnboardPayload {
  business_name: string
  owner_name: string
  tour_types: string[]
  location: string
  faq: string
  email: string
  alert_phone: string
  greeting: string
}

export interface CallSummary {
  summary: string
  leads: Lead[]
}
```

- [ ] **Step 11: Create `src/app/globals.css`**

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
```

- [ ] **Step 12: Create placeholder `src/app/layout.tsx`**

```tsx
export const metadata = { title: 'Tour Agent AI' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 13: Create placeholder `src/app/page.tsx`**

```tsx
export default function Home() {
  return <main><h1>Coming soon</h1></main>
}
```

- [ ] **Step 14: Commit**

```bash
git add .
git commit -m "chore: project scaffold — Next.js custom server, types, Railway config"
```

---

## Task 2: Supabase Schema + Client

**Files:**
- Create: `supabase/migrations/001_initial.sql`
- Create: `src/lib/supabase.ts`

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/001_initial.sql`:

```sql
-- operators: one row per tour operator customer
create table operators (
  id                uuid primary key default gen_random_uuid(),
  business_name     text not null,
  owner_name        text not null,
  email             text not null,
  alert_phone       text not null,
  twilio_number     text,
  greeting          text,
  faq               text not null default '',
  active            boolean not null default false,
  plan              text not null default 'starter',
  dashboard_token   uuid not null default gen_random_uuid(),
  created_at        timestamptz not null default now()
);

-- calls: one row per inbound call
create table calls (
  id               uuid primary key default gen_random_uuid(),
  operator_id      uuid not null references operators(id) on delete cascade,
  caller_number    text not null,
  duration_seconds integer not null default 0,
  transcript       text not null default '',
  summary          text not null default '',
  urgent           boolean not null default false,
  leads            jsonb not null default '[]',
  created_at       timestamptz not null default now()
);

-- leads: denormalised from calls for easy dashboard queries
create table leads (
  id           uuid primary key default gen_random_uuid(),
  operator_id  uuid not null references operators(id) on delete cascade,
  call_id      uuid not null references calls(id) on delete cascade,
  name         text,
  party_size   integer,
  tour_date    text,
  notes        text,
  created_at   timestamptz not null default now()
);

-- index for looking up operators by twilio number (happens on every call)
create index operators_twilio_number_idx on operators(twilio_number);

-- index for dashboard queries
create index calls_operator_id_created_at_idx on calls(operator_id, created_at desc);
create index leads_operator_id_idx on leads(operator_id);
```

- [ ] **Step 2: Run the migration in your Supabase project**

Log in to [supabase.com](https://supabase.com), open your project's SQL editor, paste and run the migration above.

- [ ] **Step 3: Write `src/lib/supabase.ts`**

```typescript
import { createClient } from '@supabase/supabase-js'

if (!process.env.SUPABASE_URL) throw new Error('SUPABASE_URL is required')
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required')

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: Supabase schema and client"
```

---

## Task 3: Express Custom Server

**Files:**
- Create: `server.ts`

- [ ] **Step 1: Write `server.ts`**

```typescript
import 'dotenv/config'
import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import express from 'express'
import { WebSocketServer } from 'ws'
import { handleIncoming } from './api/incoming'
import { handleOperators } from './api/operators'
import { handleStream } from './api/stream'
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

  // Twilio webhook — must be raw body for signature validation
  expressApp.post('/api/incoming', handleIncoming)

  // Operator creation from onboard form
  expressApp.post('/api/operators', handleOperators)

  // All other routes go to Next.js
  expressApp.all('*', (req, res) => {
    const parsedUrl = parse(req.url!, true)
    handle(req, res, parsedUrl)
  })

  const server = createServer(expressApp)

  // WebSocket server for Twilio Media Streams
  const wss = new WebSocketServer({ server, path: '/stream' })
  wss.on('connection', handleStream)

  // Start morning briefing cron
  startBriefingCron()

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`)
  })
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
```

- [ ] **Step 2: Verify it compiles**

```bash
npx tsx --noEmit server.ts 2>&1 | head -20
```

Expected: TypeScript errors about missing modules `./api/incoming`, `./api/operators`, `./api/stream`, `./src/lib/briefing` — that's fine, they don't exist yet.

- [ ] **Step 3: Create stub files so the server can start**

Create `api/incoming.ts`:
```typescript
import { Request, Response } from 'express'
export function handleIncoming(_req: Request, res: Response) {
  res.send('<Response><Say>Coming soon</Say></Response>')
}
```

Create `api/operators.ts`:
```typescript
import { Request, Response } from 'express'
export function handleOperators(_req: Request, res: Response) {
  res.json({ ok: true })
}
```

Create `api/stream.ts`:
```typescript
import { WebSocket } from 'ws'
export function handleStream(ws: WebSocket) {
  ws.close()
}
```

Create `src/lib/briefing.ts`:
```typescript
export function startBriefingCron() {
  console.log('Briefing cron registered (stub)')
}
```

- [ ] **Step 4: Start the dev server and confirm Next.js responds**

```bash
cp .env.example .env.local
# fill in at minimum: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
npm run dev
```

In another terminal:
```bash
curl http://localhost:3000/
```

Expected: HTML response (Next.js placeholder page)

```bash
curl -X POST http://localhost:3000/api/incoming
```

Expected: `<Response><Say>Coming soon</Say></Response>`

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: Express custom server with Next.js integration"
```

---

## Task 4: Twilio Incoming Webhook (TwiML)

**Files:**
- Modify: `api/incoming.ts`
- Create: `src/lib/twilio.ts`
- Create: `__tests__/twiml.test.ts`

- [ ] **Step 1: Write the failing test**

Create `__tests__/twiml.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { buildStreamTwiml } from '../src/lib/twilio'

describe('buildStreamTwiml', () => {
  it('returns TwiML with Stream pointing to the operator', () => {
    process.env.STREAM_HOST = 'app.railway.app'
    const xml = buildStreamTwiml('op-123', '+16045550192')
    expect(xml).toContain('<Connect>')
    expect(xml).toContain('wss://app.railway.app/stream')
    expect(xml).toContain('op-123')
    expect(xml).toContain('+16045550192')
  })

  it('returns fallback TwiML when operator is inactive', () => {
    const xml = buildFallbackTwiml()
    expect(xml).toContain('<Say>')
    expect(xml).not.toContain('<Connect>')
  })
})
```

- [ ] **Step 2: Run the test to confirm it fails**

```bash
npm test -- twiml
```

Expected: FAIL — `buildStreamTwiml` and `buildFallbackTwiml` not found

- [ ] **Step 3: Write `src/lib/twilio.ts`**

```typescript
import twilio from 'twilio'

const VoiceResponse = twilio.twiml.VoiceResponse

export function buildStreamTwiml(operatorId: string, callerNumber: string): string {
  const twiml = new VoiceResponse()
  const connect = twiml.connect()
  const stream = connect.stream({
    url: `wss://${process.env.STREAM_HOST}/stream`,
  })
  stream.parameter({ name: 'operatorId', value: operatorId })
  stream.parameter({ name: 'callerNumber', value: callerNumber })
  return twiml.toString()
}

export function buildFallbackTwiml(): string {
  const twiml = new VoiceResponse()
  twiml.say(
    { voice: 'Polly.Joanna' },
    "Thanks for calling. We're not available right now. Please call back during business hours."
  )
  return twiml.toString()
}

export async function sendUrgentSms(
  toPhone: string,
  businessName: string,
  callerNumber: string
): Promise<void> {
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
  )
  await client.messages.create({
    from: process.env.TWILIO_FROM_NUMBER!,
    to: toPhone,
    body: `⚠️ URGENT — ${businessName}: Caller ${callerNumber} flagged an emergency during an after-hours call. Check your voicemail or call them back immediately.`,
  })
}
```

- [ ] **Step 4: Run the test to confirm it passes**

```bash
npm test -- twiml
```

Expected: PASS

- [ ] **Step 5: Write the full `api/incoming.ts`**

```typescript
import { Request, Response } from 'express'
import { supabase } from '../src/lib/supabase'
import { buildStreamTwiml, buildFallbackTwiml } from '../src/lib/twilio'

export async function handleIncoming(req: Request, res: Response): Promise<void> {
  const toNumber: string = req.body.To || ''
  const fromNumber: string = req.body.From || 'unknown'

  const { data: operator, error } = await supabase
    .from('operators')
    .select('id, active')
    .eq('twilio_number', toNumber)
    .single()

  res.type('text/xml')

  if (error || !operator || !operator.active) {
    res.send(buildFallbackTwiml())
    return
  }

  res.send(buildStreamTwiml(operator.id, fromNumber))
}
```

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: Twilio incoming webhook with TwiML stream response"
```

---

## Task 5: Urgency Detection

**Files:**
- Create: `src/lib/urgency.ts`
- Create: `__tests__/urgency.test.ts`

- [ ] **Step 1: Write the failing test**

Create `__tests__/urgency.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { containsUrgency } from '../src/lib/urgency'

describe('containsUrgency', () => {
  it('detects emergency keyword', () => {
    expect(containsUrgency('this is an emergency')).toBe(true)
  })
  it('detects stranded keyword', () => {
    expect(containsUrgency("we're stranded at the trailhead")).toBe(true)
  })
  it('detects injured keyword', () => {
    expect(containsUrgency('someone is injured')).toBe(true)
  })
  it('is case-insensitive', () => {
    expect(containsUrgency('EMERGENCY')).toBe(true)
  })
  it('returns false for normal booking queries', () => {
    expect(containsUrgency('hi, i want to book the 3-day hike for july 12')).toBe(false)
  })
  it('returns false for empty string', () => {
    expect(containsUrgency('')).toBe(false)
  })
})
```

- [ ] **Step 2: Run the test to confirm it fails**

```bash
npm test -- urgency
```

Expected: FAIL — `containsUrgency` not found

- [ ] **Step 3: Write `src/lib/urgency.ts`**

```typescript
const URGENCY_KEYWORDS = [
  'emergency', 'stranded', 'injured', 'injury',
  'accident', 'stuck', 'hurt', 'help me', 'urgent',
  'dangerous', 'lost', 'trapped', 'rescue',
]

export function containsUrgency(text: string): boolean {
  const lower = text.toLowerCase()
  return URGENCY_KEYWORDS.some(kw => lower.includes(kw))
}
```

- [ ] **Step 4: Run the test to confirm it passes**

```bash
npm test -- urgency
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: urgency keyword detection"
```

---

## Task 6: OpenAI Call Summariser

**Files:**
- Create: `src/lib/openai.ts`
- Create: `__tests__/summarise.test.ts`

- [ ] **Step 1: Write the failing test**

Create `__tests__/summarise.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest'

vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{
            message: {
              content: JSON.stringify({
                summary: 'Sarah called about the 3-day hike for a party of 4 on July 12.',
                leads: [{ name: 'Sarah', party_size: 4, tour_date: 'July 12', notes: 'vegetarian in group' }]
              })
            }
          }]
        })
      }
    }
  }))
}))

import { summariseCall } from '../src/lib/openai'

describe('summariseCall', () => {
  it('returns summary and leads from transcript', async () => {
    const result = await summariseCall('AI: Thanks for calling. Caller: Hi, I am Sarah...')
    expect(result.summary).toContain('Sarah')
    expect(result.leads).toHaveLength(1)
    expect(result.leads[0].name).toBe('Sarah')
    expect(result.leads[0].party_size).toBe(4)
  })

  it('returns empty leads for an empty transcript', async () => {
    const result = await summariseCall('')
    expect(result.summary).toBeDefined()
    expect(Array.isArray(result.leads)).toBe(true)
  })
})
```

- [ ] **Step 2: Run the test to confirm it fails**

```bash
npm test -- summarise
```

Expected: FAIL — `summariseCall` not found

- [ ] **Step 3: Write `src/lib/openai.ts`**

```typescript
import OpenAI from 'openai'
import type { CallSummary } from '../types'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SYSTEM_PROMPT = `You are extracting structured data from a tour booking phone call transcript.
Return valid JSON with exactly these fields:
- summary: string (1-2 sentences describing the call)
- leads: array of objects, each with { name: string|null, party_size: number|null, tour_date: string|null, notes: string|null }

If no leads were captured, return an empty leads array.`

export async function summariseCall(transcript: string): Promise<CallSummary> {
  const content = transcript.trim() || 'Call with no transcript recorded.'

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content },
    ],
    response_format: { type: 'json_object' },
    temperature: 0,
  })

  try {
    const parsed = JSON.parse(completion.choices[0].message.content || '{}')
    return {
      summary: parsed.summary || '',
      leads: Array.isArray(parsed.leads) ? parsed.leads : [],
    }
  } catch {
    return { summary: '', leads: [] }
  }
}
```

- [ ] **Step 4: Run the test to confirm it passes**

```bash
npm test -- summarise
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: GPT-4o call summariser with lead extraction"
```

---

## Task 7: WebSocket Audio Bridge (the core)

**Files:**
- Modify: `api/stream.ts`

This is the most critical file. It bridges Twilio audio ↔ OpenAI Realtime API in real-time.

- [ ] **Step 1: Write the full `api/stream.ts`**

```typescript
import WebSocket from 'ws'
import { IncomingMessage } from 'http'
import { supabase } from '../src/lib/supabase'
import { containsUrgency } from '../src/lib/urgency'
import { sendUrgentSms } from '../src/lib/twilio'
import { summariseCall } from '../src/lib/openai'
import type { Operator } from '../src/types'

const OPENAI_REALTIME_URL =
  'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01'

function buildSystemPrompt(op: Operator): string {
  const greeting = op.greeting
    ?? `Thanks for calling ${op.business_name}! I'm here to help with any questions about our tours.`
  return `You are the after-hours phone assistant for ${op.business_name}.

Your role:
- Answer questions about tours warmly and helpfully
- Capture: caller name, party size, preferred tour date, special requests
- Keep responses concise — this is a phone call, not an email
- If the caller mentions an emergency, injury, being stranded, or any urgent situation, tell them you are flagging it for immediate attention

About ${op.business_name} and their tours:
${op.faq}

Open every call with: "${greeting}"`
}

export async function handleStream(twilioWs: WebSocket, req: IncomingMessage): Promise<void> {
  const url = new URL(req.url ?? '/', `http://localhost`)
  const operatorId = url.searchParams.get('operatorId')

  if (!operatorId) { twilioWs.close(); return }

  const { data: operator, error } = await supabase
    .from('operators')
    .select('*')
    .eq('id', operatorId)
    .single()

  if (error || !operator) { twilioWs.close(); return }

  // Open connection to OpenAI Realtime API
  const openaiWs = new WebSocket(OPENAI_REALTIME_URL, {
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'OpenAI-Beta': 'realtime=v1',
    },
  })

  let streamSid: string | null = null
  let callerNumber = 'unknown'
  let transcript = ''
  let urgent = false
  let callStartTime = Date.now()

  // ── OpenAI events ────────────────────────────────────────────────────────────

  openaiWs.on('open', () => {
    openaiWs.send(JSON.stringify({
      type: 'session.update',
      session: {
        turn_detection: { type: 'server_vad' },
        input_audio_format: 'g711_ulaw',
        output_audio_format: 'g711_ulaw',
        voice: 'alloy',
        instructions: buildSystemPrompt(operator),
        modalities: ['text', 'audio'],
        temperature: 0.8,
      },
    }))
  })

  openaiWs.on('message', (raw: Buffer) => {
    let event: Record<string, unknown>
    try { event = JSON.parse(raw.toString()) } catch { return }

    switch (event.type) {
      case 'response.audio.delta': {
        // Forward AI voice audio back to Twilio caller
        const delta = event.delta as string | undefined
        if (streamSid && delta && twilioWs.readyState === WebSocket.OPEN) {
          twilioWs.send(JSON.stringify({
            event: 'media',
            streamSid,
            media: { payload: delta },
          }))
        }
        break
      }

      case 'response.audio_transcript.delta': {
        // Accumulate full transcript + check for urgency
        const chunk = (event.delta as string) ?? ''
        transcript += chunk
        if (!urgent && containsUrgency(chunk)) {
          urgent = true
          sendUrgentSms(operator.alert_phone, operator.business_name, callerNumber)
            .catch(err => console.error('SMS error:', err))
        }
        break
      }

      case 'error': {
        console.error('OpenAI Realtime error:', JSON.stringify(event.error))
        break
      }
    }
  })

  openaiWs.on('close', () => {
    if (twilioWs.readyState === WebSocket.OPEN) twilioWs.close()
  })

  openaiWs.on('error', (err) => {
    console.error('OpenAI WS error:', err.message)
  })

  // ── Twilio events ────────────────────────────────────────────────────────────

  twilioWs.on('message', (raw: Buffer) => {
    let event: Record<string, unknown>
    try { event = JSON.parse(raw.toString()) } catch { return }

    switch (event.event) {
      case 'start': {
        const start = event.start as Record<string, unknown>
        streamSid = start.streamSid as string
        const params = start.customParameters as Record<string, string> | undefined
        callerNumber = params?.callerNumber ?? 'unknown'
        callStartTime = Date.now()
        break
      }

      case 'media': {
        // Forward caller audio to OpenAI
        if (openaiWs.readyState === WebSocket.OPEN) {
          const media = event.media as Record<string, string>
          openaiWs.send(JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: media.payload,
          }))
        }
        break
      }

      case 'stop': {
        const durationSeconds = Math.round((Date.now() - callStartTime) / 1000)
        openaiWs.close()
        // Fire-and-forget: save call after conversation ends
        persistCall(operator.id, callerNumber, durationSeconds, transcript, urgent)
          .catch(err => console.error('persistCall error:', err))
        break
      }
    }
  })

  twilioWs.on('close', () => {
    if (openaiWs.readyState === WebSocket.OPEN) openaiWs.close()
  })

  twilioWs.on('error', (err) => {
    console.error('Twilio WS error:', err.message)
  })
}

async function persistCall(
  operatorId: string,
  callerNumber: string,
  durationSeconds: number,
  transcript: string,
  urgent: boolean
): Promise<void> {
  const { summary, leads } = await summariseCall(transcript)

  const { data: call, error } = await supabase
    .from('calls')
    .insert({ operator_id: operatorId, caller_number: callerNumber, duration_seconds: durationSeconds, transcript, summary, urgent, leads })
    .select()
    .single()

  if (error || !call) {
    console.error('Failed to save call:', error)
    return
  }

  if (leads.length > 0) {
    await supabase.from('leads').insert(
      leads.map(lead => ({ operator_id: operatorId, call_id: call.id, ...lead }))
    )
  }
}
```

- [ ] **Step 2: Verify TypeScript is happy**

```bash
npx tsc --project tsconfig.server.json --noEmit 2>&1 | head -30
```

Expected: No errors (or only errors about missing env vars, which is fine at compile time)

- [ ] **Step 3: Commit**

```bash
git add api/stream.ts
git commit -m "feat: WebSocket audio bridge — Twilio ↔ OpenAI Realtime API"
```

---

## Task 8: Morning Briefing Cron

**Files:**
- Create: `src/lib/resend.ts`
- Modify: `src/lib/briefing.ts`
- Create: `__tests__/briefing.test.ts`

- [ ] **Step 1: Write the failing test**

Create `__tests__/briefing.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { buildBriefingEmail } from '../src/lib/briefing'
import type { Call, Operator } from '../src/types'

const operator: Operator = {
  id: 'op-1', business_name: 'Blue Ridge Adventures', owner_name: 'Mike',
  email: 'mike@blueridge.com', alert_phone: '+16045550100',
  twilio_number: '+16045550200', greeting: null, faq: '',
  active: true, plan: 'starter', dashboard_token: 'token-abc', created_at: ''
}

const calls: Call[] = [
  {
    id: 'call-1', operator_id: 'op-1', caller_number: '+16045550192',
    duration_seconds: 240, transcript: '', urgent: false,
    summary: 'Sarah asked about the 3-day hike for a party of 4 on July 12.',
    leads: [{ name: 'Sarah', party_size: 4, tour_date: 'July 12', notes: 'vegetarian in group' }],
    created_at: new Date().toISOString()
  },
  {
    id: 'call-2', operator_id: 'op-1', caller_number: '+16045550381',
    duration_seconds: 90, transcript: '', urgent: true,
    summary: 'Guest was stranded at the trailhead.',
    leads: [],
    created_at: new Date().toISOString()
  }
]

describe('buildBriefingEmail', () => {
  it('includes operator name', () => {
    const { subject, html } = buildBriefingEmail(operator, calls)
    expect(html).toContain('Mike')
    expect(html).toContain('Blue Ridge Adventures')
  })

  it('includes call count in subject', () => {
    const { subject } = buildBriefingEmail(operator, calls)
    expect(subject).toContain('2 calls')
  })

  it('marks urgent calls', () => {
    const { html } = buildBriefingEmail(operator, calls)
    expect(html).toContain('URGENT')
  })

  it('includes lead info', () => {
    const { html } = buildBriefingEmail(operator, calls)
    expect(html).toContain('Sarah')
    expect(html).toContain('4')
    expect(html).toContain('July 12')
  })

  it('handles zero calls gracefully', () => {
    const { subject, html } = buildBriefingEmail(operator, [])
    expect(subject).toContain('quiet night')
    expect(html).toContain('No calls')
  })
})
```

- [ ] **Step 2: Run the test to confirm it fails**

```bash
npm test -- briefing
```

Expected: FAIL — `buildBriefingEmail` not found

- [ ] **Step 3: Write `src/lib/resend.ts`**

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail(opts: {
  to: string
  subject: string
  html: string
  from?: string
}): Promise<void> {
  await resend.emails.send({
    from: opts.from ?? 'Your Tour Agent <agent@yourdomain.com>',
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  })
}
```

- [ ] **Step 4: Write the full `src/lib/briefing.ts`**

```typescript
import cron from 'node-cron'
import { supabase } from './supabase'
import { sendEmail } from './resend'
import type { Call, Operator } from '../types'

// ── Email builder (pure function, easy to test) ──────────────────────────────

export function buildBriefingEmail(
  operator: Operator,
  calls: Call[]
): { subject: string; html: string } {
  const leadCount = calls.flatMap(c => c.leads).length
  const urgentCount = calls.filter(c => c.urgent).length
  const baseUrl = process.env.BASE_URL ?? 'https://yourapp.railway.app'

  if (calls.length === 0) {
    return {
      subject: `Quiet night — no calls [${operator.business_name}]`,
      html: `<p>Hi ${operator.owner_name},</p><p>No calls came in overnight. Your agent is running and ready for tonight.</p><p><a href="${baseUrl}/dashboard/${operator.id}?token=${operator.dashboard_token}">View dashboard</a></p>`,
    }
  }

  const subject = `Your overnight briefing — ${calls.length} call${calls.length !== 1 ? 's' : ''}, ${leadCount} lead${leadCount !== 1 ? 's' : ''} [${operator.business_name}]`

  const callRows = calls.map(call => {
    const mins = Math.floor(call.duration_seconds / 60)
    const secs = call.duration_seconds % 60
    const duration = `${mins}:${secs.toString().padStart(2, '0')}`
    const urgentBadge = call.urgent ? ' ⚠️ <strong>URGENT — SMS was sent to your phone</strong>' : ''
    const leadRows = call.leads.map(l => {
      const parts = [l.name, l.party_size ? `${l.party_size} pax` : null, l.tour_date, l.notes].filter(Boolean)
      return `→ Lead: ${parts.join(', ')}`
    }).join('<br>')
    return `
      <div style="border:1px solid #e0e0e0;border-radius:8px;padding:16px;margin:12px 0;">
        <strong>${call.caller_number}</strong> · ${duration}${urgentBadge}<br>
        <p style="margin:8px 0;color:#333;">${call.summary}</p>
        ${leadRows ? `<p style="color:#666;font-size:14px;">${leadRows}</p>` : '<p style="color:#999;font-size:14px;">No lead captured</p>'}
      </div>`
  }).join('')

  const html = `
    <p>Hi ${operator.owner_name},</p>
    <p>Here's what happened while you were offline:</p>
    <h2 style="margin:24px 0 8px;">Calls (${calls.length})</h2>
    ${callRows}
    <p style="margin-top:24px;"><a href="${baseUrl}/dashboard/${operator.id}?token=${operator.dashboard_token}" style="background:#e8820c;color:#fff;padding:10px 20px;border-radius:24px;text-decoration:none;">View full dashboard</a></p>
  `

  return { subject, html }
}

// ── Cron job ─────────────────────────────────────────────────────────────────

export function startBriefingCron(): void {
  // Runs at 6:00 UTC every day
  cron.schedule('0 6 * * *', async () => {
    console.log('[cron] Running morning briefing...')
    await sendAllBriefings()
  })
  console.log('[cron] Morning briefing cron registered (6:00 UTC daily)')
}

async function sendAllBriefings(): Promise<void> {
  const { data: operators, error } = await supabase
    .from('operators')
    .select('*')
    .eq('active', true)

  if (error || !operators) {
    console.error('[briefing] Failed to fetch operators:', error)
    return
  }

  const since = new Date()
  since.setUTCHours(since.getUTCHours() - 24)

  await Promise.allSettled(
    operators.map(op => sendOperatorBriefing(op, since))
  )
}

async function sendOperatorBriefing(operator: Operator, since: Date): Promise<void> {
  const { data: calls, error } = await supabase
    .from('calls')
    .select('*')
    .eq('operator_id', operator.id)
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: true })

  if (error) {
    console.error(`[briefing] Failed to fetch calls for ${operator.business_name}:`, error)
    return
  }

  const { subject, html } = buildBriefingEmail(operator, calls ?? [])

  await sendEmail({ to: operator.email, subject, html })
  console.log(`[briefing] Sent to ${operator.email} (${operator.business_name})`)
}
```

- [ ] **Step 5: Run the test to confirm it passes**

```bash
npm test -- briefing
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: morning briefing cron with email builder"
```

---

## Task 9: Operator Creation API

**Files:**
- Modify: `api/operators.ts`

- [ ] **Step 1: Write the full `api/operators.ts`**

```typescript
import { Request, Response } from 'express'
import { randomUUID } from 'crypto'
import { supabase } from '../src/lib/supabase'
import { sendEmail } from '../src/lib/resend'
import type { OnboardPayload } from '../src/types'

export async function handleOperators(req: Request, res: Response): Promise<void> {
  const body = req.body as OnboardPayload

  // Basic validation
  const required: (keyof OnboardPayload)[] = ['business_name', 'owner_name', 'email', 'alert_phone', 'faq']
  for (const field of required) {
    if (!body[field]) {
      res.status(400).json({ error: `${field} is required` })
      return
    }
  }

  const { data: operator, error } = await supabase
    .from('operators')
    .insert({
      business_name: body.business_name.trim(),
      owner_name: body.owner_name.trim(),
      email: body.email.trim().toLowerCase(),
      alert_phone: body.alert_phone.trim(),
      faq: body.faq.trim(),
      greeting: body.greeting?.trim() || null,
      active: false,
    })
    .select()
    .single()

  if (error || !operator) {
    console.error('Failed to create operator:', error)
    res.status(500).json({ error: 'Failed to save. Please try again.' })
    return
  }

  // Notify you of the new signup
  await sendEmail({
    to: process.env.YOUR_NOTIFICATION_EMAIL!,
    subject: `New signup: ${operator.business_name}`,
    html: `
      <h2>New tour operator signup</h2>
      <p><strong>Business:</strong> ${operator.business_name}</p>
      <p><strong>Owner:</strong> ${operator.owner_name}</p>
      <p><strong>Email:</strong> ${operator.email}</p>
      <p><strong>Alert phone:</strong> ${operator.alert_phone}</p>
      <p><strong>Plan:</strong> ${operator.plan}</p>
      <p><strong>FAQ:</strong></p>
      <pre style="background:#f5f5f5;padding:12px;">${operator.faq}</pre>
      <p><strong>Operator ID:</strong> ${operator.id}</p>
      <hr>
      <p>To activate: set <code>twilio_number</code> and flip <code>active = true</code> in Supabase.</p>
    `,
  }).catch(err => console.error('Failed to send signup notification:', err))

  res.json({ ok: true, operatorId: operator.id })
}
```

- [ ] **Step 2: Commit**

```bash
git add api/operators.ts
git commit -m "feat: operator creation API with signup notification email"
```

---

## Task 10: Landing Page

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Update `src/app/layout.tsx` with fonts and metadata**

```tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tour Agent AI — Never miss an after-hours call again',
  description: 'AI voice agent for adventure tour operators. Answers calls 24/7, captures leads, and delivers a morning briefing to your team.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;0,9..144,900;1,9..144,400&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 2: Port the landing page HTML into `src/app/page.tsx`**

Open `/Users/joshmelcher/phone-agent-landing.html`. The entire `<style>` block goes into `src/app/globals.css` (append to it). The `<body>` content becomes the JSX. Key HTML→JSX changes:

- `class=` → `className=`
- `<svg>` attributes: `stroke-width` → `strokeWidth`, `stroke-linecap` → `strokeLinecap`, `stroke-linejoin` → `strokeLinejoin`, `viewBox` stays as-is
- `style="..."` inline styles → convert to object syntax: `style={{ color: 'red' }}`
- `<!-- comments -->` → `{/* comments */}`
- Self-closing tags: `<br>` → `<br />`, `<input>` → `<input />`
- The `<script>` block at the bottom → extract to a `'use client'` component called `LandingClient` in `src/app/LandingClient.tsx`

Create `src/app/LandingClient.tsx`:

```tsx
'use client'
import { useEffect } from 'react'

export function LandingClient() {
  useEffect(() => {
    // Stars
    const starsCt = document.getElementById('stars')
    if (starsCt) {
      for (let i = 0; i < 130; i++) {
        const s = document.createElement('div')
        s.className = 'star'
        const sz = (Math.random() * 2.2 + 0.4).toFixed(1)
        const x = (Math.random() * 100).toFixed(1)
        const y = (Math.random() * 58).toFixed(1)
        const dur = (Math.random() * 3 + 2).toFixed(1)
        const dly = (Math.random() * 5).toFixed(1)
        const lo = (Math.random() * 0.15 + 0.05).toFixed(2)
        const hi = (Math.random() * 0.5 + 0.35).toFixed(2)
        s.style.cssText = `width:${sz}px;height:${sz}px;left:${x}%;top:${y}%;--dur:${dur}s;--dly:${dly}s;--lo:${lo};--hi:${hi}`
        starsCt.appendChild(s)
      }
    }

    // Nav scroll
    const nav = document.getElementById('nav')
    const onScroll = () => nav?.classList.toggle('scrolled', window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })

    // Scroll reveal
    const revEls = document.querySelectorAll('.rev')
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const delay = parseInt((e.target as HTMLElement).dataset.delay || '0')
          setTimeout(() => e.target.classList.add('on'), delay)
          io.unobserve(e.target)
        }
      })
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' })
    revEls.forEach(el => io.observe(el))

    // Mobile nav
    const burger = document.getElementById('burger')
    const navLinks = document.getElementById('navLinks')
    const handleBurger = () => {
      const open = navLinks?.classList.toggle('open')
      if (burger) burger.textContent = open ? 'Close' : 'Menu'
    }
    burger?.addEventListener('click', handleBurger)
    navLinks?.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open')
        if (burger) burger.textContent = 'Menu'
      })
    })

    // Parallax
    const handleParallax = () => {
      const y = window.scrollY
      document.querySelectorAll('#hero .mt').forEach((el, i) => {
        ;(el as HTMLElement).style.transform = `translateY(${y * 0.025 * (i + 1)}px)`
      })
    }
    window.addEventListener('scroll', handleParallax, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('scroll', handleParallax)
      burger?.removeEventListener('click', handleBurger)
    }
  }, [])

  return null
}
```

Then `src/app/page.tsx` is the full HTML body converted to JSX with `<LandingClient />` added as the first child. Replace all `[YOUR NAME HERE]` and `[Your Name Here]` with your chosen product name (or a placeholder like `TourAgent` until you pick one).

- [ ] **Step 3: Start the dev server and verify the landing page renders**

```bash
npm run dev
```

Open http://localhost:3000 in a browser. Confirm:
- Hero section with mountains and stars renders
- Scroll animations work
- All sections (Problem, How it Works, Features, Pricing, CTA) visible
- Mobile nav burger works

- [ ] **Step 4: Commit**

```bash
git add src/app/
git commit -m "feat: landing page ported from HTML to Next.js"
```

---

## Task 11: Onboarding Wizard

**Files:**
- Create: `src/app/onboard/page.tsx`
- Create: `src/app/onboard/success/page.tsx`

- [ ] **Step 1: Write `src/app/onboard/page.tsx`**

```tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Step = 1 | 2 | 3 | 4 | 5

interface FormData {
  business_name: string
  owner_name: string
  tour_types: string[]
  location: string
  faq: string
  email: string
  alert_phone: string
  greeting: string
}

const TOUR_TYPES = [
  'Mountain & Hiking', 'Whale Watching & Marine', 'Safari & Desert',
  'Kayaking & Water Sports', 'Rainforest & Wildlife', 'Zip-line & Adventure',
  'Cultural & City Tours', 'Other',
]

const INITIAL: FormData = {
  business_name: '', owner_name: '', tour_types: [], location: '',
  faq: '', email: '', alert_phone: '', greeting: '',
}

export default function OnboardPage() {
  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState<FormData>(INITIAL)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const set = (field: keyof FormData, value: string | string[]) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const toggleTourType = (type: string) =>
    set('tour_types', form.tour_types.includes(type)
      ? form.tour_types.filter(t => t !== type)
      : [...form.tour_types, type])

  const next = () => setStep(s => (s + 1) as Step)
  const back = () => setStep(s => (s - 1) as Step)

  const submit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/operators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      router.push('/onboard/success')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSubmitting(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', border: '1px solid rgba(255,255,255,.2)',
    borderRadius: 10, background: 'rgba(255,255,255,.06)', color: '#f0e8d8',
    fontFamily: 'var(--sans)', fontSize: '1rem', outline: 'none',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', marginBottom: 6, fontSize: '.85rem',
    color: 'rgba(240,232,216,.7)', fontWeight: 500,
  }

  return (
    <main style={{
      minHeight: '100vh', background: '#040d1f', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '2rem',
      fontFamily: "'Outfit', system-ui, sans-serif", color: '#f0e8d8',
    }}>
      <div style={{ maxWidth: 560, width: '100%' }}>
        {/* Progress */}
        <div style={{ display: 'flex', gap: 6, marginBottom: '2.5rem' }}>
          {([1,2,3,4,5] as Step[]).map(n => (
            <div key={n} style={{
              flex: 1, height: 4, borderRadius: 2,
              background: n <= step ? '#e8820c' : 'rgba(255,255,255,.12)',
              transition: 'background .3s',
            }} />
          ))}
        </div>

        {/* Step 1: Business */}
        {step === 1 && (
          <div>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', fontWeight: 800, marginBottom: '.5rem' }}>
              Tell us about your business
            </h1>
            <p style={{ opacity: .6, marginBottom: '2rem' }}>We'll use this to personalise your agent.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={labelStyle}>Business name *</label>
                <input style={inputStyle} value={form.business_name}
                  onChange={e => set('business_name', e.target.value)} placeholder="Blue Ridge Adventures" />
              </div>
              <div>
                <label style={labelStyle}>Your name *</label>
                <input style={inputStyle} value={form.owner_name}
                  onChange={e => set('owner_name', e.target.value)} placeholder="Mike Johnson" />
              </div>
              <div>
                <label style={labelStyle}>Location</label>
                <input style={inputStyle} value={form.location}
                  onChange={e => set('location', e.target.value)} placeholder="Banff, Alberta" />
              </div>
              <div>
                <label style={labelStyle}>Type of tours (select all that apply)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                  {TOUR_TYPES.map(type => (
                    <button key={type} onClick={() => toggleTourType(type)} style={{
                      padding: '6px 14px', borderRadius: 50, border: '1px solid',
                      borderColor: form.tour_types.includes(type) ? '#e8820c' : 'rgba(255,255,255,.2)',
                      background: form.tour_types.includes(type) ? 'rgba(232,130,12,.15)' : 'transparent',
                      color: form.tour_types.includes(type) ? '#e8820c' : 'rgba(240,232,216,.7)',
                      cursor: 'pointer', fontSize: '.82rem',
                    }}>{type}</button>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={next} disabled={!form.business_name || !form.owner_name}
              style={{ marginTop: '2rem', background: '#e8820c', color: '#040d1f', border: 'none',
                padding: '12px 28px', borderRadius: 50, fontWeight: 600, fontSize: '1rem',
                cursor: form.business_name && form.owner_name ? 'pointer' : 'not-allowed',
                opacity: form.business_name && form.owner_name ? 1 : .5 }}>
              Continue →
            </button>
          </div>
        )}

        {/* Step 2: FAQ */}
        {step === 2 && (
          <div>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', fontWeight: 800, marginBottom: '.5rem' }}>
              Your tours & FAQ
            </h1>
            <p style={{ opacity: .6, marginBottom: '2rem' }}>
              Paste everything your agent needs to know — tour names, prices, meeting points, what to bring, cancellation policy.
            </p>
            <textarea style={{ ...inputStyle, minHeight: 240, resize: 'vertical' }}
              value={form.faq} onChange={e => set('faq', e.target.value)}
              placeholder={`3-Day Banff Hike — $299 per person
Meeting point: Banff visitor centre, 7:30am
Difficulty: Moderate. Bring layers, good boots, lunch.
Max group size: 12. Min age: 16.
Cancellation: Full refund 48+ hours before. No refund within 48 hours.

...add all your tour details here`} />
            <div style={{ display: 'flex', gap: 12, marginTop: '2rem' }}>
              <button onClick={back} style={{ background: 'transparent', color: '#f0e8d8',
                border: '1px solid rgba(255,255,255,.2)', padding: '12px 24px', borderRadius: 50,
                cursor: 'pointer', fontSize: '1rem' }}>← Back</button>
              <button onClick={next} disabled={!form.faq}
                style={{ background: '#e8820c', color: '#040d1f', border: 'none',
                  padding: '12px 28px', borderRadius: 50, fontWeight: 600, fontSize: '1rem',
                  cursor: form.faq ? 'pointer' : 'not-allowed', opacity: form.faq ? 1 : .5 }}>
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Contact */}
        {step === 3 && (
          <div>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', fontWeight: 800, marginBottom: '.5rem' }}>
              How should we reach you?
            </h1>
            <p style={{ opacity: .6, marginBottom: '2rem' }}>
              Briefing emails go to your inbox. Urgent SMS alerts go to your mobile.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={labelStyle}>Email address (for morning briefings) *</label>
                <input style={inputStyle} type="email" value={form.email}
                  onChange={e => set('email', e.target.value)} placeholder="mike@blueridge.com" />
              </div>
              <div>
                <label style={labelStyle}>Mobile number (for urgent SMS alerts) *</label>
                <input style={inputStyle} type="tel" value={form.alert_phone}
                  onChange={e => set('alert_phone', e.target.value)} placeholder="+1 604 555 0100" />
                <p style={{ fontSize: '.78rem', opacity: .45, marginTop: 4 }}>
                  We only SMS you when a caller flags an emergency.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: '2rem' }}>
              <button onClick={back} style={{ background: 'transparent', color: '#f0e8d8',
                border: '1px solid rgba(255,255,255,.2)', padding: '12px 24px', borderRadius: 50,
                cursor: 'pointer', fontSize: '1rem' }}>← Back</button>
              <button onClick={next} disabled={!form.email || !form.alert_phone}
                style={{ background: '#e8820c', color: '#040d1f', border: 'none',
                  padding: '12px 28px', borderRadius: 50, fontWeight: 600, fontSize: '1rem',
                  cursor: (form.email && form.alert_phone) ? 'pointer' : 'not-allowed',
                  opacity: (form.email && form.alert_phone) ? 1 : .5 }}>
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Agent voice */}
        {step === 4 && (
          <div>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', fontWeight: 800, marginBottom: '.5rem' }}>
              How should your agent greet callers?
            </h1>
            <p style={{ opacity: .6, marginBottom: '2rem' }}>
              Optional — leave blank for a default greeting.
            </p>
            <div>
              <label style={labelStyle}>Opening greeting (optional)</label>
              <input style={inputStyle} value={form.greeting}
                onChange={e => set('greeting', e.target.value)}
                placeholder={`Thanks for calling ${form.business_name || 'us'}! I'm here to help with any questions about our tours.`} />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: '2rem' }}>
              <button onClick={back} style={{ background: 'transparent', color: '#f0e8d8',
                border: '1px solid rgba(255,255,255,.2)', padding: '12px 24px', borderRadius: 50,
                cursor: 'pointer', fontSize: '1rem' }}>← Back</button>
              <button onClick={next}
                style={{ background: '#e8820c', color: '#040d1f', border: 'none',
                  padding: '12px 28px', borderRadius: 50, fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}>
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Review + submit */}
        {step === 5 && (
          <div>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', fontWeight: 800, marginBottom: '.5rem' }}>
              Ready to go live?
            </h1>
            <p style={{ opacity: .6, marginBottom: '2rem' }}>Review your details before we set up your agent.</p>
            <div style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
              borderRadius: 14, padding: '1.5rem', marginBottom: '1.5rem' }}>
              {[
                ['Business', form.business_name],
                ['Owner', form.owner_name],
                ['Location', form.location || '—'],
                ['Tours', form.tour_types.join(', ') || '—'],
                ['Email', form.email],
                ['SMS phone', form.alert_phone],
                ['Greeting', form.greeting || `(default for ${form.business_name})`],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', gap: '1rem', padding: '8px 0',
                  borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                  <span style={{ minWidth: 100, opacity: .5, fontSize: '.88rem' }}>{label}</span>
                  <span style={{ fontSize: '.88rem' }}>{value}</span>
                </div>
              ))}
            </div>
            {error && <p style={{ color: '#ff6b6b', marginBottom: '1rem', fontSize: '.9rem' }}>{error}</p>}
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={back} style={{ background: 'transparent', color: '#f0e8d8',
                border: '1px solid rgba(255,255,255,.2)', padding: '12px 24px', borderRadius: 50,
                cursor: 'pointer', fontSize: '1rem' }}>← Back</button>
              <button onClick={submit} disabled={submitting}
                style={{ background: '#e8820c', color: '#040d1f', border: 'none',
                  padding: '12px 28px', borderRadius: 50, fontWeight: 600, fontSize: '1rem',
                  cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? .7 : 1 }}>
                {submitting ? 'Submitting...' : 'Get my agent →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Write `src/app/onboard/success/page.tsx`**

```tsx
export default function OnboardSuccess() {
  return (
    <main style={{
      minHeight: '100vh', background: '#040d1f', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center',
      fontFamily: "'Outfit', system-ui, sans-serif", color: '#f0e8d8',
    }}>
      <div style={{ maxWidth: 480 }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '2.2rem', fontWeight: 800, marginBottom: '1rem' }}>
          You're on the list!
        </h1>
        <p style={{ opacity: .7, lineHeight: 1.7, marginBottom: '2rem' }}>
          We'll have your AI agent live within 24 hours. Check your email for next steps.
        </p>
        <a href="/" style={{ background: 'rgba(255,255,255,.08)', color: '#f0e8d8',
          padding: '10px 24px', borderRadius: 50, textDecoration: 'none', fontSize: '.9rem' }}>
          ← Back to home
        </a>
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Test the onboarding flow manually**

```bash
npm run dev
```

Visit http://localhost:3000/onboard and step through all 5 steps. Verify:
- Step validation (can't advance without required fields)
- Progress bar updates
- Review step shows correct data
- Submit calls `POST /api/operators` (check network tab)
- Redirects to `/onboard/success`

- [ ] **Step 4: Commit**

```bash
git add src/app/onboard/
git commit -m "feat: 5-step onboarding wizard"
```

---

## Task 12: Operator Dashboard

**Files:**
- Create: `src/app/dashboard/[operatorId]/page.tsx`

- [ ] **Step 1: Write `src/app/dashboard/[operatorId]/page.tsx`**

```tsx
import { supabase } from '@/lib/supabase'
import { notFound, redirect } from 'next/navigation'
import type { Call, Lead, Operator } from '@/types'

interface Props {
  params: { operatorId: string }
  searchParams: { token?: string }
}

export default async function DashboardPage({ params, searchParams }: Props) {
  const { data: operator } = await supabase
    .from('operators')
    .select('*')
    .eq('id', params.operatorId)
    .single()

  if (!operator) notFound()

  // Token auth: dashboard_token must match
  if (searchParams.token !== operator.dashboard_token) {
    redirect('/')
  }

  const since = new Date()
  since.setDate(since.getDate() - 7)

  const { data: calls } = await supabase
    .from('calls')
    .select('*')
    .eq('operator_id', operator.id)
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false })
    .limit(50)

  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .eq('operator_id', operator.id)
    .order('created_at', { ascending: false })
    .limit(20)

  const allCalls: Call[] = calls ?? []
  const allLeads: Lead[] = leads ?? []
  const urgentCount = allCalls.filter(c => c.urgent).length

  return (
    <main style={{
      minHeight: '100vh', background: '#040d1f', padding: '2rem',
      fontFamily: "'Outfit', system-ui, sans-serif", color: '#f0e8d8',
      maxWidth: 900, margin: '0 auto',
    }}>
      <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.8rem', fontWeight: 800, marginBottom: '.25rem' }}>
        {operator.business_name}
      </h1>
      <p style={{ opacity: .45, fontSize: '.85rem', marginBottom: '2.5rem' }}>Last 7 days</p>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
        {[
          { label: 'Calls', value: allCalls.length },
          { label: 'Leads', value: allLeads.length },
          { label: 'Urgent', value: urgentCount },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)',
            borderRadius: 14, padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: '2.5rem', fontWeight: 900,
              color: label === 'Urgent' && value > 0 ? '#ff6b6b' : '#f5a82a' }}>{value}</div>
            <div style={{ opacity: .5, fontSize: '.82rem', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Calls */}
      <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>
        Recent calls
      </h2>
      {allCalls.length === 0 && (
        <p style={{ opacity: .4, marginBottom: '2rem' }}>No calls yet.</p>
      )}
      {allCalls.map(call => {
        const mins = Math.floor(call.duration_seconds / 60)
        const secs = call.duration_seconds % 60
        return (
          <div key={call.id} style={{ background: 'rgba(255,255,255,.04)',
            border: `1px solid ${call.urgent ? 'rgba(255,107,107,.35)' : 'rgba(255,255,255,.07)'}`,
            borderRadius: 12, padding: '1.25rem', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontWeight: 500 }}>{call.caller_number}</span>
              <span style={{ opacity: .45, fontSize: '.82rem' }}>
                {mins}:{secs.toString().padStart(2,'0')} · {new Date(call.created_at).toLocaleDateString()}
                {call.urgent && ' · ⚠️ URGENT'}
              </span>
            </div>
            <p style={{ opacity: .7, fontSize: '.88rem', lineHeight: 1.55 }}>{call.summary || 'No summary.'}</p>
          </div>
        )
      })}

      {/* Leads */}
      {allLeads.length > 0 && (
        <>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.3rem', fontWeight: 700,
            margin: '2rem 0 1rem' }}>Leads captured</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.88rem' }}>
              <thead>
                <tr style={{ opacity: .45, borderBottom: '1px solid rgba(255,255,255,.1)' }}>
                  {['Name', 'Party size', 'Tour date', 'Notes'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allLeads.map((lead: any) => (
                  <tr key={lead.id} style={{ borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                    <td style={{ padding: '10px 12px' }}>{lead.name || '—'}</td>
                    <td style={{ padding: '10px 12px' }}>{lead.party_size ?? '—'}</td>
                    <td style={{ padding: '10px 12px' }}>{lead.tour_date || '—'}</td>
                    <td style={{ padding: '10px 12px', opacity: .6 }}>{lead.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/dashboard/
git commit -m "feat: operator dashboard with calls, leads, and token auth"
```

---

## Task 13: Deploy to Railway

**Files:**
- Modify: `package.json` (build script)

- [ ] **Step 1: Create a Railway account and new project**

Go to [railway.app](https://railway.app) → New Project → Empty Project → Add Service → GitHub Repo (connect your repo).

- [ ] **Step 2: Add all environment variables in Railway**

In the Railway service → Variables, add every key from `.env.example` with real values:
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`
- `OPENAI_API_KEY`
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `YOUR_NOTIFICATION_EMAIL`
- `NODE_ENV=production`
- `PORT=3000`

Leave `STREAM_HOST` blank for now — set it after the first deploy gives you a public URL.

- [ ] **Step 3: Update `package.json` build for production**

Ensure `start` script compiles TypeScript then runs:

```json
{
  "scripts": {
    "dev": "tsx watch server.ts",
    "build": "next build && tsc --project tsconfig.server.json",
    "start": "node dist/server.js",
    "test": "vitest run"
  }
}
```

- [ ] **Step 4: Deploy**

```bash
git add .
git commit -m "chore: production build config"
git push origin main
```

Railway auto-deploys on push. Watch the build log in the Railway dashboard.

- [ ] **Step 5: Set `STREAM_HOST` and configure Twilio**

After deploy succeeds, Railway assigns a public URL like `phone-agent.up.railway.app`.

In Railway Variables, set:
```
STREAM_HOST=phone-agent.up.railway.app
BASE_URL=https://phone-agent.up.railway.app
```

Redeploy (Railway auto-triggers on variable change).

Then in Twilio Console → Phone Numbers → your number → Voice Configuration:
- Webhook URL: `https://phone-agent.up.railway.app/api/incoming`
- HTTP Method: POST

- [ ] **Step 6: End-to-end smoke test**

1. Insert a test operator in Supabase:
```sql
insert into operators (business_name, owner_name, email, alert_phone, twilio_number, faq, active)
values ('Test Tours', 'Josh', 'your@email.com', '+1YOURNUMBER', '+1TWILIONUMBER',
  'We run hiking tours in the mountains. $150 per person. Meeting point: main square.', true);
```

2. Call your Twilio number from your mobile
3. Confirm the AI answers and you can have a conversation about hiking tours
4. Hang up
5. Check Supabase `calls` table — verify the call was saved with transcript and summary
6. Check `leads` table if you gave your name/party size

- [ ] **Step 7: Final commit**

```bash
git add .
git commit -m "chore: Railway deployment verified"
```

---

## Self-Review

**Spec coverage check:**
- ✅ 24/7 voice agent (Tasks 7 — stream.ts OpenAI Realtime bridge)
- ✅ Morning briefing emails (Task 8 — briefing.ts + cron)
- ✅ Urgent SMS escalation (Tasks 5, 7 — urgency detection + sendUrgentSms)
- ✅ Tour FAQ engine (Task 7 — system prompt built from operator.faq)
- ✅ Lead capture (Task 7 — GPT-4o extraction via summariseCall, Task 6)
- ✅ Onboarding wizard (Task 11 — 5-step form)
- ✅ Operator dashboard (Task 12)
- ✅ Operator creation API (Task 9)
- ✅ Supabase schema (Task 2)
- ✅ Railway deploy (Task 13)
- ✅ TwiML webhook (Task 4)
- ✅ Custom Express + Next.js server (Task 3)

**Type consistency check:**
- `Operator` type defined in Task 1, used in Tasks 4, 7, 8, 12 — consistent
- `Call` type defined in Task 1, used in Tasks 7, 8, 12 — consistent
- `Lead` type defined in Task 1, used in Tasks 6, 7, 8, 12 — consistent
- `CallSummary` returned by `summariseCall` in Task 6, consumed in Task 7 `persistCall` — consistent
- `OnboardPayload` defined in Task 1, consumed in Task 9 `handleOperators` — consistent
- `buildBriefingEmail` signature in Task 8 matches test in Task 8 — consistent
- `buildStreamTwiml` signature in Task 4 matches test in Task 4 — consistent
- `containsUrgency` signature in Task 5 matches test in Task 5 — consistent
