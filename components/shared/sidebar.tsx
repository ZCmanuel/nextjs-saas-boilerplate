'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, CreditCard, Settings, LogOut } from 'lucide-react'
import { OrgSwitcher } from '@/components/shared/org-switcher'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'

type Org = {
  id: string
  name: string
  slug: string
}

type Props = {
  user: { name: string; email: string }
  activeOrg: Org
  organizations: Org[]
  plan: string
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/billing', label: 'Billing', icon: CreditCard },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export function Sidebar({ user, activeOrg, organizations, plan }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await authClient.signOut()
    router.push('/login')
  }

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r bg-white dark:bg-zinc-900">
      {/* Header */}
      <div className="border-b px-3 py-3">
        <OrgSwitcher activeOrg={activeOrg} organizations={organizations} />
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-2 py-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50'
                  : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Plan badge */}
      <div className="px-4 pb-2">
        <Badge variant="secondary" className="text-xs capitalize">
          {plan}
        </Badge>
      </div>

      {/* Footer */}
      <div className="border-t px-3 py-3">
        <div className="mb-2 px-1">
          <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
            {user.name}
          </p>
          <p className="truncate text-xs text-zinc-500">{user.email}</p>
        </div>
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="h-8 gap-1.5 px-2 text-xs"
          >
            <LogOut className="h-3.5 w-3.5" />
            Salir
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  )
}
