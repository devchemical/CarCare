"use client"

import Link from "next/link"
import { Activity, ArrowRight } from "lucide-react"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { MaintenanceRecord, ScheduledService, Vehicle } from "@/contexts"

const maintenanceTypes: Record<string, string> = {
  oil_change: "Cambio de aceite",
  tire_rotation: "Rotación de neumáticos",
  brake_service: "Servicio de frenos",
  transmission: "Transmisión",
  engine_tune: "Afinación del motor",
  battery: "Batería",
  air_filter: "Filtro de aire",
  coolant: "Refrigerante",
  spark_plugs: "Bujías",
  belts_hoses: "Correas y mangueras",
  suspension: "Suspensión",
  exhaust: "Sistema de escape",
  other: "Otro",
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(amount)
}

export function RecentActivity({
  maintenanceRecords,
  vehicles,
  scheduledServices,
}: {
  maintenanceRecords: MaintenanceRecord[]
  vehicles: Vehicle[]
  scheduledServices: ScheduledService[]
}) {
  const history = maintenanceRecords.slice(0, 5)

  return (
    <Card className="border-[var(--shell-border)] bg-[var(--shell-surface)] shadow-[0_12px_36px_rgba(31,49,38,0.06)]">
      <CardHeader>
        <CardTitle id="history-heading" className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5 text-green-700" aria-hidden="true" />
          Historial de mantenimiento
        </CardTitle>
        <CardDescription>Los cinco trabajos completados más recientes.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <DashboardStats
          vehicles={vehicles}
          maintenanceRecords={maintenanceRecords}
          scheduledServices={scheduledServices}
        />

        {history.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--shell-border)] bg-[var(--shell-elevated)] p-6 text-center">
            <Activity className="mx-auto mb-3 h-9 w-9 text-green-700" aria-hidden="true" />
            <p className="text-sm text-[var(--shell-muted)]">Aún no has registrado ningún mantenimiento completado.</p>
          </div>
        ) : (
          <ul
            role="list"
            className="divide-y divide-[var(--shell-border)] rounded-xl border border-[var(--shell-border)]"
          >
            {history.map((record) => (
              <li key={record.id}>
                <Link
                  href={`/vehicles/${record.vehicle_id}/maintenance`}
                  className="group flex min-w-0 items-center gap-3 p-3 transition-colors duration-150 hover:bg-[var(--shell-elevated)] focus-visible:ring-2 focus-visible:ring-[var(--shell-focus)] focus-visible:outline-none focus-visible:ring-inset motion-reduce:transition-none sm:p-4"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">
                      {maintenanceTypes[record.type] || record.type}
                    </span>
                    <span className="mt-1 block truncate text-xs text-[var(--shell-muted)]">
                      {record.vehicles
                        ? `${record.vehicles.make} ${record.vehicles.model} ${record.vehicles.year} · `
                        : ""}
                      {formatDate(record.service_date)}
                    </span>
                  </span>
                  {record.cost ? (
                    <span className="shrink-0 text-sm font-medium">{formatCurrency(record.cost)}</span>
                  ) : null}
                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-[var(--shell-muted)] transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none"
                    aria-hidden="true"
                  />
                  <span className="sr-only">Abrir mantenimientos del vehículo</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
