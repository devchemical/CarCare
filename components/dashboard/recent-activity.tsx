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
            <Activity className="text-green-700 h-5 w-5" />
            Actividad Reciente
          </CardTitle>
          <CardDescription>No hay actividad reciente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <Activity className="text-slate-300 h-12 w-12 mx-auto mb-4" />
            <p className="text-slate-500 mb-6 leading-relaxed">Aún no has registrado ningún mantenimiento</p>
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
              <Activity className="text-green-700 h-5 w-5" />
              Actividad Reciente
            </CardTitle>
            <CardDescription>Últimos {Math.min(maintenanceRecords.length, 5)} mantenimientos</CardDescription>
          </div>
          <Button variant="default" size="sm" className="bg-green-700 hover:bg-green-800" asChild>
            <Link href="/vehicles">Ver Todos</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {maintenanceRecords.slice(0, 5).map((record) => (
            <div
              key={record.id}
              className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-4 transition-colors hover:bg-slate-50/50"
            >
              <div className="bg-green-100 rounded-xl p-2.5">
                <Activity className="text-green-700 h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-slate-900 text-sm font-medium">
                    {maintenanceTypes[record.type as keyof typeof maintenanceTypes] || record.type}
                  </span>
                  {record.cost && (
                    <Badge variant="outline" className="bg-slate-50 text-slate-600 text-xs border-slate-200">
                      {formatCurrency(record.cost)}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Car className="h-3.5 w-3.5 text-slate-400" />
                  <span>
                    {record.vehicles.make} {record.vehicles.model} {record.vehicles.year}
                  </span>
                  <span className="text-slate-300">•</span>
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
