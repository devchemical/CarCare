# Keepel - AI Coding Instructions

A Next.js 14 vehicle maintenance management system with TypeScript, Supabase, and Tailwind CSS.

**Keepel** is a vehicle maintenance management system built with Next.js 14, TypeScript, Supabase, and Tailwind CSS. It follows a component-driven architecture with server-side rendering and client-side interactivity.

## Critical Architecture: Three-Layer Context System

**Must understand before coding:** The app uses a hierarchical context chain that eliminates prop drilling:

```tsx
<SupabaseContext>        // Singleton Supabase client
  <AuthContext>          // User auth + profile
    <DataContext>        // Vehicles + maintenance records
```

All wrapped in `contexts/AppProviders.tsx`. **Never import Supabase clients directly** - always use contexts.

### Context Usage Pattern

```tsx
"use client"
import { useAuth, useData, useSupabase } from "@/contexts"

const { user, profile, isLoading } = useAuth() // Auth state
const { vehicles, addVehicleOptimistic } = useData() // App data + optimistic updates
const supabase = useSupabase() // Database client
```

## Supabase Triple-Client Pattern

Three separate client instances for different execution contexts:

1. **Browser** (`lib/supabase/client.ts`): Singleton with manual cookie handling via `document.cookie`
2. **Server** (`lib/supabase/server.ts`): Per-request client using Next.js `cookies()` helper
3. **Middleware** (`lib/supabase/middleware.ts`): Session refresh + auth redirects to `/auth/login`

**Access via contexts only** - don't import these files directly in components.

## Database & Security

- **Schema**: `profiles`, `vehicles`, `maintenance_records` (see `scripts/001_create_tables.sql`)
- **RLS**: All tables user-scoped with `auth.uid() = user_id` policies
- **Auto-Profile**: Created via trigger from `auth.users` metadata
- **User Relations**: All entities linked to `user_id` with CASCADE deletes

## CRUD Pattern with Dual Refresh

**Critical:** All mutations require TWO refresh calls for full UI update:

```tsx
import { useRouter } from "next/navigation"
const router = useRouter()
const { addVehicleOptimistic } = useData()

// After mutation:
await addVehicleOptimistic(data) // Updates context state
router.refresh() // Refreshes server components
```

Same for `updateVehicleOptimistic()`, `deleteVehicleOptimistic()`, and maintenance methods.

## Component Patterns

### Dialog Components (CRUD)

See `components/vehicles/add-vehicle-dialog-context.tsx` for reference:

- **Multi-Service**: Maintenance dialogs support dynamic service arrays (add/remove items)
- **Loading States**: Use `isLoading` state + `Loader2` icon from Lucide
- **Error Handling**: Display errors inline with user-friendly messages
- **Form Reset**: Clear state + close dialog on success

### Conditional Rendering

Main page (`app/page.tsx`) pattern:

```tsx
if (authLoading) return <LoadingScreen />
return user ? <Dashboard /> : <LandingPage />
```

## Development Commands

```bash
pnpm dev          # Development server (port 3000)
pnpm build        # Production build
pnpm type-check   # TypeScript validation
pnpm format       # Prettier format
```

**Package manager:** `pnpm` only (enforced in `package.json`)

## Key Conventions

- **Imports**: Use `@/` prefix for absolute imports
- **Client Components**: Explicit `"use client"` directive (Server Components default)
- **UI Library**: shadcn/ui with Radix primitives + `cva` variants
- **Icons**: Lucide React only
- **Forms**: React Hook Form + Zod validation (see maintenance dialogs)
- **Styling**: Tailwind with mobile-first responsive design

## Files to Reference

- Context implementation: `contexts/AppProviders.tsx`, `contexts/DataContext.tsx`
- CRUD example: `components/maintenance/add-maintenance-dialog.tsx` (multi-service pattern)
- Auth flow: `middleware.ts` → `lib/supabase/middleware.ts`
- Database schema: `scripts/001_create_tables.sql`

**Don't create summary documents after code changes**
