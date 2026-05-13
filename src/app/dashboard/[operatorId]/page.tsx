export const dynamic = 'force-dynamic'

import { supabase } from '@/lib/supabase'
import { notFound, redirect } from 'next/navigation'
import SettingsPanel from './SettingsPanel'
import VoicePreview from './VoicePreview'

interface Props {
  params: Promise<{ operatorId: string }>
  searchParams: Promise<{ token?: string }>
}

export default async function DashboardPage({ params, searchParams }: Props) {
  const { operatorId } = await params
  const { token } = await searchParams

  const { data: operator } = await supabase
    .from('operators')
    .select('*')
    .eq('id', operatorId)
    .single()

  if (!operator) notFound()
  if (token !== operator.dashboard_token) redirect('/')

  const since = new Date()
  since.setDate(since.getDate() - 7)

  const [{ data: calls }, { data: leads }] = await Promise.all([
    supabase.from('calls').select('*').eq('operator_id', operator.id)
      .gte('created_at', since.toISOString()).order('created_at', { ascending: false }).limit(50),
    supabase.from('leads').select('*').eq('operator_id', operator.id)
      .order('created_at', { ascending: false }).limit(20),
  ])

  const allCalls = calls ?? []
  const allLeads = leads ?? []
  const urgentCount = allCalls.filter((c: { urgent: boolean }) => c.urgent).length

  return (
    <main style={{
      minHeight: '100vh', background: '#040d1f', padding: '2rem',
      fontFamily: 'Outfit, system-ui, sans-serif', color: '#f0e8d8',
      maxWidth: 900, margin: '0 auto',
    }}>
      <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.8rem', fontWeight: 800, marginBottom: '.25rem' }}>
        {operator.business_name}
      </h1>
      <p style={{ opacity: .45, fontSize: '.85rem', marginBottom: '2.5rem' }}>Last 7 days</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
        {[
          { label: 'Calls', value: allCalls.length },
          { label: 'Leads', value: allLeads.length },
          { label: 'Urgent', value: urgentCount },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 14, padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: '2.5rem', fontWeight: 900, color: label === 'Urgent' && value > 0 ? '#ff6b6b' : '#f5a82a' }}>{value}</div>
            <div style={{ opacity: .5, fontSize: '.82rem', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>Recent calls</h2>
      {allCalls.length === 0 && <p style={{ opacity: .4, marginBottom: '2rem' }}>No calls yet.</p>}
      {allCalls.map((call: { id: string; caller_number: string; duration_seconds: number; summary: string; urgent: boolean; created_at: string }) => {
        const mins = Math.floor(call.duration_seconds / 60)
        const secs = call.duration_seconds % 60
        return (
          <div key={call.id} style={{ background: 'rgba(255,255,255,.04)', border: `1px solid ${call.urgent ? 'rgba(255,107,107,.35)' : 'rgba(255,255,255,.07)'}`, borderRadius: 12, padding: '1.25rem', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontWeight: 500 }}>{call.caller_number}</span>
                {call.urgent && (
                  <a href={`tel:${call.caller_number}`} style={{
                    fontSize: '.75rem', fontWeight: 700, padding: '2px 10px', borderRadius: 50,
                    background: 'rgba(255,107,107,.2)', color: '#ff6b6b',
                    textDecoration: 'none', border: '1px solid rgba(255,107,107,.4)',
                  }}>⚠️ Call back</a>
                )}
              </div>
              <span style={{ opacity: .45, fontSize: '.82rem' }}>
                {mins}:{secs.toString().padStart(2, '0')} · {new Date(call.created_at).toLocaleDateString()}
              </span>
            </div>
            <p style={{ opacity: .7, fontSize: '.88rem', lineHeight: 1.55 }}>{call.summary || 'No summary.'}</p>
          </div>
        )
      })}

      <VoicePreview
        currentVoice={operator.voice ?? 'shimmer'}
        greeting={operator.greeting ?? ''}
        operatorId={operator.id}
        token={operator.dashboard_token}
      />

      <SettingsPanel
        operatorId={operator.id}
        token={operator.dashboard_token}
        initialBusinessName={operator.business_name ?? ''}
        initialGreeting={operator.greeting ?? ''}
        initialFaq={operator.faq ?? ''}
      />

      {allLeads.length > 0 && (
        <>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.3rem', fontWeight: 700, margin: '2rem 0 1rem' }}>Leads captured</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.88rem' }}>
              <thead>
                <tr style={{ opacity: .45, borderBottom: '1px solid rgba(255,255,255,.1)' }}>
                  {['Name', 'Party size', 'Tour date', 'Notes'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allLeads.map((lead: { id: string; name: string; party_size: number; tour_date: string; notes: string }) => (
                  <tr key={lead.id} style={{ borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                    <td style={{ padding: '10px 12px' }}>{lead.name || '—'}</td>
                    <td style={{ padding: '10px 12px' }}>{lead.party_size ?? '—'}</td>
                    <td style={{ padding: '10px 12px' }}>{lead.tour_date || '—'}</td>
                    <td style={{ padding: '10px 12px', opacity: .6 }}>{lead.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  )
}
