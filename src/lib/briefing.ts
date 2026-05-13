import cron from 'node-cron'
import type { Call, Operator } from '../types'

export function buildBriefingEmail(
  operator: Operator,
  calls: Call[]
): { subject: string; html: string } {
  const leadCount = calls.flatMap(c => c.leads).length
  const baseUrl = process.env.BASE_URL ?? 'https://phone-agent-production-e8a7.up.railway.app'

  if (calls.length === 0) {
    return {
      subject: `Quiet night — no calls [${operator.business_name}]`,
      html: `<p>Hi ${operator.owner_name},</p><p>No calls came in overnight. Your agent is running and ready for tonight.</p><p><a href="${baseUrl}/dashboard/${operator.id}?token=${operator.dashboard_token}">View dashboard</a></p>`,
    }
  }

  const subject = `Your overnight briefing — ${calls.length} call${calls.length !== 1 ? 's' : ''}, ${leadCount} lead${leadCount !== 1 ? 's' : ''} [${operator.business_name}]`

  const callRows = calls.map(call => {
    const mins = Math.floor(call.duration_seconds / 60)
    const secs = call.duration_seconds % 60
    const duration = `${mins}:${secs.toString().padStart(2, '0')}`
    const urgentBadge = call.urgent ? ' ⚠️ <strong>URGENT — SMS was sent to your phone</strong>' : ''
    const leadRows = call.leads.map(l => {
      const parts = [l.name, l.party_size ? `${l.party_size} pax` : null, l.tour_date, l.notes].filter(Boolean)
      return `→ Lead: ${parts.join(', ')}`
    }).join('<br>')
    return `
      <div style="border:1px solid #e0e0e0;border-radius:8px;padding:16px;margin:12px 0;">
        <strong>${call.caller_number}</strong> · ${duration}${urgentBadge}<br>
        <p style="margin:8px 0;color:#333;">${call.summary}</p>
        ${leadRows ? `<p style="color:#666;font-size:14px;">${leadRows}</p>` : '<p style="color:#999;font-size:14px;">No lead captured</p>'}
      </div>`
  }).join('')

  const html = `
    <p>Hi ${operator.owner_name},</p>
    <p>Here's what happened overnight for <strong>${operator.business_name}</strong>:</p>
    <h2 style="margin:24px 0 8px;">Calls (${calls.length})</h2>
    ${callRows}
    <p style="margin-top:24px;"><a href="${baseUrl}/dashboard/${operator.id}?token=${operator.dashboard_token}" style="background:#e8820c;color:#fff;padding:10px 20px;border-radius:24px;text-decoration:none;">View full dashboard</a></p>
  `

  return { subject, html }
}

export function startBriefingCron(): void {
  cron.schedule('0 6 * * *', async () => {
    console.log('[cron] Running morning briefing...')
    await sendAllBriefings()
  })
  console.log('[cron] Morning briefing cron registered (6:00 UTC daily)')
}

async function sendAllBriefings(): Promise<void> {
  const { supabase } = await import('./supabase')
  const { data: operators, error } = await supabase
    .from('operators')
    .select('*')
    .eq('active', true)

  if (error || !operators) {
    console.error('[briefing] Failed to fetch operators:', error)
    return
  }

  const since = new Date()
  since.setUTCHours(since.getUTCHours() - 24)

  await Promise.allSettled(
    operators.map(op => sendOperatorBriefing(op, since))
  )
}

async function sendOperatorBriefing(operator: Operator, since: Date): Promise<void> {
  const { supabase } = await import('./supabase')
  const { sendEmail } = await import('./resend')

  const { data: calls, error } = await supabase
    .from('calls')
    .select('*')
    .eq('operator_id', operator.id)
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: true })

  if (error) {
    console.error(`[briefing] Failed to fetch calls for ${operator.business_name}:`, error)
    return
  }

  const { subject, html } = buildBriefingEmail(operator, calls ?? [])
  await sendEmail({ to: operator.email, subject, html })
  console.log(`[briefing] Sent to ${operator.email} (${operator.business_name})`)
}
