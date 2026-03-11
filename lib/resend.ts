import { Resend } from 'resend'
import { VerificationEmail } from '@/emails/verification-email'
import { WelcomeEmail } from '@/emails/welcome-email'
import { PasswordResetEmail } from '@/emails/password-reset'
import { OrganizationInvitationEmail } from '@/emails/organization-invitation'
import { PasswordChangedEmail } from '@/emails/password-changed'

const resend = new Resend(process.env.RESEND_API_KEY)

// Cambiar a dominio verificado en producción
const FROM = 'SaaS Boilerplate <onboarding@resend.dev>'

export async function sendVerificationEmail({
  name,
  email,
  url,
}: {
  name: string
  email: string
  url: string
}) {
  const { data, error } = await resend.emails.send(
    {
      from: FROM,
      to: email,
      subject: 'Verifica tu email',
      react: VerificationEmail({ name, url }),
    },
    { idempotencyKey: `verification-email/${email}` }
  )
  if (error) console.error('[resend] sendVerificationEmail:', error)
  return { data, error }
}

export async function sendWelcomeEmail({ name, email }: { name: string; email: string }) {
  const { data, error } = await resend.emails.send(
    {
      from: FROM,
      to: email,
      subject: 'Bienvenido a SaaS Boilerplate',
      react: WelcomeEmail({ name }),
    },
    { idempotencyKey: `welcome-email/${email}` }
  )
  if (error) console.error('[resend] sendWelcomeEmail:', error)
  return { data, error }
}

export async function sendPasswordResetEmail({
  name,
  email,
  url,
}: {
  name: string
  email: string
  url: string
}) {
  const { data, error } = await resend.emails.send(
    {
      from: FROM,
      to: email,
      subject: 'Restablecer contraseña',
      react: PasswordResetEmail({ name, url }),
    },
    { idempotencyKey: `password-reset/${email}` }
  )
  if (error) console.error('[resend] sendPasswordResetEmail:', error)
  return { data, error }
}

export async function sendOrganizationInvitationEmail({
  email,
  inviterName,
  orgName,
  inviteUrl,
}: {
  email: string
  inviterName: string
  orgName: string
  inviteUrl: string
}) {
  const { data, error } = await resend.emails.send(
    {
      from: FROM,
      to: email,
      subject: `Te han invitado a ${orgName}`,
      react: OrganizationInvitationEmail({ inviterName, orgName, inviteUrl }),
    },
    { idempotencyKey: `org-invitation/${email}/${orgName}` }
  )
  if (error) console.error('[resend] sendOrganizationInvitationEmail:', error)
  return { data, error }
}

export async function sendPasswordChangedEmail({ name, email }: { name: string; email: string }) {
  const { data, error } = await resend.emails.send(
    {
      from: FROM,
      to: email,
      subject: 'Tu contraseña ha cambiado',
      react: PasswordChangedEmail({ name }),
    },
    { idempotencyKey: `password-changed/${email}` }
  )
  if (error) console.error('[resend] sendPasswordChangedEmail:', error)
  return { data, error }
}
