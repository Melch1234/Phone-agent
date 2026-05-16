import { Request, Response } from 'express'
import { supabase } from '../src/lib/supabase'
import { sendEmail } from '../src/lib/resend'
import crypto from 'crypto'

const isProd = process.env.NODE_ENV === 'production'

function generatePin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// POST /api/auth/login — look up operator by PIN alone, set cookie
export async function handleLogin(req: Request, res: Response): Promise<void> {
  const { pin } = req.body as { pin?: string }

  if (!pin || pin.length !== 6) {
    res.status(400).json({ error: 'Invalid PIN' })
    return
  }

  const { data: operator } = await supabase
    .from('operators')
    .select('id, pin')
    .eq('pin', pin)
    .single()

  if (!operator) {
    res.status(401).json({ error: 'Incorrect PIN' })
    return
  }

  res.cookie(`dash_${operator.id}`, operator.pin, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/',
  })
  res.json({ ok: true, operatorId: operator.id })
}

// POST /api/auth/forgot-pin — reset PIN and email it
export async function handleForgotPin(req: Request, res: Response): Promise<void> {
  const { email } = req.body as { email?: string }

  if (!email) {
    res.status(400).json({ error: 'Email required' })
    return
  }

  const { data: operator } = await supabase
    .from('operators')
    .select('id, owner_name, email, business_name')
    .eq('email', email.toLowerCase().trim())
    .single()

  // Always respond ok to prevent email enumeration
  if (!operator) {
    res.json({ ok: true })
    return
  }

  // Generate a new unique PIN
  let newPin = generatePin()
  let attempts = 0
  while (attempts < 10) {
    const { data: conflict } = await supabase
      .from('operators')
      .select('id')
      .eq('pin', newPin)
      .single()
    if (!conflict) break
    newPin = generatePin()
    attempts++
  }

  await supabase.from('operators').update({ pin: newPin }).eq('id', operator.id)

  const baseUrl = process.env.BASE_URL ?? 'https://phone-agent-production-e8a7.up.railway.app'
  await sendEmail({
    to: operator.email,
    subject: `Your new Tour Agent PIN`,
    html: `
      <p>Hi ${operator.owner_name},</p>
      <p>Your new dashboard PIN for <strong>${operator.business_name}</strong> is:</p>
      <p style="font-size: 2rem; font-weight: bold; letter-spacing: 0.3em;">${newPin}</p>
      <p>Log in at: <a href="${baseUrl}/login">${baseUrl}/login</a></p>
      <p>— The Tour Agent team</p>
    `,
  }).catch(err => console.error('[forgot-pin] Email failed:', err))

  res.json({ ok: true })
}

export async function handleDashboardAuth(req: Request, res: Response): Promise<void> {
  const { operatorId, pin } = req.body as { operatorId?: string; pin?: string }

  if (!operatorId || !pin) {
    res.status(400).json({ error: 'Missing operatorId or pin' })
    return
  }

  const { data: operator } = await supabase
    .from('operators')
    .select('id, pin')
    .eq('id', operatorId)
    .single()

  if (!operator || !operator.pin || pin !== operator.pin) {
    res.status(401).json({ error: 'Incorrect PIN' })
    return
  }

  res.cookie(`dash_${operatorId}`, operator.pin, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/',
  })
  res.json({ ok: true })
}

export async function handleAdminAuth(req: Request, res: Response): Promise<void> {
  const { token } = req.query as { token?: string }
  const adminToken = process.env.ADMIN_TOKEN

  if (!token || !adminToken || token !== adminToken) {
    res.redirect('/')
    return
  }

  res.cookie('admin_auth', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/',
  })
  res.redirect('/admin')
}
