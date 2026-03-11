import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { headers } from 'next/headers'
import { getActivePlan } from '@/lib/plans'
import { Sidebar } from '@/components/shared/sidebar'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) redirect('/login')
  if (!session.user.emailVerified) redirect('/verify-email')

  // SUPERADMIN va directamente al panel de administración
  const currentUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { systemRole: true },
  })
  if (currentUser?.systemRole === 'SUPERADMIN') redirect('/admin')

  if (!session.session.activeOrganizationId) redirect('/select-org')

  const organizationId = session.session.activeOrganizationId

  const [activeOrg, organizations, subscription] = await Promise.all([
    db.organization.findUnique({
      where: { id: organizationId },
      select: { id: true, name: true, slug: true },
    }),
    db.member.findMany({
      where: { userId: session.user.id },
      include: { organization: { select: { id: true, name: true, slug: true } } },
    }),
    db.subscription.findUnique({
      where: { organizationId },
    }),
  ])

  if (!activeOrg) redirect('/select-org')

  const plan = getActivePlan(subscription)

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <Sidebar
        user={{ name: session.user.name, email: session.user.email }}
        activeOrg={activeOrg}
        organizations={organizations.map((m) => m.organization)}
        plan={plan}
      />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
