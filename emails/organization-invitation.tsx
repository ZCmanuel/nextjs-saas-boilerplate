import { Body, Button, Container, Heading, Hr, Html, Preview, Text } from '@react-email/components'

export function OrganizationInvitationEmail({
  inviterName,
  orgName,
  inviteUrl,
}: {
  inviterName: string
  orgName: string
  inviteUrl: string
}) {
  return (
    <Html>
      <Preview>Te han invitado a unirte a {orgName}</Preview>
      <Body style={{ backgroundColor: '#f9fafb', fontFamily: 'sans-serif' }}>
        <Container
          style={{
            maxWidth: '560px',
            margin: '40px auto',
            backgroundColor: '#ffffff',
            padding: '40px',
            borderRadius: '8px',
          }}
        >
          <Heading style={{ fontSize: '24px', color: '#111827', marginBottom: '16px' }}>
            Invitación a {orgName}
          </Heading>
          <Text style={{ color: '#6b7280', fontSize: '16px', lineHeight: '24px' }}>
            {inviterName} te ha invitado a unirte a la organización <strong>{orgName}</strong>.
          </Text>
          <Button
            href={inviteUrl}
            style={{
              backgroundColor: '#111827',
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: '6px',
              textDecoration: 'none',
              display: 'inline-block',
              marginTop: '16px',
            }}
          >
            Aceptar invitación
          </Button>
          <Hr style={{ margin: '32px 0', borderColor: '#e5e7eb' }} />
          <Text style={{ color: '#9ca3af', fontSize: '14px' }}>
            Si no esperabas esta invitación, puedes ignorar este email.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
