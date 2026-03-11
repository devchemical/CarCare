"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Car, Plus, Gauge } from "lucide-react"
import Link from "next/link"
import { formatMileage } from "@/lib/formatters"

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  license_plate?: string
  color?: string
  mileage: number
}

interface VehicleOverviewProps {
  vehicles: Vehicle[]
}

export function VehicleOverview({ vehicles }: VehicleOverviewProps) {
  if (vehicles.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="text-green-600 h-5 w-5" />
            Mis Vehículos
          </CardTitle>
          <CardDescription>No tienes vehículos registrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <Car className="text-slate-300 h-12 w-12 mx-auto mb-4" />
            <p className="text-slate-500 mb-6 leading-relaxed">Comienza agregando tu primer vehículo</p>
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link href="/vehicles">
                <Plus className="mr-2 h-4 w-4" />
                Agregar Vehículo
              </Link>
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
              <Car className="text-green-600 h-5 w-5" />
              Mis Vehículos
            </CardTitle>
            <CardDescription>
              {vehicles.length} vehículo{vehicles.length !== 1 ? "s" : ""} registrado{vehicles.length !== 1 ? "s" : ""}
            </CardDescription>
          </div>
          <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700" asChild>
            <Link href="/vehicles">Ver Todos</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {vehicles.slice(0, 3).map((vehicle) => (
            <div
              key={vehicle.id}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4 transition-colors hover:bg-slate-50/50"
            >
              <div className="flex items-center gap-4">
                <div className="bg-green-50 rounded-xl p-2.5">
                  <Car className="text-green-600 h-5 w-5" />
                </div>
                <div>
                  <div className="text-slate-900 font-medium">
                    {vehicle.make} {vehicle.model}
                  </div>
                  <div className="flex items-center gap-2 text-sm mt-0.5">
                    <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-600 border-0">
                      {vehicle.year}
                    </Badge>
                    {vehicle.license_plate && <span className="text-slate-500">{vehicle.license_plate}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Gauge className="h-4 w-4 text-slate-400" />
                <span>{formatMileage(vehicle.mileage)}</span>
              </div>
            </div>
          ))}

          {vehicles.length > 3 && (
            <div className="pt-3 text-center">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/vehicles">
                  Ver {vehicles.length - 3} vehículo
                  {vehicles.length - 3 !== 1 ? "s" : ""} más
                </Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
