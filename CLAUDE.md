# Next.js SaaS Boilerplate

SaaS B2B monolith (CRMs, facturación, gestión de equipos) con multi-tenancy,
auth, pagos y emails transaccionales listos para producción.

## Stack

- **Framework:** Next.js 14+ App Router
- **DB:** PostgreSQL vía Neon (serverless) + Prisma ORM
- **Auth:** Better Auth — sucesor oficial de Auth.js desde sep 2025
- **Pagos:** Stripe (planes + webhooks + Customer Portal)
- **Email:** Resend + React Email
- **Estilos:** Tailwind CSS + shadcn/ui
- **Deploy:** Vercel + GitHub

## Comandos comunes

```bash
npm run dev                          # servidor de desarrollo
npx prisma migrate dev --name <name> # nueva migración
npx prisma studio                    # explorador visual de DB
npx prisma generate                  # regenerar cliente tras cambios en schema
stripe listen --forward-to localhost:3000/api/webhooks/stripe  # webhooks en local
```

## Estructura de carpetas

```
app/
├── (auth)/          # login, register, verify-email, select-org, create-org
├── (marketing)/     # home pública — solo título, sin landing
├── (protected)/     # dashboard, billing, settings — requiere sesión + email verificado
├── admin/           # panel superadmin — requiere systemRole SUPERADMIN
└── api/
    ├── auth/[...all]/          # Better Auth handler
    └── webhooks/stripe/        # verificación de firma obligatoria

components/
├── ui/              # shadcn/ui — NO editar manualmente
└── shared/          # sidebar, topbar, org-switcher, theme-toggle

lib/
├── auth.ts          # configuración Better Auth (SOLO servidor)
├── auth-client.ts   # cliente Better Auth (SOLO componentes cliente)
├── db.ts            # singleton Prisma
├── stripe.ts        # singleton Stripe
├── resend.ts        # funciones de envío centralizadas
└── plans.ts         # constantes de planes + helper hasAccess()

actions/             # Server Actions — nunca llamar Resend/Stripe directamente
├── auth.ts          # register, login, logout, verifyEmail, switchOrganization
├── billing.ts       # createCheckoutSession, createPortalSession
├── user.ts
└── admin.ts         # doble verificación systemRole en cada función

emails/              # templates React Email
```

## Reglas de arquitectura

**Better Auth — dos archivos distintos:**

- `lib/auth.ts` → solo en Server Components y Server Actions
- `lib/auth-client.ts` → solo en Client Components (`useSession`, etc.)
- Mezclarlos causa errores en runtime

**Neon requiere dos URLs:**

- `DATABASE_URL` → pooler PgBouncer (runtime)
- `DIRECT_URL` → conexión directa (migraciones Prisma)
- Sin `DIRECT_URL`, `prisma migrate dev` falla

**Multi-tenancy — la suscripción es de la Organization, no del User:**

- `Subscription.organizationId` — no cambiar este diseño sin revisar todo el flujo de billing

**Stripe webhooks — firma obligatoria:**

```ts
// app/api/webhooks/stripe/route.ts
const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
// NUNCA omitir esta verificación
```

**Admin panel — doble capa de seguridad siempre:**

```ts
// En CADA Server Action de actions/admin.ts
const session = await auth()
if (session?.user?.systemRole !== 'SUPERADMIN') throw new Error('Unauthorized')
// El middleware solo es la primera capa, no la única
```

**shadcn/ui:** componentes en `components/ui/` son archivos copiados, no dependencia npm. No actualizar manualmente ni sobrescribir.

## Variables de entorno

```bash
DATABASE_URL=          # pooler Neon — runtime
DIRECT_URL=            # directa Neon — solo migraciones
BETTER_AUTH_SECRET=    # openssl rand -base64 32
BETTER_AUTH_URL=       # http://localhost:3000 en dev
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET= # distinto en local (stripe listen) y producción
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=
```

## Workflows

### Añadir una nueva feature al dashboard

1. Crear Server Action en `actions/` con validación de sesión
2. Crear página en `app/(protected)/dashboard/`
3. Añadir entrada al sidebar en `components/shared/sidebar.tsx`
4. Si toca DB: `npx prisma migrate dev --name <descripcion>`

### Depurar webhooks de Stripe en local

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Copia el whsec_xxx que te da y ponlo como STRIPE_WEBHOOK_SECRET en .env.local
```

### Cambiar dominio de email (Resend)

1. Resend Dashboard → Domains → Add Domain → añadir registros DNS
2. En `lib/resend.ts`: cambiar `from: "onboarding@resend.dev"` por `from: "hola@tudominio.com"`
3. Sin cambios en código ni en `RESEND_API_KEY`

### Crear el primer SUPERADMIN

```sql
UPDATE "User" SET "systemRole" = 'SUPERADMIN' WHERE email = 'tu@email.com';
```

### Git workflow

```bash
# Rama por módulo, commits semánticos
git checkout -b feat/modulo-X-nombre
git commit -m "feat: descripción"   # feat | fix | chore | docs | refactor
# Al terminar: merge a main, borrar rama
```

## Planes (lib/plans.ts)

Starter (gratis, 3 members, 5 projects) · Pro ($29/mes, 14d trial) · Enterprise ($99/mes, 30d trial).
`-1` en limits = ilimitado. Stripe es la fuente de verdad — los planes no están en DB.

Para quitar el plan gratuito: borrar bloque `starter` en `lib/plans.ts` + columna en pricing page.
Para cambiar trial: modificar `trialDays` en el plan correspondiente.

## Documentación del proyecto

- Decisiones de arquitectura: https://www.notion.so/31c17bd55a2881c59995cb9777ae32b9
- Plan de implementación (52 tareas): https://www.notion.so/4afa0636f520447faad04c57dcf034bf
