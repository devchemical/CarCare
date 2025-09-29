"use client";

import { Dashboard } from "@/components/dashboard/Dashboard";
import { LandingPage } from "@/components/home/LandingPage";
import { Layout } from "@/components/layout/Layout";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { useAuth, useData } from "@/contexts";

export default function HomePage() {
  const { user, profile, isLoading: authLoading, signOut } = useAuth();
  const {
    vehicles,
    maintenanceRecords,
    upcomingMaintenance,
    isLoading: dataLoading,
    refreshAll
  } = useData();

  const isLoading = authLoading || dataLoading;

  // Debug logging
  console.log('HomePage state:', {
    authLoading,
    dataLoading,
    isLoading,
    user: !!user,
    isAuthenticated: !!user
  });

  // Mostrar loading mientras se carga
  if (isLoading) {
    return <LoadingScreen message="Cargando datos del dashboard..." />;
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
          onRefresh={refreshAll}
        />
      ) : (
        <LandingPage />
      )}
    </Layout>
  );
}
