# AGENTS.md - Keepel (CarCare)

**Complete automotive maintenance management system**

This document provides full context for AI agents working on this project.

---

## Project Overview

### Identity

- **Project Name**: Keepel (formerly CarCare)
- **Purpose**: Web application to manage vehicle maintenance
- **Stack**: Next.js 16, React 19, TypeScript, Supabase, TailwindCSS v4
- **Type**: Progressive Web App (PWA)
- **License**: MIT
- **Repository**: https://github.com/devchemical/CarCare
- **Demo**: https://keepel.chemicaldev.com

### Description

Keepel lets users:

- Register and manage multiple vehicles
- Track complete maintenance history
- Schedule future services
- Monitor maintenance costs
- View statistics and reports
- Access from any device (responsive PWA with offline support)

---

## Tech Stack

### Frontend

```json
{
  "framework": "Next.js 16.1.1 (App Router)",
  "ui_library": "React 19.2.3",
  "language": "TypeScript 5",
  "styling": "TailwindCSS 4.1.9 (CSS-based config, no tailwind.config.js)",
  "components": "shadcn/ui (Radix UI primitives)",
  "icons": "lucide-react ^0.454.0",
  "forms": "react-hook-form ^7.60.0 + zod 3.25.67",
  "charts": "recharts 2.15.4",
  "fonts": "next/font/google (Inter, JetBrains Mono)",
  "toasts": "sonner ^1.7.4",
  "themes": "next-themes ^0.4.6",
  "dates": "date-fns 4.1.0"
}
```

### Backend & Database

```json
{
  "backend": "Supabase (BaaS)",
  "database": "PostgreSQL (via Supabase)",
  "auth": "Supabase Auth (JWT + OAuth Google)",
  "storage": "Supabase Storage",
  "security": "Row Level Security (RLS)",
  "rate_limiting": "@upstash/ratelimit + @upstash/redis",
  "analytics": "@vercel/analytics 1.3.1"
}
```

### PWA

```json
{
  "pwa_library": "@ducanh2912/next-pwa ^10.2.9",
  "service_worker": "Workbox (auto-generated to public/)",
  "manifest": "public/manifest.json",
  "offline": "NetworkFirst for Supabase API, CacheFirst for assets",
  "disabled_in_dev": true
}
```

### Tools & Build

```json
{
  "package_manager": "pnpm 9.0.0",
  "bundler": "Turbopack (Next.js built-in)",
  "linting": "ESLint (eslint-config-next)",
  "formatting": "Prettier + prettier-plugin-tailwindcss",
  "runtime": "Node.js 18+"
}
```

---

## Directory Structure

