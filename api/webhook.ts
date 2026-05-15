import { Request, Response } from 'express'
import { getStripe } from '../src/lib/stripe'
import { supabase } from '../src/lib/supabase'
import { sendEmail } from '../src/lib/resend'
import crypto from 'crypto'

export async function handleWebhook(req: Request, res: Response): Promise<void> {
  const sig = req.headers['stripe-signature'] as string
  const secret = process.env.STRIPE_WEBHOOK_SECRET!

  let event
  try {
    event = getStripe().webhooks.constructEvent(req.body as Buffer, sig, secret)
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err)
    res.status(400).send('Webhook signature invalid')
    return
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const meta = session.metadata ?? {}
    const { plan, business_name, owner_name, alert_phone, email } = meta

    if (!email || !business_name || !owner_name || !plan) {
      console.error('[webhook] Missing metadata on session:', session.id)
      res.json({ received: true })
      return
    }

    const dashboardToken = crypto.randomBytes(24).toString('hex')

    const { data: operator, error } = await supabase
      .from('operators')
      .insert({
        business_name,
        owner_name,
        email,
        alert_phone,
        plan,
        active: false,
        dashboard_token: dashboardToken,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string,
        faq: '',
        greeting: null,
        twilio_number: null,
        voice: null,
        intake_questions: null,
      })
      .select()
      .single()

    if (error) {
      console.error('[webhook] Failed to create operator:', error)
      res.status(500).json({ error: 'DB insert failed' })
      return
    }

    await sendEmail({
      to: email,
      subject: `You're in — Tour Agent is setting up your line`,
      html: `
        <p>Hi ${owner_name},</p>
        <p>Payment confirmed! We're setting up your dedicated phone line for <strong>${business_name}</strong>.</p>
        <p>Here's what happens next:</p>
        <ol>
          <li>We'll assign you a dedicated phone number (usually within a few hours).</li>
          <li>You'll receive a second email with your dashboard link and line details.</li>
          <li>Forward that number to your existing business line, or start using it straight away.</li>
        </ol>
        <p>Any questions? Reply to this email or reach us at <a href="mailto:fun@bugme.travel">fun@bugme.travel</a>.</p>
        <p>— The Tour Agent team</p>
      `,
    })

    console.log(`[webhook] Operator created: ${operator.id} (${business_name})`)
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object
    await supabase
      .from('operators')
      .update({ active: false })
      .eq('stripe_subscription_id', sub.id)
    console.log(`[webhook] Subscription cancelled, operator deactivated: ${sub.id}`)
  }

  res.json({ received: true })
}
