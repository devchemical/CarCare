"use client"

import { RecentActivity } from "@/components/dashboard/recent-activity"
import { UpcomingMaintenance } from "@/components/dashboard/upcoming-maintenance"
import { VehicleOverview } from "@/components/dashboard/vehicle-overview"
import { DashboardSkeleton } from "@/components/skeletons/dashboard-skeleton"
import type { MaintenanceRecord, ScheduledService, Vehicle } from "@/contexts"

interface DashboardProps {
  vehicles: Vehicle[]
  maintenanceRecords: MaintenanceRecord[]
  upcomingMaintenance: ScheduledService[]
  isLoading?: boolean
}

export function Dashboard({ vehicles, maintenanceRecords, upcomingMaintenance, isLoading }: DashboardProps) {
  if (isLoading) return <DashboardSkeleton />

  return (
    <div className="mx-auto w-full max-w-[1560px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-6 sm:mb-8">
        <p className="mb-1 text-sm font-medium text-green-800">Vista general</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Dashboard</h1>
        <p className="mt-2 text-sm text-[var(--shell-muted)] sm:text-base">
          Tus vehículos y mantenimientos, de un vistazo.
        </p>
      </div>

      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(19rem,0.85fr)] lg:items-start xl:gap-6">
        <section aria-labelledby="vehicles-heading" className="min-w-0 lg:col-start-1 lg:row-start-1">
          <VehicleOverview vehicles={vehicles} />
        </section>
        <section aria-labelledby="pending-heading" className="min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <UpcomingMaintenance upcomingMaintenance={upcomingMaintenance} vehicles={vehicles} />
        </section>
        <section aria-labelledby="history-heading" className="min-w-0 lg:col-start-1 lg:row-start-2">
          <RecentActivity
            maintenanceRecords={maintenanceRecords}
            vehicles={vehicles}
            scheduledServices={upcomingMaintenance}
          />
        </section>
      </div>
    </div>
  )
}
