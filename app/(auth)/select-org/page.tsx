'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type Org = {
  id: string
  name: string
  slug: string
  logo?: string | null
}

export default function SelectOrgPage() {
  const router = useRouter()
  const [orgs, setOrgs] = useState<Org[]>([])
  const [loading, setLoading] = useState(true)
  const [activating, setActivating] = useState<string | null>(null)

  useEffect(() => {
    authClient.organization.list().then(({ data }) => {
      if (!data || data.length === 0) {
        router.replace('/create-org')
      } else {
        setOrgs(data)
        setLoading(false)
      }
    })
  }, [router])

  async function selectOrg(id: string) {
    setActivating(id)
    await authClient.organization.setActive({ organizationId: id })
    router.push('/dashboard')
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-zinc-500">
          Cargando organizaciones...
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Selecciona tu organización</CardTitle>
        <CardDescription>Elige con qué espacio quieres continuar</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {orgs.map((org) => (
          <button
            key={org.id}
            onClick={() => selectOrg(org.id)}
            disabled={activating === org.id}
            className="flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:hover:bg-zinc-900"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-900 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
              {org.name[0].toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium">{org.name}</p>
              <p className="text-xs text-zinc-500">{org.slug}</p>
            </div>
          </button>
        ))}
        <div className="pt-2">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/create-org">+ Nueva organización</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
