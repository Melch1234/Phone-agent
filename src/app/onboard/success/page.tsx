export default function OnboardSuccess() {
  return (
    <main style={{
      minHeight: '100vh', background: '#040d1f', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center',
      fontFamily: 'Outfit, system-ui, sans-serif', color: '#f0e8d8',
    }}>
      <div style={{ maxWidth: 480 }}>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '2.2rem', fontWeight: 800, marginBottom: '2rem' }}>
          Application received.
        </h1>
        <p style={{ lineHeight: 1.8, marginBottom: '1.5rem', color: '#f0e8d8' }}>
          Thanks — we&apos;ve got your details. We&apos;ll be in touch within 24 hours to walk you through setup and get your line assigned.
        </p>
        <p style={{ lineHeight: 1.8, marginBottom: '2rem', color: '#f0e8d8' }}>
          Keep an eye on your inbox. When your line is ready, you&apos;ll get an email with your dashboard link and phone number.
        </p>
        <a href="/" style={{
          background: 'rgba(255,255,255,.08)', color: '#f0e8d8',
          padding: '10px 24px', borderRadius: 50, textDecoration: 'none', fontSize: '.9rem',
        }}>
          ← Back to home
        </a>
      </div>
    </main>
  )
}
