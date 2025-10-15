# Context Architecture Implementation Plan

## Overview

This implementation introduces a three-layer context architecture for Keepel:

1. **SupabaseContext** - Provides consistent Supabase client access
2. **AuthContext** - Manages authentication state and user profile
3. **DataContext** - Handles application data with optimistic updates

## Benefits

### 1. **Eliminates Prop Drilling**

- User/profile data available anywhere via `useAuth()`
- Vehicle/maintenance data available via `useData()`
- No need to pass data through multiple component layers

### 2. **Consistent Supabase Client Usage**

- Single client instance across the app
- Eliminates direct `createClient()` imports in components
- Centralized client configuration

### 3. **Optimistic Updates**

- Immediate UI feedback for better UX
- Automatic rollback on errors
- Reduced perceived latency

### 4. **Better Separation of Concerns**

- Auth logic isolated from data logic
- Clear boundaries between contexts
- Easier testing and maintenance

### 5. **Simplified Component Logic**

- Components focus on presentation
- Business logic centralized in contexts
- Reduced code duplication

## Migration Strategy

### Phase 1: Install Contexts (Current)

```typescript
// app/layout.tsx
import { AppProviders } from '@/contexts';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
```

### Phase 2: Update Components

Replace current hook usage:

```typescript
// OLD - Multiple hooks
const { user, profile, isLoading, signOut } = useAuth()
const { vehicles, maintenanceRecords, refreshData } = useDashboardData()

// NEW - Context-based
const { user, profile, isLoading, signOut } = useAuth()
const { vehicles, maintenanceRecords, refreshAll } = useData()
```

### Phase 3: Update Dialog Components

Replace direct Supabase usage:

```typescript
// OLD
import { createClient } from "@/lib/supabase/client"
const supabase = createClient()

// NEW
import { useSupabase, useData } from "@/contexts"
const supabase = useSupabase()
const { addVehicleOptimistic } = useData()
```

### Phase 4: Remove Legacy Code

- Delete `hooks/useAuth.ts` (replaced by AuthContext)
- Delete `hooks/useDashboardData.tsx` (replaced by DataContext)
- Update `hooks/useSupabase.ts` to re-export context version

## Implementation Examples

### Dashboard Component

```typescript
"use client";

import { useAuth, useData } from '@/contexts';

export function Dashboard() {
  const { user, profile, signOut } = useAuth();
  const { vehicles, maintenanceRecords, isLoading } = useData();

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <h1>Welcome {profile?.full_name}</h1>
      <VehiclesList vehicles={vehicles} />
      <MaintenanceList records={maintenanceRecords} />
    </div>
  );
}
```

### Add Vehicle Dialog

```typescript
"use client";

import { useData, useAuth } from '@/contexts';

export function AddVehicleDialog() {
  const { addVehicleOptimistic } = useData();
  const { user } = useAuth();

  const handleSubmit = async (data: VehicleData) => {
    try {
      await addVehicleOptimistic(data);
      // UI updates immediately, rollback on error
    } catch (error) {
      // Handle error
    }
  };

  return (
    <Dialog>
      <VehicleForm onSubmit={handleSubmit} />
    </Dialog>
  );
}
```

## Performance Considerations

### Context Splitting Benefits

- **AuthContext**: Changes infrequently (login/logout)
- **DataContext**: Changes with user actions
- **SupabaseContext**: Never changes (static client)

This prevents unnecessary re-renders when only specific data changes.

### Memory Management

- Automatic cleanup on user logout
- Subscription management in contexts
- Optimized re-render patterns

## Testing Strategy

### Context Testing

```typescript
// Test contexts in isolation
import { renderHook } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/contexts';

test('should provide auth state', () => {
  const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
  const { result } = renderHook(() => useAuth(), { wrapper });

  expect(result.current.isAuthenticated).toBe(false);
});
```

### Component Testing

```typescript
// Mock contexts for component tests
const mockUseAuth = {
  user: { id: "1", email: "test@example.com" },
  profile: { id: "1", full_name: "Test User", email: "test@example.com" },
  isLoading: false,
  isAuthenticated: true,
  signOut: jest.fn(),
}

jest.mock("@/contexts", () => ({
  useAuth: () => mockUseAuth,
  useData: () => mockUseData,
}))
```

## Next Steps

1. **Install contexts in layout** (Ready to implement)
2. **Update main page component** to use new contexts
3. **Migrate dialog components** one by one
4. **Update header component** to use auth context
5. **Remove legacy hooks** after migration
6. **Add error boundaries** for context providers
7. **Implement real-time subscriptions** in DataContext

This architecture provides a solid foundation for scaling the application while maintaining clean separation of concerns and excellent developer experience.
