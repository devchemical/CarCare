"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Car, User, LogOut, Plus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSupabase } from "@/hooks/useSupabase";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  license_plate?: string;
}

interface Profile {
  id: string;
  full_name?: string;
  email: string;
}

export function Header() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [showVehiclesDropdown, setShowVehiclesDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = useSupabase();

  useEffect(() => {
    const getUser = async () => {
      try {
        setIsLoading(true);
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // Obtener el perfil del usuario
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          // Actualizar estados en lote para reducir re-renders
          setUser(user);
          setProfile(profile);
        } else {
          setUser(null);
          setProfile(null);
          setVehicles([]);
        }
      } catch (error) {
        // Silenciosamente manejar errores
        setUser(null);
        setProfile(null);
        setVehicles([]);
      } finally {
        setIsLoading(false);
      }
    };

    getUser();

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        // Actualizar estados en lote
        setUser(session.user);
        setProfile(profile);
      } else {
        setUser(null);
        setProfile(null);
        setVehicles([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadVehicles(user.id);
    }
  }, [user]);

  const loadVehicles = async (userId: string) => {
    try {
      const { data } = await supabase
        .from("vehicles")
        .select("id, make, model, year, license_plate")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (data) setVehicles(data);
    } catch (error) {
      // Silenciosamente manejar errores
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  // Mostrar skeleton durante la carga inicial para evitar parpadeo
  if (isLoading) {
    return (
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo y nombre */}
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Car className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">CarCare</h1>
          </Link>

          {/* Skeleton para el área de navegación */}
          <div className="flex items-center gap-4">
            <div className="h-4 w-20 bg-muted rounded animate-pulse hidden sm:block"></div>
            <div className="h-8 w-24 bg-muted rounded animate-pulse"></div>
            <div className="h-8 w-8 bg-muted rounded-full animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo y nombre */}
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Car className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">CarCare</h1>
        </Link>

        {/* Navegación del usuario autenticado */}
        {user ? (
          <div className="flex items-center gap-4">
            {/* Saludo al usuario */}
            <span className="text-sm text-muted-foreground hidden sm:block">
              Hola, {profile?.full_name || user.email?.split("@")[0]}
            </span>

            {/* Dropdown de Vehículos */}
            <div
              className="group relative"
              onMouseEnter={() => setShowVehiclesDropdown(true)}
              onMouseLeave={() => setShowVehiclesDropdown(false)}
            >
              <DropdownMenu
                open={showVehiclesDropdown}
                onOpenChange={setShowVehiclesDropdown}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/vehicles")}
                    className="hover:bg-accent cursor-pointer"
                  >
                    <Car className="h-4 w-4 mr-2" />
                    Vehículos
                    <ChevronDown className="h-4 w-4 ml-2" />
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
                        <Link
                          href={`/vehicles/${vehicle.id}`}
                          className="cursor-pointer flex items-center"
                        >
                          <Car className="mr-2 h-4 w-4 text-muted-foreground" />
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">
                              {vehicle.make} {vehicle.model} {vehicle.year}
                            </span>
                            {vehicle.license_plate && (
                              <span className="text-xs text-muted-foreground">
                                {vehicle.license_plate}
                              </span>
                            )}
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <DropdownMenuItem disabled>
                      <span className="text-muted-foreground text-sm">
                        No hay vehículos añadidos
                      </span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Dropdown del usuario */}
            <div
              className="group relative"
              onMouseEnter={() => setShowUserDropdown(true)}
              onMouseLeave={() => setShowUserDropdown(false)}
            >
              <DropdownMenu
                open={showUserDropdown}
                onOpenChange={setShowUserDropdown}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 hover:bg-accent cursor-pointer"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {/* Información del usuario */}
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {profile?.full_name || "Usuario"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  {/* Cerrar sesión */}
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer"
                  >
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
  );
}
