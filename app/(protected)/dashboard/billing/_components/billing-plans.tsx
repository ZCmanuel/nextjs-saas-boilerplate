'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { PLANS, type PlanId, type BillingCycle } from '@/lib/plans'
import { createCheckoutSession } from '@/actions/billing'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

type Props = {
  activePlan: PlanId
}

export function BillingPlans({ activePlan }: Props) {
  const [cycle, setCycle] = useState<BillingCycle>('monthly')
  const [loading, setLoading] = useState<string | null>(null)

  async function handleUpgrade(planId: PlanId) {
    setLoading(planId)
    const result = await createCheckoutSession(planId, cycle)
    if ('url' in result) {
      window.location.assign(result.url)
    } else {
      alert(result.error)
      setLoading(null)
    }
  }

  return (
    <div>
      {/* Cycle toggle */}
      <div className="mb-6 flex items-center gap-3">
        <span className="text-sm font-medium">Facturación:</span>
        <div className="flex rounded-md border">
          <button
            onClick={() => setCycle('monthly')}
            className={`rounded-l-md px-3 py-1.5 text-sm transition-colors ${
              cycle === 'monthly'
                ? 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900'
                : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            Mensual
          </button>
          <button
            onClick={() => setCycle('annual')}
            className={`rounded-r-md px-3 py-1.5 text-sm transition-colors ${
              cycle === 'annual'
                ? 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900'
                : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            Anual <span className="text-xs text-green-600">−17%</span>
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {(Object.entries(PLANS) as [PlanId, (typeof PLANS)[PlanId]][]).map(([planId, plan]) => {
          const isActive = planId === activePlan
          const price = cycle === 'monthly' ? plan.price.monthly : plan.price.annual
          const isStarter = planId === 'starter'

          return (
            <Card key={planId} className={isActive ? 'border-zinc-900 dark:border-zinc-100' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  {plan.name}
                  {isActive && (
                    <span className="text-xs font-normal text-zinc-500">Plan actual</span>
                  )}
                </CardTitle>
                <div className="mt-1">
                  <span className="text-3xl font-bold">${price}</span>
                  {!isStarter && (
                    <span className="text-sm text-zinc-500">
                      /{cycle === 'monthly' ? 'mes' : 'año'}
                    </span>
                  )}
                </div>
                <p className="text-sm text-zinc-500">{plan.description}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  {plan.limits.members === -1
                    ? 'Miembros ilimitados'
                    : `${plan.limits.members} miembros`}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  {plan.limits.projects === -1
                    ? 'Proyectos ilimitados'
                    : `${plan.limits.projects} proyectos`}
                </div>
                {!isStarter && plan.trialDays > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    {plan.trialDays} días de prueba gratis
                  </div>
                )}
              </CardContent>
              <CardFooter>
                {isStarter ? (
                  <Button variant="outline" className="w-full" disabled>
                    {isActive ? 'Plan actual' : 'Gratis'}
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    variant={isActive ? 'outline' : 'default'}
                    disabled={isActive || loading !== null}
                    onClick={() => handleUpgrade(planId)}
                  >
                    {loading === planId
                      ? 'Redirigiendo...'
                      : isActive
                        ? 'Plan actual'
                        : `Upgrade a ${plan.name}`}
                  </Button>
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
