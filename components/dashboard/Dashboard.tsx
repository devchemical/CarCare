"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Car, CheckCircle } from "lucide-react";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { UpcomingMaintenance } from "@/components/dashboard/upcoming-maintenance";
import { VehicleOverview } from "@/components/dashboard/vehicle-overview";

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

interface DashboardProps {
  user: {
    id: string;
    email?: string;
  };
  profile: Profile | null;
  vehicles: Vehicle[];
  maintenanceRecords: any[];
  upcomingMaintenance: any[];
  onSignOut: () => void;
}

interface ExtendedDashboardProps extends DashboardProps {
  onRefresh?: () => void;
}

export function Dashboard({
  user,
  profile,
  vehicles,
  maintenanceRecords,
  upcomingMaintenance,
  onSignOut,
  onRefresh,
}: ExtendedDashboardProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Panel de Control
        </h2>
        <p className="text-muted-foreground">
          Resumen de tus vehículos y mantenimientos
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/vehicles">
            <Car className="h-4 w-4 mr-2" />
            Ver Vehículos
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/vehicles">
            <CheckCircle className="h-4 w-4 mr-2" />
            Agregar Vehículo
          </Link>
        </Button>
        {onRefresh && (
          <Button variant="secondary" onClick={onRefresh}>
            Actualizar Datos
          </Button>
        )}
      </div>

      {/* Dashboard Stats */}
      <DashboardStats
        vehicles={vehicles}
        maintenanceRecords={maintenanceRecords}
      />

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        {/* Left Column - Vehicle Overview */}
        <div className="lg:col-span-2 space-y-6">
          <VehicleOverview vehicles={vehicles} />
          <RecentActivity maintenanceRecords={maintenanceRecords} />
        </div>

        {/* Right Column - Upcoming Maintenance */}
        <div className="space-y-6">
          <UpcomingMaintenance upcomingMaintenance={upcomingMaintenance} />
        </div>
      </div>
    </div>
  );
}
