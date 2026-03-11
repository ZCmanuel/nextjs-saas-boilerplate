import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { headers } from 'next/headers'
import { getActivePlan } from '@/lib/plans'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DeleteOrgButton } from './_components/delete-org-button'

export default async function AdminOrganizationsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/login')

  const currentUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { systemRole: true },
  })
  if (currentUser?.systemRole !== 'SUPERADMIN') redirect('/dashboard')

  const organizations = await db.organization.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      members: true,
      subscription: true,
    },
  })

  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Organizaciones</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {organizations.length} organizaciones registradas
        </p>
      </div>

      <div className="rounded-md border bg-white dark:bg-zinc-900">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Miembros</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Creada</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {organizations.map((org) => {
              const plan = getActivePlan(org.subscription)
              return (
                <TableRow key={org.id}>
                  <TableCell className="font-medium">{org.name}</TableCell>
                  <TableCell className="font-mono text-xs text-zinc-500">{org.slug}</TableCell>
                  <TableCell>{org.members.length}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize text-xs">
                      {plan}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {org.subscription ? (
                      <Badge
                        variant={
                          org.subscription.status === 'ACTIVE' ||
                          org.subscription.status === 'TRIALING'
                            ? 'default'
                            : org.subscription.status === 'PAST_DUE'
                              ? 'destructive'
                              : 'outline'
                        }
                        className="text-xs"
                      >
                        {org.subscription.status}
                      </Badge>
                    ) : (
                      <span className="text-xs text-zinc-400">Sin suscripción</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-zinc-500">
                    {new Date(org.createdAt).toLocaleDateString('es-ES')}
                  </TableCell>
                  <TableCell className="text-right">
                    <DeleteOrgButton organizationId={org.id} orgName={org.name} />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