```
CarCare/
├── app/                              # Next.js App Router
│   ├── api/
│   │   └── auth/
│   │       └── signout/
│   │           └── route.ts          # Server-side logout (clears HTTP-only cookies)
│   ├── auth/
│   │   ├── actions.ts                # Server Actions: loginAction, signupAction (with rate limiting)
│   │   ├── callback/
│   │   │   └── route.ts              # OAuth + email verification callback
│   │   ├── error/
│   │   │   └── page.tsx              # Auth error page
│   │   ├── login/
│   │   │   └── page.tsx              # Login page
│   │   ├── signup/
│   │   │   └── page.tsx              # Signup page
│   │   └── signup-success/
│   │       └── page.tsx              # Email confirmation sent
│   ├── vehicles/
│   │   ├── page.tsx                  # Vehicle list (protected)
│   │   └── [id]/
│   │       └── maintenance/
│   │           └── page.tsx          # Maintenance records per vehicle (protected)
│   ├── globals.css                   # Global styles + Tailwind v4 theme config (@theme inline)
│   ├── layout.tsx                    # Root layout (fonts, metadata, PWA meta tags, AppProviders)
│   └── page.tsx                      # Landing page / root (also serves as dashboard when authenticated)
│
├── components/
│   ├── auth/
│   │   └── google-signin-button.tsx  # Google OAuth sign-in button
│   ├── dashboard/
│   │   ├── Dashboard.tsx             # Main dashboard component (renders for authenticated users)
│   │   ├── dashboard-stats.tsx
│   │   ├── recent-activity.tsx
│   │   ├── upcoming-maintenance.tsx
│   │   └── vehicle-overview.tsx
│   ├── home/
│   │   └── LandingPage.tsx           # Landing page for unauthenticated users
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Layout.tsx
│   ├── maintenance/
│   │   ├── add-maintenance-dialog.tsx
│   │   ├── edit-maintenance-dialog.tsx
│   │   ├── delete-maintenance-dialog.tsx
│   │   └── maintenance-list.tsx
│   ├── pwa/
│   │   ├── index.ts
│   │   ├── notification-manager.tsx  # Push notification management
│   │   ├── offline-indicator.tsx     # Offline status indicator
│   │   └── pwa-debug.tsx             # PWA debug utilities
│   ├── ui/                           # shadcn/ui components
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── context-error-boundary.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── icons.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── loading-screen.tsx
│   │   ├── responsive-dialog.tsx
│   │   ├── select.tsx
│   │   ├── sheet.tsx
│   │   └── textarea.tsx
│   ├── vehicles/
│   │   ├── add-vehicle-dialog.tsx
│   │   ├── add-vehicle-dialog-context.tsx
│   │   ├── edit-vehicle-dialog.tsx
│   │   ├── delete-vehicle-dialog.tsx
│   │   └── vehicles-list.tsx
│   └── theme-provider.tsx            # Dark/light mode provider
│
├── contexts/                         # React Contexts (all Client Components)
│   ├── AppProviders.tsx              # Root provider tree: SupabaseProvider > AuthProvider > DataProvider
│   ├── AuthContext.tsx               # Auth state (user, profile, signOut, refreshProfile)
│   ├── DataContext.tsx               # App data (vehicles, maintenance, optimistic updates)
│   ├── SupabaseContext.tsx           # Supabase client singleton via context
│   └── index.ts                      # Re-exports all contexts
│
├── hooks/                            # Custom React Hooks
│   ├── index.ts                      # Re-exports all hooks
│   ├── use-media-query.ts            # Responsive media query hook
│   ├── useAuth.ts                    # Standalone auth hook (used outside AuthContext tree)
│   ├── useDashboardData.tsx          # Dashboard-specific data aggregation
│   ├── useGuestRoute.ts              # Redirect authenticated users away from guest-only pages
│   ├── useProtectedRoute.ts          # Redirect unauthenticated users to login
│   ├── usePWA.ts                     # PWA install prompt and status
│   └── useSupabase.ts                # Access Supabase client from SupabaseContext
│
├── lib/
│   ├── auth/
│   │   └── authManager.ts            # AuthManager singleton (event-driven, BroadcastChannel)
│   ├── supabase/
│   │   ├── client.ts                 # Browser Supabase client (singleton, cookie-based)
│   │   ├── server.ts                 # Server Component Supabase client (async cookies())
│   │   └── middleware.ts             # Middleware Supabase client + route protection logic
│   ├── utils/
│   │   └── pwa.ts                    # PWA utility functions
│   ├── formatters.ts                 # Date/currency/text formatters
│   ├── ratelimit.ts                  # Upstash rate limiters (login: 5/min, signup: 3/hour)
│   └── utils.ts                      # General utilities (cn, etc.)
│
├── scripts/                          # SQL migration scripts
│   ├── 001_create_tables.sql         # profiles, vehicles, maintenance_records tables
│   └── 002_create_profile_trigger.sql # Auto-create profile on user signup
│
├── styles/
│   ├── pwa.css                       # PWA-specific styles (install banners, offline states)
│   └── responsive.css                # Additional responsive utilities
│
├── public/
│   ├── manifest.json                 # PWA manifest
│   ├── sw.js                         # Service worker (generated by next-pwa)
│   ├── icons/                        # App icons (various sizes)
│   ├── screenshots/                  # PWA install screenshots
│   ├── splash/                       # iOS splash screen images
│   └── robots.txt
│
├── middleware.ts                     # Next.js middleware (delegates to lib/supabase/middleware.ts)
├── next.config.mjs                   # Next.js config + PWA wrapper
├── postcss.config.mjs                # PostCSS config (@tailwindcss/postcss)
├── tsconfig.json
├── components.json                   # shadcn/ui config
├── .prettierrc
├── package.json
└── pnpm-lock.yaml
```

