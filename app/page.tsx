"use client"

import { useAuthProjection, useData } from "@/contexts"
import { Dashboard } from "@/components/dashboard/Dashboard"
import { LandingPage } from "@/components/home/LandingPage"
import { Layout } from "@/components/layout/Layout"
import { AuthenticatedDashboardShell } from "@/components/dashboard/authenticated-dashboard-shell"
import { AUTH_STATE_STATUS } from "@/lib/auth/contracts"

export default function HomePage() {
  const authState = useAuthProjection()
  const { vehicles, maintenanceRecords, scheduledServices, isLoading: dataLoading } = useData()

  if (authState.status === AUTH_STATE_STATUS.AUTHENTICATED) {
    return (
      <AuthenticatedDashboardShell>
        <Dashboard
          vehicles={vehicles}
          maintenanceRecords={maintenanceRecords}
          upcomingMaintenance={scheduledServices}
          isLoading={dataLoading}
        />
      </AuthenticatedDashboardShell>
    )
  }

  return (
    <Layout showHeader={true}>
      <LandingPage />
    </Layout>
  )
}
