import { type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

/**
 * Middleware de Next.js
 *
 * Responsabilidades:
 * 1. Gestión de sesiones de Supabase (refresh de tokens, cookies)
 * 2. Protección de rutas (redirección a login si no autenticado)
 *
 * Nota: El rate limiting de auth se maneja en las Server Actions (app/auth/actions.ts)
 * ya que las Server Actions no pasan por este middleware de la misma manera que los
 * endpoints HTTP tradicionales.
 */
export async function middleware(request: NextRequest) {
  // Actualizar sesión de Supabase (refresh tokens, cookies, redirecciones)
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
