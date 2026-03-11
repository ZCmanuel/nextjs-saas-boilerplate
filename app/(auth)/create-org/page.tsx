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

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function CreateOrgPage() {
  const router = useRouter()
  const [slug, setSlug] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlug(toSlug(e.target.value))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = e.currentTarget
    const name = (form.elements.namedItem('name') as HTMLInputElement).value

    const { data, error } = await authClient.organization.create({
      name,
      slug,
    })

    if (error) {
      setError(error.message ?? 'Error al crear la organización')
      setLoading(false)
      return
    }

    if (data) {
      await authClient.organization.setActive({ organizationId: data.id })
      router.push('/dashboard')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crear organización</CardTitle>
        <CardDescription>Tu espacio de trabajo para el equipo</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-sm font-medium leading-none">
              Nombre de la organización
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Acme Corp"
              onChange={handleNameChange}
              required
            />
          </div>
          {slug && (
            <p className="text-xs text-zinc-500">
              URL: <span className="font-mono text-zinc-700 dark:text-zinc-300">{slug}</span>
            </p>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creando...' : 'Crear organización'}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <Button variant="ghost" className="w-full" asChild>
          <Link href="/select-org">← Volver</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
