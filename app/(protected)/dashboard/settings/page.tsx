import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { headers } from 'next/headers'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileForm } from './_components/profile-form'
import { MembersTable } from './_components/members-table'
import { InviteForm } from './_components/invite-form'

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/login')
  if (!session.session.activeOrganizationId) redirect('/select-org')

  const organizationId = session.session.activeOrganizationId

  const [org, members] = await Promise.all([
    db.organization.findUnique({
      where: { id: organizationId },
      select: { id: true, name: true, slug: true },
    }),
    db.member.findMany({
      where: { organizationId },
      include: { user: { select: { id: true, name: true, email: true, image: true } } },
      orderBy: { createdAt: 'asc' },
    }),
  ])

  if (!org) redirect('/select-org')

  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-zinc-500">Gestiona tu perfil y tu organización</p>
      </div>

      <Tabs defaultValue="profile" className="max-w-2xl">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="members">Miembros</TabsTrigger>
          <TabsTrigger value="invite">Invitar</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileForm user={{ name: session.user.name, email: session.user.email }} />
        </TabsContent>

        <TabsContent value="members">
          <MembersTable
            members={members.map((m) => ({
              id: m.id,
              role: m.role,
              user: m.user,
            }))}
            currentUserId={session.user.id}
            organizationId={organizationId}
          />
        </TabsContent>

        <TabsContent value="invite">
          <InviteForm organizationId={organizationId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
