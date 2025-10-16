"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GoogleSignInButton } from "@/components/auth/google-signin-button"
import { Layout } from "../../../components/layout/Layout"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useSupabase } from "@/hooks/useSupabase"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = useSupabase()

  // Ensure we're fully logged out when landing on login page
  useEffect(() => {
    const clearSession = async () => {
      try {
        // Check if we're coming from a logout action
        const urlParams = new URLSearchParams(window.location.search)
        const isLogout = urlParams.has("logout")

        if (isLogout) {
          console.log("🧹 Login page: Logout detected, performing aggressive cleanup...")

          // Force sign out again to be absolutely sure
          await supabase.auth.signOut()

          // Clear local storage
          if (typeof window !== "undefined") {
            Object.keys(localStorage).forEach((key) => {
              if (key.includes("supabase") || key.includes("sb-")) {
                localStorage.removeItem(key)
                console.log(`  ✓ Cleared localStorage: ${key}`)
              }
            })

            // Clear session storage
            Object.keys(sessionStorage).forEach((key) => {
              if (key.includes("supabase") || key.includes("sb-")) {
                sessionStorage.removeItem(key)
                console.log(`  ✓ Cleared sessionStorage: ${key}`)
              }
            })
          }

          // Clean up the URL
          window.history.replaceState({}, document.title, "/auth/login")
          console.log("✅ Aggressive cleanup complete")
        } else {
          // Regular check
          const {
            data: { session },
          } = await supabase.auth.getSession()

          if (session) {
            console.log("🧹 Login page: Found existing session, clearing...")
            await supabase.auth.signOut()
          }
        }
      } catch (error) {
        console.error("Error clearing session on login page:", error)
      }
    }

    clearSession()
  }, [supabase])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (!data?.user || !data?.session) {
        throw new Error("No se pudo crear la sesión")
      }

      await new Promise((resolve) => setTimeout(resolve, 100))

      router.refresh()
      router.push("/")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Layout showHeader={true}>
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Card className="border-border/50 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-foreground text-2xl">Iniciar Sesión</CardTitle>
              <CardDescription className="text-muted-foreground">
                Ingresa tus credenciales para acceder a tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-foreground">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="text-foreground">
                      Contraseña
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-input border-border"
                    />
                  </div>
                  {error && (
                    <div className="text-destructive-foreground bg-destructive/10 border-destructive/20 rounded-md border p-3 text-sm">
                      {error}
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground w-full cursor-pointer"
                    disabled={isLoading}
                  >
                    {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="border-border w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background text-muted-foreground px-2">O continúa con</span>
                    </div>
                  </div>

                  <GoogleSignInButton className="w-full cursor-pointer" supabaseClient={supabase} />
                </div>
                <div className="text-muted-foreground mt-4 text-center text-sm">
                  ¿No tienes una cuenta?{" "}
                  <Link href="/auth/signup" className="text-primary hover:text-primary/80 underline underline-offset-4">
                    Regístrate
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
