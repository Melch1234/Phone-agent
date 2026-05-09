'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Step = 1 | 2 | 3 | 4 | 5

interface FormData {
  business_name: string
  owner_name: string
  tour_types: string[]
  location: string
  faq: string
  email: string
  alert_phone: string
  greeting: string
}

const TOUR_TYPES = [
  'Mountain & Hiking', 'Whale Watching & Marine', 'Safari & Desert',
  'Kayaking & Water Sports', 'Rainforest & Wildlife', 'Zip-line & Adventure',
  'Cultural & City Tours', 'Other',
]

const INITIAL: FormData = {
  business_name: '', owner_name: '', tour_types: [], location: '',
  faq: '', email: '', alert_phone: '', greeting: '',
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 16px', border: '1px solid rgba(255,255,255,.2)',
  borderRadius: 10, background: 'rgba(255,255,255,.06)', color: '#f0e8d8',
  fontFamily: 'Outfit, system-ui, sans-serif', fontSize: '1rem', outline: 'none',
}
const labelStyle: React.CSSProperties = {
  display: 'block', marginBottom: 6, fontSize: '.85rem',
  color: 'rgba(240,232,216,.7)', fontWeight: 500,
}
const btnPrimary = (disabled = false): React.CSSProperties => ({
  background: '#e8820c', color: '#040d1f', border: 'none',
  padding: '12px 28px', borderRadius: 50, fontWeight: 600, fontSize: '1rem',
  cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
})
const btnGhost: React.CSSProperties = {
  background: 'transparent', color: '#f0e8d8',
  border: '1px solid rgba(255,255,255,.2)', padding: '12px 24px',
  borderRadius: 50, cursor: 'pointer', fontSize: '1rem',
}