---

## Database Schema

### Tables

#### `profiles`

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `vehicles`

```sql
CREATE TABLE vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  license_plate TEXT,
  vin TEXT,
  color TEXT,
  mileage INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `maintenance_records`

```sql
CREATE TABLE maintenance_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  cost DECIMAL(10,2),
  mileage INTEGER,
  service_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Relationships

```
auth.users (Supabase Auth)
    ↓ (1:1, trigger auto-creates on signup)
profiles
    ↓ (1:N)
vehicles
    ↓ (1:N)
maintenance_records
```

### Key Trigger

`handle_new_user()` — automatically creates a `profiles` row when a user registers via Supabase Auth.

### RLS Policies

All tables have RLS enabled. Every policy validates `auth.uid()`:

- `profiles`: users can only read/update their own row
- `vehicles`: users can only CRUD their own vehicles (`user_id = auth.uid()`)
- `maintenance_records`: users can only CRUD records for their own vehicles

---

## Authentication System

### Architecture

The auth system is event-driven with three layers:

1. **`AuthManager`** (`lib/auth/authManager.ts`)
   - Singleton instantiated at module level: `export const authManager = AuthManager.getInstance()`
   - Manages a single Supabase browser client
   - Subscribes to `onAuthStateChange` events
   - Broadcasts state changes to other tabs via `BroadcastChannel("auth-state")`
   - Provides `subscribe(listener)` for React contexts to react to auth events
   - Clears all Supabase cookies/localStorage on sign-out

2. **`AuthProvider`** (`contexts/AuthContext.tsx`)
   - Wraps the app and subscribes to `authManager`
   - Exposes: `user`, `profile`, `isLoading`, `isLoggingOut`, `isAuthenticated`, `signOut()`, `refreshProfile()`
   - Also loads the user's `profiles` row from Supabase DB

3. **`DataProvider`** (`contexts/DataContext.tsx`)
   - Sits inside `AuthProvider` in the tree
   - Loads and caches vehicles + maintenance records when user is authenticated
   - Implements **optimistic updates** for all CRUD operations

4. **Middleware** (`middleware.ts` → `lib/supabase/middleware.ts`)
   - Refreshes session tokens on every request
   - Redirects unauthenticated users trying to access protected routes to `/auth/login`
   - Redirects authenticated users trying to access auth pages to `/`

### Provider Tree

```
// app/layout.tsx
<AppProviders>           // contexts/AppProviders.tsx
  <SupabaseProvider>     // provides Supabase client via context
    <AuthProvider>       // manages auth state
      <DataProvider>     // manages vehicles + maintenance data
        {children}
      </DataProvider>
    </AuthProvider>
  </SupabaseProvider>
</AppProviders>
```

### Auth Flows

#### Sign Up

```
User → /auth/signup
  ↓ signupAction() Server Action (app/auth/actions.ts)
  ↓ Rate limit check (Upstash: 3 signups/hour per IP + email)
  ↓ supabase.auth.signUp()
  ↓ Trigger: handle_new_user() → creates profiles row
  ↓ Confirmation email sent
  → /auth/signup-success
```

#### Login (email/password)

```
User → /auth/login
  ↓ loginAction() Server Action (app/auth/actions.ts)
  ↓ Rate limit check (Upstash: 5 attempts/min per IP + email)
  ↓ supabase.auth.signInWithPassword()
  ↓ Session cookies set
  ↓ authManager: onAuthStateChange SIGNED_IN
  ↓ AuthContext updates state
  ↓ BroadcastChannel notifies other tabs
  → Redirect to /
```

