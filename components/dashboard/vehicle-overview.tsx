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
            <Car className="text-primary h-5 w-5" />
            Mis Vehículos
          </CardTitle>
          <CardDescription>No tienes vehículos registrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-6 text-center">
            <div className="bg-muted mx-auto mb-4 w-fit rounded-full p-4">
              <Car className="text-muted-foreground h-8 w-8" />
            </div>
            <p className="text-muted-foreground mb-4">Comienza agregando tu primer vehículo</p>
            <Button asChild className="bg-primary hover:bg-primary/90">
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
              <Car className="text-primary h-5 w-5" />
              Mis Vehículos
            </CardTitle>
            <CardDescription>
              {vehicles.length} vehículo{vehicles.length !== 1 ? "s" : ""} registrado{vehicles.length !== 1 ? "s" : ""}
            </CardDescription>
          </div>
          <Button variant="default" size="sm" asChild>
            <Link href="/vehicles">Ver Todos</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {vehicles.slice(0, 3).map((vehicle) => (
            <div
              key={vehicle.id}
              className="bg-background border-border flex items-center justify-between rounded-lg border p-3 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 rounded-lg p-2">
                  <Car className="text-primary h-4 w-4" />
                </div>
                <div>
                  <div className="text-foreground font-medium">
                    {vehicle.make} {vehicle.model}
                  </div>
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <Badge variant="secondary" className="text-xs">
                      {vehicle.year}
                    </Badge>
                    {vehicle.license_plate && <span>{vehicle.license_plate}</span>}
                  </div>
                </div>
              </div>
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Gauge className="h-4 w-4" />
                <span>{formatMileage(vehicle.mileage)}</span>
              </div>
            </div>
          ))}

          {vehicles.length > 3 && (
            <div className="pt-2 text-center">
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
