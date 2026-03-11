'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { stripe } from '@/lib/stripe'
import { PLANS, type BillingCycle, type PlanId } from '@/lib/plans'
import { headers } from 'next/headers'

/**
 * Crea una Checkout Session de Stripe para que la org activa se suscriba a un plan.
 * Reutiliza el stripeCustomerId si ya existe en DB.
 * Devuelve la URL de checkout para redirigir al usuario.
 */
export async function createCheckoutSession(
  planId: PlanId,
  billingCycle: BillingCycle
): Promise<{ url: string } | { error: string }> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return { error: 'No autenticado' }

  const organizationId = session.session.activeOrganizationId
  if (!organizationId) return { error: 'No hay organización activa' }

  const plan = PLANS[planId]
  const priceId = plan.stripePriceId[billingCycle]
  if (!priceId) return { error: 'Plan no disponible' }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  try {
    // Recuperar o crear el stripeCustomerId para esta organización
    const existingSubscription = await db.subscription.findUnique({
      where: { organizationId },
      select: { stripeCustomerId: true },
    })

    let stripeCustomerId = existingSubscription?.stripeCustomerId

    if (!stripeCustomerId) {
      const organization = await db.organization.findUnique({
        where: { id: organizationId },
        select: { name: true },
      })

      const customer = await stripe.customers.create({
        email: session.user.email,
        name: organization?.name ?? session.user.name,
        metadata: { organizationId },
      })
      stripeCustomerId = customer.id
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: plan.trialDays > 0 ? plan.trialDays : undefined,
        metadata: { organizationId },
      },
      success_url: `${appUrl}/dashboard/billing?success=true`,
      cancel_url: `${appUrl}/dashboard/billing?canceled=true`,
      metadata: { organizationId },
    })

    if (!checkoutSession.url) return { error: 'No se pudo crear la sesión de checkout' }
    return { url: checkoutSession.url }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Error al crear la sesión de checkout'
    return { error: message }
  }
}

/**
 * Crea una Billing Portal Session para que la org activa gestione su suscripción.
 * Devuelve la URL del portal.
 */
export async function createPortalSession(): Promise<{ url: string } | { error: string }> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return { error: 'No autenticado' }

  const organizationId = session.session.activeOrganizationId
  if (!organizationId) return { error: 'No hay organización activa' }

  const subscription = await db.subscription.findUnique({
    where: { organizationId },
    select: { stripeCustomerId: true },
  })

  if (!subscription?.stripeCustomerId) {
    return { error: 'No hay suscripción activa para esta organización' }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${appUrl}/dashboard/billing`,
    })

    return { url: portalSession.url }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Error al crear la sesión del portal'
    return { error: message }
  }
}
