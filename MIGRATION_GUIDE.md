# Guía de Migración Rápida - Auth v2.0

## 🎯 Para Desarrolladores

Si estás trabajando en una característica que usa el sistema de autenticación, aquí está todo lo que necesitas saber sobre los cambios.

## ⚡ TL;DR (Too Long; Didn't Read)

### Lo que cambió:

1. ✅ **AuthManager** es ahora la fuente única de verdad
2. ✅ **AuthContext** ahora usa AuthManager internamente
3. ✅ **Nuevos hooks:** `useProtectedRoute()` y `useGuestRoute()`
4. ✅ **Middleware** optimizado con caché de sesiones
5. ✅ **Login** redirige correctamente a dashboard

### ¿Qué necesitas hacer?

**NADA** si solo usas `useAuth()` en tus componentes. La API es compatible hacia atrás.

## 🔄 Cambios en la API

### ✅ API Compatible (Sigue funcionando igual)

```typescript
// Estos imports siguen funcionando exactamente igual
import { useAuth } from "@/contexts"

function MyComponent() {
  const { user, profile, isLoading, isAuthenticated, signOut } = useAuth()
  
  // Tu código existente funciona sin cambios
  if (isLoading) return <Spinner />
  if (!isAuthenticated) return <Login />
  
  return <Dashboard user={user} />
}
```

### ⭐ Nueva API (Opciones adicionales)

```typescript
// 1. Usar AuthManager directamente (en utilities, no components)
import { authManager } from "@/lib/auth/authManager"

// En una función utility
async function checkUserPermissions() {
  const user = authManager.getUser()
  if (!user) throw new Error("Not authenticated")
  // ...
}

// 2. Proteger rutas fácilmente
import { useProtectedRoute } from "@/hooks"

function AdminPage() {
  useProtectedRoute() // Redirige automáticamente si no autenticado
  return <AdminDashboard />
}

// 3. Rutas solo para guests
import { useGuestRoute } from "@/hooks"

function LoginPage() {
  useGuestRoute() // Redirige automáticamente si ya autenticado
  return <LoginForm />
}
```

## 📝 Patrones Comunes

### Patrón 1: Componente Protegido

**Antes:**
```typescript
function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, isLoading, router])
  
  if (isLoading) return <Spinner />
  if (!user) return null
  
  return <Dashboard user={user} />
}
```

**Después (opción 1 - compatible):**
```typescript
function DashboardPage() {
  const { user, isLoading } = useAuth()
  
  if (isLoading) return <Spinner />
  if (!user) return null
  
  return <Dashboard user={user} />
}
```

**Después (opción 2 - nuevo hook):**
```typescript
function DashboardPage() {
  const { user, isLoading } = useProtectedRoute()
  
  if (isLoading) return <Spinner />
  
  // Si llega aquí, user siempre existe
  return <Dashboard user={user!} />
}
```

### Patrón 2: Login con Redirección

**Antes:**
```typescript
async function handleLogin(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  
  router.push("/") // Siempre redirige a raíz
}
```

**Después:**
```typescript
async function handleLogin(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  
  // Obtener URL de redirección del query param
  const params = new URLSearchParams(window.location.search)
  const redirect = params.get("redirect") || "/"
  
  router.push(redirect) // Redirige a URL original o dashboard
}
```

### Patrón 3: Verificar Auth en API Route

**Antes:**
```typescript
// app/api/vehicles/route.ts
export async function GET(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  // ...
}
```

**Después (sin cambios, sigue funcionando igual):**
```typescript
// app/api/vehicles/route.ts
export async function GET(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  // ...
}
```

### Patrón 4: Suscribirse a Cambios de Auth

**Antes:**
```typescript
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    console.log("Auth changed:", event)
  })
  
  return () => subscription.unsubscribe()
}, [])
```

**Después (más simple con AuthManager):**
```typescript
useEffect(() => {
  const unsubscribe = authManager.subscribe((state) => {
    console.log("Auth changed:", state)
  })
  
  return unsubscribe
}, [])
```

## 🚨 Breaking Changes (NINGUNO)

**No hay breaking changes.** Toda la API existente es compatible hacia atrás.

## ✨ Mejoras que Obtienes Gratis

Si tu código ya usaba `useAuth()`, ahora obtienes automáticamente:

