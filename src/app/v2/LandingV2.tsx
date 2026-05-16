'use client'

import { useEffect, useState } from 'react'
import DemoPlayer from './DemoPlayer'
import './v2.css'

const MARQUEE_ITEMS = [
  '11:42pm — Sea kayak booking, party of 4 — captured',
  '10:15pm — Sunrise paddle enquiry, this Sunday — captured',
  '9:58pm — Whale watching, group of 8, mid-June — captured',
  '1:23am — Rainforest walk cancellation policy — answered',
  '11:57pm — Charter boat, corporate group of 20 — captured',
  '12:34am — Mountain bike hire, tomorrow AM — captured',
  '10:44pm — Zip-line age requirements — answered',
  '2:07am — Safari tour, family of 5, next week — captured',
]

const STEPS = [
  { n: '01', title: 'They call.', body: 'Tour Agent picks up before the second ring — landline or mobile, your existing number forwarded.' },
  { n: '02', title: 'It listens, answers, captures.', body: 'Trained on your FAQ. Answers questions about tours and pricing in your voice. Takes name, number, and what they\'re after.' },
  { n: '03', title: 'You wake up sorted.', body: 'Every enquiry captured overnight. A clean summary lands in your inbox at 7am — names, numbers, and what they\'re after.' },
]

const FEATURES = [
  { title: 'Answers your FAQs', body: 'Trained on tours, prices, meeting points, cancellation policy — your own playbook.', icon: <ChatIcon /> },
  { title: 'Captures every enquiry', body: 'Name, number, party size, dates, intent. Cleanly structured, never lost.', icon: <ClipboardIcon /> },
  { title: 'Works on any phone', body: 'Landlines, mobiles, VoIP. Forward your existing number — no porting required.', icon: <PhoneIcon /> },
  { title: 'Team dashboard', body: 'Every call logged and searchable. Your whole team sees who called, what they wanted, and what to follow up — no inbox required.', icon: <MailIcon /> },
]

const WHO = [
  { title: 'Tour operators', body: 'Walking tours, food tours, guided experiences.', img: 'photo-1488646953014-85cb44e25828' },
  { title: 'Activity companies', body: 'Kayaking, climbing, paragliding, surf schools.', img: 'photo-1463693396721-8ca0cfa2b3b5' },
  { title: 'Charter businesses', body: 'Boat charters, helicopter tours, ski lodges.', img: 'photo-1502082553048-f009c37129b9' },
  { title: 'Any tourism business', body: 'If your phone rings after hours, we belong here.', img: 'photo-1540541338287-41700207dee6' },
]

const TIERS = [
  {
    name: 'Starter', price: 199, blurb: 'For solo operators.',
    features: ['1 phone line', '300 min/mo included', 'AI trained on your FAQ', 'Team dashboard', 'Email support'],
    recommended: false,
    cta: 'Get started',
    planKey: 'starter' as const,
  },
  {
    name: 'Growth', price: 399, blurb: 'Most tourism businesses pick this.',
    features: ['3 phone lines', '700 min/mo included', 'AI trained on your FAQ', 'Team dashboard', 'Priority support'],
    recommended: true,
    cta: 'Get started',
    planKey: 'growth' as const,
  },
  {
    name: 'Agency', price: 799, blurb: 'For multi-location operators.',
    features: ['5 phone lines', '1,500 min/mo included', 'Per-brand FAQ training', 'Team dashboard', 'Dedicated support'],
    recommended: false,
    cta: 'Get started',
    planKey: 'agency' as const,
  },
  {
    name: 'Custom', price: null, blurb: 'Weekends only, seasonal, or something else entirely.',
    features: ['Any number of lines', 'Tailored minute allowance', 'Custom hours & schedule', 'Multi-location setups', 'Let\'s figure it out together'],
    recommended: false,
    cta: 'Get in touch',
    planKey: null,
  },
]

type PlanKey = 'starter' | 'growth' | 'agency'

