# Demo Audio Player Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a styled audio player to the landing page with a generated two-voice demo call showing the AI agent handling an after-hours booking inquiry.

**Architecture:** A one-time Node script generates a WAV file (two OpenAI TTS voices stitched with silence) saved to `public/`. A `DemoPlayer` client component plays it with a progress bar and highlighted transcript. The component is embedded in a new section in `LandingV2.tsx`.

**Tech Stack:** OpenAI TTS (`tts-1`, `pcm` format), Node.js Buffer + WAV header construction, React `useRef`/`useEffect` on HTML5 `<audio>`, existing v2 CSS design tokens.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `scripts/generate-demo-audio.ts` | Create | Calls OpenAI TTS, stitches PCM + silence, writes WAV, logs timestamps |
| `public/demo-call.wav` | Generated | The audio file served statically |
| `src/app/v2/DemoPlayer.tsx` | Create | Client component — audio controls + transcript |
| `src/app/v2/LandingV2.tsx` | Modify | Import and embed `DemoPlayer` in new section |
| `src/app/v2/v2.css` | Modify | Add demo card and player styles |

---

## Task 1: Write the audio generation script

**Files:**
- Create: `scripts/generate-demo-audio.ts`

- [ ] **Step 1: Create the script**

```typescript
import OpenAI from 'openai'
import { writeFileSync } from 'fs'
import path from 'path'
import 'dotenv/config'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SCRIPT = [
  { speaker: 'caller' as const, voice: 'echo' as const,    text: "Hi, I'm trying to book a whale watching tour for this Saturday — I called earlier but no one picked up." },
  { speaker: 'agent'  as const, voice: 'shimmer' as const, text: "Hey there! You've reached Island Adventures after hours. I'm the AI assistant — happy to help. Saturday whale watching, got it. How many people will be joining?" },
  { speaker: 'caller' as const, voice: 'echo' as const,    text: "Just two of us, me and my wife." },
  { speaker: 'agent'  as const, voice: 'shimmer' as const, text: "Perfect. Can I grab your name and a good number so the team can confirm your spot first thing tomorrow morning?" },
  { speaker: 'caller' as const, voice: 'echo' as const,    text: "Sure — Mike Thompson, 555-234-7890." },
  { speaker: 'agent'  as const, voice: 'shimmer' as const, text: "Got it, Mike. I've noted two guests for Saturday. Someone will call you back before 9 AM to confirm availability and take payment. Anything else tonight?" },
  { speaker: 'caller' as const, voice: 'echo' as const,    text: "No, that's great. Thanks." },
  { speaker: 'agent'  as const, voice: 'shimmer' as const, text: "Enjoy your evening, Mike. We'll be in touch tomorrow." },
]

const SILENCE_MS = 600
const SAMPLE_RATE = 24000

function silence(ms: number): Buffer {
  return Buffer.alloc(Math.floor(SAMPLE_RATE * ms / 1000) * 2)
}

function buildWav(pcm: Buffer): Buffer {
  const header = Buffer.alloc(44)
  const dataSize = pcm.length
  header.write('RIFF', 0)
  header.writeUInt32LE(36 + dataSize, 4)
  header.write('WAVE', 8)
  header.write('fmt ', 12)
  header.writeUInt32LE(16, 16)
  header.writeUInt16LE(1, 20)  // PCM
  header.writeUInt16LE(1, 22)  // mono
  header.writeUInt32LE(SAMPLE_RATE, 24)
  header.writeUInt32LE(SAMPLE_RATE * 2, 28) // byte rate
  header.writeUInt16LE(2, 32)  // block align
  header.writeUInt16LE(16, 34) // bits per sample
  header.write('data', 36)
  header.writeUInt32LE(dataSize, 40)
  return Buffer.concat([header, pcm])
}

async function main() {
  const segments: Buffer[] = []
  let accumulatedBytes = 0

  console.log('--- Copy these startTime values into DemoPlayer.tsx ---')

  for (let i = 0; i < SCRIPT.length; i++) {
    const line = SCRIPT[i]

    if (i > 0) {
      const gap = silence(SILENCE_MS)
      segments.push(gap)
      accumulatedBytes += gap.length
    }

    const startTime = accumulatedBytes / (SAMPLE_RATE * 2)
    console.log(`Line ${i} (${line.speaker}): startTime = ${startTime.toFixed(2)}`)

    const response = await openai.audio.speech.create({
      model: 'tts-1',
      voice: line.voice,
      input: line.text,
      response_format: 'pcm',
    })

    const pcm = Buffer.from(await response.arrayBuffer())
    segments.push(pcm)
    accumulatedBytes += pcm.length
  }

  const wav = buildWav(Buffer.concat(segments))
  const out = path.join(process.cwd(), 'public', 'demo-call.wav')
  writeFileSync(out, wav)
  console.log(`\nWrote ${(wav.length / 1024 / 1024).toFixed(1)} MB → ${out}`)
}

main().catch(err => { console.error(err); process.exit(1) })
```

- [ ] **Step 2: Run the script**

