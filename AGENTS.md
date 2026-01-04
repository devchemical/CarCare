# AGENTS.md - Keepel (CarCare)

**Sistema completo de gestión de mantenimiento automotriz**

Este documento proporciona contexto completo para agentes de IA que trabajen en este proyecto.

---

## 📋 Información General del Proyecto

### Identidad

- **Nombre del Proyecto**: Keepel (anteriormente CarCare)
- **Propósito**: Sistema web para gestionar el mantenimiento de vehículos personales
- **Stack Principal**: Next.js 14, React 18, TypeScript, Supabase, TailwindCSS
- **Tipo**: Progressive Web App (PWA)
- **Licencia**: MIT
- **Repositorio**: https://github.com/devchemical/CarCare
- **Demo**: https://keepel.chemicaldev.com

### Descripción

Keepel es una aplicación web moderna que permite a los usuarios:

- Registrar y gestionar múltiples vehículos
- Llevar un historial completo de mantenimientos
- Programar servicios futuros y recibir recordatorios
- Controlar gastos de mantenimiento
- Visualizar estadísticas y reportes
- Acceder desde cualquier dispositivo (responsive)

---

## 🏗️ Arquitectura del Proyecto

### Stack Tecnológico

#### Frontend

```json
{
  "framework": "Next.js 14.2.16 (App Router)",
  "ui_library": "React 18",
  "language": "TypeScript 5",
  "styling": "TailwindCSS 4.1.9",
  "components": "shadcn/ui",
  "icons": "lucide-react",
  "forms": "react-hook-form + zod",
  "charts": "recharts"
}
```

#### Backend & Database

```json
{
  "backend": "Supabase (BaaS)",
  "database": "PostgreSQL (via Supabase)",
  "auth": "Supabase Auth (JWT)",
  "storage": "Supabase Storage",
  "realtime": "Supabase Realtime",
  "security": "Row Level Security (RLS)"
}
```

#### Tools & Build

```json
{
  "package_manager": "pnpm",
  "bundler": "Next.js built-in (Turbopack)",
  "linting": "ESLint",
  "formatting": "Prettier",
  "runtime": "Node.js 18+"
}
```

### Estructura de Directorios

```
CarCare/
├── app/                          # Next.js App Router
│   ├── (routes)/
│   │   ├── auth/                 # Rutas de autenticación
│   │   │   ├── login/            # Página de inicio de sesión
│   │   │   ├── signup/           # Página de registro
│   │   │   ├── signup-success/   # Confirmación de registro
│   │   │   ├── callback/         # Callback de email verification
│   │   │   └── error/            # Manejo de errores de auth
│   │   ├── dashboard/            # Dashboard principal (protegido)
│   │   ├── vehicles/             # Gestión de vehículos (protegido)
│   │   │   └── [id]/
│   │   │       └── maintenance/  # Mantenimiento por vehículo
│   │   └── page.tsx              # Landing page (ruta raíz)
│   ├── layout.tsx                # Layout raíz con providers
│   └── globals.css               # Estilos globales
│
├── components/                   # Componentes React reutilizables
│   ├── dashboard/                # Componentes específicos del dashboard
│   │   ├── dashboard-stats.tsx
│   │   ├── recent-activity.tsx
│   │   ├── upcoming-maintenance.tsx
│   │   └── vehicle-overview.tsx
│   ├── vehicles/                 # Componentes de gestión de vehículos
│   │   ├── add-vehicle-dialog.tsx
│   │   ├── edit-vehicle-dialog.tsx
│   │   ├── delete-vehicle-dialog.tsx
│   │   └── vehicles-list.tsx
│   ├── maintenance/              # Componentes de mantenimiento
│   │   ├── add-maintenance-dialog.tsx
│   │   ├── edit-maintenance-dialog.tsx
│   │   ├── delete-maintenance-dialog.tsx
│   │   └── maintenance-list.tsx
│   ├── ui/                       # Componentes UI de shadcn/ui
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── form.tsx
│   │   └── ...                   # Más componentes UI
│   └── theme-provider.tsx        # Provider de temas (dark/light)
│
├── contexts/                     # React Contexts
│   └── auth-context.tsx          # Contexto de autenticación (NUEVO)
│
├── hooks/                        # Custom React Hooks
│   └── use-auth-redirect.ts     # Hooks para protección de rutas (NUEVO)
│
├── lib/                          # Utilidades y configuración
│   ├── auth/                     # Sistema de autenticación (NUEVO)
│   │   └── auth-manager.ts       # AuthManager centralizado
│   ├── supabase/                 # Configuración de Supabase
│   │   ├── client.ts             # Cliente para browser
│   │   ├── server.ts             # Cliente para server components
│   │   ├── route-handler.ts     # Cliente para API routes (NUEVO)
│   │   ├── admin.ts              # Cliente admin (NUEVO)
│   │   └── types.ts              # Tipos de TypeScript (NUEVO)
│   └── utils.ts                  # Funciones de utilidad (cn, etc.)
│
├── scripts/                      # Scripts SQL de base de datos
│   ├── 001_create_tables.sql     # Creación de tablas principales
│   └── 002_create_profile_trigger.sql  # Trigger de perfiles
│
├── public/                       # Archivos estáticos
│   ├── placeholder-logo.svg
│   └── ...
│
├── styles/                       # Estilos adicionales (si aplica)
│
├── middleware.ts                 # Middleware de Next.js (auth)
├── next.config.mjs               # Configuración de Next.js
├── tailwind.config.js            # Configuración de TailwindCSS
├── tsconfig.json                 # Configuración de TypeScript
├── components.json               # Configuración de shadcn/ui
├── .prettierrc                   # Configuración de Prettier
├── .prettierignore               # Archivos ignorados por Prettier
├── package.json                  # Dependencias del proyecto
├── pnpm-lock.yaml                # Lockfile de pnpm
│
└── README.md                     # Documentación principal
```

