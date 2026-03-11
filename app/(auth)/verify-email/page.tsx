import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function VerifyEmailPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Verifica tu email</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Te hemos enviado un enlace de verificación. Haz clic en él para activar tu cuenta y
          acceder al dashboard.
        </p>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Si no lo encuentras, revisa la carpeta de spam.
        </p>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/login">Volver al login</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
