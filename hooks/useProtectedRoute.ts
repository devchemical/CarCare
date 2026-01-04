/**
 * Hook para proteger rutas que requieren autenticación
 * Redirige automáticamente a login si el usuario no está autenticado
 */

"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts"

interface UseProtectedRouteOptions {
  redirectTo?: string
  onUnauthorized?: () => void
}

export function useProtectedRoute(options: UseProtectedRouteOptions = {}) {
  const { redirectTo = "/auth/login", onUnauthorized } = options
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Esperar a que termine de cargar
    if (isLoading) return

    // Si no hay usuario, redirigir
    if (!user) {
      if (onUnauthorized) {
        onUnauthorized()
      }
      router.push(redirectTo)
    }
  }, [user, isLoading, router, redirectTo, onUnauthorized])

  return {
    user,
    isLoading,
    isProtected: !!user,
  }
}