---

## 🗄️ Esquema de Base de Datos

### Tablas Principales

#### `profiles`

Perfil de usuario vinculado a `auth.users` de Supabase.

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Relaciones:**

- `id` → `auth.users.id` (ONE-TO-ONE)

**RLS Policies:**

- Users can view/update only their own profile

#### `vehicles`

Información de vehículos de cada usuario.

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

**Relaciones:**

- `user_id` → `profiles.id` (MANY-TO-ONE)

**RLS Policies:**

- Users can only view/edit their own vehicles

#### `maintenance_records`

Registros de mantenimiento para cada vehículo.

```sql
CREATE TABLE maintenance_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  cost DECIMAL(10,2),
  mileage INTEGER,
  service_date DATE NOT NULL,
  next_service_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Relaciones:**

- `vehicle_id` → `vehicles.id` (MANY-TO-ONE)

**RLS Policies:**

- Users can only view/edit maintenance records for their own vehicles

### Relaciones

```
auth.users (Supabase Auth)
    ↓ (1:1)
profiles
    ↓ (1:N)
vehicles
    ↓ (1:N)
maintenance_records
```

### Triggers Importantes

#### `handle_new_user()`

Se ejecuta automáticamente cuando un usuario se registra en Supabase Auth.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Propósito:** Crear automáticamente un perfil en `profiles` cuando se crea un usuario en `auth.users`.

---

## 🔐 Sistema de Autenticación

### Arquitectura (REFACTORIZADO)

El sistema de autenticación ha sido completamente refactorizado para ser **event-driven** y **libre de timeouts**.

#### Componentes Principales

1. **AuthManager** (`lib/auth/auth-manager.ts`)
   - Singleton que gestiona todo el estado de autenticación
   - Event-driven: responde a eventos de Supabase
   - Sincronización cross-tab con BroadcastChannel
   - Single source of truth para toda la app

2. **AuthProvider** (`contexts/auth-context.tsx`)
   - React Context que envuelve la aplicación
   - Expone estado y métodos de autenticación
   - Maneja subscripciones y actualizaciones

3. **Middleware** (`middleware.ts`)
   - Intercepta todas las requests
   - Valida sesiones antes de renderizar
   - Maneja redirecciones automáticas
   - Caché de sesiones para performance

4. **Custom Hooks**
   - `useAuth()`: Acceder a estado de autenticación
   - `useProtectedRoute()`: Proteger páginas
   - `useGuestRoute()`: Páginas solo para no autenticados

### Flujo de Autenticación

#### Registro (Sign Up)

```
Usuario → /auth/signup
  ↓ Formulario
  ↓ authManager.signUp()
  ↓ Supabase Auth API
  ↓ Trigger: handle_new_user()
  ↓ Email de confirmación enviado
  → /auth/signup-success
