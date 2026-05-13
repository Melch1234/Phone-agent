'use client'

import { useState } from 'react'

interface Props {
  call: {
    id: string
    caller_number: string
    duration_seconds: number
    summary: string
    transcript: string
    urgent: boolean
    created_at: string
  }
  operatorId: string
  token: string
}

export default function CallCard({ call, operatorId, token }: Props) {
  const [open, setOpen] = useState(false)
  const [deleted, setDeleted] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const mins = Math.floor(call.duration_seconds / 60)
  const secs = call.duration_seconds % 60

  async function deleteCall() {
    if (!confirm('Delete this call?')) return
    setDeleting(true)
    const res = await fetch('/api/calls', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callId: call.id, operatorId, token }),
    })
    if (res.ok) setDeleted(true)
    else setDeleting(false)
  }

  if (deleted) return null

  return (
    <div style={{
      background: 'rgba(255,255,255,.04)',
      border: `1px solid ${call.urgent ? 'rgba(255,107,107,.35)' : 'rgba(255,255,255,.07)'}`,
      borderRadius: 12, padding: '1.25rem', marginBottom: '0.75rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontWeight: 500 }}>{call.caller_number}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ opacity: .45, fontSize: '.82rem' }}>
            {mins}:{secs.toString().padStart(2, '0')} · {new Date(call.created_at).toLocaleDateString()}
            {call.urgent && ' · ⚠️ URGENT'}
          </span>
          <button
            type="button"
            onClick={deleteCall}
            disabled={deleting}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(240,232,216,.25)', fontSize: '.78rem', padding: 0,
            }}
          >
            {deleting ? '…' : '✕'}
          </button>
        </div>
      </div>
      <p style={{ opacity: .7, fontSize: '.88rem', lineHeight: 1.55, margin: '0 0 8px' }}>
        {call.summary || 'No summary.'}
      </p>
      {call.transcript && (
        <>
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(240,232,216,.4)', fontSize: '.78rem', padding: 0,
            }}
          >
            {open ? '▲ Hide transcript' : '▼ Read transcript'}
          </button>
          {open && (
            <pre style={{
              marginTop: 10, padding: '0.75rem', borderRadius: 8,
              background: 'rgba(0,0,0,.25)', fontSize: '.78rem',
              lineHeight: 1.6, whiteSpace: 'pre-wrap', color: 'rgba(240,232,216,.65)',
              maxHeight: 300, overflowY: 'auto',
            }}>
              {call.transcript}
            </pre>
          )}
        </>
      )}
    </div>
  )
}
