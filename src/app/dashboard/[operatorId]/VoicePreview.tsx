'use client'

import { useState } from 'react'

const VOICES = [
  { id: 'pmpt_6a04fb388bc88190a5009264357ecc9104f1bbc2d66a539b', desc: 'Custom voice', label: 'Alicia' },
  { id: 'alloy', desc: 'Neutral, balanced' },
  { id: 'ash', desc: 'Clear, professional male' },
  { id: 'coral', desc: 'Friendly, upbeat female' },
  { id: 'echo', desc: 'Confident male' },
  { id: 'sage', desc: 'Calm, authoritative' },
  { id: 'shimmer', desc: 'Warm, natural female' },
]

interface Voice {
  id: string
  desc: string
  label?: string
}

interface Props {
  currentVoice: string
  greeting: string
  operatorId: string
  token: string
}

export default function VoicePreview({ currentVoice, greeting, operatorId, token }: Props) {
  const [playing, setPlaying] = useState<string | null>(null)
  const [selecting, setSelecting] = useState<string | null>(null)
  const [selected, setSelected] = useState(currentVoice)
  const [msg, setMsg] = useState<string | null>(null)

  async function play(voice: string) {
    setPlaying(voice)
    const text = greeting || 'Thanks for calling! How can I help you today?'
    const url = `/api/voice-preview?voice=${voice}&text=${encodeURIComponent(text)}`
    const audio = new Audio(url)
    audio.onended = () => setPlaying(null)
    audio.onerror = () => setPlaying(null)
    await audio.play().catch(() => setPlaying(null))
  }

  async function selectVoice(v: Voice) {
    setSelecting(v.id)
    setMsg(null)
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operatorId, token, voice: v.id }),
    })
    if (res.ok) {
      setSelected(v.id)
      setMsg(`Voice set to ${v.label ?? v.id}`)
    } else {
      setMsg('Failed to save')
    }
    setSelecting(null)
  }

  return (
    <div style={{ marginTop: '2.5rem' }}>
      <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.3rem', fontWeight: 700, marginBottom: '.25rem' }}>
        Voice
      </h2>
      <p style={{ opacity: .45, fontSize: '.82rem', marginBottom: '1.25rem' }}>
        Preview uses your greeting. Click a voice to hear it, then select.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
        {VOICES.map(v => {
          const isCurrent = selected === v.id
          const isPlaying = playing === v.id
          return (
            <div key={v.id} style={{
              background: isCurrent ? 'rgba(245,168,42,.12)' : 'rgba(255,255,255,.04)',
              border: `1px solid ${isCurrent ? 'rgba(245,168,42,.5)' : 'rgba(255,255,255,.08)'}`,
              borderRadius: 12, padding: '1rem',
              display: 'flex', flexDirection: 'column', gap: '0.6rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{v.label ?? v.id}</span>
                {isCurrent && <span style={{ fontSize: '.7rem', color: '#f5a82a', fontWeight: 600 }}>ACTIVE</span>}
              </div>
              <span style={{ fontSize: '.8rem', opacity: .5 }}>{v.desc}</span>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                <button onClick={() => play(v.id)} disabled={!!playing} style={{
                  flex: 1, padding: '0.5rem', borderRadius: 8, border: '1px solid rgba(255,255,255,.15)',
                  background: 'transparent', color: '#f0e8d8', cursor: 'pointer', fontSize: '.82rem',
                }}>
                  {isPlaying ? '▶ Playing…' : '▶ Preview'}
                </button>
                {!isCurrent && (
                  <button onClick={() => selectVoice(v)} disabled={!!selecting} style={{
                    flex: 1, padding: '0.5rem', borderRadius: 8, border: 'none',
                    background: '#f5a82a', color: '#040d1f', cursor: 'pointer',
                    fontWeight: 600, fontSize: '.82rem',
                  }}>
                    {selecting === v.id ? 'Saving…' : 'Select'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
      {msg && <p style={{ fontSize: '.82rem', color: '#6fcf97', marginTop: '0.75rem' }}>{msg}</p>}
    </div>
  )
}