1. ✅ **Mejor performance**: Menos re-renders innecesarios
2. ✅ **Cross-tab sync**: Login/logout sincronizado entre pestañas
3. ✅ **Token refresh automático**: Sin interrupciones en la sesión
4. ✅ **Mejor manejo de errores**: Logs más claros
5. ✅ **Caché de sesiones**: Middleware más rápido

## 📚 Ejemplos Completos

### Ejemplo 1: Página Protegida con Loading

```typescript
"use client"

import { useProtectedRoute } from "@/hooks"
import { LoadingScreen } from "@/components/ui/loading-screen"
import { VehiclesList } from "@/components/vehicles/vehicles-list"

export default function VehiclesPage() {
  const { user, isLoading } = useProtectedRoute()
  
  if (isLoading) {
    return <LoadingScreen message="Cargando vehículos..." />
  }
  
  return (
    <div>
      <h1>Mis Vehículos</h1>
      <VehiclesList userId={user!.id} />
    </div>
  )
}
```

### Ejemplo 2: Login con Redirección Inteligente

```typescript
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useGuestRoute } from "@/hooks"
import { authManager } from "@/lib/auth/authManager"

export default function LoginPage() {
  const { isLoading } = useGuestRoute()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()
  
  if (isLoading) return <LoadingScreen />
  
  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    
    try {
      await authManager.signIn(email, password)
      
      // Obtener URL de redirección
      const params = new URLSearchParams(window.location.search)
      const redirect = params.get("redirect") || "/"
      
      router.refresh()
      router.push(redirect)
    } catch (error) {
      console.error("Login error:", error)
      toast.error(error.message)
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  )
}
```

### Ejemplo 3: Utility Function que Necesita Auth

```typescript
// lib/utils/exportVehicles.ts
import { authManager } from "@/lib/auth/authManager"
import { createClient } from "@/lib/supabase/client"

export async function exportVehiclesToCSV() {
  // Verificar autenticación
  const user = authManager.getUser()
  if (!user) {
    throw new Error("Usuario no autenticado")
  }
  
  // Obtener datos
  const supabase = createClient()
  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("*")
    .eq("user_id", user.id)
  
  // Exportar a CSV
  const csv = convertToCSV(vehicles)
  downloadFile(csv, "vehicles.csv")
}
```

### Ejemplo 4: Componente con Estado de Logout

```typescript
"use client"

import { useAuth } from "@/contexts"
import { Button } from "@/components/ui/button"

export function Header() {
  const { user, profile, isLoggingOut, signOut } = useAuth()
  
  return (
    <header>
      {user && (
        <>
          <span>Hola, {profile?.full_name}</span>
          <Button 
            onClick={signOut}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
          </Button>
        </>
      )}
    </header>
  )
}
```

## 🐛 Troubleshooting

### "No puedo importar authManager"

```typescript
// ❌ Incorrecto
import { authManager } from "@/lib/auth/auth-manager" 

// ✅ Correcto
import { authManager } from "@/lib/auth/authManager"
```

### "useProtectedRoute no redirige"

Verifica que estés usando el hook dentro de un componente cliente:

```typescript
// ❌ Falta "use client"
import { useProtectedRoute } from "@/hooks"

// ✅ Correcto
"use client"

import { useProtectedRoute } from "@/hooks"
```

### "User es null después de login"

Asegúrate de verificar `isLoading` antes de usar `user`:

```typescript
const { user, isLoading } = useAuth()

// ❌ user puede ser null aquí
console.log(user.email)

// ✅ Correcto
if (isLoading) return <Spinner />
if (!user) return <Login />
console.log(user.email) // Ahora es seguro
```

## 📞 ¿Necesitas Ayuda?

- 📖 [AUTH_SYSTEM.md](./AUTH_SYSTEM.md) - Documentación completa
- 📖 [AGENTS.md](./AGENTS.md) - Guía del proyecto
- 💬 [GitHub Issues](https://github.com/devchemical/CarCare/issues)
- 📧 Email: soporte@keepel.dev

## ✅ Checklist de Migración

Si quieres adoptar las nuevas características:

- [ ] Leer esta guía completa
- [ ] Revisar ejemplos de código
- [ ] Probar en entorno de desarrollo
- [ ] Actualizar tests si existen
- [ ] Desplegar a producción

---

**Tip Final:** Si tu código funciona actualmente, NO necesitas cambiar nada. Las mejoras son transparentes y retrocompatibles. Solo usa las nuevas características cuando las necesites.
