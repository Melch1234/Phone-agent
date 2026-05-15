import Stripe from 'stripe'

let _stripe: InstanceType<typeof Stripe> | null = null

export function getStripe(): InstanceType<typeof Stripe> {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY is not set')
    _stripe = new Stripe(key, { apiVersion: '2026-04-22.dahlia' })
  }
  return _stripe
}

export function getPriceId(plan: 'starter' | 'growth' | 'agency'): string {
  const ids: Record<string, string | undefined> = {
    starter: process.env.STRIPE_PRICE_STARTER,
    growth: process.env.STRIPE_PRICE_GROWTH,
    agency: process.env.STRIPE_PRICE_AGENCY,
  }
  const id = ids[plan]
  if (!id) throw new Error(`STRIPE_PRICE_${plan.toUpperCase()} is not set`)
  return id
}
