'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface FormData {
  business_name: string
  owner_name: string
  email: string
  alert_phone: string
  location: string
  tour_types: string[]
  call_slots: string[]
}

const TOUR_TYPES = [
  'Mountain & Hiking', 'Whale Watching & Marine', 'Safari & Desert',
  'Kayaking & Water Sports', 'Rainforest & Wildlife', 'Zip-line & Adventure',
  'Cultural & City Tours', 'Other',
]

const TIME_SLOTS = ['9:00am', '10:00am', '11:00am', '1:00pm', '2:00pm', '3:00pm', '4:00pm', '5:00pm']

function getNextWeekdays(count: number): string[] {
  const days: string[] = []
  const d = new Date()
  d.setDate(d.getDate() + 1)
  while (days.length < count) {
    const dow = d.getDay()
    if (dow !== 0 && dow !== 6) {
      days.push(d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }))
    }
    d.setDate(d.getDate() + 1)
  }
  return days
}

const INITIAL: FormData = {
  business_name: '', owner_name: '', email: '', alert_phone: '',
  location: '', tour_types: [], call_slots: [],
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
const chipStyle = (active: boolean): React.CSSProperties => ({
  padding: '6px 14px', borderRadius: 50, border: '1px solid',
  borderColor: active ? '#e8820c' : 'rgba(255,255,255,.2)',
  background: active ? 'rgba(232,130,12,.15)' : 'transparent',
  color: active ? '#e8820c' : 'rgba(240,232,216,.7)',
  cursor: 'pointer', fontSize: '.82rem',
})

export default function OnboardPage() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>(INITIAL)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const weekdays = getNextWeekdays(10)

  const set = (field: keyof FormData, value: string | string[]) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const toggleItem = (field: 'tour_types' | 'call_slots', val: string) =>
    set(field, form[field].includes(val)
      ? form[field].filter(v => v !== val)
      : [...form[field], val])

  const step1Valid = form.business_name && form.owner_name && form.email && form.alert_phone

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

  return (
    <main style={{
      minHeight: '100vh', background: '#040d1f', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '2rem',
      fontFamily: 'Outfit, system-ui, sans-serif', color: '#f0e8d8',
    }}>
      <div style={{ maxWidth: 560, width: '100%' }}>

        {/* Progress */}
        <div style={{ display: 'flex', gap: 6, marginBottom: '2.5rem' }}>
          {[1, 2, 3].map(n => (
            <div key={n} style={{
              flex: 1, height: 4, borderRadius: 2,
              background: n <= step ? '#e8820c' : 'rgba(255,255,255,.12)',
              transition: 'background .3s',
            }} />
          ))}
        </div>

        {/* Step 1 — Business info */}
        {step === 1 && (
          <div>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', fontWeight: 800, marginBottom: '.5rem' }}>
              Tell us about your business
            </h1>
            <p style={{ opacity: .6, marginBottom: '2rem' }}>
              We&apos;ll review your application and be in touch.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={labelStyle}>Business name *</label>
                <input style={inputStyle} value={form.business_name}
                  onChange={e => set('business_name', e.target.value)} placeholder="Blue Ridge Adventures" />
              </div>
              <div>
                <label style={labelStyle}>Your name *</label>
                <input style={inputStyle} value={form.owner_name}
                  onChange={e => set('owner_name', e.target.value)} placeholder="Mike Johnson" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Email *</label>
                  <input style={inputStyle} type="email" value={form.email}
                    onChange={e => set('email', e.target.value)} placeholder="mike@blueridge.com" />
                </div>
                <div>
                  <label style={labelStyle}>Phone *</label>
                  <input style={inputStyle} type="tel" value={form.alert_phone}
                    onChange={e => set('alert_phone', e.target.value)} placeholder="+1 604 555 0100" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Location</label>
                <input style={inputStyle} value={form.location}
                  onChange={e => set('location', e.target.value)} placeholder="Banff, Alberta" />
              </div>
              <div>
                <label style={labelStyle}>Type of tours (select all that apply)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                  {TOUR_TYPES.map(type => (
                    <button key={type} type="button" onClick={() => toggleItem('tour_types', type)}
                      style={chipStyle(form.tour_types.includes(type))}>
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ marginTop: '2rem' }}>
              <button type="button" onClick={() => setStep(2)}
                disabled={!step1Valid} style={btnPrimary(!step1Valid)}>
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Book a call (optional) */}
        {step === 2 && (
          <div>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', fontWeight: 800, marginBottom: '.5rem' }}>
              Book a call with us
            </h1>
            <p style={{ opacity: .6, marginBottom: '.5rem' }}>
              Optional — pick a few times that work and we&apos;ll confirm one with you.
            </p>
            <p style={{ opacity: .4, fontSize: '.82rem', marginBottom: '2rem' }}>
              You can skip this and we&apos;ll reach out by email instead.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {weekdays.map(day => (
                <div key={day}>
                  <div style={{ fontSize: '.82rem', opacity: .5, marginBottom: 6 }}>{day}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {TIME_SLOTS.map(time => {
                      const slot = `${day} at ${time}`
                      return (
                        <button key={slot} type="button"
                          onClick={() => toggleItem('call_slots', slot)}
                          style={chipStyle(form.call_slots.includes(slot))}>
                          {time}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: '2rem' }}>
              <button type="button" onClick={() => setStep(1)} style={btnGhost}>← Back</button>
              <button type="button" onClick={() => setStep(3)} style={btnPrimary()}>
                {form.call_slots.length > 0 ? 'Continue →' : 'Skip →'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Review & submit */}
        {step === 3 && (
          <div>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', fontWeight: 800, marginBottom: '.5rem' }}>
              Ready to submit?
            </h1>
            <p style={{ opacity: .6, marginBottom: '2rem' }}>
              We&apos;ll review your application and reach out soon.
            </p>
            <div style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 14, padding: '1.5rem', marginBottom: '1.5rem' }}>
              {([
                ['Business', form.business_name],
                ['Owner', form.owner_name],
                ['Email', form.email],
                ['Phone', form.alert_phone],
                ['Location', form.location || '—'],
                ['Tours', form.tour_types.join(', ') || '—'],
                ['Call times', form.call_slots.length > 0 ? form.call_slots.join(', ') : 'None selected'],
              ] as [string, string][]).map(([label, value]) => (
                <div key={label} style={{ display: 'flex', gap: '1rem', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                  <span style={{ minWidth: 100, opacity: .5, fontSize: '.88rem' }}>{label}</span>
                  <span style={{ fontSize: '.88rem' }}>{value}</span>
                </div>
              ))}
            </div>
            {error && <p style={{ color: '#ff6b6b', marginBottom: '1rem', fontSize: '.9rem' }}>{error}</p>}
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" onClick={() => setStep(2)} style={btnGhost}>← Back</button>
              <button type="button" onClick={submit} disabled={submitting} style={btnPrimary(submitting)}>
                {submitting ? 'Submitting...' : 'Submit application →'}
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
