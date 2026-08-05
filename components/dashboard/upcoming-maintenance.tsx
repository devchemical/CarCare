"use client"

import { useMemo, useState } from "react"
import { CalendarDays, Car, ChevronDown, ChevronUp, Edit, MoreVertical } from "lucide-react"
import { MaintenanceCreationAction } from "@/components/dashboard/maintenance-creation-action"
import { EditScheduledServiceDialog } from "@/components/maintenance/edit-scheduled-service-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { ScheduledService, Vehicle } from "@/contexts"
import { classifyPendingMaintenance, sortPendingMaintenance } from "@/lib/dashboard/pending-maintenance"

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

const statusClasses = {
  overdue: "border-red-200 bg-red-50 text-red-700",
  today: "border-orange-200 bg-orange-50 text-orange-700",
  upcoming: "border-amber-200 bg-amber-50 text-amber-800",
  scheduled: "border-slate-200 bg-slate-50 text-slate-600",
}

function formatDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number)
  return new Date(year, month - 1, day).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })
}

export function UpcomingMaintenance({
  upcomingMaintenance,
  vehicles,
}: {
  upcomingMaintenance: ScheduledService[]
  vehicles: Vehicle[]
}) {
  const [expanded, setExpanded] = useState(false)
  const [editingService, setEditingService] = useState<ScheduledService | null>(null)
  const ordered = useMemo(
    () => sortPendingMaintenance(upcomingMaintenance.filter(({ status }) => status === "pending")),
    [upcomingMaintenance]
  )
  const visible = expanded ? ordered : ordered.slice(0, 3)
  const hiddenCount = Math.max(ordered.length - 3, 0)

  return (
    <Card className="border-[var(--shell-border)] bg-[var(--shell-surface)] shadow-[0_12px_36px_rgba(31,49,38,0.06)]">
      <CardHeader className="gap-4">
        <div>
          <CardTitle id="pending-heading" className="flex items-center gap-2 text-lg">
            <CalendarDays className="h-5 w-5 text-green-700" aria-hidden="true" />
            Mantenimientos pendientes
          </CardTitle>
          <CardDescription className="mt-1">
            {ordered.length === 0
              ? "No hay trabajo pendiente."
              : `${ordered.length} mantenimiento${ordered.length === 1 ? "" : "s"} por atender`}
          </CardDescription>
        </div>
        <MaintenanceCreationAction vehicles={vehicles} />
      </CardHeader>
      <CardContent>
        {ordered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--shell-border)] bg-[var(--shell-elevated)] p-6 text-center">
            <CalendarDays className="mx-auto mb-3 h-9 w-9 text-green-700" aria-hidden="true" />
            <p className="text-sm text-[var(--shell-muted)]">
              No tienes mantenimientos pendientes. Puedes añadir uno cuando lo necesites.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map((maintenance) => {
              const status = classifyPendingMaintenance(maintenance.scheduled_date)
              const recordName = maintenanceTypes[maintenance.type] || maintenance.type
              return (
                <article
                  key={maintenance.id}
                  className="relative rounded-xl border border-[var(--shell-border)] bg-[var(--shell-elevated)] p-4 pr-12"
                >
                  <div className="flex flex-wrap items-start gap-2">
                    <h3 className="min-w-0 flex-1 text-sm font-semibold">{recordName}</h3>
                    <Badge variant="outline" className={statusClasses[status.kind]}>
                      {status.label}
                    </Badge>
                  </div>
                  {maintenance.vehicles ? (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-[var(--shell-muted)]">
                      <Car className="h-3.5 w-3.5" aria-hidden="true" />
                      {maintenance.vehicles.make} {maintenance.vehicles.model} {maintenance.vehicles.year}
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs text-[var(--shell-muted)]">
                    {maintenance.scheduled_date ? formatDate(maintenance.scheduled_date) : "Sin fecha programada"}
                    {maintenance.scheduled_mileage !== undefined && maintenance.scheduled_mileage !== null
                      ? ` · ${maintenance.scheduled_mileage.toLocaleString("es-ES")} km`
                      : ""}
                  </p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-3 right-2 h-10 w-10"
                        aria-label={`Acciones de ${recordName}`}
                      >
                        <MoreVertical className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingService(maintenance)}>
                        <Edit className="h-4 w-4" aria-hidden="true" />
                        Editar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </article>
              )
            })}
            {hiddenCount > 0 ? (
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setExpanded((value) => !value)}
                aria-expanded={expanded}
              >
                {expanded ? (
                  <>
                    <ChevronUp aria-hidden="true" />
                    Mostrar menos
                  </>
                ) : (
                  <>
                    <ChevronDown aria-hidden="true" />
                    Mostrar {hiddenCount} más
                  </>
                )}
              </Button>
            ) : null}
          </div>
        )}
      </CardContent>
      {editingService ? (
        <EditScheduledServiceDialog
          service={editingService}
          open
          onOpenChange={(open) => {
            if (!open) setEditingService(null)
          }}
        />
      ) : null}
    </Card>
  )
}