```

#### Login

```
Usuario → /auth/login
  ↓ Formulario
  ↓ authManager.signIn()
  ↓ Supabase Auth API
  ↓ Cookies establecidas (httpOnly)
  ↓ onAuthStateChange: SIGNED_IN
  ↓ AuthManager actualiza estado
  ↓ BroadcastChannel a otras tabs
  → Middleware redirige a /dashboard
```

#### Token Refresh (Automático)

```
Token próximo a expirar
  ↓ Supabase detecta (< 60s antes)
  ↓ Auto-refresh con refresh_token
  ↓ onAuthStateChange: TOKEN_REFRESHED
  ↓ AuthManager actualiza cookies
  ↓ BroadcastChannel a otras tabs
  → Sesión continúa sin interrupción
```

#### Protección de Rutas

```
Request a /dashboard
  ↓ Middleware intercepta
  ↓ Lee cookies de auth
  ↓ Verifica con Supabase
  ↓ ¿Token válido?
    ├─ SÍ → Renderiza /dashboard
    └─ NO → Redirect a /auth/login
```

### Variables de Entorno Requeridas

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# Redirect URLs (Opcional)
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard
NEXT_PUBLIC_SUPABASE_REDIRECT_URL=https://tu-dominio.com/dashboard
```

---

## 🎨 Sistema de Diseño

### Temas

- **Light Mode**: Tema claro por defecto
- **Dark Mode**: Tema oscuro (toggle en UI)
- **System**: Respeta preferencias del sistema operativo

### Paleta de Colores (TailwindCSS)

```javascript
// tailwind.config.js
colors: {
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  accent: 'hsl(var(--accent))',
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  muted: 'hsl(var(--muted))',
  // ... más colores
}
```

### Componentes UI (shadcn/ui)

Todos los componentes UI están en `components/ui/` y siguen el sistema de shadcn/ui:

- **Button**: Botones con variantes (default, destructive, outline, ghost)
- **Dialog**: Modales y diálogos
- **Input**: Campos de entrada de texto
- **Card**: Contenedores de contenido
- **Form**: Manejo de formularios con react-hook-form
- **Alert**: Mensajes de alerta
- **Badge**: Etiquetas y badges
- **Dropdown**: Menús desplegables
- **Table**: Tablas de datos

### Convenciones de Estilo

1. **Usar Tailwind utilities** en lugar de CSS custom
2. **Usar componentes shadcn/ui** para consistencia
3. **Responsive first**: Mobile → Tablet → Desktop
4. **Dark mode compatible**: Siempre testear en ambos temas
5. **Accesibilidad**: ARIA labels, keyboard navigation

---

## 📝 Patrones de Código

### Componentes React

#### Estructura de un Componente

```typescript
// components/ejemplo/mi-componente.tsx
'use client'; // Solo si usa hooks de React o interactividad

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';

interface MiComponenteProps {
  titulo: string;
  onAction?: () => void;
}

export function MiComponente({ titulo, onAction }: MiComponenteProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleClick = async () => {
    setLoading(true);
    try {
      // Lógica...
      await onAction?.();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">{titulo}</h2>
      <p>Usuario: {user?.email}</p>
      <Button onClick={handleClick} disabled={loading}>
        {loading ? 'Cargando...' : 'Acción'}
      </Button>
    </div>
  );
}
```

### Server Components vs Client Components

#### Server Component (Por defecto en Next.js 14)

```typescript
// app/dashboard/page.tsx
import { createServerClient } from '@/lib/supabase/server';
import { VehiclesList } from '@/components/vehicles/vehicles-list';

// ✅ NO necesita 'use client'
// ✅ Puede hacer fetch de datos directamente
// ✅ Mejor para SEO y performance

export default async function DashboardPage() {
  const supabase = await createServerClient();

  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('*');

  return (
    <div>
      <h1>Dashboard</h1>
      <VehiclesList vehicles={vehicles} />
    </div>
  );
}
```