export default function LandingV2() {
  const [scrolled, setScrolled] = useState(false)
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
  const [contactState, setContactState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [signupPlan, setSignupPlan] = useState<PlanKey | null>(null)
  const [signupForm, setSignupForm] = useState({ name: '', email: '', business_name: '', alert_phone: '' })
  const [agreedTerms, setAgreedTerms] = useState(false)
  const [agreedAI, setAgreedAI] = useState(false)
  const [signupState, setSignupState] = useState<'idle' | 'submitting' | 'error'>('idle')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function openSignup(plan: PlanKey) {
    setSignupForm({ name: '', email: '', business_name: '', alert_phone: '' })
    setAgreedTerms(false)
    setAgreedAI(false)
    setSignupState('idle')
    setSignupPlan(plan)
  }

  async function submitSignup(e: React.FormEvent) {
    e.preventDefault()
    if (!signupPlan || !agreedTerms || !agreedAI) return
    setSignupState('submitting')
    try {
      const r = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...signupForm, plan: signupPlan }),
      })
      const data = await r.json()
      if (r.ok && data.url) {
        window.location.href = data.url
      } else {
        setSignupState('error')
      }
    } catch {
      setSignupState('error')
    }
  }

  async function submitContact(e: React.FormEvent) {
    e.preventDefault()
    setContactState('sending')
    try {
      const r = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      })
      setContactState(r.ok ? 'sent' : 'error')
    } catch {
      setContactState('error')
    }
  }

  return (
    <div className="v2">
      {/* ── HEADER ── */}
      <header className={`v2-header${scrolled ? ' v2-header--scrolled' : ''}`}>
        <a href="/v2" className="v2-wordmark">
          <CompassMark />
          Tour Agent
        </a>
        <nav className="v2-nav">
          <a href="#v2-how">How it works</a>
          <a href="#v2-features">Features</a>
          <a href="#v2-who">Who it&apos;s for</a>
          <a href="#v2-pricing">Pricing</a>
        </nav>
      </header>

      {/* ── HERO ── */}
      <section className="v2-hero">
        <svg className="v2-hero-arc" viewBox="0 0 200 200" aria-hidden="true">
          <circle cx="100" cy="100" r="90" fill="none" stroke="#F26A1F" strokeWidth="1.2" />
          <circle cx="100" cy="100" r="65" fill="none" stroke="#F26A1F" strokeWidth="1" />
          <circle cx="100" cy="100" r="40" fill="none" stroke="#F26A1F" strokeWidth="0.8" />
        </svg>
        <div className="v2-container v2-hero-grid">
          <div className="v2-hero-copy">
            <span className="v2-eyebrow">After-hours phone agent · for tourism</span>
            <h1 className="v2-display-lg v2-hero-h1">
              Your guests don&apos;t keep<br />office hours.<br />
              <span className="v2-hero-gradient">Now you don&apos;t<br />have to either.</span>
            </h1>
            <p className="v2-lead" style={{ maxWidth: 480, marginBottom: 40 }}>
              Tour Agent answers the phone when you can&apos;t. It takes the booking enquiry and emails your team a clean summary every morning.
            </p>
            <div className="v2-hero-actions">
              <a href="/onboard" target="_blank" rel="noopener noreferrer" className="v2-btn v2-btn--primary v2-btn--lg">
                Get started <ArrowRight />
              </a>
              <a href="#v2-how" className="v2-btn v2-btn--secondary v2-btn--lg">
                See how it works
              </a>
            </div>
            <div className="v2-hero-meta">
              <span className="v2-hero-meta-live">
                <span className="v2-live-dot" />
                Answering calls right now
              </span>
              <span aria-hidden="true">·</span>
              <span>Set up in 5 minutes</span>
              <span aria-hidden="true">·</span>
              <span>Built on Twilio + OpenAI</span>
            </div>
          </div>
          <div className="v2-hero-visual" aria-hidden="true">
            <div className="v2-hero-photo" />
            <div className="v2-call-card">
              <div className="v2-call-card-header">
                <span className="v2-live-dot" />
                <span className="v2-call-card-title">Call in progress</span>
                <span className="v2-call-card-time">02:14</span>
              </div>
              <p className="v2-call-card-body">
                <span style={{ color: 'var(--v2-ink-500)' }}>Caller asks:</span>{' '}
                &ldquo;Do you run sunrise paddles on Sundays, and what&rsquo;s the meeting point?&rdquo;
              </p>
            </div>
            <div className="v2-captured-card">
              <div className="v2-captured-label">Captured</div>
              <div className="v2-captured-name">Maya Chen · +61 4** *** 219</div>
              <div className="v2-captured-detail">Sunrise tour · party of 4 · this Sun</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="v2-marquee" aria-hidden="true">
        <div className="v2-marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="v2-marquee-item">{item}</span>
          ))}
        </div>
      </div>

      {/* ── PROBLEM ── */}
      <section className="v2-section v2-section--alt">
        <div className="v2-container v2-problem-grid">
          <div>
            <span className="v2-eyebrow">The problem</span>
            <h2 className="v2-display-md" style={{ marginTop: 20 }}>
              Every call you miss<br />after hours is a<br />
              <em style={{ color: 'var(--v2-coral-500)' }}>booking you lose.</em>
            </h2>
          </div>
          <div>
            <p className="v2-lead" style={{ color: 'var(--v2-ink-700)' }}>
              Tourists book on impulse. They call from a hotel lobby at 9pm, from a bar at 11pm, from a beach at 6am. Voicemail is a dead end — by the time you call back, they&apos;ve booked your competitor.
            </p>
            <div className="v2-stats-row">
              {[
                { n: '40%', label: 'of tourism calls go to voicemail' },
                { n: '$280', label: 'average lost booking value' },
                { n: '11pm', label: 'peak after-hours enquiry time' },
              ].map(s => (
                <div key={s.n} className="v2-stat-block">
                  <div className="v2-stat-n">{s.n}</div>
                  <div className="v2-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="v2-how" className="v2-section">
        <div className="v2-container">
          <div className="v2-how-head">
            <div>
              <span className="v2-eyebrow">How it works</span>
              <h2 className="v2-display-md" style={{ marginTop: 20 }}>Three steps.<br />One night&apos;s sleep.</h2>
            </div>
            <p className="v2-lead v2-how-sub">
              No app to install, no headset to wear. Forward your number after-hours and we handle the rest.
            </p>
          </div>
          <div className="v2-steps">
            {STEPS.map(s => (
              <div key={s.n} className="v2-step-card">
                <div className="v2-step-n">{s.n}</div>
                <h3 className="v2-step-title">{s.title}</h3>
                <p className="v2-step-body">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEMO CALL ── */}
      <section id="v2-demo" className="v2-section">
        <div className="v2-container" style={{ textAlign: 'center' }}>
          <span className="v2-eyebrow" style={{ display: 'inline-block' }}>Hear it in action</span>
          <h2 className="v2-display-md" style={{ marginTop: 20, maxWidth: 600, marginInline: 'auto' }}>
            A real after-hours call
          </h2>
          <p className="v2-lead" style={{ marginTop: 16, maxWidth: 480, marginInline: 'auto' }}>
            A visitor calls after hours trying to book a whale watching tour. The AI handles it — no hold music, no missed lead.
          </p>
          <DemoPlayer />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="v2-features" className="v2-section v2-section--dark" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="v2-topo-bg" aria-hidden="true" />
        <div className="v2-container" style={{ position: 'relative' }}>
          <div style={{ marginBottom: 56, maxWidth: 600 }}>
            <span className="v2-eyebrow" style={{ color: 'var(--v2-coral-400)' }}>Features</span>
            <h2 className="v2-display-md" style={{ marginTop: 20, color: '#fff' }}>
              Everything you&apos;d ask a great<br />after-hours receptionist to do.
            </h2>
          </div>
          <div className="v2-feat-grid">
            {FEATURES.map(f => (
              <div key={f.title} className="v2-feat-cell">
                <div className="v2-feat-icon">{f.icon}</div>
                <h3 className="v2-feat-title">{f.title}</h3>
                <p className="v2-feat-body">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHO IT'S FOR ── */}
      <section id="v2-who" className="v2-section v2-section--alt">
        <div className="v2-container">
          <div style={{ marginBottom: 48, maxWidth: 600 }}>
            <span className="v2-eyebrow">Who it&apos;s for</span>
            <h2 className="v2-display-md" style={{ marginTop: 20 }}>
              Built for the operators<br />actually out doing the thing.
            </h2>
          </div>
          <div className="v2-who-grid">
            {WHO.map(c => (
              <div key={c.title} className="v2-who-card">
                <div
                  className="v2-who-photo"
                  style={{ backgroundImage: `url('https://images.unsplash.com/${c.img}?w=600&auto=format&fit=crop')` }}
                />
                <div className="v2-who-body">
                  <h3 className="v2-who-title">{c.title}</h3>
                  <p className="v2-who-sub">{c.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="v2-pricing" className="v2-section">
        <div className="v2-container">
          <div className="v2-pricing-head">
            <span className="v2-eyebrow" style={{ display: 'inline-block' }}>Pricing</span>
            <h2 className="v2-display-md" style={{ marginTop: 20, maxWidth: 720, marginInline: 'auto' }}>
              One missed booking pays for the year.
            </h2>
            <p className="v2-lead" style={{ marginTop: 18, maxWidth: 540, marginInline: 'auto' }}>
              Cancel any time. No setup fees.
            </p>
          </div>
          <div className="v2-pricing-grid">
            {TIERS.map(t => (
              <div key={t.name} className={`v2-tier${t.recommended ? ' v2-tier--featured' : ''}`}>
                {t.recommended && <div className="v2-tier-badge">Most popular</div>}
                <div className="v2-tier-name">{t.name}</div>
                <div className="v2-tier-price">
                  {t.price ? (
                    <><span className="v2-tier-amt">${t.price}</span><span className="v2-tier-per">/mo</span></>
                  ) : (
                    <span className="v2-tier-amt" style={{ fontSize: '1.6rem' }}>Let&apos;s talk</span>
                  )}
                </div>
                <p className="v2-tier-blurb">{t.blurb}</p>
                <div className="v2-tier-divider" />
                <ul className="v2-tier-feats">
                  {t.features.map(f => (
                    <li key={f}>
                      <span className="v2-tier-check"><CheckIcon /></span>
                      {f}
                    </li>
                  ))}
                </ul>
                {t.planKey ? (
                  <button
                    type="button"
                    onClick={() => openSignup(t.planKey!)}
                    className={`v2-btn ${t.recommended ? 'v2-btn--primary' : 'v2-btn--outline-ink'} v2-tier-cta`}
                  >
                    {t.cta}
                  </button>
                ) : (
                  <a href="#v2-contact" className="v2-btn v2-btn--outline-ink v2-tier-cta">
                    {t.cta}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BAND ── */}
      <section className="v2-section v2-section--dark v2-cta-band">
        <div className="v2-topo-bg" aria-hidden="true" />
        <div className="v2-container v2-cta-inner">
          <span className="v2-eyebrow" style={{ color: 'var(--v2-coral-400)', display: 'inline-block' }}>Get started</span>
          <h2 className="v2-display-lg" style={{ marginTop: 20, color: '#fff' }}>
            Set up your company<br />in{' '}
            <em style={{ color: 'var(--v2-coral-400)' }}>5 minutes.</em>
          </h2>
          <p className="v2-lead" style={{ marginTop: 22, color: 'var(--v2-fg-on-dark-mut)', maxWidth: 520, marginInline: 'auto' }}>
            Tell us a few details about your tours. We&apos;ll have your AI agent on the line by tomorrow morning.
          </p>
          <a href="/onboard" target="_blank" rel="noopener noreferrer" className="v2-btn v2-btn--primary v2-btn--lg" style={{ marginTop: 32 }}>
            Set up my company <ArrowRight />
          </a>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="v2-contact" className="v2-section v2-section--alt">
        <div className="v2-container" style={{ maxWidth: 640 }}>
          <span className="v2-eyebrow">Get in touch</span>
          <h2 className="v2-display-md" style={{ marginTop: 20, marginBottom: 12 }}>
            Questions? We&apos;d love<br />to hear from you.
          </h2>
          <p className="v2-lead" style={{ marginBottom: 36, color: 'var(--v2-ink-700)' }}>
            Not ready to sign up yet, or want to chat about a custom setup? Drop us a message.
          </p>
          {contactState === 'sent' ? (
            <div style={{ background: 'rgba(111,207,151,.1)', border: '1px solid rgba(111,207,151,.3)', borderRadius: 12, padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>✓</div>
              <p style={{ fontWeight: 600, marginBottom: 4 }}>Message sent!</p>
              <p style={{ opacity: .6, fontSize: '.9rem' }}>Your message was forwarded to <a href="mailto:fun@bugme.travel" style={{ color: 'inherit' }}>fun@bugme.travel</a> — Tour Agent is partnered with <a href="https://bugme.travel" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', fontWeight: 600 }}>BUGMe.travel</a>, who will get back to you shortly.</p>
            </div>
          ) : (
            <form onSubmit={submitContact} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '.82rem', opacity: .6, marginBottom: 6 }}>Name</label>
                  <input
                    required
                    value={contactForm.name}
                    onChange={e => setContactForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Jane Smith"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--v2-ink-200)', fontSize: '.9rem', background: '#fff', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '.82rem', opacity: .6, marginBottom: 6 }}>Email</label>
                  <input
                    required
                    type="email"
                    value={contactForm.email}
                    onChange={e => setContactForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="jane@raftingco.com"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--v2-ink-200)', fontSize: '.9rem', background: '#fff', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '.82rem', opacity: .6, marginBottom: 6 }}>Message</label>
                <textarea
                  required
                  rows={5}
                  value={contactForm.message}
                  onChange={e => setContactForm(p => ({ ...p, message: e.target.value }))}
                  placeholder="Tell us about your business and what you need..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--v2-ink-200)', fontSize: '.9rem', background: '#fff', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>
              {contactState === 'error' && (
                <p style={{ color: '#e55', fontSize: '.85rem' }}>Something went wrong — try emailing us directly at fun@bugme.travel</p>
              )}
              <button
                type="submit"
                disabled={contactState === 'sending'}
                className="v2-btn v2-btn--primary"
                style={{ alignSelf: 'flex-start' }}
              >
                {contactState === 'sending' ? 'Sending…' : 'Send message'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="v2-footer">
        <div className="v2-container v2-footer-grid">
          <div>
            <div className="v2-footer-brand">
              <CompassMark />
              Tour Agent
            </div>
            <p className="v2-footer-tagline">
              The after-hours phone agent for tourism. Made for operators who&apos;d rather be out on the water.
            </p>
            <div style={{ marginTop: 20 }}>
              <a
                href="https://bugme.travel"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)',
                  borderRadius: 8, padding: '7px 12px', textDecoration: 'none',
                  color: 'var(--v2-fg-on-dark-mut)', fontSize: '.78rem',
                }}
              >
                <span style={{ opacity: .5 }}>In partnership with</span>
                <span style={{ fontWeight: 700, color: '#fff' }}>BUGMe.travel</span>
              </a>
            </div>
          </div>
          {[
            { title: 'Product', links: ['How it works', 'Features', 'Pricing', 'Onboarding'] },
            { title: 'Company', links: ['About', 'Operators', 'Press', 'Contact'] },
            { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'Status'] },
          ].map(col => (
            <div key={col.title}>
              <div className="v2-footer-col-title">{col.title}</div>
              <ul className="v2-footer-links">
                {col.links.map(l => <li key={l}><a href="#">{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="v2-container v2-footer-base">
          <span>© 2026 Tour Agent.</span>
        </div>
      </footer>

      {/* ── SIGNUP MODAL ── */}
      {signupPlan && (
        <div className="v2-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setSignupPlan(null) }}>
          <div className="v2-modal">
            <button type="button" className="v2-modal-close" onClick={() => setSignupPlan(null)}>×</button>
            <span className="v2-modal-plan-badge">
              {signupPlan} plan — ${signupPlan === 'starter' ? 199 : signupPlan === 'growth' ? 399 : 799}/mo
            </span>
            <h2 className="v2-modal-title">Get started</h2>
            <p className="v2-modal-subtitle">Fill in your details and you&apos;ll be taken to secure payment. Your line will be ready within hours.</p>

            <form onSubmit={submitSignup} className="v2-modal-form">
              <div className="v2-modal-field">
                <label>Full name</label>
                <input required value={signupForm.name} onChange={e => setSignupForm(p => ({ ...p, name: e.target.value }))} placeholder="Jane Smith" />
              </div>
              <div className="v2-modal-field">
                <label>Email</label>
                <input required type="email" value={signupForm.email} onChange={e => setSignupForm(p => ({ ...p, email: e.target.value }))} placeholder="jane@mytours.com" />
              </div>
              <div className="v2-modal-field">
                <label>Business name</label>
                <input required value={signupForm.business_name} onChange={e => setSignupForm(p => ({ ...p, business_name: e.target.value }))} placeholder="Island Tours Ltd" />
              </div>
              <div className="v2-modal-field">
                <label>Your mobile (for urgent SMS alerts)</label>
                <input required type="tel" value={signupForm.alert_phone} onChange={e => setSignupForm(p => ({ ...p, alert_phone: e.target.value }))} placeholder="+64 21 000 0000" />
              </div>

              <div className="v2-modal-divider">
                <label className="v2-modal-check">
                  <input type="checkbox" checked={agreedTerms} onChange={e => setAgreedTerms(e.target.checked)} />
                  <span>
                    I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a>. I understand my subscription renews monthly and I can cancel any time — I retain access until the end of my billing period.
                  </span>
                </label>
                <label className="v2-modal-check">
                  <input type="checkbox" checked={agreedAI} onChange={e => setAgreedAI(e.target.checked)} />
                  <span>
                    I understand Tour Agent uses AI technology that may occasionally make errors or require an initial training period to accurately represent my tours and policies. I accept responsibility for reviewing and correcting responses during onboarding.
                  </span>
                </label>
              </div>

              {signupState === 'error' && (
                <p className="v2-modal-error">Something went wrong. Please try again or email us at fun@bugme.travel.</p>
              )}

              <button type="submit" className="v2-modal-submit" disabled={!agreedTerms || !agreedAI || signupState === 'submitting'}>
                {signupState === 'submitting' ? 'Redirecting to payment…' : 'Continue to payment →'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Icons ── */

function CompassMark() {
  return (
    <svg viewBox="0 0 48 48" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="24" cy="24" r="16" />
      <path d="M24 8 L27 24 L24 21 L21 24 Z" fill="currentColor" />
      <path d="M24 40 L21 24 L24 27 L27 24 Z" opacity="0.55" fill="currentColor" />
    </svg>
  )
}

function ArrowRight() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function ChatIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  )
}

function ClipboardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="12" y2="17" />
    </svg>
  )
}

function AlertIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 015.2 16.9a19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )
}

function SmsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      <line x1="9" y1="10" x2="9.01" y2="10" />
      <line x1="12" y1="10" x2="12.01" y2="10" />
      <line x1="15" y1="10" x2="15.01" y2="10" />
    </svg>
  )
}
