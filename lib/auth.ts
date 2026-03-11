// lib/auth.ts — solo en Server Components y Server Actions
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { organization } from 'better-auth/plugins'
import { db } from '@/lib/db'

const googleEnabled = !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    password: {
      hash: async (password) => {
        const bcrypt = await import('bcryptjs')
        return bcrypt.hash(password, 12)
      },
      verify: async ({ password, hash }) => {
        const bcrypt = await import('bcryptjs')
        return bcrypt.compare(password, hash)
      },
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    callbackURL: '/dashboard',
    sendVerificationEmail: async ({ user, url }) => {
      // Módulo 4: conectar con Resend
      console.log(`[verify] ${user.email} → ${url}`)
    },
  },
  ...(googleEnabled && {
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
    },
  }),
  plugins: [organization()],
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'],
})

export type Session = typeof auth.$Infer.Session
