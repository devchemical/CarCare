import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

/**
 * Caché en memoria para sesiones (evita múltiples validaciones)
 * Expira después de 60 segundos
 */
const sessionCache = new Map<
  string,
  {
    userId: string | null
    timestamp: number
  }
>()

const CACHE_TTL = 60 * 1000 // 60 segundos

/**
 * Limpiar entradas expiradas del caché
 */
function cleanExpiredCache() {
  const now = Date.now()
  for (const [key, value] of sessionCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      sessionCache.delete(key)
    }
  }
}

/**
 * Generar key de caché basada en cookies de sesión
 */
function getCacheKey(cookies: any): string {
  const authToken = cookies.get("sb-access-token")?.value || ""
  const refreshToken = cookies.get("sb-refresh-token")?.value || ""
  return `${authToken.slice(0, 20)}-${refreshToken.slice(0, 20)}`
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    }
  )

  // Rutas públicas y especiales
  const isAuthRoute = request.nextUrl.pathname.startsWith("/auth")
  const isPublicRoute = request.nextUrl.pathname === "/"
  const isNextRoute = request.nextUrl.pathname.startsWith("/_next")
  const isApiRoute = request.nextUrl.pathname.startsWith("/api")
  const isLogoutRedirect = request.nextUrl.searchParams.has("logout")
  const isCallbackRoute = request.nextUrl.pathname === "/auth/callback"

  // Permitir acceso sin validación a rutas especiales
  if (isNextRoute || isApiRoute || isCallbackRoute) {
    return supabaseResponse
  }

  // Si hay parámetro logout, limpiar caché inmediatamente
  const cacheKey = getCacheKey(request.cookies)
  if (isLogoutRedirect) {
    sessionCache.delete(cacheKey)
  }

  const cached = sessionCache.get(cacheKey)
  const now = Date.now()

  let user = null

  // Si hay caché válido y NO es un logout, usar ese valor
  if (cached && now - cached.timestamp < CACHE_TTL && !isLogoutRedirect) {
    user = cached.userId ? { id: cached.userId } : null
  } else {
    // Si no hay caché o es un logout, validar con Supabase
    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser()

    user = supabaseUser

    // Actualizar caché solo si NO es un logout
    if (!isLogoutRedirect) {
      sessionCache.set(cacheKey, {
        userId: user?.id || null,
        timestamp: now,
      })
    }

    // Limpiar caché periódicamente
    if (Math.random() < 0.1) {
      // 10% de probabilidad
      cleanExpiredCache()
    }
  }

  // === LÓGICA DE REDIRECCIONES ===

  // Si usuario autenticado intenta acceder a rutas de auth (excepto callback)
  // IMPORTANTE: No redirigir si no hay usuario, permitir acceso al login
  if (user && isAuthRoute && !isCallbackRoute) {
    const url = request.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  // Si usuario NO autenticado intenta acceder a rutas protegidas
  if (!user && !isAuthRoute && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    // Preservar URL original para redirección después de login
    url.searchParams.set("redirect", request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
