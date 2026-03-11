import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { headers } from 'next/headers'
import { getActivePlan } from '@/lib/plans'
import { PLANS } from '@/lib/plans'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, FolderOpen, CreditCard } from 'lucide-react'

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/login')
  if (!session.session.activeOrganizationId) redirect('/select-org')

  const organizationId = session.session.activeOrganizationId

  const [org, memberCount, subscription] = await Promise.all([
    db.organization.findUnique({
      where: { id: organizationId },
      select: { name: true },
    }),
    db.member.count({ where: { organizationId } }),
    db.subscription.findUnique({ where: { organizationId } }),
  ])

  const plan = getActivePlan(subscription)
  const planData = PLANS[plan]

  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Bienvenido, {session.user.name}</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Organización:{' '}
          <span className="font-medium text-zinc-700 dark:text-zinc-300">{org?.name}</span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Plan actual</CardTitle>
            <CreditCard className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-semibold capitalize">{planData.name}</span>
              {subscription?.status === 'TRIALING' && (
                <Badge variant="secondary" className="text-xs">
                  Trial
                </Badge>
              )}
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              {planData.price.monthly === 0 ? 'Gratis' : `$${planData.price.monthly}/mes`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Miembros</CardTitle>
            <Users className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{memberCount}</div>
            <p className="mt-1 text-xs text-zinc-500">
              {planData.limits.members === -1
                ? 'Ilimitados'
                : `de ${planData.limits.members} permitidos`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Proyectos</CardTitle>
            <FolderOpen className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">—</div>
            <p className="mt-1 text-xs text-zinc-500">
              {planData.limits.projects === -1 ? 'Ilimitados' : `hasta ${planData.limits.projects}`}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
