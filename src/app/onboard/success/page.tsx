export default function OnboardSuccess() {
  return (
    <main style={{
      minHeight: '100vh', background: '#040d1f', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center',
      fontFamily: 'Outfit, system-ui, sans-serif', color: '#f0e8d8',
    }}>
      <div style={{ maxWidth: 480 }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '2.2rem', fontWeight: 800, marginBottom: '1rem' }}>
          You&apos;re on the list!
        </h1>
        <p style={{ opacity: .7, lineHeight: 1.7, marginBottom: '2rem' }}>
          We&apos;ll have your AI agent live within 24 hours. Check your email for next steps.
        </p>
        <a href="/" style={{ background: 'rgba(255,255,255,.08)', color: '#f0e8d8',
          padding: '10px 24px', borderRadius: 50, textDecoration: 'none', fontSize: '.9rem' }}>
          ← Back to home
        </a>
      </div>
    </main>
  )
}
