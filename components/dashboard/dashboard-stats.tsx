"use client"

import { CalendarDays, Car, CircleDollarSign, Wrench } from "lucide-react"
import type { MaintenanceRecord, ScheduledService, Vehicle } from "@/contexts"
import { isWithinNextThirtyDays } from "@/lib/dashboard/pending-maintenance"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(amount)
}

export function DashboardStats({
  vehicles,
  maintenanceRecords,
  scheduledServices,
}: {
  vehicles: Vehicle[]
  maintenanceRecords: MaintenanceRecord[]
  scheduledServices: ScheduledService[]
}) {
  const totalCost = maintenanceRecords.reduce((total, record) => total + (record.cost || 0), 0)
  const metrics = [
    { label: "Vehículos", value: vehicles.length, icon: Car },
    { label: "Realizados", value: maintenanceRecords.length, icon: Wrench },
    { label: "Gasto total", value: formatCurrency(totalCost), icon: CircleDollarSign },
    {
      label: "Próximos 30 días",
      value: scheduledServices.filter(({ scheduled_date }) => isWithinNextThirtyDays(scheduled_date)).length,
      icon: CalendarDays,
    },
  ]

  return (
    <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {metrics.map(({ label, value, icon: Icon }) => (
        <div
          key={label}
          className="min-w-0 rounded-xl border border-[var(--shell-border)] bg-[var(--shell-elevated)] p-3"
        >
          <dt className="flex items-center gap-1.5 text-xs text-[var(--shell-muted)]">
            <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{label}</span>
          </dt>
          <dd className="mt-2 truncate text-lg font-semibold" title={String(value)}>
            {value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
