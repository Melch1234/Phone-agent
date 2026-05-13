import { Request, Response } from 'express'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const ALLOWED_VOICES = ['alloy', 'ash', 'coral', 'echo', 'sage', 'shimmer']

function isAllowedVoice(v: string) {
  return ALLOWED_VOICES.includes(v) || v.startsWith('pmpt_')
}

export async function handleVoicePreview(req: Request, res: Response): Promise<void> {
  const { voice, text } = req.query as { voice: string; text?: string }

  if (!voice || !isAllowedVoice(voice)) {
    res.status(400).json({ error: 'Invalid voice' })
    return
  }

  const sample = (text || 'Thanks for calling! How can I help you today?').slice(0, 200)

  const mp3 = await openai.audio.speech.create({
    model: 'tts-1',
    voice: voice as RealtimeVoice,
    input: sample,
  })

  const buffer = Buffer.from(await mp3.arrayBuffer())
  res.setHeader('Content-Type', 'audio/mpeg')
  res.setHeader('Cache-Control', 'public, max-age=3600')
  res.send(buffer)
}
