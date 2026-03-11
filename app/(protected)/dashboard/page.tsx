import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { logout } from '@/actions/auth'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) redirect('/login')

  // Si no hay org activa, redirige al selector
  if (!session.session.activeOrganizationId) {
    redirect('/select-org')
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b bg-white px-6 py-4 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="font-semibold">Dashboard</span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">{session.user.name}</span>
            <form action={logout}>
              <Button variant="outline" size="sm" type="submit">
                Cerrar sesión
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
        <h2 className="text-2xl font-semibold tracking-tight">
          Bienvenido, {session.user.name} 👋
        </h2>
        <p className="mt-2 text-zinc-500">
          Organización activa:{' '}
          <span className="font-mono text-xs text-zinc-700 dark:text-zinc-300">
            {session.session.activeOrganizationId}
          </span>
        </p>
      </main>
    </div>
  )
}
