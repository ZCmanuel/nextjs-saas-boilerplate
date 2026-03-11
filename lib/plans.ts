// lib/plans.ts — definición de planes y helper hasAccess()
// Los price IDs se obtienen del Stripe Dashboard tras crear los productos.
// Stripe es la fuente de verdad para el estado de la suscripción — no la DB.

import type { Subscription } from '@prisma/client'

export const PLANS = {
  starter: {
    name: 'Starter',
    description: 'Perfecto para empezar',
    price: {
      monthly: 0,
      annual: 0,
    },
    // Sin trial en el plan gratuito
    trialDays: 0,
    stripePriceId: {
      monthly: '', // Plan gratuito — sin price ID de Stripe
      annual: '',
    },
    limits: {
      members: 3,
      projects: 5,
    },
  },
  pro: {
    name: 'Pro',
    description: 'Para equipos en crecimiento',
    price: {
      monthly: 29,
      annual: 290, // ~2 meses gratis
    },
    trialDays: 14,
    stripePriceId: {
      monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID ?? '',
      annual: process.env.STRIPE_PRO_ANNUAL_PRICE_ID ?? '',
    },
    limits: {
      members: 10,
      projects: -1, // -1 = ilimitado
    },
  },
  enterprise: {
    name: 'Enterprise',
    description: 'Para grandes organizaciones',
    price: {
      monthly: 99,
      annual: 990, // ~2 meses gratis
    },
    trialDays: 30,
    stripePriceId: {
      monthly: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID ?? '',
      annual: process.env.STRIPE_ENTERPRISE_ANNUAL_PRICE_ID ?? '',
    },
    limits: {
      members: -1, // ilimitado
      projects: -1,
    },
  },
} as const

export type PlanId = keyof typeof PLANS
export type BillingCycle = 'monthly' | 'annual'

/**
 * Devuelve el plan activo de una suscripción.
 * Si no hay suscripción activa, devuelve "starter".
 */
export function getActivePlan(subscription: Subscription | null): PlanId {
  if (!subscription) return 'starter'
  if (subscription.status !== 'ACTIVE' && subscription.status !== 'TRIALING') return 'starter'

  const priceId = subscription.stripePriceId

  for (const [planId, plan] of Object.entries(PLANS)) {
    if (plan.stripePriceId.monthly === priceId || plan.stripePriceId.annual === priceId) {
      return planId as PlanId
    }
  }

  return 'starter'
}

/**
 * Comprueba si una suscripción tiene acceso a un plan determinado.
 * La jerarquía es: enterprise > pro > starter
 */
const PLAN_HIERARCHY: PlanId[] = ['starter', 'pro', 'enterprise']

export function hasAccess(subscription: Subscription | null, requiredPlan: PlanId): boolean {
  const activePlan = getActivePlan(subscription)
  const activeIndex = PLAN_HIERARCHY.indexOf(activePlan)
  const requiredIndex = PLAN_HIERARCHY.indexOf(requiredPlan)
  return activeIndex >= requiredIndex
}
