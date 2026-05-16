import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail(opts: {
  to: string
  subject: string
  html: string
  from?: string
}): Promise<void> {
  const { error } = await resend.emails.send({
    from: opts.from ?? (process.env.RESEND_FROM_EMAIL ?? 'Tour Agent <fun@bugme.travel>'),
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  })
  if (error) throw error
}