#### Client Component

```typescript
// components/vehicles/add-vehicle-dialog.tsx
'use client'; // ⚠️ Necesario porque usa useState, useAuth, etc.

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Dialog } from '@/components/ui/dialog';

export function AddVehicleDialog() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Contenido del modal */}
    </Dialog>
  );
}
```

### Manejo de Formularios

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel } from '@/components/ui/form';

// 1. Definir schema de validación con Zod
const vehicleSchema = z.object({
  make: z.string().min(1, 'Marca es requerida'),
  model: z.string().min(1, 'Modelo es requerido'),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  mileage: z.number().min(0).optional(),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

export function VehicleForm() {
  // 2. Setup react-hook-form con Zod
  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      make: '',
      model: '',
      year: new Date().getFullYear(),
      mileage: 0,
    },
  });

  // 3. Handler de submit
  const onSubmit = async (data: VehicleFormData) => {
    try {
      // Lógica de guardado...
      console.log('Datos:', data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="make"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Marca</FormLabel>
              <Input {...field} placeholder="Toyota" />
            </FormItem>
          )}
        />
        {/* Más campos... */}
        <Button type="submit">Guardar</Button>
      </form>
    </Form>
  );
}
```

### Queries a Supabase

#### En Client Components

```typescript
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function MiComponente() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      try {
        const { data, error } = await supabase
          .from('vehicles')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setData(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <div>Cargando...</div>;
  return <div>{/* Renderizar data */}</div>;
}
```

#### En Server Components

```typescript
// app/vehicles/page.tsx
import { createServerClient } from '@/lib/supabase/server';

export default async function VehiclesPage() {
  const supabase = await createServerClient();

  // ✅ Directamente en el componente, sin useEffect
  const { data: vehicles, error } = await supabase
    .from('vehicles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return <div>Error al cargar vehículos</div>;
  }

  return <VehiclesList vehicles={vehicles} />;
}
```

### Manejo de Errores

```typescript
import { toast } from "@/components/ui/use-toast"

async function handleAction() {
  try {
    // Acción...
    const { error } = await supabase.from("vehicles").insert(data)

    if (error) throw error

    toast({
      title: "¡Éxito!",
      description: "Vehículo agregado correctamente",
    })
  } catch (error) {
    console.error("Error:", error)

    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Ocurrió un error",
      variant: "destructive",
    })
  }
}
```

---

## 🧪 Testing

### Setup de Testing (Pendiente de implementar)

```bash
# Instalar dependencias de testing
pnpm add -D @testing-library/react @testing-library/jest-dom jest
```

### Ejemplo de Test

```typescript
// __tests__/components/vehicle-form.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { VehicleForm } from '@/components/vehicles/vehicle-form';

describe('VehicleForm', () => {
  it('should render form fields', () => {
    render(<VehicleForm />);

    expect(screen.getByLabelText(/marca/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/modelo/i)).toBeInTheDocument();
  });

  it('should show validation errors', async () => {
    render(<VehicleForm />);

    const submitButton = screen.getByRole('button', { name: /guardar/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/marca es requerida/i)).toBeInTheDocument();
  });
});
```

---

## 🚀 Comandos Importantes

### Desarrollo

```bash
# Instalar dependencias
pnpm install

# Ejecutar en modo desarrollo
pnpm dev

# Ejecutar en puerto específico
pnpm dev -p 3001
```

### Build y Producción

```bash
# Construir para producción
pnpm build

# Ejecutar build de producción
pnpm start

# Analizar bundle
pnpm build --analyze
```

### Linting y Formatting

```bash
# Lint del código
pnpm lint

# Fix automático de lint
pnpm lint --fix

