'use client'

import { useState } from 'react'
import { createPortalSession } from '@/actions/billing'
import { Button } from '@/components/ui/button'

export function BillingPortal() {
  const [loading, setLoading] = useState(false)

  async function handlePortal() {
    setLoading(true)
    const result = await createPortalSession()
    if ('url' in result) {
      window.location.assign(result.url)
    } else {
      alert(result.error)
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handlePortal} disabled={loading}>
      {loading ? 'Cargando...' : 'Gestionar suscripción'}
    </Button>
  )
}
