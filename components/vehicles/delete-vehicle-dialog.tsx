"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { AlertTriangle, Loader2 } from "lucide-react"

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
}

interface DeleteVehicleDialogProps {
  vehicle: Vehicle
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteVehicleDialog({ vehicle, open, onOpenChange }: DeleteVehicleDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = async () => {
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const { error } = await supabase.from("vehicles").delete().eq("id", vehicle.id)

      if (error) throw error

      onOpenChange(false)
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al eliminar vehículo")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Eliminar Vehículo
          </DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas eliminar el vehículo{" "}
            <span className="font-semibold">
              {vehicle.make} {vehicle.model} {vehicle.year}
            </span>
            ?
          </DialogDescription>
        </DialogHeader>

        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 mb-4">
          <p className="text-sm text-destructive-foreground">
            <strong>Advertencia:</strong> Esta acción eliminará permanentemente el vehículo y todos sus registros de
            mantenimiento asociados. Esta acción no se puede deshacer.
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">
            {error}
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleDelete} disabled={isLoading} variant="destructive" className="flex-1">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Eliminar Vehículo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
