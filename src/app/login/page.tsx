'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (pin.length !== 6) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })
      const data = await res.json()
      if (res.ok) {
        router.replace(`/dashboard/${data.operatorId}`)
      } else {
        setError('Incorrect PIN. Check your welcome email and try again.')
        setPin('')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{
      minHeight: '100vh', background: '#040d1f', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '2rem',
      fontFamily: 'Outfit, system-ui, sans-serif', color: '#f0e8d8',
    }}>
      <div style={{ maxWidth: 360, width: '100%', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', fontWeight: 800, marginBottom: '.5rem' }}>
          Dashboard
        </h1>
        <p style={{ opacity: .5, fontSize: '.9rem', marginBottom: '2rem' }}>
          Enter your 6-digit PIN to access your account.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            value={pin}
            onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            autoFocus
            style={{
              width: '100%', padding: '16px', fontSize: '2rem', letterSpacing: '0.4em',
              textAlign: 'center', background: 'rgba(255,255,255,.06)',
              border: `1px solid ${error ? '#ff6b6b' : 'rgba(255,255,255,.15)'}`,
              borderRadius: 12, color: '#f0e8d8', outline: 'none',
              fontFamily: 'Outfit, system-ui, sans-serif', marginBottom: '1rem',
              boxSizing: 'border-box',
            }}
          />
          {error && (
            <p style={{ color: '#ff6b6b', fontSize: '.85rem', marginBottom: '1rem' }}>{error}</p>
          )}
          <button
            type="submit"
            disabled={pin.length !== 6 || loading}
            style={{
              width: '100%', padding: '14px', background: '#e8820c', color: '#040d1f',
              border: 'none', borderRadius: 50, fontWeight: 700, fontSize: '1rem',
              cursor: pin.length !== 6 || loading ? 'not-allowed' : 'pointer',
              opacity: pin.length !== 6 || loading ? 0.5 : 1,
            }}
          >
            {loading ? 'Verifying…' : 'Enter dashboard'}
          </button>
        </form>
        <p style={{ opacity: .35, fontSize: '.8rem', marginTop: '1.5rem' }}>
          PIN is in your welcome email.{' '}
          <Link href="/forgot-pin" style={{ color: '#f0e8d8' }}>Forgot PIN?</Link>
        </p>
      </div>
    </main>
  )
}
