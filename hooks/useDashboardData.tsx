"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/hooks/useSupabase";

interface AuthUser {
  id: string;
  email?: string;
}

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  license_plate?: string;
  vin?: string;
  color?: string;
  mileage: number;
  created_at: string;
  updated_at: string;
}

interface Profile {
  id: string;
  full_name?: string;
  email: string;
}

interface DashboardData {
  user: AuthUser | null;
  profile: Profile | null;
  vehicles: Vehicle[];
  maintenanceRecords: any[];
  upcomingMaintenance: any[];
  isLoading: boolean;
}

export function useDashboardData(): DashboardData & {
  signOut: () => Promise<void>;
} {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<any[]>([]);
  const [upcomingMaintenance, setUpcomingMaintenance] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = useSupabase();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Verificar autenticación
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (authUser) {
          setUser({ id: authUser.id, email: authUser.email });

          // Crear un perfil básico sin consultar la base de datos
          const basicProfile = {
            id: authUser.id,
            email: authUser.email || "",
            full_name:
              authUser.user_metadata?.name ||
              authUser.email?.split("@")[0] ||
              "Usuario",
          };
          setProfile(basicProfile);

          // Por ahora, usar datos vacíos para vehículos y mantenimiento
          setVehicles([]);
          setMaintenanceRecords([]);
          setUpcomingMaintenance([]);
        } else {
          // Limpiar estado si no hay usuario
          setUser(null);
          setProfile(null);
          setVehicles([]);
          setMaintenanceRecords([]);
          setUpcomingMaintenance([]);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email });

        // Crear perfil básico
        const basicProfile = {
          id: session.user.id,
          email: session.user.email || "",
          full_name:
            session.user.user_metadata?.name ||
            session.user.email?.split("@")[0] ||
            "Usuario",
        };
        setProfile(basicProfile);

        // Datos vacíos por ahora
        setVehicles([]);
        setMaintenanceRecords([]);
        setUpcomingMaintenance([]);
      } else {
        // Limpiar estado cuando se cierra sesión
        setUser(null);
        setProfile(null);
        setVehicles([]);
        setMaintenanceRecords([]);
        setUpcomingMaintenance([]);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const loadProfile = async (userId: string) => {
    try {
      console.log("Loading profile for user:", userId);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.log("Profile error:", error);
        // Si no existe el perfil, crear uno básico
        if (error.code === "PGRST116") {
          console.log("Creating basic profile...");
          const { data: user } = await supabase.auth.getUser();
          if (user.user) {
            const basicProfile = {
              id: userId,
              email: user.user.email || "",
              full_name:
                user.user.user_metadata?.name ||
                user.user.email?.split("@")[0] ||
                "Usuario",
            };
            setProfile(basicProfile);
          }
        }
      } else if (data) {
        console.log("Profile loaded:", data);
        setProfile(data);
      }
    } catch (error) {
      console.log("Profile load error:", error);
    }
  };

  const loadVehicles = async (userId: string) => {
    try {
      console.log("Loading vehicles for user:", userId);
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.log("Vehicles error:", error);
      } else if (data) {
        console.log("Vehicles loaded:", data.length);
        setVehicles(data);
      }
    } catch (error) {
      console.log("Vehicles load error:", error);
    }
  };

  const loadMaintenanceRecords = async (userId: string) => {
    try {
      console.log("Loading maintenance records for user:", userId);
      const { data, error } = await supabase
        .from("maintenance_records")
        .select(
          `
          *,
          vehicles (
            make,
            model,
            year
          )
        `
        )
        .eq("user_id", userId)
        .order("service_date", { ascending: false })
        .limit(10);

      if (error) {
        console.log("Maintenance records error:", error);
      } else if (data) {
        console.log("Maintenance records loaded:", data.length);
        // Transformar los datos para que coincidan con el tipo esperado
        const transformedData = data.map((record) => ({
          ...record,
          type: record.service_type,
          vehicles: record.vehicles,
        }));
        setMaintenanceRecords(transformedData);
      }
    } catch (error) {
      console.log("Maintenance records load error:", error);
    }
  };

  const loadUpcomingMaintenance = async (userId: string) => {
    try {
      console.log("Loading upcoming maintenance for user:", userId);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const { data, error } = await supabase
        .from("maintenance_records")
        .select(
          `
          *,
          vehicles (
            make,
            model,
            year,
            license_plate
          )
        `
        )
        .eq("user_id", userId)
        .not("next_service_date", "is", null)
        .lte("next_service_date", thirtyDaysFromNow.toISOString().split("T")[0])
        .order("next_service_date", { ascending: true });

      if (error) {
        console.log("Upcoming maintenance error:", error);
      } else if (data) {
        console.log("Upcoming maintenance loaded:", data.length);
        setUpcomingMaintenance(data);
      }
    } catch (error) {
      console.log("Upcoming maintenance load error:", error);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setVehicles([]);
    setMaintenanceRecords([]);
    setUpcomingMaintenance([]);
  };

  return {
    user,
    profile,
    vehicles,
    maintenanceRecords,
    upcomingMaintenance,
    isLoading,
    signOut,
  };
}
