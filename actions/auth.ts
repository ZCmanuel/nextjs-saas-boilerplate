'use server'

import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export async function getSession() {
  return auth.api.getSession({ headers: await headers() })
}

export async function logout() {
  await auth.api.signOut({ headers: await headers() })
  redirect('/login')
}

export async function forgotPassword(email: string) {
  await auth.api.requestPasswordReset({
    body: {
      email,
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
    },
    headers: await headers(),
  })
  // Siempre devuelve éxito para no revelar si el email existe
  return { success: true }
}

export async function resetPassword(token: string, newPassword: string) {
  try {
    await auth.api.resetPassword({
      body: { token, newPassword },
      headers: await headers(),
    })
    return { success: true }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Error al restablecer la contraseña'
    return { error: message }
  }
}
