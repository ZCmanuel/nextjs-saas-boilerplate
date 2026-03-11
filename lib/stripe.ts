// lib/stripe.ts — singleton Stripe, solo en Server Components y Server Actions
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
})
