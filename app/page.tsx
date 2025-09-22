"use client";

import { Car } from "lucide-react";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { LandingPage } from "@/components/home/LandingPage";
import { Layout } from "@/components/layout/Layout";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function HomePage() {
  const {
    user,
    profile,
    vehicles,
    maintenanceRecords,
    upcomingMaintenance,
    isLoading,
    signOut,
  } = useDashboardData();

  // Mostrar loading mientras se carga
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="flex flex-col items-center gap-4">
          <Car className="h-8 w-8 text-primary animate-pulse" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  // Renderizado condicional basado en autenticación
  return (
    <Layout showHeader={true}>
      {user ? (
        <Dashboard
          user={user}
          profile={profile}
          vehicles={vehicles}
          maintenanceRecords={maintenanceRecords}
          upcomingMaintenance={upcomingMaintenance}
          onSignOut={signOut}
        />
      ) : (
        <LandingPage />
      )}
    </Layout>
  );
}
