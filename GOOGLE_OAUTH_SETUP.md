# Configuración de Google OAuth para Keepel

Esta guía te ayudará a configurar la autenticación con Google en tu aplicación Keepel.

## 📋 Requisitos previos

- Cuenta de Google Cloud Platform
- Proyecto de Supabase configurado
- Variables de entorno de Supabase configuradas

## 🔧 Paso 1: Configurar Google Cloud Console

### 1.1 Crear un proyecto (opcional)

Si no tienes un proyecto de Google Cloud:

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente

### 1.2 Habilitar Google+ API

1. En el dashboard de Google Cloud Console
2. Ve a **APIs & Services** > **Library**
3. Busca "Google+ API" y habilítala
4. También habilita "People API" (recomendado)

### 1.3 Configurar OAuth consent screen

1. Ve a **APIs & Services** > **OAuth consent screen**
2. Selecciona **External** como User Type
3. Completa la información requerida:
   - **App name**: Keepel
   - **User support email**: tu email
   - **Developer contact information**: tu email
4. En **Scopes**, añade:
   - `userinfo.email`
   - `userinfo.profile`
5. En **Test users** (para desarrollo), añade tu email

### 1.4 Crear credenciales OAuth

1. Ve a **APIs & Services** > **Credentials**
2. Haz clic en **+ CREATE CREDENTIALS** > **OAuth client ID**
3. Selecciona **Web application**
4. Configura:
   - **Name**: Keepel Web Client
   - **Authorized JavaScript origins**:
     ```
     http://localhost:3000
     https://tu-dominio.vercel.app
     ```
   - **Authorized redirect URIs**:
     ```
     http://localhost:3000/auth/callback
     https://tu-dominio.vercel.app/auth/callback
     https://tu-proyecto.supabase.co/auth/v1/callback
     ```

⚠️ **Importante**: Reemplaza `tu-dominio` y `tu-proyecto` con tus valores reales.

## 🔐 Paso 2: Configurar Supabase

### 2.1 Configurar Google OAuth en Supabase

1. Ve a tu [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Authentication** > **Providers**
4. Habilita **Google**
5. Ingresa las credenciales de Google Cloud:
   - **Client ID**: Desde Google Cloud Console
   - **Client Secret**: Desde Google Cloud Console

### 2.2 Configurar Site URL

1. En Supabase Dashboard, ve a **Authentication** > **URL Configuration**
2. Configura:
   - **Site URL**: `https://tu-dominio.vercel.app` (producción)
   - **Redirect URLs**:
     ```
     http://localhost:3000/auth/callback
     https://tu-dominio.vercel.app/auth/callback
     ```

## 🌐 Paso 3: Variables de entorno

Actualiza tu archivo `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key

# Opcional: Google OAuth (si necesitas configuración adicional)
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
```

## 🚀 Paso 4: Desplegar en Vercel

### 4.1 Configurar variables de entorno en Vercel

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Ve a **Settings** > **Environment Variables**
3. Añade todas las variables de `.env.local`

### 4.2 Actualizar URLs en Google Cloud

Una vez desplegado, actualiza las URLs autorizadas en Google Cloud Console con tu dominio real de Vercel.

## 🧪 Paso 5: Probar la configuración

### 5.1 Desarrollo local

```bash
npm run dev
```

1. Ve a `http://localhost:3000/auth/login`
2. Haz clic en "Continuar con Google"
3. Verifica que la autenticación funcione correctamente

### 5.2 Producción

1. Ve a tu dominio de Vercel
2. Prueba el flujo completo de autenticación
3. Verifica que redirija correctamente al dashboard

## 🔍 Solución de problemas

### Error: "redirect_uri_mismatch"

- Verifica que las URLs de redirección en Google Cloud Console coincidan exactamente
- Asegúrate de incluir tanto localhost como tu dominio de producción

### Error: "Invalid client"

- Verifica que el Client ID y Client Secret estén correctos en Supabase
- Confirma que la Google+ API esté habilitada

### Error: "Access blocked"

- Verifica la configuración del OAuth consent screen
- Asegúrate de que tu email esté en la lista de usuarios de prueba (para apps no verificadas)

### La autenticación funciona pero no redirige

- Verifica la configuración de Site URL en Supabase
- Confirma que las Redirect URLs estén configuradas correctamente

## 📚 Recursos adicionales

- [Documentación de Supabase Auth](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Auth with Google](https://supabase.com/docs/guides/auth/social-login/auth-google)

## ✅ Lista de verificación

- [ ] Proyecto de Google Cloud creado/seleccionado
- [ ] Google+ API habilitada
- [ ] OAuth consent screen configurado
- [ ] Credenciales OAuth creadas
- [ ] Google OAuth habilitado en Supabase
- [ ] Client ID y Secret configurados en Supabase
- [ ] Site URL configurado en Supabase
- [ ] Redirect URLs configuradas
- [ ] Variables de entorno actualizadas
- [ ] Configuración desplegada en Vercel
- [ ] URLs actualizadas en Google Cloud para producción
- [ ] Flujo de autenticación probado en desarrollo
- [ ] Flujo de autenticación probado en producción

---

¡Una vez completados todos los pasos, la autenticación con Google debería funcionar perfectamente en tu aplicación Keepel! 🎉
