import { Request, Response } from 'express'
import { stripe, PRICE_IDS } from '../src/lib/stripe'

export async function handleCheckout(req: Request, res: Response): Promise<void> {
  const { plan, name, email, business_name, alert_phone } = req.body as {
    plan?: string
    name?: string
    email?: string
    business_name?: string
    alert_phone?: string
  }

  if (!plan || !name || !email || !business_name || !alert_phone) {
    res.status(400).json({ error: 'All fields are required' })
    return
  }

  if (!['starter', 'growth', 'agency'].includes(plan)) {
    res.status(400).json({ error: 'Invalid plan' })
    return
  }

  const priceId = PRICE_IDS[plan as 'starter' | 'growth' | 'agency']
  if (!priceId) {
    res.status(500).json({ error: 'Plan not configured' })
    return
  }

  const baseUrl = process.env.BASE_URL ?? 'https://phone-agent-production-e8a7.up.railway.app'

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        metadata: { plan, business_name, owner_name: name, alert_phone },
      },
      metadata: { plan, business_name, owner_name: name, alert_phone, email },
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/#v2-pricing`,
    })

    res.json({ url: session.url })
  } catch (err) {
    console.error('[checkout] Stripe error:', err)
    res.status(500).json({ error: 'Failed to create checkout session' })
  }
}
