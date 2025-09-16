"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, AlertTriangle, CheckCircle, Car } from "lucide-react"
import Link from "next/link"

interface UpcomingMaintenanceRecord {
  id: string
  type: string
  next_service_date: string
  vehicles: {
    make: string
    model: string
    year: number
    license_plate?: string
  }
}

interface UpcomingMaintenanceProps {
  upcomingMaintenance: UpcomingMaintenanceRecord[]
}

const maintenanceTypes = {
  oil_change: "Cambio de Aceite",
  tire_rotation: "Rotación de Llantas",
  brake_service: "Servicio de Frenos",
  transmission: "Transmisión",
  engine_tune: "Afinación del Motor",
  battery: "Batería",
  air_filter: "Filtro de Aire",
  coolant: "Refrigerante",
  spark_plugs: "Bujías",
  belts_hoses: "Correas y Mangueras",
  suspension: "Suspensión",
  exhaust: "Sistema de Escape",
  other: "Otro",
}

export function UpcomingMaintenance({ upcomingMaintenance }: UpcomingMaintenanceProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      month: "short",
      day: "numeric",
    })
  }

  const isOverdue = (dateString: string) => {
    return new Date(dateString) < new Date()
  }

  const getDaysUntil = (dateString: string) => {
    const today = new Date()
    const serviceDate = new Date(dateString)
    const diffTime = serviceDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (upcomingMaintenance.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Próximos Mantenimientos
          </CardTitle>
          <CardDescription>No hay servicios programados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="p-4 bg-green-100 rounded-full w-fit mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-muted-foreground">
              ¡Perfecto! No tienes mantenimientos pendientes en los próximos 30 días.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Próximos Mantenimientos
        </CardTitle>
        <CardDescription>
          {upcomingMaintenance.length} servicio{upcomingMaintenance.length !== 1 ? "s" : ""} programado
          {upcomingMaintenance.length !== 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingMaintenance.slice(0, 5).map((maintenance) => {
            const daysUntil = getDaysUntil(maintenance.next_service_date)
            const overdue = isOverdue(maintenance.next_service_date)

            return (
              <div
                key={maintenance.id}
                className="flex items-start gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className={`p-2 rounded-lg ${overdue ? "bg-destructive/10" : "bg-orange-100"}`}>
                  {overdue ? (
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  ) : (
                    <Calendar className="h-4 w-4 text-orange-600" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground text-sm">
                      {maintenanceTypes[maintenance.type as keyof typeof maintenanceTypes] || maintenance.type}
                    </span>
                    <Badge variant={overdue ? "destructive" : "secondary"} className="text-xs">
                      {overdue ? "Vencido" : `${daysUntil} días`}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Car className="h-3 w-3" />
                    <span>
                      {maintenance.vehicles.make} {maintenance.vehicles.model} {maintenance.vehicles.year}
                    </span>
                    {maintenance.vehicles.license_plate && <span>• {maintenance.vehicles.license_plate}</span>}
                  </div>

                  <div className="text-xs text-muted-foreground mt-1">{formatDate(maintenance.next_service_date)}</div>
                </div>
              </div>
            )
          })}

          {upcomingMaintenance.length > 5 && (
            <div className="text-center pt-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/vehicles">Ver {upcomingMaintenance.length - 5} más</Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
