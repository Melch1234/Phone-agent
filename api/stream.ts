import WebSocket from 'ws'
import { IncomingMessage } from 'http'
import { supabase } from '../src/lib/supabase'
import { containsUrgency } from '../src/lib/urgency'
import { sendUrgentSms } from '../src/lib/twilio'
import { summariseCall } from '../src/lib/openai'
import type { Operator } from '../src/types'

const OPENAI_REALTIME_URL =
  'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview'

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
  console.log('[stream] connection url:', req.url)
  const parts = (req.url ?? '').split('/')
  const operatorId = parts[2]
  const callerNumber = decodeURIComponent(parts[3] ?? 'unknown')
  console.log('[stream] operatorId:', operatorId, 'caller:', callerNumber)

  if (!operatorId) { twilioWs.close(); return }

  // Buffer Twilio messages that arrive during the async Supabase lookup
  const twilioBuffer: Buffer[] = []
  const bufferTwilio = (raw: Buffer) => twilioBuffer.push(raw)
  twilioWs.on('message', bufferTwilio)

  const { data: operator, error } = await supabase
    .from('operators')
    .select('*')
    .eq('id', operatorId)
    .single()

  if (error || !operator) {
    console.log('[stream] operator lookup failed:', error)
    twilioWs.close()
    return
  }

  const openaiWs = new WebSocket(OPENAI_REALTIME_URL, {
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'OpenAI-Beta': 'realtime=v1',
    },
  })

  let streamSid: string | null = null
  let audioBuffer: string[] = []
  let transcript = ''
  let urgent = false
  let callStartTime = Date.now()

  function sendAudio(delta: string) {
    if (streamSid && twilioWs.readyState === WebSocket.OPEN) {
      twilioWs.send(JSON.stringify({ event: 'media', streamSid, media: { payload: delta } }))
    } else {
      audioBuffer.push(delta)
    }
  }

  openaiWs.on('open', () => {
    console.log('[stream] OpenAI WS connected, sending session config')
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
      case 'session.updated': {
        console.log('[stream] session ready, triggering greeting')
        openaiWs.send(JSON.stringify({ type: 'response.create' }))
        break
      }
      case 'response.audio.delta': {
        const delta = event.delta as string | undefined
        if (delta) sendAudio(delta)
        break
      }
      case 'response.audio_transcript.delta': {
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
    console.error('[stream] OpenAI WS error:', err.message)
    if (twilioWs.readyState === WebSocket.OPEN) twilioWs.close()
  })

  function handleTwilioMessage(raw: Buffer) {
    let event: Record<string, unknown>
    try { event = JSON.parse(raw.toString()) } catch { return }

    switch (event.event) {
      case 'start': {
        const start = event.start as Record<string, unknown>
        streamSid = start.streamSid as string
        callStartTime = Date.now()
        console.log('[stream] Twilio start, streamSid:', streamSid)
        // Flush any audio that arrived before streamSid was known
        for (const delta of audioBuffer) {
          if (twilioWs.readyState === WebSocket.OPEN) {
            twilioWs.send(JSON.stringify({ event: 'media', streamSid, media: { payload: delta } }))
          }
        }
        audioBuffer = []
        break
      }
      case 'media': {
        if (openaiWs.readyState === WebSocket.OPEN) {
          const media = event.media as Record<string, string>
          openaiWs.send(JSON.stringify({ type: 'input_audio_buffer.append', audio: media.payload }))
        }
        break
      }
      case 'stop': {
        const durationSeconds = Math.round((Date.now() - callStartTime) / 1000)
        openaiWs.close()
        persistCall(operator.id, callerNumber, durationSeconds, transcript, urgent)
          .catch(err => console.error('persistCall error:', err))
        break
      }
    }
  }

  // Swap buffering listener for real handler and replay buffered messages
  twilioWs.removeListener('message', bufferTwilio)
  twilioWs.on('message', handleTwilioMessage)
  for (const raw of twilioBuffer) handleTwilioMessage(raw)

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