# Formatear código con Prettier
pnpm format
```

### Base de Datos

```bash
# Ejecutar migraciones (desde Supabase Dashboard)
# SQL Editor → Ejecutar scripts en orden:
# 1. scripts/001_create_tables.sql
# 2. scripts/002_create_profile_trigger.sql
```

---

## 📦 Dependencias Principales

### Core

```json
{
  "next": "14.2.16",
  "react": "^18",
  "react-dom": "^18",
  "typescript": "^5"
}
```

### UI & Styling

```json
{
  "tailwindcss": "^4.1.9",
  "@radix-ui/react-*": "^1.x", // Componentes de shadcn/ui
  "lucide-react": "^0.460.0",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^2.6.0"
}
```

### Forms & Validation

```json
{
  "react-hook-form": "^7.54.2",
  "zod": "^3.24.1",
  "@hookform/resolvers": "^3.9.1"
}
```

### Backend & Auth

```json
{
  "@supabase/supabase-js": "^2.48.1",
  "@supabase/ssr": "^0.5.2"
}
```

### Charts & Data Viz

```json
{
  "recharts": "^2.15.0"
}
```

---

## 🔧 Configuraciones Importantes

### TypeScript (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "jsx": "preserve",
    "module": "esnext",
    "moduleResolution": "bundler",
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Next.js (next.config.mjs)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["your-supabase-project.supabase.co"],
  },
  experimental: {
    serverActions: true,
  },
}

export default nextConfig
```

### TailwindCSS (tailwind.config.js)

```javascript
module.exports = {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Variables CSS para temas
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

---

## 🎯 Convenciones y Mejores Prácticas

### Nomenclatura

#### Archivos y Carpetas

- **Componentes**: `kebab-case.tsx` (ej: `vehicle-form.tsx`)
- **Páginas**: `page.tsx` (Next.js App Router)
- **Layouts**: `layout.tsx`
- **Carpetas**: `kebab-case` (ej: `auth-context`)

#### Código

- **Componentes**: `PascalCase` (ej: `VehicleForm`)
- **Funciones**: `camelCase` (ej: `handleSubmit`)
- **Constantes**: `UPPER_SNAKE_CASE` (ej: `MAX_VEHICLES`)
- **Variables**: `camelCase` (ej: `vehicleData`)
- **Interfaces/Types**: `PascalCase` con sufijo opcional (ej: `VehicleFormProps`)

### Organización de Imports

```typescript
// 1. Imports de React y frameworks
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

// 2. Imports de librerías externas
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

// 3. Imports internos (@ alias)
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { createClient } from "@/lib/supabase/client"

// 4. Imports de tipos
import type { Vehicle } from "@/lib/supabase/types"

// 5. Imports relativos (evitar si es posible)
import { helperFunction } from "./utils"
```

### Comentarios

```typescript
/**
 * Componente para agregar un nuevo vehículo
 *
 * @param onSuccess - Callback cuando se agrega exitosamente
 * @param initialData - Datos iniciales del formulario (opcional)
 */
export function AddVehicleDialog({ onSuccess, initialData }: Props) {
  // Lógica...
}

// ✅ BIEN: Comentarios para código complejo
// Verificamos si el token está próximo a expirar (menos de 5 minutos)
const isExpiringSoon = expiresAt - Date.now() < 5 * 60 * 1000

// ❌ MAL: Comentarios obvios
// Asigna el valor a la variable
const value = getValue()
```

### Manejo de Estado

```typescript
// ✅ BIEN: Estado local simple
const [isOpen, setIsOpen] = useState(false)

// ✅ BIEN: Estado global con Context
const { user, loading } = useAuth()

// ✅ BIEN: Estado de servidor con Server Components
const vehicles = await fetchVehicles()

// ❌ MAL: Estado global sin Context
// (compartir estado pasándolo como props por muchos niveles)
```

### Async/Await

```typescript
// ✅ BIEN: Usar async/await con try/catch
async function handleSubmit() {
  try {
    const result = await saveData()
    toast.success("Guardado exitosamente")
  } catch (error) {
    console.error("Error:", error)
    toast.error("Error al guardar")
  }
}

// ❌ MAL: Promesas sin manejo de errores
function handleSubmit() {
  saveData().then(() => {
    toast.success("Guardado")
  }) // ⚠️ No captura errores
}
```

---

## 🐛 Debugging y Troubleshooting

### Common Issues

#### 1. "Hydration Error" en Next.js

**Causa**: Diferencia entre HTML del servidor y cliente
**Solución**:

```typescript
// Usar useEffect para código que solo debe correr en cliente
useEffect(() => {
  // Código que depende del browser
}, [])

