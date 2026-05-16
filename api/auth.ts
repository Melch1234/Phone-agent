import { Request, Response } from 'express'
import { supabase } from '../src/lib/supabase'

const isProd = process.env.NODE_ENV === 'production'

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
