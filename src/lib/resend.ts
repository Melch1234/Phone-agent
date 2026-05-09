import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail(opts: {
  to: string
  subject: string
  html: string
  from?: string
}): Promise<void> {
  await resend.emails.send({
    from: opts.from ?? 'Tour Agent <agent@yourdomain.com>',
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  })
}
