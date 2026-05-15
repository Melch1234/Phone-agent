import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
})

export const PRICE_IDS: Record<'starter' | 'growth' | 'agency', string> = {
  starter: process.env.STRIPE_PRICE_STARTER!,
  growth: process.env.STRIPE_PRICE_GROWTH!,
  agency: process.env.STRIPE_PRICE_AGENCY!,
}