```bash
cd /Users/joshmelcher/phone-agent
OPENAI_API_KEY=$(grep OPENAI_API_KEY .env | cut -d= -f2) npx tsx scripts/generate-demo-audio.ts
```

Expected: script prints startTime values for each line and writes `public/demo-call.wav`. Example output:
```
--- Copy these startTime values into DemoPlayer.tsx ---
Line 0 (caller): startTime = 0.00
Line 1 (agent): startTime = 9.84
Line 2 (caller): startTime = 22.16
...
Wrote 5.2 MB → /Users/joshmelcher/phone-agent/public/demo-call.wav
```

Copy the printed startTime values — you'll need them in Task 2.

- [ ] **Step 3: Verify the WAV plays**

Open `public/demo-call.wav` in QuickTime or any audio player. Confirm two distinct voices alternate with short pauses. Both speakers should be clearly audible and the conversation should flow naturally.

- [ ] **Step 4: Commit**

```bash
git add scripts/generate-demo-audio.ts public/demo-call.wav
git commit -m "feat: add demo call audio generation script and generated WAV"
```

---

## Task 2: Build the DemoPlayer component

**Files:**
- Create: `src/app/v2/DemoPlayer.tsx`

- [ ] **Step 1: Create the component**

Replace the placeholder `startTime` values with the actual values printed by the generation script in Task 2, Step 2.

```tsx
'use client'

import { useRef, useState, useEffect } from 'react'

interface Line {
  speaker: 'caller' | 'agent'
  text: string
  startTime: number
}

// Update startTime values from the script output after running generate-demo-audio.ts
const TRANSCRIPT: Line[] = [
  { speaker: 'caller', text: "Hi, I'm trying to book a whale watching tour for this Saturday — I called earlier but no one picked up.", startTime: 0 },
  { speaker: 'agent',  text: "Hey there! You've reached Island Adventures after hours. I'm the AI assistant — happy to help. Saturday whale watching, got it. How many people will be joining?", startTime: 0 },
  { speaker: 'caller', text: "Just two of us, me and my wife.", startTime: 0 },
  { speaker: 'agent',  text: "Perfect. Can I grab your name and a good number so the team can confirm your spot first thing tomorrow morning?", startTime: 0 },
  { speaker: 'caller', text: "Sure — Mike Thompson, 555-234-7890.", startTime: 0 },
  { speaker: 'agent',  text: "Got it, Mike. I've noted two guests for Saturday. Someone will call you back before 9 AM to confirm availability and take payment. Anything else tonight?", startTime: 0 },
  { speaker: 'caller', text: "No, that's great. Thanks.", startTime: 0 },
  { speaker: 'agent',  text: "Enjoy your evening, Mike. We'll be in touch tomorrow.", startTime: 0 },
]

function fmt(s: number) {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export default function DemoPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying]         = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration]       = useState(0)
  const [activeLine, setActiveLine]   = useState(0)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTime = () => {
      setCurrentTime(audio.currentTime)
      let idx = 0
      for (let i = 0; i < TRANSCRIPT.length; i++) {
        if (audio.currentTime >= TRANSCRIPT[i].startTime) idx = i
      }
      setActiveLine(idx)
    }
    const onMeta  = () => setDuration(audio.duration)
    const onEnded = () => setPlaying(false)

    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('ended', onEnded)
    }
  }, [])

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) { audio.pause() } else { audio.play() }
    setPlaying(p => !p)
  }

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * duration
  }

  const activeSpeaker = TRANSCRIPT[activeLine]?.speaker

  return (
    <div className="v2-demo-card">
      <audio ref={audioRef} src="/demo-call.wav" preload="metadata" />

      <div className="v2-demo-speakers">
        <span className={`v2-demo-chip${activeSpeaker === 'caller' ? ' v2-demo-chip--active' : ''}`}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
          Caller
        </span>
        <span className="v2-demo-chip-divider">·</span>
        <span className={`v2-demo-chip${activeSpeaker === 'agent' ? ' v2-demo-chip--active' : ''}`}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
          AI Agent
        </span>
      </div>

      <div className="v2-demo-controls">
        <button className="v2-demo-play" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
          {playing ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          )}
        </button>
        <div className="v2-demo-progress" onClick={seek} role="slider" aria-label="Seek">
          <div className="v2-demo-progress-fill" style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }} />
        </div>
        <span className="v2-demo-time">{fmt(currentTime)} / {fmt(duration)}</span>
      </div>

      <div className="v2-demo-transcript">
        {TRANSCRIPT.map((line, i) => (
          <div key={i} className={`v2-demo-line${i === activeLine && (playing || currentTime > 0) ? ' v2-demo-line--active' : ' v2-demo-line--inactive'}`}>
            <span className="v2-demo-line-label">{line.speaker === 'caller' ? 'Caller' : 'AI Agent'}</span>
            <span className="v2-demo-line-text">{line.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Update timestamps**

Replace each `startTime: 0` in `TRANSCRIPT` with the actual values printed by the generation script. Example (your values will differ):
```ts
{ speaker: 'caller', text: "Hi, I'm trying...", startTime: 0 },
{ speaker: 'agent',  text: "Hey there!...",    startTime: 9.84 },
{ speaker: 'caller', text: "Just two...",      startTime: 22.16 },
// etc.
```

- [ ] **Step 3: Commit**

```bash
git add src/app/v2/DemoPlayer.tsx
git commit -m "feat: add DemoPlayer client component with transcript sync"
```

---

## Task 3: Add demo section styles to v2.css

**Files:**
- Modify: `src/app/v2/v2.css`

- [ ] **Step 1: Append styles at the end of v2.css**

```css
/* ── Demo Player ── */
.v2-demo-card {
  background: var(--v2-navy-900);
  border-radius: 16px;
  padding: 32px;
  max-width: 680px;
  margin: 48px auto 0;
  box-shadow: var(--v2-shadow-lg);
}

