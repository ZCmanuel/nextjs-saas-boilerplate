'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronsUpDown, Plus } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type Org = {
  id: string
  name: string
  slug: string
}

type Props = {
  activeOrg: Org
  organizations: Org[]
}

export function OrgSwitcher({ activeOrg, organizations }: Props) {
  const router = useRouter()
  const [switching, setSwitching] = useState(false)

  async function switchOrg(id: string) {
    if (id === activeOrg.id) return
    setSwitching(true)
    await authClient.organization.setActive({ organizationId: id })
    router.refresh()
    setSwitching(false)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          disabled={switching}
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-zinc-100 disabled:opacity-50 dark:hover:bg-zinc-800"
        >
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-zinc-900 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
            {activeOrg.name[0].toUpperCase()}
          </div>
          <span className="flex-1 truncate font-medium">{activeOrg.name}</span>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        {organizations.map((org) => (
          <DropdownMenuItem key={org.id} onClick={() => switchOrg(org.id)} className="gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-zinc-900 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
              {org.name[0].toUpperCase()}
            </div>
            <span className="truncate">{org.name}</span>
            {org.id === activeOrg.id && (
              <span className="ml-auto text-xs text-zinc-400">activa</span>
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/create-org')} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva organización
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
