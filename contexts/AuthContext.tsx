"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import { authManager } from "@/lib/auth/authManager"
import type { User } from "@supabase/supabase-js"

export interface AuthUser {
  id: string
  email?: string
}

export interface Profile {
  id: string
  full_name?: string
  email: string
}

interface AuthContextType {
  user: AuthUser | null
  profile: Profile | null
  isLoading: boolean
  isLoggingOut: boolean
  isAuthenticated: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const supabase = authManager.getSupabase()

  const loadProfile = useCallback(
    async (userId: string) => {
      try {
        const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

        if (error && error.code !== "PGRST116") {
          console.error("Profile error:", error)
        } else if (data) {
          setProfile(data)
        }
      } catch (error) {
        console.error("Profile load error:", error)
      }
    },
    [supabase]
  )

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await loadProfile(user.id)
    }
  }, [user?.id, loadProfile])

  useEffect(() => {
    // Suscribirse a cambios de estado del AuthManager
    const unsubscribe = authManager.subscribe((state) => {
      setIsLoading(state.isLoading)

      if (state.user) {
        // Usuario autenticado
        setUser({
          id: state.user.id,
          email: state.user.email,
        })

        // Crear perfil básico desde metadata
        const basicProfile: Profile = {
          id: state.user.id,
          email: state.user.email || "",
          full_name:
            state.user.user_metadata?.name ||
            state.user.user_metadata?.full_name ||
            state.user.email?.split("@")[0] ||
            "Usuario",
        }
        setProfile(basicProfile)

        // Cargar perfil completo desde BD
        loadProfile(state.user.id)
      } else {
        // Usuario no autenticado
        setUser(null)
        setProfile(null)
      }
    })

    // Cleanup
    return () => {
      unsubscribe()
    }
  }, [loadProfile])

  const signOut = async () => {
    // Prevenir múltiples intentos simultáneos
    if (isLoggingOut) return

    try {
      setIsLoggingOut(true)

      // Usar AuthManager para cerrar sesión
      await authManager.signOut()

      // Redirigir al login
      if (typeof window !== "undefined") {
        window.location.href = `/auth/login?logout=${Date.now()}`
      }
    } catch (error) {
      console.error("Error durante sign out:", error)

      // Forzar redirección incluso si hay error
      if (typeof window !== "undefined") {
        window.location.href = `/auth/login?logout=${Date.now()}`
      }
    }
  }

  const value: AuthContextType = {
    user,
    profile,
    isLoading,
    isLoggingOut,
    isAuthenticated: !!user,
    signOut,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
