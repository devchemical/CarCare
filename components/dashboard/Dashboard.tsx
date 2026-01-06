"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Car, CheckCircle } from "lucide-react"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { UpcomingMaintenance } from "@/components/dashboard/upcoming-maintenance"
import { VehicleOverview } from "@/components/dashboard/vehicle-overview"
import { OfflineIndicator } from "@/components/pwa/offline-indicator"

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  license_plate?: string
  vin?: string
  color?: string
  mileage: number
  created_at: string
  updated_at: string
}

interface Profile {
  id: string
  full_name?: string
  email: string
}

interface DashboardProps {
  user: {
    id: string
    email?: string
  }
  profile: Profile | null
  vehicles: Vehicle[]
  maintenanceRecords: any[]
  upcomingMaintenance: any[]
}

export function Dashboard({ user, profile, vehicles, maintenanceRecords, upcomingMaintenance }: DashboardProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-foreground mb-2 text-3xl font-bold">Panel de Control</h2>
        <p className="text-muted-foreground">Resumen de tus vehículos y mantenimientos</p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 flex flex-wrap gap-3">
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/vehicles">
            <Car className="mr-2 h-4 w-4" />
            Ver Vehículos
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/vehicles">
            <CheckCircle className="mr-2 h-4 w-4" />
            Agregar Vehículo
          </Link>
        </Button>
      </div>

      {/* Dashboard Stats */}
      <DashboardStats vehicles={vehicles} maintenanceRecords={maintenanceRecords} />

      {/* Main Content Grid */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Left Column - Vehicle Overview */}
        <div className="space-y-6 lg:col-span-2">
          <VehicleOverview vehicles={vehicles} />
          <RecentActivity maintenanceRecords={maintenanceRecords} />
        </div>

        {/* Right Column - Upcoming Maintenance */}
        <div className="space-y-6">
          <UpcomingMaintenance upcomingMaintenance={upcomingMaintenance} />
        </div>
      </div>

      {/* Offline Indicator */}
      <OfflineIndicator />
    </div>
  )
}