#### Login (Google OAuth)

```
User → clicks Google Sign-In button
  ↓ authManager.signInWithOAuth('google')
  ↓ Redirect to Google
  ↓ /auth/callback route handler
  ↓ Session established
  → Redirect to /
```

#### Sign Out

```
User triggers signOut()
  ↓ AuthContext.signOut()
  ↓ POST /api/auth/signout (clears server-side HTTP-only cookies)
  ↓ supabase.auth.signOut()
  ↓ authManager.clearLocalState() (clears localStorage, sessionStorage, cookies)
  → window.location.href = "/"
```

#### Token Refresh (automatic)

```
Token near expiry
  ↓ Supabase auto-refresh
  ↓ onAuthStateChange: TOKEN_REFRESHED
  ↓ authManager updates state
  ↓ BroadcastChannel notifies other tabs
  → Session continues uninterrupted
```

### Route Protection

| Route | Protection |
|---|---|
| `/` | Public (shows `LandingPage` if unauthenticated, `Dashboard` if authenticated) |
| `/auth/*` | Guest-only via `useGuestRoute()` + middleware redirects authenticated users to `/` |
| `/vehicles/*` | Protected via `useProtectedRoute()` + middleware redirects unauthenticated to `/auth/login` |

### Environment Variables

```bash
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Upstash Redis for rate limiting (required in production)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Email redirect after signup confirmation
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/
NEXT_PUBLIC_SUPABASE_REDIRECT_URL=https://keepel.chemicaldev.com/
```

---

## PWA Configuration

The app is a full PWA using `@ducanh2912/next-pwa` (Workbox-based).

**Service worker is disabled in development** (`disable: process.env.NODE_ENV === 'development'`).

### Caching Strategy

| Resource | Strategy | TTL |
|---|---|---|
| Supabase API (`*.supabase.co/*`) | NetworkFirst | 24h |
| Google Fonts stylesheets | StaleWhileRevalidate | — |
| Google Fonts webfonts | CacheFirst | 365d |
| Images (png/jpg/svg/gif/webp) | CacheFirst | 7d |

### PWA Files

- `public/manifest.json` — web app manifest
- `public/sw.js` — service worker (auto-generated, do not edit)
- `public/icons/` — icon set (various sizes)
- `public/splash/` — iOS launch screens
- `components/pwa/` — PWA UI components (install prompt, offline indicator)
- `lib/utils/pwa.ts` — utility functions
- `styles/pwa.css` — PWA-specific styles

---

## Design System

### Themes

- **Light Mode** / **Dark Mode** / **System** — managed by `next-themes`
- Theme toggle is available in the UI header

### Tailwind v4 Configuration

Tailwind v4 does **not** use a `tailwind.config.js` file. Configuration lives in:

- `postcss.config.mjs` — uses `@tailwindcss/postcss` plugin
- `app/globals.css` — uses `@import "tailwindcss"` + `@theme inline { ... }` block with CSS custom properties for all design tokens (colors, radii, shadows, fonts)

### Fonts

```typescript
// app/layout.tsx
import { Inter, JetBrains_Mono } from "next/font/google"
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] })
const jetbrainsMono = JetBrains_Mono({ variable: "--font-jetbrains-mono", subsets: ["latin"] })
```

### Toasts

The project uses **`sonner`**, not `@/components/ui/use-toast`.

```typescript
import { toast } from "sonner"

toast.success("Vehicle added successfully")
toast.error("Failed to save changes")
toast("Neutral message")
```

### shadcn/ui Components

Components live in `components/ui/`. See `components.json` for the shadcn/ui configuration.
Actual components available: `badge`, `button`, `card`, `dialog`, `dropdown-menu`, `input`, `label`, `select`, `sheet`, `textarea`, `responsive-dialog`, `loading-screen`.

---

## Code Patterns

### React Contexts — How to Use

Always import from `@/contexts` (uses `index.ts` re-exports):

