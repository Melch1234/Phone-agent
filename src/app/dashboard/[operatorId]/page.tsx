export const dynamic = 'force-dynamic'

import { supabase } from '@/lib/supabase'
import { notFound, redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import SettingsPanel from './SettingsPanel'
import VoicePreview from './VoicePreview'
import CallsList from './CallsList'

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

  // If token is in URL, redirect to auth endpoint to set cookie + strip token from URL
  if (token) {
    redirect(`/api/auth/dashboard?operatorId=${operatorId}&token=${encodeURIComponent(token)}`)
  }

  // No URL token — check cookie
  const cookieStore = await cookies()
  const cookieToken = cookieStore.get(`dash_${operatorId}`)?.value
  if (!cookieToken || cookieToken !== String(operator.dashboard_token)) redirect('/')

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

  const setupSteps = [
    { label: 'Phone number assigned', done: !!operator.twilio_number },
    { label: 'Greeting recorded', done: !!(operator.greeting?.trim()) },
    { label: 'FAQ configured', done: !!(operator.faq?.trim()) },
  ]
  const setupComplete = setupSteps.every(s => s.done)

  return (
    <main style={{
      minHeight: '100vh', background: '#040d1f', padding: '2rem',
      fontFamily: 'Outfit, system-ui, sans-serif', color: '#f0e8d8',
      maxWidth: 900, margin: '0 auto',
    }}>
      <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.8rem', fontWeight: 800, marginBottom: '.25rem' }}>
        {operator.business_name}
      </h1>
      <p style={{ opacity: .45, fontSize: '.85rem', marginBottom: '2rem' }}>Last 7 days</p>

      {!setupComplete && (
        <div style={{
          background: 'rgba(245,168,42,.08)', border: '1px solid rgba(245,168,42,.25)',
          borderRadius: 14, padding: '1.25rem 1.5rem', marginBottom: '2rem',
        }}>
          <p style={{ fontWeight: 600, fontSize: '.9rem', marginBottom: '.75rem', color: '#f5a82a' }}>
            Finish setting up your agent
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
            {setupSteps.map(step => (
              <div key={step.label} style={{ display: 'flex', alignItems: 'center', gap: '.6rem', fontSize: '.88rem' }}>
                <span style={{
                  width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.7rem',
                  background: step.done ? '#22c55e' : 'rgba(255,255,255,.1)',
                  color: step.done ? '#fff' : 'rgba(255,255,255,.3)',
                }}>
                  {step.done ? '✓' : '○'}
                </span>
                <span style={{ opacity: step.done ? .45 : 1, textDecoration: step.done ? 'line-through' : 'none' }}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

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
      <CallsList calls={allCalls} operatorId={operator.id} token={operator.dashboard_token} />

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
        initialIntakeQuestions={operator.intake_questions ?? ''}
      />

      {allLeads.length > 0 && (
        <>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.3rem', fontWeight: 700, margin: '2rem 0 1rem' }}>Leads captured</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.88rem' }}>
              <thead>
                <tr style={{ opacity: .45, borderBottom: '1px solid rgba(255,255,255,.1)' }}>
                  {['Name', 'Phone', 'Party', 'Date', 'Trip type', 'Callback time', 'Staying', 'Notes'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allLeads.map((lead: { id: string; name: string; phone_number: string; party_size: number; tour_date: string; trip_type: string; callback_time: string; accommodation: string; notes: string }) => (
                  <tr key={lead.id} style={{ borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                    <td style={{ padding: '10px 12px' }}>{lead.name || '—'}</td>
                    <td style={{ padding: '10px 12px' }}>{lead.phone_number || '—'}</td>
                    <td style={{ padding: '10px 12px' }}>{lead.party_size ?? '—'}</td>
                    <td style={{ padding: '10px 12px' }}>{lead.tour_date || '—'}</td>
                    <td style={{ padding: '10px 12px' }}>{lead.trip_type || '—'}</td>
                    <td style={{ padding: '10px 12px' }}>{lead.callback_time || '—'}</td>
                    <td style={{ padding: '10px 12px' }}>{lead.accommodation || '—'}</td>
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
