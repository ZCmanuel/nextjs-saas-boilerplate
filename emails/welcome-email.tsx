import { Body, Container, Heading, Hr, Html, Preview, Text } from '@react-email/components'

export function WelcomeEmail({ name }: { name: string }) {
  return (
    <Html>
      <Preview>Bienvenido, tu cuenta está lista</Preview>
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
            Bienvenido a SaaS Boilerplate
          </Heading>
          <Text style={{ color: '#6b7280', fontSize: '16px', lineHeight: '24px' }}>
            Hola {name}, tu email ha sido verificado y tu cuenta está activa.
          </Text>
          <Text style={{ color: '#6b7280', fontSize: '16px', lineHeight: '24px' }}>
            Ya puedes iniciar sesión y comenzar a usar la aplicación.
          </Text>
          <Hr style={{ margin: '32px 0', borderColor: '#e5e7eb' }} />
          <Text style={{ color: '#9ca3af', fontSize: '14px' }}>Gracias por unirte.</Text>
        </Container>
      </Body>
    </Html>
  )
}