```typescript
import { useAuth } from "@/contexts"           // auth state
import { useData } from "@/contexts"            // vehicles + maintenance data
import { useSupabase } from "@/contexts"        // raw Supabase client
```

**Do not import directly from context files** — use the barrel export.

### `useAuth()` — Auth State

```typescript
'use client'
import { useAuth } from "@/contexts"

export function MyComponent() {
  const { user, profile, isLoading, isAuthenticated, signOut, refreshProfile } = useAuth()

  if (isLoading) return <LoadingScreen />
  if (!isAuthenticated) return null

  return <div>Hello, {profile?.full_name ?? user?.email}</div>
}
```

### `useData()` — Vehicles & Maintenance

```typescript
'use client'
import { useData } from "@/contexts"

export function VehiclesList() {
  const {
    vehicles,
    maintenanceRecords,
    isLoading,
    addVehicleOptimistic,
    updateVehicleOptimistic,
    deleteVehicleOptimistic,
    refreshVehicles,
  } = useData()

  // All mutations are optimistic — they update local state immediately
  // and roll back on error
  const handleAdd = async (data) => {
    try {
      await addVehicleOptimistic(data)
      toast.success("Vehicle added")
    } catch {
      toast.error("Failed to add vehicle")
    }
  }
}
```

### Route Protection Hooks

```typescript
// Protected page (requires authentication)
'use client'
import { useProtectedRoute } from "@/hooks"

export function VehiclesPage() {
  const { isLoading } = useProtectedRoute() // auto-redirects to /auth/login if not authenticated

  if (isLoading) return <LoadingScreen />
  return <VehiclesList />
}

// Guest-only page (no access if authenticated)
'use client'
import { useGuestRoute } from "@/hooks"

export function LoginPage() {
  const { isLoading } = useGuestRoute() // auto-redirects to / if already authenticated

  if (isLoading) return <LoadingScreen />
  return <LoginForm />
}
```

### Server Components vs Client Components

**Server Component** (default in Next.js — no directive needed):

```typescript
// app/vehicles/page.tsx
import { createClient } from "@/lib/supabase/server"

export default async function VehiclesPage() {
  // Next.js 16: cookies() is async — always await
  const supabase = await createClient()

  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("*")
    .order("created_at", { ascending: false })

  return <VehiclesList initialVehicles={vehicles} />
}
```

**Client Component** (add `'use client'` when using hooks, state, or browser APIs):

```typescript
'use client'
import { useState } from "react"
import { useAuth } from "@/contexts"
import { useData } from "@/contexts"

export function AddVehicleDialog() {
  const [open, setOpen] = useState(false)
  const { user } = useAuth()
  const { addVehicleOptimistic } = useData()
  // ...
}
```

### Server Actions

Auth operations use Server Actions in `app/auth/actions.ts`:

```typescript
// IMPORTANT: Server Actions validate rate limits — do not call them in loops
import { loginAction, signupAction } from "@/app/auth/actions"

// Always check result.success
const result = await loginAction(email, password)
if (!result.success) {
  toast.error(result.error)
  // result.rateLimit contains remaining/limit/reset info
}
```

When writing new Server Actions, always authenticate inside the action:

```typescript
'use server'
import { createClient } from "@/lib/supabase/server"

export async function myAction(data: unknown) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  // ... perform mutation
}
```

### Forms (react-hook-form + zod)

```typescript
'use client'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"

const vehicleSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  mileage: z.number().int().min(0).optional(),
})

type VehicleFormData = z.infer<typeof vehicleSchema>

export function VehicleForm() {
  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: { make: "", model: "", year: new Date().getFullYear(), mileage: 0 },
  })

  const onSubmit = async (data: VehicleFormData) => {
    try {
      await addVehicleOptimistic(data)
      toast.success("Vehicle saved")
      form.reset()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save")
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* fields */}
    </form>
  )
}
```

### Import Organization

