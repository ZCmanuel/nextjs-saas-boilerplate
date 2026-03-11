# Next.js SaaS Boilerplate

Boilerplate de producción para SaaS B2B con multi-tenancy, autenticación, pagos y emails transaccionales listos para usar.

## Stack

| Capa          | Tecnología                                     |
| ------------- | ---------------------------------------------- |
| Framework     | Next.js 14+ App Router                         |
| Base de datos | PostgreSQL vía Neon (serverless) + Prisma ORM  |
| Auth          | Better Auth (multi-tenancy + organizaciones)   |
| Pagos         | Stripe (Checkout + Customer Portal + Webhooks) |
| Email         | Resend + React Email                           |
| Estilos       | Tailwind CSS v4 + shadcn/ui                    |
| Deploy        | Vercel                                         |

---

## Quick Start

```bash
# 1. Clonar e instalar
git clone <repo-url>
cd boilerplate
npm install

# 2. Copiar variables de entorno
cp .env.example .env.local

# 3. Rellenar las variables (ver secciones siguientes)

# 4. Ejecutar migraciones
npx prisma migrate dev --name init

# 5. Arrancar
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

---

## Variables de entorno

```bash
# Base de datos (Neon)
DATABASE_URL=             # URL del pooler — runtime
DIRECT_URL=               # URL directa — solo migraciones Prisma

# Better Auth
BETTER_AUTH_SECRET=       # openssl rand -base64 32
BETTER_AUTH_URL=          # http://localhost:3000 en dev

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=    # whsec_xxx (ver sección Stripe)
STRIPE_PRO_MONTHLY_PRICE_ID=
STRIPE_PRO_ANNUAL_PRICE_ID=
STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=
STRIPE_ENTERPRISE_ANNUAL_PRICE_ID=

# Resend
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=      # http://localhost:3000 en dev
```

---

## Setup de base de datos

Este proyecto usa **Neon** (PostgreSQL serverless). Neon requiere dos URLs distintas:

- `DATABASE_URL` → URL del **pooler** (PgBouncer) — para el runtime de la app
- `DIRECT_URL` → URL de **conexión directa** — solo para migraciones con Prisma

### Obtener las URLs en Neon

1. Crea un proyecto en [neon.tech](https://neon.tech)
2. En el panel del proyecto → **Connection Details**
3. Copia la **Connection string** como `DATABASE_URL`
4. Activa el toggle **Pooler** → copia esa URL como `DIRECT_URL` (o al revés según el panel)

> **Importante:** Sin `DIRECT_URL`, `npx prisma migrate dev` fallará.

### Comandos Prisma

```bash
npx prisma migrate dev --name <descripcion>   # nueva migración
npx prisma studio                              # explorador visual de DB
npx prisma generate                            # regenerar cliente tras cambios en schema
```

---

## Configuración de Auth y Google OAuth

### Better Auth

Genera el secreto:

```bash
openssl rand -base64 32
```

Cópialo como `BETTER_AUTH_SECRET`.

### Google OAuth (opcional)

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un proyecto → **APIs & Services** → **Credentials**
3. Crea **OAuth 2.0 Client ID** (tipo: Web application)
4. En **Authorized redirect URIs** añade:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
5. Copia el **Client ID** y **Client Secret** al `.env.local`

> Si no configuras Google OAuth, el botón de Google no aparece (la app lo detecta automáticamente).

---

## Configuración de Stripe y planes

### 1. Crear productos en Stripe Dashboard

1. Ve a [dashboard.stripe.com](https://dashboard.stripe.com) → **Products**
2. Crea 2 productos: **Pro** y **Enterprise**
3. Para cada uno, añade 2 precios:
   - Recurrente mensual (ej. $29/mes para Pro)
   - Recurrente anual (ej. $290/año para Pro)

### 2. Copiar los Price IDs

Cada precio tiene un ID con formato `price_xxx`. Cópialos al `.env.local`:

```bash
STRIPE_PRO_MONTHLY_PRICE_ID=price_xxx
STRIPE_PRO_ANNUAL_PRICE_ID=price_xxx
STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=price_xxx
STRIPE_ENTERPRISE_ANNUAL_PRICE_ID=price_xxx
```

### 3. Webhook en desarrollo local

```bash
# Instalar Stripe CLI
brew install stripe/stripe-cli/stripe

# Autenticarse
stripe login

# Escuchar eventos y reenviarlos al servidor local
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Al arrancar, la CLI muestra:

```
> Ready! Your webhook signing secret is whsec_xxxxxxxx
```

Copia ese `whsec_xxx` como `STRIPE_WEBHOOK_SECRET` en `.env.local`.

> El listener debe estar activo mientras pruebas el flujo de pagos.

### 4. Webhook en producción

1. Stripe Dashboard → **Developers** → **Webhooks** → **Add endpoint**
2. URL: `https://tu-dominio.com/api/webhooks/stripe`
3. Eventos a escuchar:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
   - `invoice.payment_succeeded`
4. Copia el **Signing secret** como `STRIPE_WEBHOOK_SECRET` en Vercel

### 5. Tarjetas de test

