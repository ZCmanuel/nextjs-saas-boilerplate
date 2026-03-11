import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { headers } from 'next/headers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Users, CreditCard, TrendingUp } from 'lucide-react'

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/login')

  const currentUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { systemRole: true },
  })
  if (currentUser?.systemRole !== 'SUPERADMIN') redirect('/dashboard')

  const [totalUsers, totalOrgs, subscriptions] = await Promise.all([
    db.user.count(),
    db.organization.count(),
    db.subscription.findMany({
      select: { status: true, stripePriceId: true },
    }),
  ])

  const activeSubscriptions = subscriptions.filter(
    (s) => s.status === 'ACTIVE' || s.status === 'TRIALING'
  ).length

  const canceledSubscriptions = subscriptions.filter((s) => s.status === 'CANCELED').length
  const pastDueSubscriptions = subscriptions.filter((s) => s.status === 'PAST_DUE').length

  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-zinc-500">Métricas globales del sistema</p>
      </div>

      {/* Métricas principales */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Usuarios totales</CardTitle>
            <Users className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Organizaciones</CardTitle>
            <Building2 className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{totalOrgs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              Suscripciones activas
            </CardTitle>
            <CreditCard className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{activeSubscriptions}</div>
            <p className="mt-1 text-xs text-zinc-500">
              {canceledSubscriptions} canceladas · {pastDueSubscriptions} con pago pendiente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Tasa de conversión</CardTitle>
            <TrendingUp className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {totalOrgs > 0 ? Math.round((activeSubscriptions / totalOrgs) * 100) : 0}%
            </div>
            <p className="mt-1 text-xs text-zinc-500">orgs con plan activo</p>
          </CardContent>
        </Card>
      </div>

      {/* Distribución de suscripciones */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Estado de suscripciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                label: 'Activas',
                value: subscriptions.filter((s) => s.status === 'ACTIVE').length,
                color: 'bg-green-500',
              },
              {
                label: 'En trial',
                value: subscriptions.filter((s) => s.status === 'TRIALING').length,
                color: 'bg-blue-500',
              },
              { label: 'Pago pendiente', value: pastDueSubscriptions, color: 'bg-yellow-500' },
              { label: 'Canceladas', value: canceledSubscriptions, color: 'bg-red-500' },
              {
                label: 'Incompletas',
                value: subscriptions.filter((s) => s.status === 'INCOMPLETE').length,
                color: 'bg-zinc-400',
              },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center gap-3">
                <div className={`h-2.5 w-2.5 rounded-full ${color}`} />
                <span className="w-36 text-sm text-zinc-600 dark:text-zinc-400">{label}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
