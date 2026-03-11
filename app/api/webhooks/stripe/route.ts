import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import type { SubscriptionStatus } from '@prisma/client'
import type Stripe from 'stripe'

// Necesario para leer el body raw y verificar la firma de Stripe
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Sin firma Stripe' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Firma inválida'
    console.error('[Stripe Webhook] Error de firma:', message)
    return NextResponse.json({ error: `Webhook error: ${message}` }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode !== 'subscription') break

        const organizationId = session.metadata?.organizationId
        if (!organizationId) {
          console.error('[Stripe Webhook] checkout.session.completed sin organizationId')
          break
        }

        const subscriptionId = session.subscription as string
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const item = subscription.items.data[0]

        await db.subscription.upsert({
          where: { organizationId },
          create: {
            organizationId,
            stripeCustomerId: subscription.customer as string,
            stripeSubscriptionId: subscription.id,
            stripePriceId: item.price.id,
            status: mapStripeStatus(subscription.status),
            currentPeriodStart: new Date(item.current_period_start * 1000),
            currentPeriodEnd: new Date(item.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          },
          update: {
            stripeCustomerId: subscription.customer as string,
            stripeSubscriptionId: subscription.id,
            stripePriceId: item.price.id,
            status: mapStripeStatus(subscription.status),
            currentPeriodStart: new Date(item.current_period_start * 1000),
            currentPeriodEnd: new Date(item.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          },
        })
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const organizationId = subscription.metadata?.organizationId
        if (!organizationId) {
          console.error('[Stripe Webhook] subscription.updated sin organizationId')
          break
        }

        const item = subscription.items.data[0]
        await db.subscription.update({
          where: { organizationId },
          data: {
            stripePriceId: item.price.id,
            status: mapStripeStatus(subscription.status),
            currentPeriodStart: new Date(item.current_period_start * 1000),
            currentPeriodEnd: new Date(item.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          },
        })
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const organizationId = subscription.metadata?.organizationId
        if (!organizationId) {
          console.error('[Stripe Webhook] subscription.deleted sin organizationId')
          break
        }

        await db.subscription.update({
          where: { organizationId },
          data: {
            status: 'CANCELED',
            cancelAtPeriodEnd: false,
          },
        })
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.parent?.subscription_details?.subscription
        if (!subscriptionId) break

        const subId = typeof subscriptionId === 'string' ? subscriptionId : subscriptionId.id
        const subscription = await stripe.subscriptions.retrieve(subId)
        const organizationId = subscription.metadata?.organizationId
        if (!organizationId) break

        await db.subscription.update({
          where: { organizationId },
          data: { status: 'PAST_DUE' },
        })
        break
      }

      case 'invoice.payment_succeeded': {
        // Actualiza currentPeriodEnd en cada renovación exitosa
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.parent?.subscription_details?.subscription
        if (!subscriptionId) break

        const subId = typeof subscriptionId === 'string' ? subscriptionId : subscriptionId.id
        const subscription = await stripe.subscriptions.retrieve(subId)
        const organizationId = subscription.metadata?.organizationId
        if (!organizationId) break

        const item = subscription.items.data[0]
        await db.subscription.update({
          where: { organizationId },
          data: {
            status: mapStripeStatus(subscription.status),
            currentPeriodStart: new Date(item.current_period_start * 1000),
            currentPeriodEnd: new Date(item.current_period_end * 1000),
          },
        })
        break
      }

      default:
        // Evento no manejado — ignorar
        break
    }
  } catch (e) {
    console.error(`[Stripe Webhook] Error procesando ${event.type}:`, e)
    return NextResponse.json({ error: 'Error interno procesando el webhook' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case 'active':
      return 'ACTIVE'
    case 'canceled':
      return 'CANCELED'
    case 'past_due':
      return 'PAST_DUE'
    case 'trialing':
      return 'TRIALING'
    case 'incomplete':
    case 'incomplete_expired':
    case 'unpaid':
    case 'paused':
      return 'INCOMPLETE'
    default:
      return 'INCOMPLETE'
  }
}
