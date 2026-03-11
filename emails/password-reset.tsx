import { Body, Button, Container, Heading, Hr, Html, Preview, Text } from '@react-email/components'

export function PasswordResetEmail({ name, url }: { name: string; url: string }) {
  return (
    <Html>
      <Preview>Restablece tu contraseña</Preview>
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
            Restablecer contraseña
          </Heading>
          <Text style={{ color: '#6b7280', fontSize: '16px', lineHeight: '24px' }}>
            Hola {name}, recibimos una solicitud para restablecer tu contraseña.
          </Text>
          <Button
            href={url}
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
            Restablecer contraseña
          </Button>
          <Hr style={{ margin: '32px 0', borderColor: '#e5e7eb' }} />
          <Text style={{ color: '#9ca3af', fontSize: '14px' }}>
            Este enlace expira en 1 hora. Si no solicitaste esto, ignora este email.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