// O usar 'use client' si el componente es completamente cliente
;("use client")
```

#### 2. "Cannot read properties of undefined (reading 'user')"

**Causa**: Acceder a `user` antes de que AuthContext esté listo
**Solución**:

```typescript
const { user, loading } = useAuth();

if (loading) {
  return <Spinner />;
}

// Ahora es seguro usar user
return <div>{user.email}</div>;
```

#### 3. "Supabase client must be created in Client Component"

**Causa**: Usar `createClient()` (browser) en Server Component
**Solución**:

```typescript
// En Server Component
import { createServerClient } from "@/lib/supabase/server"
const supabase = await createServerClient()

// En Client Component
import { createClient } from "@/lib/supabase/client"
const supabase = createClient()
```

#### 4. Session no persiste después de refresh

**Causa**: Cookies no configuradas correctamente
**Solución**:

1. Verificar URLs en Supabase Dashboard
2. Verificar que middleware tenga acceso a cookies
3. Verificar que `autoRefreshToken: true` en client

### Logs Útiles

```typescript
// Verificar estado de autenticación
console.log("Auth State:", {
  user: authManager.getUser(),
  session: authManager.getSession(),
  isAuthenticated: authManager.isAuthenticated(),
})

// Verificar eventos de auth
supabase.auth.onAuthStateChange((event, session) => {
  console.log("🔐 Auth Event:", event, {
    user: session?.user?.email,
    expiresAt: new Date(session?.expires_at * 1000).toISOString(),
  })
})

