# CarCare - AI Coding Instructions

## Project Overview

**CarCare** is a vehicle maintenance management system built with Next.js 14, TypeScript, Supabase, and Tailwind CSS. It follows a component-driven architecture with server-side rendering and client-side interactivity.

## Architecture Patterns

### Supabase Integration

- **Triple Client Pattern**: Use separate Supabase clients for different contexts:
  - `lib/supabase/client.ts` - Browser client (singleton pattern)
  - `lib/supabase/server.ts` - Server-side client with cookie handling
  - `lib/supabase/middleware.ts` - Middleware client for auth session management
- Auth flow uses middleware to redirect unauthenticated users to `/auth/login`
- Profile data is automatically created from auth metadata in `useAuth` hook

### Component Structure

- **shadcn/ui Components**: All UI components use the shadcn/ui pattern with `cva` for variant styling
- **Feature Components**: Organized by domain (`dashboard/`, `vehicles/`, `maintenance/`, `auth/`)
- **Dialog Pattern**: CRUD operations use dialog components (e.g., `add-vehicle-dialog.tsx`)
- **Server Components by Default**: Client components explicitly marked with `"use client"`

### Context Architecture (NEW)

- **Three-Layer Context System**: `SupabaseContext` → `AuthContext` → `DataContext`
- **AppProviders**: Wrap app in `contexts/AppProviders.tsx` for unified context access
- **Optimistic Updates**: Use `useData()` methods like `addVehicleOptimistic()` for immediate UI feedback
- **No Prop Drilling**: Access user/data state directly via `useAuth()` and `useData()` hooks

### Data Flow

- **Context-Based**: Primary data access through `useAuth()` and `useData()` contexts
- **Legacy Hooks**: Some components still use `useDashboardData`, `useAuth` hooks (being migrated)
- **Conditional Rendering**: Main page (`app/page.tsx`) renders `Dashboard` or `LandingPage` based on auth state
- **Loading States**: Consistent loading patterns with Lucide icons and skeleton states

## Development Workflows

### Database Schema

- Tables: `profiles`, `vehicles`, `maintenance_records` (see `scripts/001_create_tables.sql`)
- All entities are user-scoped with `user_id` foreign keys
- Profile creation handled automatically via trigger (`scripts/002_create_profile_trigger.sql`)

### Commands

Use `pnpm` for package management and scripts:

```bash
pnpm dev          # Start development server
pnpm build        # Production build
pnpm type-check   # TypeScript validation
pnpm format       # Prettier formatting
```

## Key Conventions

### File Organization

- **Route Groups**: Auth pages in `app/auth/` directory
- **Component Co-location**: Related components grouped by feature
- **Absolute Imports**: Use `@/` prefix for all internal imports
- **TypeScript**: Interface definitions inline with components, shared types extracted when reused

### UI Patterns

- **Tailwind Classes**: Use design system tokens, responsive modifiers, dark mode variants
- **Icon Library**: Lucide React for consistent iconography
- **Form Handling**: React Hook Form with Zod validation (following existing patterns)
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints

### Authentication

- **Protected Routes**: Middleware handles automatic redirects
- **AuthContext**: Access via `useAuth()` from `contexts/AuthContext` for user, profile, and auth state
- **Session Management**: Automatic session refresh in middleware
- **Supabase Client**: Use `useSupabase()` from `contexts/SupabaseContext` instead of direct imports

### Database Queries

- **Row Level Security**: All tables use RLS policies (user-scoped access)
- **Real-time**: Supabase real-time subscriptions for live data updates
- **Error Handling**: Graceful degradation with user-friendly error messages

## Common Patterns

### Component Creation

```tsx
"use client" // Only when needed for interactivity

import { useAuth, useData, useSupabase } from "@/contexts"

interface ComponentProps {
  // Props interface above component
}

export function Component({ prop }: ComponentProps) {
  const { user, profile } = useAuth()
  const { vehicles, addVehicleOptimistic } = useData()
  const supabase = useSupabase()

  // Event handlers
  // Render logic with early returns for loading/error states
}
```

### Dialog Components

Follow the updated pattern with context integration:

- Use `useData()` optimistic update methods
- Access user data via `useAuth()` context
- Supabase client via `useSupabase()` context
- Immediate UI feedback with automatic rollback on errors

### Data Access Patterns

- **Auth State**: `const { user, profile, isLoading } = useAuth()`
- **App Data**: `const { vehicles, maintenanceRecords, refreshAll } = useData()`
- **Database**: `const supabase = useSupabase()` for custom queries
- **Optimistic Updates**: Use context methods like `addVehicleOptimistic()` for better UX

When working on this codebase, prioritize consistency with existing patterns, maintain TypeScript strict mode compliance, and ensure responsive design across all components.

Don't create any documents when you do code changes
