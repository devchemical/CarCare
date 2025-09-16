# CarCare Pro - Aplicación de Gestión de Mantenimiento Automotriz

Una aplicación web completa para gestionar el mantenimiento de vehículos, construida con Next.js, TailwindCSS y Supabase.

## 🚗 Características

- **Gestión de Vehículos**: Registra y organiza todos tus vehículos con información detallada
- **Programación de Servicios**: Programa y recibe recordatorios de mantenimientos próximos
- **Control de Gastos**: Rastrea costos y analiza patrones de gastos en mantenimiento
- **Historial Completo**: Mantén un registro detallado de todos los servicios realizados
- **Dashboard Intuitivo**: Vista general con estadísticas y próximos mantenimientos
- **Autenticación Segura**: Sistema de login y registro con Supabase Auth
- **Responsive Design**: Funciona perfectamente en dispositivos móviles y desktop

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 15 con App Router
- **Styling**: TailwindCSS v4 con shadcn/ui
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Iconos**: Lucide React
- **Tipografía**: Geist Sans & Geist Mono

## 📋 Requisitos Previos

- Node.js 18+ 
- Cuenta de Supabase
- Variables de entorno configuradas

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio
\`\`\`bash
git clone <repository-url>
cd car-maintenance-app
\`\`\`

### 2. Instalar dependencias
\`\`\`bash
npm install
\`\`\`

### 3. Configurar Supabase

#### Variables de Entorno
Configura las siguientes variables de entorno en tu proyecto:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard
\`\`\`

#### Configurar Base de Datos
Ejecuta los siguientes scripts SQL en tu proyecto de Supabase:

1. **Crear tablas principales** (`scripts/001_create_tables.sql`):
\`\`\`sql
-- Tabla de perfiles de usuario
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de vehículos
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

-- Tabla de registros de mantenimiento
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

-- Políticas RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Políticas para vehicles
CREATE POLICY "Users can view own vehicles" ON vehicles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own vehicles" ON vehicles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own vehicles" ON vehicles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own vehicles" ON vehicles FOR DELETE USING (auth.uid() = user_id);

-- Políticas para maintenance_records
CREATE POLICY "Users can view own maintenance records" ON maintenance_records FOR SELECT 
  USING (auth.uid() = (SELECT user_id FROM vehicles WHERE id = vehicle_id));
CREATE POLICY "Users can insert own maintenance records" ON maintenance_records FOR INSERT 
  WITH CHECK (auth.uid() = (SELECT user_id FROM vehicles WHERE id = vehicle_id));
CREATE POLICY "Users can update own maintenance records" ON maintenance_records FOR UPDATE 
  USING (auth.uid() = (SELECT user_id FROM vehicles WHERE id = vehicle_id));
CREATE POLICY "Users can delete own maintenance records" ON maintenance_records FOR DELETE 
  USING (auth.uid() = (SELECT user_id FROM vehicles WHERE id = vehicle_id));
\`\`\`

2. **Crear trigger para perfiles** (`scripts/002_create_profile_trigger.sql`):
\`\`\`sql
-- Función para crear perfil automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil cuando se registra un usuario
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
\`\`\`

### 4. Ejecutar la aplicación
\`\`\`bash
npm run dev
\`\`\`

La aplicación estará disponible en `http://localhost:3000`

## 📁 Estructura del Proyecto

\`\`\`
car-maintenance-app/
├── app/
│   ├── auth/                    # Páginas de autenticación
│   │   ├── login/
│   │   ├── signup/
│   │   ├── signup-success/
│   │   └── error/
│   ├── dashboard/               # Dashboard principal
│   ├── vehicles/                # Gestión de vehículos
│   │   └── [id]/maintenance/    # Mantenimiento por vehículo
│   ├── layout.tsx
│   ├── page.tsx                 # Landing page
│   └── globals.css
├── components/
│   ├── dashboard/               # Componentes del dashboard
│   ├── vehicles/                # Componentes de vehículos
│   ├── maintenance/             # Componentes de mantenimiento
│   └── ui/                      # Componentes UI (shadcn)
├── lib/
│   └── supabase/                # Configuración de Supabase
│       ├── client.ts
│       ├── server.ts
│       └── middleware.ts
├── scripts/                     # Scripts SQL
└── middleware.ts                # Middleware de Next.js
\`\`\`

## 🎯 Funcionalidades Principales

### Autenticación
- Registro de usuarios con email y contraseña
- Inicio de sesión seguro
- Protección de rutas con middleware
- Gestión automática de sesiones

### Gestión de Vehículos
- Agregar nuevos vehículos con información completa
- Editar datos de vehículos existentes
- Eliminar vehículos (con confirmación)
- Vista de lista con información resumida

### Gestión de Mantenimiento
- Registrar servicios de mantenimiento por vehículo
- Categorización por tipo de servicio
- Control de costos y kilometraje
- Programación de próximos servicios
- Historial completo de mantenimientos

### Dashboard
- Estadísticas generales (vehículos, mantenimientos, costos)
- Vista de próximos mantenimientos
- Actividad reciente
- Navegación rápida a funciones principales

## 🔒 Seguridad

- **Row Level Security (RLS)**: Cada usuario solo puede acceder a sus propios datos
- **Autenticación JWT**: Tokens seguros manejados por Supabase
- **Validación de formularios**: Validación tanto en cliente como servidor
- **Middleware de protección**: Rutas protegidas automáticamente

## 🎨 Diseño

- **Tema automotriz**: Colores verdes que evocan confiabilidad y profesionalismo
- **Responsive**: Diseño adaptable a todos los dispositivos
- **Accesibilidad**: Cumple con estándares de accesibilidad web
- **Componentes reutilizables**: Basado en shadcn/ui para consistencia

## 📱 Uso de la Aplicación

1. **Registro**: Crea una cuenta con email y contraseña
2. **Agregar Vehículos**: Registra tus vehículos con información detallada
3. **Registrar Mantenimientos**: Añade servicios realizados y programa futuros
4. **Monitorear**: Usa el dashboard para seguimiento general
5. **Gestionar**: Edita o elimina información según necesites

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si encuentras algún problema o tienes preguntas:

1. Revisa la documentación de [Supabase](https://supabase.com/docs)
2. Consulta la documentación de [Next.js](https://nextjs.org/docs)
3. Abre un issue en el repositorio

---

**CarCare Pro** - Mantén tus vehículos en perfecto estado 🚗✨
