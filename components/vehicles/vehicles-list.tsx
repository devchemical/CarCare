"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Car, MoreVertical, Edit, Trash2, Calendar, Gauge } from "lucide-react"
import { EditVehicleDialog } from "./edit-vehicle-dialog"
import { DeleteVehicleDialog } from "./delete-vehicle-dialog"
import { useState } from "react"
import Link from "next/link"

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  license_plate?: string
  vin?: string
  color?: string
  mileage: number
  created_at: string
  updated_at: string
}

interface VehiclesListProps {
  vehicles: Vehicle[]
}

export function VehiclesList({ vehicles }: VehiclesListProps) {
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null)

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {vehicles.map((vehicle) => (
        <Card key={vehicle.id} className="hover:shadow-lg transition-shadow border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Car className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg text-foreground">
                  {vehicle.make} {vehicle.model}
                </CardTitle>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditingVehicle(vehicle)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/vehicles/${vehicle.id}/maintenance`}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Ver Mantenimientos
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setDeletingVehicle(vehicle)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Badge variant="secondary" className="w-fit">
              {vehicle.year}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {vehicle.color && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div
                  className="w-4 h-4 rounded-full border border-border"
                  style={{ backgroundColor: vehicle.color.toLowerCase() }}
                />
                <span className="capitalize">{vehicle.color}</span>
              </div>
            )}

            {vehicle.license_plate && (
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-foreground">Placa:</span>
                <Badge variant="outline">{vehicle.license_plate}</Badge>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              <Gauge className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Kilometraje:</span>
              <span className="font-medium text-foreground">{vehicle.mileage.toLocaleString()} km</span>
            </div>

            {vehicle.vin && (
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">VIN:</span> {vehicle.vin}
              </div>
            )}

            <div className="pt-2">
              <Button asChild variant="outline" size="sm" className="w-full bg-transparent">
                <Link href={`/vehicles/${vehicle.id}/maintenance`}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Ver Mantenimientos
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {editingVehicle && (
        <EditVehicleDialog
          vehicle={editingVehicle}
          open={!!editingVehicle}
          onOpenChange={(open) => !open && setEditingVehicle(null)}
        />
      )}

      {deletingVehicle && (
        <DeleteVehicleDialog
          vehicle={deletingVehicle}
          open={!!deletingVehicle}
          onOpenChange={(open) => !open && setDeletingVehicle(null)}
        />
      )}
    </div>
  )
}
