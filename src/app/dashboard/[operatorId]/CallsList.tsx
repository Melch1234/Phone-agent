'use client'

import { useState } from 'react'

interface Call {
  id: string
  caller_number: string
  duration_seconds: number
  summary: string
  transcript: string
  urgent: boolean
  created_at: string
}

interface Props {
  calls: Call[]
  operatorId: string
  token: string
}

export default function CallsList({ calls: initial, operatorId, token }: Props) {
  const [calls, setCalls] = useState(initial)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)
  const [openTranscripts, setOpenTranscripts] = useState<Set<string>>(new Set())

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    setSelected(prev => prev.size === calls.length ? new Set() : new Set(calls.map(c => c.id)))
  }

  function toggleTranscript(id: string) {
    setOpenTranscripts(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function deleteSelected() {
    if (selected.size === 0) return
    setDeleting(true)
    await Promise.allSettled([...selected].map(callId =>
      fetch('/api/calls', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId, operatorId, token }),
      })
    ))
    setCalls(prev => prev.filter(c => !selected.has(c.id)))
    setSelected(new Set())
    setDeleting(false)
  }

  if (calls.length === 0) return <p style={{ opacity: .4, marginBottom: '2rem' }}>No calls yet.</p>

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '.82rem', opacity: .5 }}>
          <input type="checkbox" checked={selected.size === calls.length} onChange={toggleAll} />
          Select all
        </label>
        {selected.size > 0 && (
          <button type="button" onClick={deleteSelected} disabled={deleting} style={{
            background: 'rgba(255,107,107,.15)', border: '1px solid rgba(255,107,107,.35)',
            color: '#ff6b6b', borderRadius: 8, padding: '4px 14px',
            cursor: 'pointer', fontSize: '.82rem', fontWeight: 600,
          }}>
            {deleting ? 'Deleting…' : `Delete ${selected.size} call${selected.size !== 1 ? 's' : ''}`}
          </button>
        )}
      </div>

      {calls.map(call => {
        const mins = Math.floor(call.duration_seconds / 60)
        const secs = call.duration_seconds % 60
        const isOpen = openTranscripts.has(call.id)
        const isSelected = selected.has(call.id)

        return (
          <div key={call.id} style={{
            background: isSelected ? 'rgba(245,168,42,.06)' : 'rgba(255,255,255,.04)',
            border: `1px solid ${isSelected ? 'rgba(245,168,42,.3)' : call.urgent ? 'rgba(255,107,107,.35)' : 'rgba(255,255,255,.07)'}`,
            borderRadius: 12, padding: '1.25rem', marginBottom: '0.75rem',
            cursor: 'pointer',
          }} onClick={() => toggle(call.id)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" checked={isSelected} onChange={() => toggle(call.id)}
                  onClick={e => e.stopPropagation()} style={{ cursor: 'pointer' }} />
                <span style={{ fontWeight: 500 }}>{call.caller_number}</span>
              </div>
              <span style={{ opacity: .45, fontSize: '.82rem' }}>
                {mins}:{secs.toString().padStart(2, '0')} · {new Date(call.created_at).toLocaleDateString()}
                {call.urgent && ' · ⚠️ URGENT'}
              </span>
            </div>
            <p style={{ opacity: .7, fontSize: '.88rem', lineHeight: 1.55, margin: '0 0 8px', paddingLeft: 26 }}>
              {call.summary || 'No summary.'}
            </p>
            {call.transcript && (
              <div style={{ paddingLeft: 26 }} onClick={e => e.stopPropagation()}>
                <button type="button" onClick={() => toggleTranscript(call.id)} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgba(240,232,216,.4)', fontSize: '.78rem', padding: 0,
                }}>
                  {isOpen ? '▲ Hide transcript' : '▼ Read transcript'}
                </button>
                {isOpen && (
                  <pre style={{
                    marginTop: 10, padding: '0.75rem', borderRadius: 8,
                    background: 'rgba(0,0,0,.25)', fontSize: '.78rem',
                    lineHeight: 1.6, whiteSpace: 'pre-wrap', color: 'rgba(240,232,216,.65)',
                    maxHeight: 300, overflowY: 'auto',
                  }}>
                    {call.transcript}
                  </pre>
                )}
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}
