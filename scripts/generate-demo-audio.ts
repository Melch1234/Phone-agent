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
