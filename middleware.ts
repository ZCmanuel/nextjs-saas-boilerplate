// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

// Accesibles sin sesión
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
]
// Redirigen al dashboard si ya hay sesión
const authRoutes = ['/login', '/register']
// Requieren sesión (SUPERADMIN se verifica en cada Server Action)
const adminRoutes = ['/admin']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = getSessionCookie(request)

  const isPublic = publicRoutes.includes(pathname)
  const isAuth = authRoutes.includes(pathname)
  const isAdmin = adminRoutes.some((r) => pathname.startsWith(r))

  // Admin: requiere sesión
  if (isAdmin && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Rutas protegidas: requieren sesión
  if (!isPublic && !isAdmin && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Rutas de auth: redirige al dashboard si ya está autenticado
  if (isAuth && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*).+)'],
}