```typescript
// 1. React and Next.js
import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"

// 2. External libraries
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

// 3. Internal — contexts and hooks
import { useAuth, useData } from "@/contexts"
import { useProtectedRoute } from "@/hooks"

// 4. Internal — UI components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// 5. Internal — lib utilities
import { createClient } from "@/lib/supabase/server"

// 6. Types
import type { Vehicle } from "@/contexts/DataContext"
```

---

## Rate Limiting

`lib/ratelimit.ts` exports two Upstash rate limiters used in `app/auth/actions.ts`:

| Limiter | Limit | Window | Key |
|---|---|---|---|
| `loginRateLimiter` | 5 attempts | 60 seconds | per email + per IP |
| `signupRateLimiter` | 3 attempts | 1 hour | per email + per IP |

Requires `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in env. The module **throws at import time** if these variables are missing.

---

## Key Commands

```bash
pnpm dev              # Development server (PWA disabled)
pnpm build            # Production build
pnpm start            # Start production build
pnpm lint             # ESLint
pnpm type-check       # TypeScript check without emitting
pnpm format           # Prettier format
pnpm format:check     # Check formatting without writing
pnpm clean            # Remove .next cache
pnpm clean:install    # Clean + reinstall dependencies
```

---

## Naming Conventions

### Files & Folders

- **Component files**: `kebab-case.tsx` (e.g., `add-vehicle-dialog.tsx`)
  - Exception: context files and some component files use `PascalCase.tsx` (e.g., `AuthContext.tsx`, `Dashboard.tsx`) — match the existing style in the same directory
- **Pages**: `page.tsx` (Next.js App Router convention)
- **Hooks**: `use-kebab-case.ts` or `useCamelCase.ts` — match existing style in `hooks/`
- **Folders**: `kebab-case`

### Code

- **Components**: `PascalCase` (e.g., `VehicleForm`)
- **Functions**: `camelCase` (e.g., `handleSubmit`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_VEHICLES`)
- **Variables**: `camelCase`
- **Interfaces/Types**: `PascalCase` (e.g., `VehicleFormProps`)
- Use `type` for component props and simple shapes; `interface` for complex objects or when extension is expected

---

## Debugging & Troubleshooting

### Common Issues

#### 1. Hydration Error

**Cause**: Server/client HTML mismatch.
`app/layout.tsx` uses `suppressHydrationWarning={true}` on `<body>` for this reason.

```typescript
// Move browser-only code into useEffect
useEffect(() => {
  // browser-only logic
}, [])
```

See the `next-best-practices` skill (`hydration-error.md`) for detailed fixes.

#### 2. `useAuth must be used within an AuthProvider`

**Cause**: Component is rendered outside `AppProviders`.
**Fix**: Ensure the component tree includes `AppProviders` from `app/layout.tsx`.

#### 3. Wrong Supabase client in Server Component

```typescript
// Server Component → use server client
import { createClient } from "@/lib/supabase/server"
const supabase = await createClient()  // ← always await in Next.js 16

// Client Component → use context
import { useSupabase } from "@/contexts"
const supabase = useSupabase()
```

#### 4. Rate limit errors on login/signup

Check `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in your environment. If variables are missing, `lib/ratelimit.ts` throws at module load time and the app will not start.

#### 5. Service worker stale in production

PWA is disabled in development. In production, after deploying, instruct users to refresh or clear cache. The service worker versioning is handled automatically by Workbox.

### Useful Debug Logs

```typescript
// Check auth state
import { authManager } from "@/lib/auth/authManager"
console.log("Auth:", {
  user: authManager.getUser()?.email,
  isAuthenticated: authManager.isAuthenticated(),
  session: authManager.getSession()?.expires_at,
})

