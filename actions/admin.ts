'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { headers } from 'next/headers'

async function requireSuperAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('No autenticado')

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { systemRole: true },
  })

  if (user?.systemRole !== 'SUPERADMIN') throw new Error('Unauthorized')

  return session
}

export async function promoteToSuperAdmin(userId: string) {
  await requireSuperAdmin()

  await db.user.update({
    where: { id: userId },
    data: { systemRole: 'SUPERADMIN' },
  })

  return { success: true }
}

export async function demoteFromSuperAdmin(userId: string) {
  const session = await requireSuperAdmin()

  if (session.user.id === userId) {
    throw new Error('No puedes quitarte el rol SUPERADMIN a ti mismo')
  }

  await db.user.update({
    where: { id: userId },
    data: { systemRole: 'USER' },
  })

  return { success: true }
}

export async function deleteOrganization(organizationId: string) {
  await requireSuperAdmin()

  await db.organization.delete({ where: { id: organizationId } })

  return { success: true }
}
