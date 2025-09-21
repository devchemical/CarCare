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

          // Cargar datos del usuario autenticado
          await Promise.all([
            loadProfile(authUser.id),
            loadVehicles(authUser.id),
            loadMaintenanceRecords(authUser.id),
            loadUpcomingMaintenance(authUser.id),
          ]);
        }
      } catch (error) {
        // Silenciosamente manejar errores
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [supabase]);

  const loadProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (data) setProfile(data);
  };

  const loadVehicles = async (userId: string) => {
    const { data } = await supabase
      .from("vehicles")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (data) setVehicles(data);
  };

  const loadMaintenanceRecords = async (userId: string) => {
    const { data } = await supabase
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

    if (data) {
      // Transformar los datos para que coincidan con el tipo esperado
      const transformedData = data.map((record) => ({
        ...record,
        type: record.service_type,
        vehicles: record.vehicles,
      }));
      setMaintenanceRecords(transformedData);
    }
  };

  const loadUpcomingMaintenance = async (userId: string) => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const { data } = await supabase
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

    if (data) {
      // Transformar los datos para que coincidan con el tipo esperado
      const transformedData = data
        .filter((record) => record.next_service_date)
        .map((record) => ({
          ...record,
          type: record.service_type,
          next_service_date: record.next_service_date,
          vehicles: record.vehicles,
        }));
      setUpcomingMaintenance(transformedData);
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
