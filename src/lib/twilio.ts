import twilio from 'twilio'

const VoiceResponse = twilio.twiml.VoiceResponse

export function buildStreamTwiml(operatorId: string, callerNumber: string): string {
  const twiml = new VoiceResponse()
  const connect = twiml.connect()
  const stream = connect.stream({
    url: `wss://${process.env.STREAM_HOST}/stream/${operatorId}/${encodeURIComponent(callerNumber)}`,
  })
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
