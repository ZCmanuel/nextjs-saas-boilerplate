'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await authClient.signOut()
    router.push('/login')
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout} className="h-8 gap-1.5 px-2 text-xs">
      <LogOut className="h-3.5 w-3.5" />
      Salir
    </Button>
  )
}
