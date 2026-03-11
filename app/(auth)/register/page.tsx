'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = e.currentTarget
    const name = (form.elements.namedItem('name') as HTMLInputElement).value
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement).value

    const { error } = await authClient.signUp.email({
      name,
      email,
      password,
      callbackURL: '/verify-email',
    })

    if (error) {
      setError(error.message ?? 'Error al crear la cuenta')
      setLoading(false)
    } else {
      router.push('/verify-email')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crear cuenta</CardTitle>
        <CardDescription>Empieza gratis, sin tarjeta</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-sm font-medium leading-none">
              Nombre
            </label>
            <Input id="name" name="name" type="text" placeholder="Tu nombre" required />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium leading-none">
              Email
            </label>
            <Input id="email" name="email" type="email" placeholder="tu@email.com" required />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium leading-none">
              Contraseña
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Mínimo 8 caracteres"
              minLength={8}
              required
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          ¿Ya tienes cuenta?{' '}
          <Link
            href="/login"
            className="font-medium text-zinc-950 hover:underline dark:text-zinc-50"
          >
            Inicia sesión
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