// Check Supabase query
const { data, error } = await supabase.from("vehicles").select("*")
if (error) console.error("Query error:", error)
```

---

## Security

### Policies

1. **Never commit**: `.env.local`, API keys, real user data
2. **RLS**: Always enable RLS on new tables; all policies must validate `auth.uid()`
3. **Server Actions**: Always authenticate inside each action — do not rely only on middleware
4. **Rate limiting**: Auth actions (login/signup) use Upstash sliding window rate limiters
5. **Input validation**: Zod in client forms + RLS + DB constraints on server

### Vulnerability Reports

Do not open a public issue. Email: security@keepel.dev

---

## AI Agent Skills

This project has skills installed that agents should load when working on relevant tasks.

> Skills are located at: `.agents\skills\`

### `next-best-practices`

**Load when**: writing or reviewing any Next.js-specific code — pages, layouts, Route Handlers, Server Actions, metadata, fonts, images, RSC boundaries.

**Key areas covered**:
- File conventions and special files (`page.tsx`, `layout.tsx`, `error.tsx`, `loading.tsx`)
- RSC boundaries — detecting invalid async Client Components, non-serializable props
- Next.js 16 async APIs: `params`, `searchParams`, `cookies()`, `headers()` must all be awaited
- Error handling with `error.tsx`, `not-found.tsx`, `unauthorized()`, `forbidden()`
- Data patterns: Server Components vs Server Actions vs Route Handlers
- Image optimization with `next/image`
- Font optimization with `next/font`
- Avoiding data waterfalls (`Promise.all`, Suspense, preload pattern)
- Hydration error fixes
- Bundling and barrel import optimization

**Example triggers**:
- Adding a new page or layout
- Implementing a new Server Action
- Fetching data in a Server Component
- Reviewing RSC/Client Component boundaries

### `vercel-react-best-practices`

**Load when**: writing, reviewing, or refactoring React components — especially for performance, data fetching patterns, bundle size, or re-render issues.

**57 rules across 8 priority categories**:

| Priority | Category | Example rules |
|---|---|---|
| CRITICAL | Eliminating Waterfalls | `Promise.all` for independent fetches, strategic `Suspense` boundaries |
| CRITICAL | Bundle Size | Avoid barrel imports from `lucide-react`, use `next/dynamic` for heavy components |
| HIGH | Server-Side Performance | Authenticate Server Actions, `React.cache()` for deduplication, minimize RSC props |
| MEDIUM-HIGH | Client Data Fetching | Passive event listeners, `localStorage` versioning |
| MEDIUM | Re-render Optimization | `memo`, `useCallback`, functional `setState`, lazy state init |
| MEDIUM | Rendering Performance | Conditional rendering (`ternary` not `&&`), `useTransition` for loading states |
| LOW-MEDIUM | JavaScript Performance | `Set`/`Map` for O(1) lookups, early returns, hoisted RegExp |
| LOW | Advanced Patterns | `useRef` for transient values, event handler refs |

**Example triggers**:
- Adding a new React component
- Implementing data fetching in a Client Component
- Optimizing a slow page or component
- Reviewing imports and bundle size
- Refactoring effects or state management

### `supabase-postgres-best-practices`

**Load when**: writing, reviewing, or optimizing any SQL, database schema, RLS policies, indexes, or Supabase/Postgres configuration.

**Rules across 8 priority categories**:

| Priority | Category | Impact | Examples |
|---|---|---|---|
| CRITICAL | Query Performance | Indexes, query plans, covering indexes, partial indexes | `query-missing-indexes`, `query-composite-indexes` |
| CRITICAL | Connection Management | Pooling, idle timeouts, connection limits, prepared statements | `conn-pooling`, `conn-limits` |
| CRITICAL | Security & RLS | RLS basics, policy performance, privilege management | `security-rls-basics`, `security-rls-performance` |
| HIGH | Schema Design | Data types, primary keys, foreign key indexes, constraints | `schema-data-types`, `schema-foreign-key-indexes` |
| MEDIUM-HIGH | Concurrency & Locking | Deadlock prevention, advisory locks, short transactions | `lock-deadlock-prevention`, `lock-skip-locked` |
| MEDIUM | Data Access Patterns | N+1 queries, pagination, batch inserts, upserts | `data-n-plus-one`, `data-pagination` |
| LOW-MEDIUM | Monitoring & Diagnostics | EXPLAIN ANALYZE, pg_stat_statements, VACUUM/ANALYZE | `monitor-explain-analyze`, `monitor-vacuum-analyze` |
| LOW | Advanced Features | JSONB indexing, full-text search | `advanced-jsonb-indexing`, `advanced-full-text-search` |

**Example triggers**:
- Writing or modifying SQL migration scripts (`scripts/`)
- Adding new tables or columns to the schema
- Designing or reviewing RLS policies
- Optimizing Supabase queries in Server Components or Server Actions
- Configuring connection pooling or scaling

### `web-design-guidelines`

**Load when**: reviewing UI code, checking accessibility, auditing design, reviewing UX, or checking the site against best practices.

**Key areas covered**:
- Real-time fetching of Vercel's Web Interface Guidelines
- UI/UX compliance and accessibility auditing
- Design structure and layout best practices
- Standardized `file:line` reporting for quick action

**Example triggers**:
- "Review my UI"
- "Check accessibility"
- "Audit design"
- "Review UX"
- "Check my site against best practices"

---

## Roadmap

### v1.1 (In Development)

- [ ] Full REST API for integrations
- [ ] Push notifications for maintenance reminders
- [ ] Advanced reports with improved charts
- [ ] Internationalization (i18n) Spanish/English
- [ ] Advanced search with multiple filters

### v1.2 (Planned)

- [ ] Native mobile app (React Native)
- [ ] OCR for automatic invoice scanning
- [ ] Integration with repair shops
- [ ] Budget management
- [ ] Cost comparison between vehicles

### v2.0 (Future)

- [ ] AI-based maintenance prediction
- [ ] Advanced performance analytics
- [ ] Manufacturer API integrations
- [ ] Services marketplace
- [ ] Recommendation engine

---

## Quick Reference

### Key Files

| File | Purpose |
|---|---|
| `middleware.ts` | Delegates session refresh + route protection |
| `lib/supabase/middleware.ts` | Route protection logic |
| `lib/auth/authManager.ts` | Auth singleton (event-driven, BroadcastChannel) |
| `lib/supabase/client.ts` | Browser Supabase client |
| `lib/supabase/server.ts` | Server Component Supabase client |
| `lib/ratelimit.ts` | Upstash rate limiters |
| `contexts/AppProviders.tsx` | Root provider tree |
| `contexts/AuthContext.tsx` | Auth state and `useAuth()` |
| `contexts/DataContext.tsx` | App data and optimistic updates |
| `app/auth/actions.ts` | Login and signup Server Actions |
| `app/api/auth/signout/route.ts` | Server-side logout endpoint |
| `app/globals.css` | Global styles + Tailwind v4 theme |
| `next.config.mjs` | Next.js + PWA configuration |

### Hooks Reference

| Hook | Import | Usage |
|---|---|---|
| `useAuth()` | `@/contexts` | Auth state (user, profile, signOut) |
| `useData()` | `@/contexts` | Vehicles + maintenance + optimistic mutations |
| `useSupabase()` | `@/contexts` | Raw Supabase client |
| `useProtectedRoute()` | `@/hooks` | Redirect to login if unauthenticated |
| `useGuestRoute()` | `@/hooks` | Redirect to `/` if authenticated |
| `useDashboardData()` | `@/hooks` | Aggregated dashboard statistics |
| `usePWA()` | `@/hooks` | PWA install prompt and status |
| `use-media-query` | `@/hooks` | Responsive breakpoint detection |

### Contexts Reference

| Context/Provider | File | Exposes |
|---|---|---|
| `AuthProvider` + `useAuth()` | `contexts/AuthContext.tsx` | `user`, `profile`, `isLoading`, `isAuthenticated`, `signOut`, `refreshProfile` |
| `DataProvider` + `useData()` | `contexts/DataContext.tsx` | `vehicles`, `maintenanceRecords`, loading states, optimistic CRUD methods |
| `SupabaseProvider` + `useSupabase()` | `contexts/SupabaseContext.tsx` | Supabase browser client |

---

**Last updated**: February 2026
**Document version**: 2.1.0
**Maintained by**: DevChemical
