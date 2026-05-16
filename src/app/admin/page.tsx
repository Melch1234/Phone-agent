'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

interface Operator {
  id: string
  business_name: string
  owner_name: string
  email: string
  alert_phone: string
  twilio_number: string | null
  active: boolean
  pin: string | null
  created_at: string
}

const s = {
  wrap: { minHeight: '100vh', background: '#040d1f', padding: '2rem', fontFamily: 'Outfit, system-ui, sans-serif', color: '#f0e8d8' },
  h1: { fontFamily: 'Fraunces, serif', fontSize: '1.8rem', fontWeight: 800, marginBottom: '2rem' },
  table: { width: '100%', borderCollapse: 'collapse' as const, fontSize: '.88rem' },
  th: { textAlign: 'left' as const, padding: '8px 12px', opacity: .45, fontWeight: 500, borderBottom: '1px solid rgba(255,255,255,.1)', whiteSpace: 'nowrap' as const },
  td: { padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,.05)', verticalAlign: 'middle' as const },
  input: { background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6, padding: '4px 8px', color: '#f0e8d8', fontSize: '.82rem', width: 160 },
  badge: (active: boolean) => ({
    display: 'inline-block', padding: '2px 10px', borderRadius: 50, fontSize: '.72rem', fontWeight: 700,
    background: active ? 'rgba(111,207,151,.15)' : 'rgba(255,255,255,.06)',
    color: active ? '#6fcf97' : 'rgba(240,232,216,.35)',
    border: `1px solid ${active ? 'rgba(111,207,151,.3)' : 'rgba(255,255,255,.1)'}`,
  }),
  btn: (primary: boolean) => ({
    padding: '4px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '.78rem', fontWeight: 600,
    background: primary ? '#f5a82a' : 'rgba(255,255,255,.08)', color: primary ? '#040d1f' : '#f0e8d8',
  }),
}

function AdminContent() {
  const params = useSearchParams()
  const [operators, setOperators] = useState<Operator[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    // If token is in URL, redirect to auth endpoint to set cookie + strip token from URL
    const token = params.get('token')
    if (token) {
      window.location.replace(`/api/auth/admin?token=${encodeURIComponent(token)}`)
      return
    }

    // No URL token — rely on cookie being sent automatically
    fetch('/api/admin/operators')
      .then(r => r.json())
      .then(data => { setOperators(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [params])

  async function save(op: Operator) {
    setSaving(op.id)
    await fetch('/api/admin/operators', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operatorId: op.id, twilio_number: editing[op.id] ?? op.twilio_number }),
    })
    setOperators(prev => prev.map(o => o.id === op.id ? { ...o, twilio_number: editing[op.id] ?? o.twilio_number } : o))
    setSaving(null)
  }

  async function toggleActive(op: Operator) {
    setSaving(op.id)
    await fetch('/api/admin/operators', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operatorId: op.id, active: !op.active }),
    })
    setOperators(prev => prev.map(o => o.id === op.id ? { ...o, active: !o.active } : o))
    setSaving(null)
  }

  if (loading) return <main style={s.wrap}><p style={{ opacity: .4 }}>Loading…</p></main>
  if (!operators.length) return <main style={s.wrap}><p style={{ opacity: .4 }}>No operators or invalid token.</p></main>

  return (
    <main style={s.wrap}>
      <h1 style={s.h1}>Operators</h1>
      <p style={{ opacity: .35, fontSize: '.78rem', marginBottom: '1.5rem' }}>
        Webhook URL for all Twilio numbers: <code>https://phone-agent-production-e8a7.up.railway.app/api/incoming</code>
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table style={s.table}>
          <thead>
            <tr>
              {['Business', 'Owner', 'Email', 'Alert phone', 'Twilio number', 'PIN', 'Status', ''].map(h => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {operators.map(op => (
              <tr key={op.id}>
                <td style={s.td}>{op.business_name}</td>
                <td style={s.td}>{op.owner_name}</td>
                <td style={s.td}>{op.email}</td>
                <td style={s.td}>{op.alert_phone}</td>
                <td style={s.td}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <input
                      style={s.input}
                      defaultValue={op.twilio_number ?? ''}
                      placeholder="+16395550100"
                      onChange={e => setEditing(prev => ({ ...prev, [op.id]: e.target.value }))}
                    />
                    {editing[op.id] !== undefined && editing[op.id] !== (op.twilio_number ?? '') && (
                      <button style={s.btn(true)} onClick={() => save(op)} disabled={saving === op.id}>
                        {saving === op.id ? '…' : 'Save'}
                      </button>
                    )}
                  </div>
                </td>
                <td style={s.td} title="Dashboard PIN">{op.pin ?? '—'}</td>
                <td style={s.td}><span style={s.badge(op.active)}>{op.active ? 'Active' : 'Inactive'}</span></td>
                <td style={s.td}>
                  <button style={s.btn(op.active)} onClick={() => toggleActive(op)} disabled={saving === op.id}>
                    {op.active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}

export default function AdminPage() {
  return (
    <Suspense fallback={<main style={{ minHeight: '100vh', background: '#040d1f' }} />}>
      <AdminContent />
    </Suspense>
  )
}
