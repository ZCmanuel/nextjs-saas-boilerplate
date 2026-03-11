import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { headers } from 'next/headers'
import Link from 'next/link'
import { LayoutDashboard, Users, Building2 } from 'lucide-react'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { LogoutButton } from '@/components/shared/logout-button'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) redirect('/login')

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { systemRole: true },
  })

  if (user?.systemRole !== 'SUPERADMIN') redirect('/login')

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <aside className="flex h-screen w-56 shrink-0 flex-col border-r bg-white dark:bg-zinc-900">
        <div className="border-b px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Admin Panel
          </p>
        </div>
        <nav className="flex-1 space-y-0.5 px-2 py-3">
          <Link
            href="/admin"
            className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
          >
            <LayoutDashboard className="h-4 w-4" />
            Overview
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
          >
            <Users className="h-4 w-4" />
            Usuarios
          </Link>
          <Link
            href="/admin/organizations"
            className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
          >
            <Building2 className="h-4 w-4" />
            Organizaciones
          </Link>
        </nav>
        <div className="border-t px-3 py-3">
          <div className="mb-2 px-1">
            <p className="truncate text-sm font-medium">{session.user.name}</p>
            <p className="truncate text-xs text-zinc-500">{session.user.email}</p>
          </div>
          <div className="flex items-center justify-between">
            <LogoutButton />
            <ThemeToggle />
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
