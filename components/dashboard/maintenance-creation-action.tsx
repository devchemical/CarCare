"use client"

import Link from "next/link"
import { useState } from "react"
import { Plus, Wrench } from "lucide-react"
import { AddMaintenanceDialog } from "@/components/maintenance/add-maintenance-dialog"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Vehicle } from "@/contexts"

export function MaintenanceCreationAction({ vehicles }: { vehicles: Vehicle[] }) {
  const [selecting, setSelecting] = useState(false)
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null)

  if (vehicles.length === 0) {
    return (
      <Button asChild size="sm">
        <Link href="/vehicles">
          <Plus aria-hidden="true" />
          Añadir mantenimiento
        </Link>
      </Button>
    )
  }

  if (vehicles.length === 1) {
    return (
      <AddMaintenanceDialog vehicleId={vehicles[0].id}>
        <Button size="sm">
          <Plus aria-hidden="true" />
          Añadir mantenimiento
        </Button>
      </AddMaintenanceDialog>
    )
  }

  return (
    <>
      <Button size="sm" onClick={() => setSelecting(true)}>
        <Plus aria-hidden="true" />
        Añadir mantenimiento
      </Button>
      <Dialog open={selecting} onOpenChange={setSelecting}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Selecciona un vehículo</DialogTitle>
            <DialogDescription>El mantenimiento se registrará en el vehículo que elijas.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            {vehicles.map((vehicle) => (
              <Button
                key={vehicle.id}
                variant="outline"
                className="h-auto min-h-12 justify-start py-3 text-left"
                onClick={() => {
                  setSelecting(false)
                  setSelectedVehicleId(vehicle.id)
                }}
              >
                <Wrench className="shrink-0" aria-hidden="true" />
                <span>
                  <span className="block font-medium">
                    {vehicle.make} {vehicle.model}
                  </span>
                  <span className="text-muted-foreground block text-xs">
                    {vehicle.year}
                    {vehicle.license_plate ? ` · ${vehicle.license_plate}` : ""}
                  </span>
                </span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      {selectedVehicleId ? (
        <AddMaintenanceDialog
          vehicleId={selectedVehicleId}
          open
          onOpenChange={(open) => {
            if (!open) setSelectedVehicleId(null)
          }}
        />
      ) : null}
    </>
  )
}
