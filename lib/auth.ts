// lib/auth.ts — solo en Server Components y Server Actions
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { organization } from 'better-auth/plugins'
import { db } from '@/lib/db'
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendOrganizationInvitationEmail,
} from '@/lib/resend'

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
    sendResetPassword: async ({
      user,
      url,
    }: {
      user: { name: string; email: string }
      url: string
      token: string
    }) => {
      await sendPasswordResetEmail({ name: user.name, email: user.email, url })
    },
    onPasswordReset: async ({ user }: { user: { name: string; email: string } }) => {
      await sendPasswordChangedEmail({ name: user.name, email: user.email })
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    callbackURL: '/dashboard',
    sendVerificationEmail: async ({
      user,
      url,
    }: {
      user: { name: string; email: string }
      url: string
    }) => {
      await sendVerificationEmail({ name: user.name, email: user.email, url })
      await sendWelcomeEmail({ name: user.name, email: user.email })
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
  plugins: [
    organization({
      async sendInvitationEmail(data) {
        const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/accept?id=${data.invitation.id}`
        await sendOrganizationInvitationEmail({
          email: data.invitation.email,
          inviterName: data.inviter.user.name,
          orgName: data.organization.name,
          inviteUrl,
        })
      },
    }),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'],
})

export type Session = typeof auth.$Infer.Session