| Tarjeta               | Resultado          |
| --------------------- | ------------------ |
| `4242 4242 4242 4242` | Pago exitoso       |
| `4000 0000 0000 0002` | Pago rechazado     |
| `4000 0025 0000 3155` | Requiere 3D Secure |

Fecha: cualquiera futura. CVC: cualquiera.

### Modificar planes

Los planes se definen en `lib/plans.ts`. Para cambiar límites, precios o días de trial, edita las constantes `PLANS`. Stripe es la fuente de verdad para el estado de la suscripción.

---

## Configuración de emails y dominio propio

### Desarrollo

Por defecto los emails se envían desde `onboarding@resend.dev`. Funciona sin configuración adicional (solo necesitas `RESEND_API_KEY`).

### Dominio propio (producción)

1. En [resend.com](https://resend.com) → **Domains** → **Add Domain**
2. Añade los registros DNS que te indica Resend
3. En `lib/resend.ts`, cambia el campo `from`:

```ts
// Antes
from: 'onboarding@resend.dev'

// Después
from: 'hola@tudominio.com'
```

> No necesitas cambiar `RESEND_API_KEY` al cambiar de dominio.

---

## Personalización de UI y temas

### Colores y tema

Los colores se definen en `app/globals.css` usando el sistema OKLch de Tailwind v4:

```css
:root {
  --color-primary: oklch(...); /* color principal */
  --color-background: oklch(...);
  /* ... */
}

.dark {
  --color-primary: oklch(...); /* versión oscura */
}
```

### Dark mode

El toggle de tema está en el sidebar. Usa `next-themes` con `attribute="class"`. Las opciones son `light`, `dark` y `system`.

### Componentes shadcn/ui

Los componentes están en `components/ui/`. Son archivos copiados, no una dependencia npm. Para añadir nuevos:

```bash
npx shadcn add <componente>
```

> No edites manualmente los archivos de `components/ui/` — serán sobreescritos al actualizar.

### Fuentes

Se usa **Geist** (sans y mono) de Google Fonts, configurado en `app/layout.tsx`. Para cambiar la fuente, reemplaza la importación de `next/font/google`.

---

## Primer SUPERADMIN

El rol `SUPERADMIN` da acceso al panel de administración en `/admin`. Para asignarlo:

**Opción 1 — Prisma Studio:**

```bash
npx prisma studio
```

Abre `http://localhost:5555` → tabla `User` → edita el campo `systemRole` a `SUPERADMIN`.

**Opción 2 — SQL directo:**

```sql
UPDATE "User" SET "systemRole" = 'SUPERADMIN' WHERE email = 'tu@email.com';
```

> Los SUPERADMIN son redirigidos automáticamente a `/admin` al hacer login. No tienen acceso al dashboard de usuario normal.

---

## Deploy en Vercel

### 1. Conectar repositorio

1. [vercel.com](https://vercel.com) → **New Project** → importa el repo de GitHub
2. Vercel detecta Next.js automáticamente

### 2. Variables de entorno

Añade todas las variables del `.env.example` en **Settings** → **Environment Variables**. Cambia los valores de desarrollo por los de producción:

- `BETTER_AUTH_URL` → `https://tu-dominio.com`
- `NEXT_PUBLIC_APP_URL` → `https://tu-dominio.com`
- `STRIPE_WEBHOOK_SECRET` → el signing secret del webhook de producción (ver sección Stripe)
- `STRIPE_SECRET_KEY` → usar la clave `sk_live_xxx` (no la de test)

### 3. Webhook de Stripe para producción

Una vez desplegado, configura el webhook en Stripe Dashboard apuntando a `https://tu-dominio.com/api/webhooks/stripe` (ver sección Stripe).

### 4. Deploy

```bash
git push origin main
```

Vercel despliega automáticamente en cada push a `main`.

---

## Estructura del proyecto

```
app/
├── (auth)/           # login, register, verify-email, select-org, create-org
├── (marketing)/      # home pública
├── (protected)/      # dashboard, billing, settings — requiere sesión
│   └── dashboard/
│       ├── billing/
│       └── settings/
├── admin/            # panel SUPERADMIN
│   ├── organizations/
│   └── users/
└── api/
    ├── auth/[...all]/        # Better Auth handler
    └── webhooks/stripe/      # webhook handler

components/
├── shared/           # sidebar, org-switcher, theme-toggle, logout-button
└── ui/               # shadcn/ui

lib/
├── auth.ts           # Better Auth config (solo servidor)
├── auth-client.ts    # Better Auth client (solo cliente)
├── db.ts             # singleton Prisma
├── stripe.ts         # singleton Stripe
├── resend.ts         # funciones de email
└── plans.ts          # constantes de planes + hasAccess()

actions/              # Server Actions
├── auth.ts
├── billing.ts
└── admin.ts

emails/               # templates React Email
```

---

## Comandos útiles

```bash
npm run dev                                                    # desarrollo
npm run build                                                  # build producción
npx prisma migrate dev --name <nombre>                         # nueva migración
npx prisma studio                                              # explorador DB
stripe listen --forward-to localhost:3000/api/webhooks/stripe  # webhooks local
```
