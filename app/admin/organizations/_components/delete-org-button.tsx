'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteOrganization } from '@/actions/admin'
import { Button } from '@/components/ui/button'

type Props = {
  organizationId: string
  orgName: string
}

export function DeleteOrgButton({ organizationId, orgName }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm(`¿Eliminar la organización "${orgName}"? Esta acción no se puede deshacer.`))
      return
    setLoading(true)
    try {
      await deleteOrganization(organizationId)
      router.refresh()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error al eliminar la organización')
      setLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 text-xs text-red-500 hover:text-red-600"
      disabled={loading}
      onClick={handleDelete}
    >
      Eliminar
    </Button>
  )
}
