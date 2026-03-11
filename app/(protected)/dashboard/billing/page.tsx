import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { headers } from 'next/headers'
import { PLANS, getActivePlan } from '@/lib/plans'
import { BillingPlans } from './_components/billing-plans'
import { BillingPortal } from './_components/billing-portal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/login')
  if (!session.session.activeOrganizationId) redirect('/select-org')

  const organizationId = session.session.activeOrganizationId
  const subscription = await db.subscription.findUnique({ where: { organizationId } })
  const activePlan = getActivePlan(subscription)
  const params = await searchParams

  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
        <p className="mt-1 text-sm text-zinc-500">Gestiona tu suscripción y plan</p>
      </div>

      {params.success && (
        <div className="mb-6 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
          ¡Suscripción activada correctamente!
        </div>
      )}
      {params.canceled && (
        <div className="mb-6 rounded-md border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
          Proceso cancelado. Tu plan no ha cambiado.
        </div>
      )}

      {/* Plan activo */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base">Plan actual</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold capitalize">{PLANS[activePlan].name}</span>
              {subscription?.status === 'TRIALING' && (
                <Badge variant="secondary">Trial activo</Badge>
              )}
              {subscription?.status === 'PAST_DUE' && (
                <Badge variant="destructive">Pago pendiente</Badge>
              )}
              {subscription?.status === 'CANCELED' && <Badge variant="outline">Cancelado</Badge>}
            </div>
            {subscription?.currentPeriodEnd && (
              <p className="mt-1 text-sm text-zinc-500">
                {subscription.cancelAtPeriodEnd ? 'Cancela el' : 'Siguiente cobro:'}{' '}
                {new Date(subscription.currentPeriodEnd).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            )}
          </div>
          {subscription?.stripeCustomerId && <BillingPortal />}
        </CardContent>
      </Card>

      {/* Planes disponibles */}
      <BillingPlans activePlan={activePlan} />
    </div>
  )
}
