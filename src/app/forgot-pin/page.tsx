'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPinPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      await fetch('/api/auth/forgot-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
    } finally {
      setLoading(false)
      setSubmitted(true)
    }
  }

  return (
    <main style={{
      minHeight: '100vh', background: '#040d1f', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '2rem',
      fontFamily: 'Outfit, system-ui, sans-serif', color: '#f0e8d8',
    }}>
      <div style={{ maxWidth: 360, width: '100%', textAlign: 'center' }}>
        {submitted ? (
          <>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', fontWeight: 800, marginBottom: '.5rem' }}>
              Check your inbox
            </h1>
            <p style={{ opacity: .5, fontSize: '.9rem', marginBottom: '2rem' }}>
              If that email matches an account, we&apos;ve sent a new PIN.
            </p>
            <Link
              href="/login"
              style={{
                display: 'inline-block', padding: '14px 32px', background: '#e8820c',
                color: '#040d1f', borderRadius: 50, fontWeight: 700, fontSize: '1rem',
                textDecoration: 'none',
              }}
            >
              Back to login
            </Link>
          </>
        ) : (
          <>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', fontWeight: 800, marginBottom: '.5rem' }}>
              Forgot PIN
            </h1>
            <p style={{ opacity: .5, fontSize: '.9rem', marginBottom: '2rem' }}>
              Enter your account email and we&apos;ll send you a new PIN.
            </p>
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoFocus
                required
                style={{
                  width: '100%', padding: '14px 16px', fontSize: '1rem',
                  background: 'rgba(255,255,255,.06)',
                  border: '1px solid rgba(255,255,255,.15)',
                  borderRadius: 12, color: '#f0e8d8', outline: 'none',
                  fontFamily: 'Outfit, system-ui, sans-serif', marginBottom: '1rem',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="submit"
                disabled={!email || loading}
                style={{
                  width: '100%', padding: '14px', background: '#e8820c', color: '#040d1f',
                  border: 'none', borderRadius: 50, fontWeight: 700, fontSize: '1rem',
                  cursor: !email || loading ? 'not-allowed' : 'pointer',
                  opacity: !email || loading ? 0.5 : 1,
                }}
              >
                {loading ? 'Sending…' : 'Send new PIN'}
              </button>
            </form>
            <p style={{ opacity: .35, fontSize: '.8rem', marginTop: '1.5rem' }}>
              <Link href="/login" style={{ color: '#f0e8d8' }}>Back to login</Link>
            </p>
          </>
        )}
      </div>
    </main>
  )
}
