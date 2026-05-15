export default function CheckoutSuccessPage() {
  return (
    <main style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, sans-serif', background: '#f8f5f0', padding: '2rem',
    }}>
      <div style={{ maxWidth: 520, textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎉</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#0E1B2C', marginBottom: 12 }}>
          You&apos;re in!
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#444', lineHeight: 1.7, marginBottom: 24 }}>
          Payment confirmed. We&apos;re setting up your dedicated phone line for your business.
        </p>
        <div style={{
          background: '#fff', borderRadius: 12, padding: '1.5rem',
          border: '1px solid #e0d8cc', marginBottom: 32, textAlign: 'left',
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#0E1B2C', marginBottom: 12 }}>What happens next</h2>
          <ol style={{ paddingLeft: 20, color: '#555', lineHeight: 2 }}>
            <li>We assign you a dedicated phone number (usually within a few hours).</li>
            <li>You&apos;ll receive an email with your dashboard link and line details.</li>
            <li>Forward the number or use it straight away — your AI agent is ready.</li>
          </ol>
        </div>
        <p style={{ color: '#888', fontSize: '0.9rem' }}>
          Questions? Email us at{' '}
          <a href="mailto:fun@bugme.travel" style={{ color: '#F26A1F' }}>fun@bugme.travel</a>
        </p>
        <a
          href="/"
          style={{
            display: 'inline-block', marginTop: 24, padding: '12px 28px',
            background: '#F26A1F', color: '#fff', borderRadius: 999,
            textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem',
          }}
        >
          Back to home
        </a>
      </div>
    </main>
  )
}
