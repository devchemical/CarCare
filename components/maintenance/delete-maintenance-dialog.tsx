"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { AlertTriangle } from "lucide-react"

interface MaintenanceRecord {
  id: string
  type: string
  service_date: string
}

interface DeleteMaintenanceDialogProps {
  record: MaintenanceRecord
  open: boolean
  onOpenChange: (open: boolean) => void
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

export function DeleteMaintenanceDialog({ record, open, onOpenChange }: DeleteMaintenanceDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = async () => {
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const { error } = await supabase.from("maintenance_records").delete().eq("id", record.id)

      if (error) throw error

      onOpenChange(false)
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al eliminar registro")
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Eliminar Registro de Mantenimiento
          </DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas eliminar el registro de{" "}
            <span className="font-semibold">
              {maintenanceTypes[record.type as keyof typeof maintenanceTypes] || record.type}
            </span>{" "}
            del {formatDate(record.service_date)}?
          </DialogDescription>
        </DialogHeader>

        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 mb-4">
          <p className="text-sm text-destructive-foreground">
            <strong>Advertencia:</strong> Esta acción eliminará permanentemente este registro de mantenimiento. Esta
            acción no se puede deshacer.
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
            {isLoading ? "Eliminando..." : "Eliminar Registro"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
