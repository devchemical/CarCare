"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Car, User, LogOut, Plus, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth, useData, useSupabase } from "@/contexts"
import { InstallButton } from "@/components/pwa/install-prompt"

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  license_plate?: string
}

export function Header() {
  const { user, profile, isLoading: authLoading, signOut } = useAuth()
  const { vehicles } = useData()
  const [showVehiclesDropdown, setShowVehiclesDropdown] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const router = useRouter()

  const handleVehicleSelect = (vehicleId: string) => {
    router.push(`/vehicles/${vehicleId}/maintenance`)
    setShowVehiclesDropdown(false)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  // Mostrar skeleton durante la carga inicial para evitar parpadeo
  if (authLoading) {
    return (
      <header className="border-border/50 bg-background/80 sticky top-0 z-50 border-b backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          {/* Logo y nombre */}
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <Car className="text-primary h-8 w-8" />
            <h1 className="text-foreground text-2xl font-bold">CarCare</h1>
          </Link>

          {/* Skeleton para el área de navegación */}
          <div className="flex items-center gap-4">
            <div className="bg-muted hidden h-4 w-20 animate-pulse rounded sm:block"></div>
            <div className="bg-muted h-8 w-24 animate-pulse rounded"></div>
            <div className="bg-muted h-8 w-8 animate-pulse rounded-full"></div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="border-border/50 bg-background/80 sticky top-0 z-50 border-b backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        {/* Logo y nombre */}
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <Car className="text-primary h-8 w-8" />
          <h1 className="text-foreground text-2xl font-bold">CarCare</h1>
        </Link>

        {/* Navegación del usuario autenticado */}
        {user ? (
          <div className="flex items-center gap-4">
            {/* Saludo al usuario */}
            <span className="text-muted-foreground hidden text-sm sm:block">
              Hola, {profile?.full_name || user.email?.split("@")[0]}
            </span>

            {/* Dropdown de Vehículos */}
            <div
              className="group relative"
              onMouseEnter={() => setShowVehiclesDropdown(true)}
              onMouseLeave={() => setShowVehiclesDropdown(false)}
            >
              <DropdownMenu open={showVehiclesDropdown} onOpenChange={setShowVehiclesDropdown}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/vehicles")}
                    className="hover:bg-accent cursor-pointer"
                  >
                    <Car className="mr-2 h-4 w-4" />
                    Vehículos
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  {/* Opción para añadir vehículo */}
                  <DropdownMenuItem asChild>
                    <Link href="/vehicles" className="cursor-pointer">
                      <Plus className="mr-2 h-4 w-4" />
                      Añadir Vehículo
                    </Link>
                  </DropdownMenuItem>

                  {/* Separador si hay vehículos */}
                  {vehicles.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Mis Vehículos</DropdownMenuLabel>
                    </>
                  )}

                  {/* Lista de vehículos */}
                  {vehicles.length > 0 ? (
                    vehicles.map((vehicle) => (
                      <DropdownMenuItem key={vehicle.id} asChild>
                        <Link href={`/vehicles/${vehicle.id}`} className="flex cursor-pointer items-center">
                          <Car className="text-muted-foreground mr-2 h-4 w-4" />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {vehicle.make} {vehicle.model} {vehicle.year}
                            </span>
                            {vehicle.license_plate && (
                              <span className="text-muted-foreground text-xs">{vehicle.license_plate}</span>
                            )}
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <DropdownMenuItem disabled>
                      <span className="text-muted-foreground text-sm">No hay vehículos añadidos</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Botón de instalación PWA */}
            <InstallButton />

            {/* Dropdown del usuario */}
            <div
              className="group relative"
              onMouseEnter={() => setShowUserDropdown(true)}
              onMouseLeave={() => setShowUserDropdown(false)}
            >
              <DropdownMenu open={showUserDropdown} onOpenChange={setShowUserDropdown}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="hover:bg-accent flex cursor-pointer items-center gap-2">
                    <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
                      <User className="text-primary h-4 w-4" />
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {/* Información del usuario */}
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm leading-none font-medium">{profile?.full_name || "Usuario"}</p>
                      <p className="text-muted-foreground text-xs leading-none">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  {/* Cerrar sesión */}
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ) : (
          /* Botones para usuarios no autenticados */
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Iniciar Sesión</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">Registrarse</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
