import { Body, Container, Heading, Hr, Html, Preview, Text } from '@react-email/components'

export function PasswordChangedEmail({ name }: { name: string }) {
  return (
    <Html>
      <Preview>Tu contraseña ha sido cambiada</Preview>
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
            Contraseña actualizada
          </Heading>
          <Text style={{ color: '#6b7280', fontSize: '16px', lineHeight: '24px' }}>
            Hola {name}, tu contraseña ha sido cambiada exitosamente.
          </Text>
          <Text style={{ color: '#6b7280', fontSize: '16px', lineHeight: '24px' }}>
            Si no realizaste este cambio, contacta a soporte de inmediato.
          </Text>
          <Hr style={{ margin: '32px 0', borderColor: '#e5e7eb' }} />
          <Text style={{ color: '#9ca3af', fontSize: '14px' }}>
            Este es un email de seguridad automático.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
