export default function CheckoutSuccessPage() {
  return (
    <main style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, sans-serif', background: '#f8f5f0', padding: '2rem',
    }}>
      <div style={{ maxWidth: 520, textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#0E1B2C', marginBottom: 16 }}>
          Payment confirmed.
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#0E1B2C', fontWeight: 500, lineHeight: 1.6, marginBottom: 32 }}>
          Check your inbox — we&apos;ve sent next steps to your email.
        </p>
        <div style={{
          background: '#fff', borderRadius: 12, padding: '2rem',
          border: '1px solid #e0d8cc', marginBottom: 32, textAlign: 'left',
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#0E1B2C', marginBottom: 20 }}>What happens next</h2>
          <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
            <div style={{ fontWeight: 700, color: '#F26A1F', fontSize: '1.1rem' }}>1</div>
            <div>
              <div style={{ fontWeight: 600, color: '#0E1B2C', marginBottom: 4 }}>Check your email now</div>
              <div style={{ color: '#666', fontSize: '0.95rem', lineHeight: 1.6 }}>
                You&apos;ll find a confirmation with what to expect and a link to your dashboard once your line is ready.
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
            <div style={{ fontWeight: 700, color: '#F26A1F', fontSize: '1.1rem' }}>2</div>
            <div>
              <div style={{ fontWeight: 600, color: '#0E1B2C', marginBottom: 4 }}>We assign your number</div>
              <div style={{ color: '#666', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Usually within a few hours, we&apos;ll assign you a dedicated phone line.
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ fontWeight: 700, color: '#F26A1F', fontSize: '1.1rem' }}>3</div>
            <div>
              <div style={{ fontWeight: 600, color: '#0E1B2C', marginBottom: 4 }}>You go live</div>
              <div style={{ color: '#666', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Forward the number or use it directly. Your AI agent answers from day one.
              </div>
            </div>
          </div>
        </div>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>
          Questions? Email{' '}
          <a href="mailto:fun@bugme.travel" style={{ color: '#F26A1F', textDecoration: 'none', fontWeight: 600 }}>fun@bugme.travel</a>
        </p>
      </div>
    </main>
  )
}
