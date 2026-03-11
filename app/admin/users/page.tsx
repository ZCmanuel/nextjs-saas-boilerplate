import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { headers } from 'next/headers'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default async function AdminUsersPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/login')

  const currentUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { systemRole: true },
  })
  if (currentUser?.systemRole !== 'SUPERADMIN') redirect('/dashboard')

  const users = await db.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      members: {
        include: { organization: { select: { name: true } } },
      },
    },
  })

  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Usuarios</h1>
        <p className="mt-1 text-sm text-zinc-500">{users.length} usuarios registrados</p>
      </div>

      <div className="rounded-md border bg-white dark:bg-zinc-900">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Organizaciones</TableHead>
              <TableHead>Rol sistema</TableHead>
              <TableHead>Email verificado</TableHead>
              <TableHead>Registrado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell className="text-zinc-500">{user.email}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {user.members.length === 0 ? (
                      <span className="text-xs text-zinc-400">Sin org</span>
                    ) : (
                      user.members.map((m) => (
                        <Badge key={m.id} variant="outline" className="text-xs">
                          {m.organization.name}
                        </Badge>
                      ))
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={user.systemRole === 'SUPERADMIN' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {user.systemRole}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span
                    className={`text-xs ${user.emailVerified ? 'text-green-600' : 'text-red-500'}`}
                  >
                    {user.emailVerified ? 'Sí' : 'No'}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-zinc-500">
                  {new Date(user.createdAt).toLocaleDateString('es-ES')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
