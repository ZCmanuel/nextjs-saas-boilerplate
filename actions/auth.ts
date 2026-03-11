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
