# Phone AI Agent for Tour Operators — Design Spec
**Date:** 2026-05-08  
**Status:** Approved

---

## Overview

A standalone SaaS product that gives tour operators a 24/7 AI voice agent to handle after-hours calls. The agent answers questions, captures leads, escalates emergencies via SMS, and delivers a structured morning briefing email to the operator every day.

**Not part of MooseMail.** Separate business, separate codebase, separate domain.

---

## Architecture

### Single service — Next.js custom server on Railway

One Node.js process handles everything:

```
Express custom server (Railway)
├── WebSocket /stream        → Twilio ↔ OpenAI Realtime API audio bridge
├── POST /api/incoming       → TwiML webhook (initiates stream)
├── POST /api/call-end       → saves transcript + leads to Supabase
├── node-cron @ 6am          → morning briefing emails via Resend
└── /* (all other routes)   → Next.js (landing page, /onboard, /dashboard)
```

**Why Railway over Vercel:** The OpenAI Realtime API requires a persistent bidirectional WebSocket connection. Vercel serverless functions cannot hold long-lived WebSocket connections. Railway runs a persistent Node.js process — one service, one deploy, no juggling two platforms.

**Why Next.js custom server over plain Express:** Get React/Next.js for all web pages (landing, onboarding wizard, dashboard) while still running Express + WebSocket in the same process.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (custom server) |
| Server | Express + ws (WebSocket library) |
| Voice AI | OpenAI Realtime API (gpt-4o-realtime-preview) |
| Telephony | Twilio Voice + SMS |
| Database | Supabase (Postgres) |
| Email | Resend |
| Hosting | Railway |
| Language | TypeScript throughout |

---

## Call Flow

```
1. Caller dials operator's Twilio number
2. Twilio → POST /api/incoming
   Server looks up operator by Twilio number → returns TwiML:
   <Connect><Stream url="wss://app.railway.app/stream?operatorId=xxx"/></Connect>

3. WebSocket opens at /stream
   Server loads operator config (FAQ, greeting, business name) from Supabase
   Server opens second WebSocket to OpenAI Realtime API
   System prompt built from operator's data

4. Audio bridge runs (bidirectional, real-time)
   Twilio mulaw audio → server → OpenAI Realtime API (AI hears caller)
   OpenAI audio → server → Twilio (caller hears AI)
   Latency: <500ms — sounds like a real person

5. Urgency detection (runs during call)
   Keywords: "emergency", "stranded", "injured", "cancel", "accident", "stuck"
   Detected → Twilio SMS fired to operator's alert_phone immediately

6. Call ends
   Server sends transcript to GPT-4o for structured summary extraction
   Saves call + leads to Supabase

7. 6am daily cron (node-cron)
   Pulls all calls from past 24h per active operator
   Sends morning briefing email via Resend
```

---

## Data Model

### `operators`
```sql
id              uuid primary key
business_name   text not null
owner_name      text not null
email           text not null        -- briefing emails sent here
alert_phone     text not null        -- urgent SMS sent here
twilio_number   text                 -- assigned manually by you after signup
greeting        text                 -- custom opening line (optional)
faq             text                 -- tour info, pricing, policies (free text)
active          boolean default false
plan            text default 'starter'
created_at      timestamptz default now()
```

### `calls`
```sql
id              uuid primary key
operator_id     uuid references operators(id)
caller_number   text
duration_seconds integer
transcript      text                 -- full conversation
summary         text                 -- AI-generated structured summary
urgent          boolean default false
leads           jsonb                -- [{name, party_size, tour_date, notes}]
created_at      timestamptz default now()
```

### `leads`
```sql
id              uuid primary key
operator_id     uuid references operators(id)
call_id         uuid references calls(id)
name            text
party_size      integer
tour_date       text
notes           text
created_at      timestamptz default now()
```

---

## AI System Prompt Template

```
You are the after-hours phone assistant for {business_name}.

Your role:
- Answer questions about tours warmly and helpfully
- Capture key details: caller's name, party size, preferred tour date, special requests
- Keep responses concise — this is a phone call, not an email
- If caller mentions emergency, injury, being stranded, or any urgent situation, 
  tell them you are flagging it for immediate attention

About {business_name} and their tours:
{faq}

Opening greeting: "{greeting}"
```

