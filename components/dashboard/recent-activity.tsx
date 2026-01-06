"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Activity, Car } from "lucide-react"
import Link from "next/link"

interface MaintenanceRecord {
  id: string
  type: string
  cost?: number
  service_date: string
  vehicles: {
    make: string
    model: string
    year: number
  }
}

interface RecentActivityProps {
  maintenanceRecords: MaintenanceRecord[]
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

export function RecentActivity({ maintenanceRecords }: RecentActivityProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  if (maintenanceRecords.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="text-primary h-5 w-5" />
            Actividad Reciente
          </CardTitle>
          <CardDescription>No hay actividad reciente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-6 text-center">
            <div className="bg-muted mx-auto mb-4 w-fit rounded-full p-4">
              <Activity className="text-muted-foreground h-8 w-8" />
            </div>
            <p className="text-muted-foreground mb-4">Aún no has registrado ningún mantenimiento</p>
            <Button variant="outline" asChild>
              <Link href="/vehicles">Agregar Mantenimiento</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="text-primary h-5 w-5" />
              Actividad Reciente
            </CardTitle>
            <CardDescription>Últimos {Math.min(maintenanceRecords.length, 5)} mantenimientos</CardDescription>
          </div>
          <Button variant="default" size="sm" asChild>
            <Link href="/vehicles">Ver Todos</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {maintenanceRecords.slice(0, 5).map((record) => (
            <div
              key={record.id}
              className="bg-background border-border flex items-center gap-3 rounded-lg border p-3 transition-colors"
            >
              <div className="bg-primary/10 rounded-lg p-2">
                <Activity className="text-primary h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-foreground text-sm font-medium">
                    {maintenanceTypes[record.type as keyof typeof maintenanceTypes] || record.type}
                  </span>
                  {record.cost && (
                    <Badge variant="outline" className="bg-secondary text-xs">
                      {formatCurrency(record.cost)}
                    </Badge>
                  )}
                </div>

                <div className="text-muted-foreground flex items-center gap-2 text-xs">
                  <Car className="h-3 w-3" />
                  <span>
                    {record.vehicles.make} {record.vehicles.model} {record.vehicles.year}
                  </span>
                  <span>•</span>
                  <span>{formatDate(record.service_date)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
