/**
 * Hook para rutas que solo deben ser accesibles por usuarios NO autenticados
 * Redirige automáticamente al dashboard si el usuario ya está autenticado
 */

"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts"

interface UseGuestRouteOptions {
  redirectTo?: string
  onAuthenticated?: () => void
}

export function useGuestRoute(options: UseGuestRouteOptions = {}) {
  const { redirectTo = "/", onAuthenticated } = options
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Esperar a que termine de cargar
    if (isLoading) return

    // Si hay usuario, redirigir
    if (user) {
      if (onAuthenticated) {
        onAuthenticated()
      }
      router.push(redirectTo)
    }
  }, [user, isLoading, router, redirectTo, onAuthenticated])

  return {
    isLoading,
    isGuest: !user,
  }
}
