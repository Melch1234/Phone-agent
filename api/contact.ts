import { Request, Response } from 'express'
import { sendEmail } from '../src/lib/resend'

export async function handleContact(req: Request, res: Response): Promise<void> {
  const { name, email, message } = req.body as { name?: string; email?: string; message?: string }

  if (!name || !email || !message) {
    res.status(400).json({ error: 'name, email, and message are required' })
    return
  }

  try {
    await sendEmail({
      to: 'fun@bugme.travel',
      subject: `Tour Agent enquiry from ${name}`,
      html: `
        <h2>New contact form submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p style="background:#f5f5f5;padding:12px;border-radius:6px;">${message.replace(/\n/g, '<br>')}</p>
      `,
    })
    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'Failed to send message' })
  }
}
