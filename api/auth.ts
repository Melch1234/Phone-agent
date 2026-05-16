import { Request, Response } from 'express'
import { supabase } from '../src/lib/supabase'

const COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000 // 30 days
const isProd = process.env.NODE_ENV === 'production'

export async function handleDashboardAuth(req: Request, res: Response): Promise<void> {
  const { operatorId, token } = req.query as { operatorId?: string; token?: string }

  if (!operatorId || !token) { res.redirect('/'); return }

  const { data: operator } = await supabase
    .from('operators')
    .select('id, dashboard_token')
    .eq('id', operatorId)
    .single()

  if (!operator || token !== String(operator.dashboard_token)) {
    res.redirect('/')
    return
  }

  res.cookie(`dash_${operatorId}`, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })
  res.redirect(`/dashboard/${operatorId}`)
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