// Verificar queries de Supabase
const { data, error } = await supabase.from("vehicles").select("*")
console.log("Query result:", { data, error })
```

---

## 📚 Recursos de Referencia

### Documentación Oficial

- [Next.js 14 Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Supabase Docs](https://supabase.com/docs)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Herramientas

- [TypeScript Playground](https://www.typescriptlang.org/play)
- [TailwindCSS Playground](https://play.tailwindcss.com)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Vercel Dashboard](https://vercel.com/dashboard)

---

## 🎯 Roadmap y Features Futuras

### v1.1 (En Desarrollo)

- [ ] API REST completa para integraciones
- [ ] Notificaciones push para recordatorios
- [ ] Reportes avanzados con gráficos mejorados
- [ ] Internacionalización (i18n) español/inglés
- [ ] Búsqueda avanzada con filtros múltiples

### v1.2 (Planificado)

- [ ] App móvil nativa (React Native)
- [ ] OCR para facturas automático
- [ ] Integración con talleres mecánicos
- [ ] Gestión de presupuestos
- [ ] Comparador de costos entre vehículos

### v2.0 (Futuro)

- [ ] IA para predicción de mantenimientos
- [ ] Analytics avanzados de rendimiento
- [ ] Integración con APIs de fabricantes
- [ ] Marketplace de servicios
- [ ] Sistema de recomendaciones

---

## 🤝 Contribuciones

### Flujo de Trabajo

1. **Fork del repositorio**
2. **Crear rama**: `git checkout -b feature/nueva-caracteristica`
3. **Desarrollar y commit**: `git commit -m "feat: agrega nueva característica"`
4. **Push**: `git push origin feature/nueva-caracteristica`
5. **Pull Request** a `main`

### Conventional Commits

Usar formato: `tipo(scope): descripción`

**Tipos:**

- `feat`: Nueva característica
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Cambios de formato (no afectan lógica)
- `refactor`: Refactorización de código
- `test`: Agregar o modificar tests
- `chore`: Mantenimiento y tareas auxiliares

**Ejemplos:**

```bash
feat(vehicles): agrega filtro por marca
fix(auth): corrige redirección después del login
docs(readme): actualiza guía de instalación
refactor(dashboard): simplifica lógica de estadísticas
```

### Code Review Checklist

- [ ] Código sigue convenciones del proyecto
- [ ] TypeScript sin errores (`pnpm build`)
- [ ] Linting pasa (`pnpm lint`)
- [ ] Componentes funcionan en light/dark mode
- [ ] Responsive en móvil, tablet, desktop
- [ ] Tests agregados/actualizados (si aplica)
- [ ] Sin console.logs en producción
- [ ] Documentación actualizada (si aplica)

---

## 🔒 Seguridad

### Políticas de Seguridad

1. **Nunca commitear**:
   - `.env.local` (ya está en `.gitignore`)
   - API keys o secrets
   - Datos de usuarios reales

2. **Row Level Security (RLS)**:
   - SIEMPRE habilitar RLS en nuevas tablas
   - Políticas deben validar `auth.uid()`

3. **Validación**:
   - Validar en cliente (Zod)
   - Validar en servidor (RLS + constraints)

4. **Headers de Seguridad**:
   - Configurados en middleware
   - CSP, XSS Protection, etc.

### Reporte de Vulnerabilidades

Si encuentras una vulnerabilidad de seguridad:

1. NO crear issue público
2. Enviar email a: security@keepel.dev
3. Incluir descripción detallada y pasos para reproducir

---

## 🎓 Guías para Agentes de IA

### Cuando Generes Código

1. **Siempre usar TypeScript** con tipos explícitos
2. **Preferir Server Components** cuando sea posible
3. **Usar `useAuth()` hook** para acceder a usuario
4. **Validar formularios** con Zod + react-hook-form
5. **Manejar errores** con try/catch y toast notifications
6. **Responsive design** con TailwindCSS
7. **Accesibilidad**: ARIA labels, keyboard navigation
8. **Comentar código complejo** pero evitar comentarios obvios

### Cuando Modifiques Código Existente

1. **Mantener convenciones** del archivo existente
2. **No romper funcionalidad** existente
3. **Agregar tests** si modificas lógica crítica
4. **Actualizar documentación** si cambias API pública
5. **Verificar que compile** con `pnpm build`

### Cuando Respondas Preguntas

1. **Referenciar este documento** (AGENTS.md) cuando sea relevante
2. **Dar ejemplos de código** del proyecto real
3. **Explicar el "por qué"**, no solo el "cómo"
4. **Sugerir mejoras** si ves oportunidades
5. **Ser específico** sobre archivos y líneas de código

### Cuando Debuggees

1. **Verificar logs** en consola y terminal
2. **Revisar Network tab** en DevTools
3. **Verificar cookies** en Application tab
4. **Probar en incógnito** para descartar caché
5. **Verificar variables de entorno**
6. **Consultar Supabase Dashboard** para errores de DB

---

## 📞 Contacto y Soporte

- **Repository**: https://github.com/devchemical/CarCare
- **Issues**: https://github.com/devchemical/CarCare/issues
- **Discussions**: https://github.com/devchemical/CarCare/discussions
- **Email**: soporte@keepel.dev
- **Demo**: https://keepel.chemicaldev.com

---

## 📄 Licencia

Este proyecto está bajo la **Licencia MIT**.

Ver el archivo [LICENSE](LICENSE) para más detalles.

---

**Última actualización**: Enero 2026
**Versión del documento**: 1.0.0
**Mantenido por**: DevChemical

---

## 🎯 Quick Reference para IA

### Comandos Más Usados

```bash
pnpm dev              # Desarrollo
pnpm build            # Build producción
pnpm lint             # Linting
```

### Archivos Clave

- `middleware.ts` - Autenticación y protección de rutas
- `contexts/auth-context.tsx` - Estado global de auth
- `lib/auth/auth-manager.ts` - Lógica centralizada de auth
- `lib/supabase/client.ts` - Cliente Supabase browser
- `lib/supabase/server.ts` - Cliente Supabase server

### Hooks Principales

- `useAuth()` - Estado de autenticación
- `useProtectedRoute()` - Proteger páginas
- `useGuestRoute()` - Páginas solo no autenticados

### Componentes UI

- Ubicación: `components/ui/*`
- Basados en: shadcn/ui + Radix UI
- Uso: `import { Button } from '@/components/ui/button'`

### Tipos TypeScript

- Database types: `lib/supabase/types.ts`
- Component props: Definir inline o en archivo separado
- Usar `type` para props, `interface` para objetos complejos

---

**Este documento está en constante evolución. Si encuentras algo desactualizado o faltante, por favor abre un issue o PR.**
