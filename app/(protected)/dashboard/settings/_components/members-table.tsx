'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type Member = {
  id: string
  role: string
  user: { id: string; name: string; email: string; image?: string | null }
}

type Props = {
  members: Member[]
  currentUserId: string
  organizationId: string
}

export function MembersTable({ members, currentUserId, organizationId }: Props) {
  const router = useRouter()
  const [removing, setRemoving] = useState<string | null>(null)

  async function handleRemove(memberId: string, userId: string) {
    if (!confirm('¿Eliminar este miembro de la organización?')) return
    setRemoving(memberId)
    await authClient.organization.removeMember({
      memberIdOrEmail: userId,
      organizationId,
    })
    router.refresh()
    setRemoving(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Miembros</CardTitle>
        <CardDescription>
          {members.length} miembro{members.length !== 1 ? 's' : ''} en esta organización
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">{member.user.name}</TableCell>
                <TableCell className="text-zinc-500">{member.user.email}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize text-xs">
                    {member.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {member.user.id !== currentUserId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-red-500 hover:text-red-600"
                      disabled={removing === member.id}
                      onClick={() => handleRemove(member.id, member.user.id)}
                    >
                      Eliminar
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