export default function OnboardPage() {
  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState<FormData>(INITIAL)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const set = (field: keyof FormData, value: string | string[]) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const toggleTourType = (type: string) =>
    set('tour_types', form.tour_types.includes(type)
      ? form.tour_types.filter(t => t !== type)
      : [...form.tour_types, type])

  const next = () => setStep(s => (s + 1) as Step)
  const back = () => setStep(s => (s - 1) as Step)

  const submit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/operators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      router.push('/onboard/success')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSubmitting(false)
    }
  }

  const wrapStyle: React.CSSProperties = {
    minHeight: '100vh', background: '#040d1f', display: 'flex',
    alignItems: 'center', justifyContent: 'center', padding: '2rem',
    fontFamily: 'Outfit, system-ui, sans-serif', color: '#f0e8d8',
  }

  return (
    <main style={wrapStyle}>
      <div style={{ maxWidth: 560, width: '100%' }}>
        {/* Progress bar */}
        <div style={{ display: 'flex', gap: 6, marginBottom: '2.5rem' }}>
          {([1,2,3,4,5] as Step[]).map(n => (
            <div key={n} style={{
              flex: 1, height: 4, borderRadius: 2,
              background: n <= step ? '#e8820c' : 'rgba(255,255,255,.12)',
              transition: 'background .3s',
            }} />
          ))}
        </div>

        {step === 1 && (
          <div>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', fontWeight: 800, marginBottom: '.5rem' }}>Tell us about your business</h1>
            <p style={{ opacity: .6, marginBottom: '2rem' }}>We&apos;ll use this to personalise your agent.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={labelStyle}>Business name *</label>
                <input style={inputStyle} value={form.business_name} onChange={e => set('business_name', e.target.value)} placeholder="Blue Ridge Adventures" />
              </div>
              <div>
                <label style={labelStyle}>Your name *</label>
                <input style={inputStyle} value={form.owner_name} onChange={e => set('owner_name', e.target.value)} placeholder="Mike Johnson" />
              </div>
              <div>
                <label style={labelStyle}>Location</label>
                <input style={inputStyle} value={form.location} onChange={e => set('location', e.target.value)} placeholder="Banff, Alberta" />
              </div>
              <div>
                <label style={labelStyle}>Type of tours (select all that apply)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                  {TOUR_TYPES.map(type => (
                    <button key={type} type="button" onClick={() => toggleTourType(type)} style={{
                      padding: '6px 14px', borderRadius: 50, border: '1px solid',
                      borderColor: form.tour_types.includes(type) ? '#e8820c' : 'rgba(255,255,255,.2)',
                      background: form.tour_types.includes(type) ? 'rgba(232,130,12,.15)' : 'transparent',
                      color: form.tour_types.includes(type) ? '#e8820c' : 'rgba(240,232,216,.7)',
                      cursor: 'pointer', fontSize: '.82rem',
                    }}>{type}</button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ marginTop: '2rem' }}>
              <button type="button" onClick={next} disabled={!form.business_name || !form.owner_name} style={btnPrimary(!form.business_name || !form.owner_name)}>Continue →</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', fontWeight: 800, marginBottom: '.5rem' }}>Your tours &amp; FAQ</h1>
            <p style={{ opacity: .6, marginBottom: '2rem' }}>Paste everything your agent needs to know — tour names, prices, meeting points, what to bring, cancellation policy.</p>
            <textarea style={{ ...inputStyle, minHeight: 240, resize: 'vertical' }} value={form.faq} onChange={e => set('faq', e.target.value)}
              placeholder={`3-Day Banff Hike — $299 per person\nMeeting point: Banff visitor centre, 7:30am\nDifficulty: Moderate. Bring layers, good boots, lunch.\nMax group size: 12. Min age: 16.\nCancellation: Full refund 48+ hours before.`} />
            <div style={{ display: 'flex', gap: 12, marginTop: '2rem' }}>
              <button type="button" onClick={back} style={btnGhost}>← Back</button>
              <button type="button" onClick={next} disabled={!form.faq} style={btnPrimary(!form.faq)}>Continue →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', fontWeight: 800, marginBottom: '.5rem' }}>How should we reach you?</h1>
            <p style={{ opacity: .6, marginBottom: '2rem' }}>Briefing emails go to your inbox. Urgent SMS alerts go to your mobile.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={labelStyle}>Email address (for morning briefings) *</label>
                <input style={inputStyle} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="mike@blueridge.com" />
              </div>
              <div>
                <label style={labelStyle}>Mobile number (for urgent SMS alerts) *</label>
                <input style={inputStyle} type="tel" value={form.alert_phone} onChange={e => set('alert_phone', e.target.value)} placeholder="+1 604 555 0100" />
                <p style={{ fontSize: '.78rem', opacity: .45, marginTop: 4 }}>We only SMS you when a caller flags an emergency.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: '2rem' }}>
              <button type="button" onClick={back} style={btnGhost}>← Back</button>
              <button type="button" onClick={next} disabled={!form.email || !form.alert_phone} style={btnPrimary(!form.email || !form.alert_phone)}>Continue →</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', fontWeight: 800, marginBottom: '.5rem' }}>How should your agent greet callers?</h1>
            <p style={{ opacity: .6, marginBottom: '2rem' }}>Optional — leave blank for a default greeting.</p>
            <div>
              <label style={labelStyle}>Opening greeting (optional)</label>
              <input style={inputStyle} value={form.greeting} onChange={e => set('greeting', e.target.value)}
                placeholder={`Thanks for calling ${form.business_name || 'us'}! I'm here to help with any questions about our tours.`} />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: '2rem' }}>
              <button type="button" onClick={back} style={btnGhost}>← Back</button>
              <button type="button" onClick={next} style={btnPrimary()}>Continue →</button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', fontWeight: 800, marginBottom: '.5rem' }}>Ready to go live?</h1>
            <p style={{ opacity: .6, marginBottom: '2rem' }}>Review your details before we set up your agent.</p>
            <div style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 14, padding: '1.5rem', marginBottom: '1.5rem' }}>
              {([
                ['Business', form.business_name],
                ['Owner', form.owner_name],
                ['Location', form.location || '—'],
                ['Tours', form.tour_types.join(', ') || '—'],
                ['Email', form.email],
                ['SMS phone', form.alert_phone],
                ['Greeting', form.greeting || `(default for ${form.business_name})`],
              ] as [string, string][]).map(([label, value]) => (
                <div key={label} style={{ display: 'flex', gap: '1rem', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                  <span style={{ minWidth: 100, opacity: .5, fontSize: '.88rem' }}>{label}</span>
                  <span style={{ fontSize: '.88rem' }}>{value}</span>
                </div>
              ))}
            </div>
            {error && <p style={{ color: '#ff6b6b', marginBottom: '1rem', fontSize: '.9rem' }}>{error}</p>}
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" onClick={back} style={btnGhost}>← Back</button>
              <button type="button" onClick={submit} disabled={submitting} style={btnPrimary(submitting)}>
                {submitting ? 'Submitting...' : 'Get my agent →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
