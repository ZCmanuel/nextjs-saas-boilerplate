import { Body, Button, Container, Heading, Hr, Html, Preview, Text } from '@react-email/components'

export function VerificationEmail({ name, url }: { name: string; url: string }) {
  return (
    <Html>
      <Preview>Verifica tu email para activar tu cuenta</Preview>
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
            Verifica tu email
          </Heading>
          <Text style={{ color: '#6b7280', fontSize: '16px', lineHeight: '24px' }}>
            Hola {name}, haz clic en el botón para verificar tu cuenta.
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
            Verificar email
          </Button>
          <Hr style={{ margin: '32px 0', borderColor: '#e5e7eb' }} />
          <Text style={{ color: '#9ca3af', fontSize: '14px' }}>
            Si no creaste esta cuenta, puedes ignorar este email.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