.v2-demo-speakers {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
}

.v2-demo-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 999px;
  font-family: var(--v2-font-body);
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--v2-fg-on-dark-mut);
  border: 1px solid var(--v2-border-dark);
  transition: color 0.2s, border-color 0.2s, background 0.2s;
}

.v2-demo-chip--active {
  color: var(--v2-coral-500);
  border-color: var(--v2-coral-500);
  background: rgba(242, 106, 31, 0.10);
}

.v2-demo-chip-divider {
  color: var(--v2-fg-on-dark-mut);
  font-size: 0.9rem;
}

.v2-demo-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
}

.v2-demo-play {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--v2-coral-500);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: background 0.15s, transform 0.1s;
}

.v2-demo-play:hover  { background: var(--v2-coral-600); }
.v2-demo-play:active { transform: scale(0.95); }

.v2-demo-progress {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.12);
  cursor: pointer;
  position: relative;
}

.v2-demo-progress-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  border-radius: 2px;
  background: var(--v2-coral-500);
  transition: width 0.1s linear;
}

.v2-demo-time {
  font-family: var(--v2-font-mono);
  font-size: 0.75rem;
  color: var(--v2-fg-on-dark-mut);
  white-space: nowrap;
  flex-shrink: 0;
}

.v2-demo-transcript {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 300px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.1) transparent;
}

.v2-demo-line {
  display: flex;
  gap: 12px;
  padding-left: 12px;
  border-left: 3px solid transparent;
  transition: opacity 0.3s, border-color 0.3s;
}

.v2-demo-line--active {
  border-left-color: var(--v2-coral-500);
  opacity: 1;
}

.v2-demo-line--inactive {
  opacity: 0.35;
}

.v2-demo-line-label {
  flex-shrink: 0;
  font-family: var(--v2-font-body);
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--v2-coral-400);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding-top: 2px;
  min-width: 60px;
}

.v2-demo-line-text {
  font-family: var(--v2-font-body);
  font-size: 0.9rem;
  color: rgba(245, 239, 228, 0.88);
  line-height: 1.5;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/v2/v2.css
git commit -m "feat: add demo player styles to v2 design system"
```

---

## Task 4: Embed DemoPlayer in the landing page

**Files:**
- Modify: `src/app/v2/LandingV2.tsx`

- [ ] **Step 1: Add the import** at the top of `LandingV2.tsx`, after the existing imports:

```tsx
import DemoPlayer from './DemoPlayer'
```

- [ ] **Step 2: Insert the demo section**

Find the closing `</section>` tag for `#v2-how` (around line 265) and insert the new section immediately after it:

```tsx
      {/* ── DEMO CALL ── */}
      <section id="v2-demo" className="v2-section">
        <div className="v2-container" style={{ textAlign: 'center' }}>
          <span className="v2-eyebrow" style={{ display: 'inline-block' }}>Hear it in action</span>
          <h2 className="v2-display-md" style={{ marginTop: 20, maxWidth: 600, marginInline: 'auto' }}>
            A real after-hours call
          </h2>
          <p className="v2-lead" style={{ marginTop: 16, maxWidth: 480, marginInline: 'auto' }}>
            A visitor calls after hours trying to book a whale watching tour. The AI handles it — no hold music, no missed lead.
          </p>
          <DemoPlayer />
        </div>
      </section>
```

- [ ] **Step 3: Verify the build**

```bash
cd /Users/joshmelcher/phone-agent && npm run build 2>&1 | tail -20
```

Expected: build completes with no TypeScript errors. If errors appear, fix them before committing.

- [ ] **Step 4: Smoke test locally**

```bash
npm run dev
```

Open `http://localhost:3000` in a browser. Scroll to the "Hear it in action" section. Click play. Confirm:
- Audio plays
- Progress bar fills
- Active transcript line highlights in coral as the call progresses
- Speaker chips switch between Caller and AI Agent

- [ ] **Step 5: Commit and push**

```bash
git add src/app/v2/LandingV2.tsx
git commit -m "feat: embed DemoPlayer in landing page between how-it-works and features"
git push origin main
```

Railway will auto-deploy. Visit the live URL to confirm the section renders and audio plays.