---

## Onboarding Wizard (`/onboard`)

5-step form, no login required. Creates an `operators` row with `active: false`.

| Step | Fields |
|---|---|
| 1. Business | business_name, tour types (multi-select), location |
| 2. Tours & FAQ | Large textarea: tour details, pricing, meeting points, cancellation policy |
| 3. Contact | email (briefings), alert_phone (urgent SMS) |
| 4. Agent voice | Custom greeting (optional — defaults to "Thanks for calling [name]...") |
| 5. Confirm | Review all details → Submit |

**On submit:**
- Creates `operators` row (`active: false`)
- Sends Resend notification email to you with all operator details
- Shows confirmation: "We'll have your agent live within 24 hours"

**You then manually:**
1. Provision a Twilio number
2. Point its webhook to `/api/incoming`
3. Update `twilio_number` in Supabase
4. Set `active: true`

---

## Operator Dashboard (`/dashboard/[operatorId]`)

Protected by magic link (email → time-limited token, v1).

**Sections:**
- At a glance: overnight call count, lead count, urgent alert count
- Recent calls list: caller number, duration, AI summary, leads captured, urgent flag
- Leads table: name, party size, requested date, notes
- Settings: update FAQ, change briefing email, change SMS alert number

Each dashboard URL is scoped to a single operator — no cross-operator data access.

---

## Morning Briefing Email

**Schedule:** 6am UTC daily (v1 — all operators get the same send time)  
**Sender:** Resend  
**Subject:** `Your overnight briefing — [X] calls, [Y] leads [Business Name]`

**Body:**
```
Hi [owner_name],

Here's what happened while you were offline:

CALLS (3)
• +1 604 555 0192 · 4 min
  Sarah asked about the 3-day hike, party of 4, July 12.
  → Lead: Sarah M., 4 pax, July 12, vegetarian in group

• +1 778 555 0381 · 2 min
  Asked about the weekend cancellation policy.
  → No lead captured

• +1 250 555 0092 · 1 min ⚠️ URGENT
  Guest said they were stranded at the trailhead.
  → SMS alert sent to your phone at 11:42pm

View your dashboard → [link]
```

If no calls: still sends a "quiet night" email so operators know the system is working.

---

## Pricing (from landing page)

| Plan | Price | Calls | Tour Profiles |
|---|---|---|---|
| Starter | $97/mo | 200 calls | 1 |
| Growth | $197/mo | 600 calls | 5 |
| Agency | $397/mo | Unlimited | Unlimited |

Stripe billing is **out of scope for v1** — manually invoice early operators. Add Stripe once you have 5+ paying customers.

---

## Out of Scope (v1)

- Stripe / automated billing
- Automated Twilio number provisioning
- Multi-language support
- Calendar / booking system integration
- White-label dashboard for Agency plan
- Analytics beyond call counts and leads

---

## Environment Variables Required

```
# Twilio
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_FROM_NUMBER       # your sending number for SMS alerts

# OpenAI
OPENAI_API_KEY

# Supabase
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY

# Resend
RESEND_API_KEY

# App
YOUR_NOTIFICATION_EMAIL  # where new signup alerts go to you
BASE_URL                 # https://yourapp.railway.app
```

---

## Project Structure

```
phone-agent/
├── server.ts              # Express custom server entry point
├── src/
│   ├── app/               # Next.js app router
│   │   ├── page.tsx       # Landing page (ported from HTML)
│   │   ├── onboard/       # Multi-step onboarding wizard
│   │   └── dashboard/
│   │       └── [operatorId]/
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── twilio.ts
│   │   ├── resend.ts
│   │   └── briefing.ts    # Morning email builder
│   └── api/               # Express routes (not Next.js API routes)
│       ├── incoming.ts    # TwiML webhook
│       ├── call-end.ts    # Save call data
│       └── stream.ts      # WebSocket bridge (Twilio ↔ OpenAI)
├── package.json
└── railway.toml
```
