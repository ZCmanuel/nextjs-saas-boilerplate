'use client'

import { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type Props = {
  organizationId: string
}

export function InviteForm({ organizationId }: Props) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    const { error } = await authClient.organization.inviteMember({
      organizationId,
      email,
      role: 'member',
    })

    if (error) {
      setError(error.message ?? 'Error al enviar la invitación')
    } else {
      setSuccess(true)
      setEmail('')
    }
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Invitar miembro</CardTitle>
        <CardDescription>
          Envía una invitación por email para unirse a la organización
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="colaborador@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-green-600">Invitación enviada correctamente</p>}
          <Button type="submit" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar invitación'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
