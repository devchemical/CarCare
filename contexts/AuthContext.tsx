"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useSupabase } from "./SupabaseContext"
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
  const [isLoading, setIsLoading] = useState(true) // Start as true to prevent flash
  const [isLoggingOut, setIsLoggingOut] = useState(false) // Loading state for logout
  const supabase = useSupabase()

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
    let isMounted = true

    const initAuth = async () => {
      // Set a very short loading state to prevent flash
      setTimeout(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      }, 100)

      try {
        // Try to get session asynchronously after initial render
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (!isMounted) {
          return
        }

        if (sessionError) {
          // Only log error if it's not the expected "session missing" error
          if (sessionError.name !== "AuthSessionMissingError") {
            console.error("Session error:", sessionError)
          }
          setUser(null)
          setProfile(null)
          setIsLoading(false)
          return
        }

        // If we have a session, use the user from it
        if (session?.user) {
          const authUser = session.user
          setUser({ id: authUser.id, email: authUser.email })

          // Create basic profile from auth metadata
          const basicProfile = {
            id: authUser.id,
            email: authUser.email || "",
            full_name:
              authUser.user_metadata?.name ||
              authUser.user_metadata?.full_name ||
              authUser.email?.split("@")[0] ||
              "Usuario",
          }
          setProfile(basicProfile)

          // Try to load full profile from database
          await loadProfile(authUser.id)
        } else {
          // Fallback to getUser() if no session
          const {
            data: { user: authUser },
            error: authError,
          } = await supabase.auth.getUser()

          if (!isMounted) return

          if (authError) {
            // Only log error if it's not the expected "session missing" error
            if (authError.name !== "AuthSessionMissingError") {
              console.error("Auth error:", authError)
            }
            setUser(null)
            setProfile(null)
            setIsLoading(false)
            return
          }

          if (authUser) {
            setUser({ id: authUser.id, email: authUser.email })

            // Create basic profile from auth metadata
            const basicProfile = {
              id: authUser.id,
              email: authUser.email || "",
              full_name:
                authUser.user_metadata?.name ||
                authUser.user_metadata?.full_name ||
                authUser.email?.split("@")[0] ||
                "Usuario",
            }
            setProfile(basicProfile)

            // Try to load full profile from database
            await loadProfile(authUser.id)
          } else {
            setUser(null)
            setProfile(null)
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
        setUser(null)
        setProfile(null)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    // No timeout needed - auth resolves immediately or shows content

    // Initialize auth
    initAuth()

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      console.log("🔔 Auth state change:", event, "Session:", !!session)

      if (!isMounted) return

      if (event === "SIGNED_IN" && session?.user) {
        console.log("✅ User signed in:", session.user.email)
        setUser({ id: session.user.id, email: session.user.email })

        const basicProfile = {
          id: session.user.id,
          email: session.user.email || "",
          full_name:
            session.user.user_metadata?.name ||
            session.user.user_metadata?.full_name ||
            session.user.email?.split("@")[0] ||
            "Usuario",
        }
        setProfile(basicProfile)

        await loadProfile(session.user.id)
      } else if (event === "SIGNED_OUT") {
        console.log("🚪 User signed out event received")
        setUser(null)
        setProfile(null)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [supabase, loadProfile])

  const signOut = async () => {
    console.log("🚀 Starting signOut process...")

    // Prevent multiple simultaneous logout attempts
    if (isLoggingOut) {
      console.log("⚠️ Logout already in progress")
      return
    }

    try {
      setIsLoggingOut(true)

      // 1. Clear local state FIRST for immediate UI feedback
      console.log("🧹 Clearing local state...")
      setUser(null)
      setProfile(null)

      // 2. Manual cookie cleanup FIRST (most aggressive approach)
      console.log("🍪 Manually clearing ALL auth cookies...")
      if (typeof document !== "undefined") {
        const cookies = document.cookie.split(";")
        const cookiesToDelete = []

        for (let cookie of cookies) {
          const cookieName = cookie.split("=")[0].trim()
          // Clear all Supabase auth cookies
          if (cookieName.includes("supabase") || cookieName.includes("sb-") || cookieName.startsWith("auth-")) {
            cookiesToDelete.push(cookieName)
          }
        }

        // Delete each cookie with multiple strategies
        for (let cookieName of cookiesToDelete) {
          // Strategy 1: Delete with path=/
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
          // Strategy 2: Delete with domain
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`
          // Strategy 3: Delete with root domain
          const rootDomain = window.location.hostname.split(".").slice(-2).join(".")
          if (rootDomain !== window.location.hostname) {
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${rootDomain};`
          }
          console.log(`  ✓ Cleared cookie: ${cookieName}`)
        }
      }

      // 3. Call Supabase signOut API
      console.log("🔐 Calling supabase.auth.signOut()...")
      try {
        await supabase.auth.signOut()
        console.log("✅ SignOut API call successful")
      } catch (signOutError) {
        console.error("⚠️ SignOut error (continuing anyway):", signOutError)
      }

      console.log("✅ Cookie cleanup complete")

      // 4. Force immediate redirect with cache busting
      console.log("🔄 Forcing redirect to /auth/login...")

      if (typeof window !== "undefined") {
        // Add timestamp to prevent caching
        const timestamp = Date.now()
        window.location.href = `/auth/login?logout=${timestamp}`
      }
    } catch (error) {
      console.error("❌ Critical error during sign out:", error)

      // Emergency cleanup
      setUser(null)
      setProfile(null)

      // Force redirect regardless of errors
      if (typeof window !== "undefined") {
        window.location.href = `/auth/login?logout=${Date.now()}`
      }
    }
    // Note: No finally block to reset isLoggingOut because we're doing a hard redirect
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
