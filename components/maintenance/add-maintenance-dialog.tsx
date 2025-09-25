"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { Wrench, Loader2 } from "lucide-react"

interface AddMaintenanceDialogProps {
  children: React.ReactNode
  vehicleId: string
}

const maintenanceTypes = [
  { value: "oil_change", label: "Cambio de Aceite" },
  { value: "tire_rotation", label: "Rotación de Llantas" },
  { value: "brake_service", label: "Servicio de Frenos" },
  { value: "transmission", label: "Transmisión" },
  { value: "engine_tune", label: "Afinación del Motor" },
  { value: "battery", label: "Batería" },
  { value: "air_filter", label: "Filtro de Aire" },
  { value: "coolant", label: "Refrigerante" },
  { value: "spark_plugs", label: "Bujías" },
  { value: "belts_hoses", label: "Correas y Mangueras" },
  { value: "suspension", label: "Suspensión" },
  { value: "exhaust", label: "Sistema de Escape" },
  { value: "other", label: "Otro" },
]

export function AddMaintenanceDialog({ children, vehicleId }: AddMaintenanceDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingStep, setLoadingStep] = useState<string>("")
  const router = useRouter()

  const [formData, setFormData] = useState({
    type: "",
    description: "",
    cost: "",
    mileage: "",
    service_date: new Date().toISOString().split("T")[0],
    next_service_date: "",
    next_service_mileage: "",
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setLoadingStep("Iniciando...")

    try {
      // Validaciones básicas
      if (!vehicleId) {
        throw new Error("ID del vehículo no válido")
      }

      if (!formData.type) {
        throw new Error("Debe seleccionar un tipo de mantenimiento")
      }

      setLoadingStep("Conectando con la base de datos...")
      const supabase = createClient()

      // Verificar autenticación
      setLoadingStep("Verificando autenticación...")

      // Agregar timeout para la verificación de sesión
      const sessionPromise = supabase.auth.getSession()
      const sessionTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Timeout al verificar sesión")), 5000)
      })

      const { data: { session }, error: sessionError } = await Promise.race([sessionPromise, sessionTimeout]) as any

      if (sessionError) {
        throw new Error(`Error de sesión: ${sessionError.message}`)
      }

      if (!session) {
        throw new Error("No hay sesión activa. Por favor, inicia sesión.")
      }

      const user = session.user
      if (!user) {
        throw new Error("Usuario no válido en la sesión.")
      }

      // Verificar que el vehículo existe y pertenece al usuario
      setLoadingStep("Verificando permisos del vehículo...")

      const vehiclePromise = supabase
        .from("vehicles")
        .select("id, user_id")
        .eq("id", vehicleId)
        .eq("user_id", user.id)
        .single()

      const vehicleTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Timeout al verificar vehículo")), 5000)
      })

      const { data: vehicle, error: vehicleError } = await Promise.race([vehiclePromise, vehicleTimeout]) as any

      if (vehicleError) {
        if (vehicleError.code === 'PGRST116') {
          throw new Error("No se encontró el vehículo o no tienes permisos para acceder a él")
        }
        throw new Error(`Error al verificar vehículo: ${vehicleError.message}`)
      }

      if (!vehicle) {
        throw new Error("No tienes permisos para agregar mantenimiento a este vehículo")
      }

      // Preparar datos para inserción con validación de números
      const cost = formData.cost ? parseFloat(formData.cost) : null
      const mileage = formData.mileage ? parseInt(formData.mileage, 10) : null
      const nextServiceMileage = formData.next_service_mileage ? parseInt(formData.next_service_mileage, 10) : null

      // Verificar que los números sean válidos si se proporcionaron
      if (formData.cost && (isNaN(cost!) || cost! < 0)) {
        throw new Error("El costo debe ser un número válido mayor o igual a 0")
      }

      if (formData.mileage && (isNaN(mileage!) || mileage! < 0)) {
        throw new Error("El kilometraje debe ser un número válido mayor o igual a 0")
      }

      if (formData.next_service_mileage && (isNaN(nextServiceMileage!) || nextServiceMileage! < 0)) {
        throw new Error("El kilometraje del próximo servicio debe ser un número válido mayor o igual a 0")
      }

      const insertData = {
        vehicle_id: vehicleId,
        user_id: user.id,
        type: formData.type,
        description: formData.description?.trim() || null,
        cost,
        mileage,
        service_date: formData.service_date,
        next_service_date: formData.next_service_date || null,
        next_service_mileage: nextServiceMileage,
        notes: formData.notes?.trim() || null,
      }

      // Agregar timeout para evitar operaciones colgadas
      setLoadingStep("Guardando registro de mantenimiento...")
      const insertPromise = supabase
        .from("maintenance_records")
        .insert(insertData)
        .select()

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("La operación tardó demasiado tiempo. Inténtalo de nuevo.")), 8000)
      })

      const { data, error: insertError } = await Promise.race([insertPromise, timeoutPromise]) as any

      if (insertError) {
        throw new Error(`Error al insertar: ${insertError.message}`)
      }

      setLoadingStep("Finalizando...")

      // Reset form and close dialog
      setFormData({
        type: "",
        description: "",
        cost: "",
        mileage: "",
        service_date: new Date().toISOString().split("T")[0],
        next_service_date: "",
        next_service_mileage: "",
        notes: "",
      })

      setOpen(false)
      router.refresh()

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido al agregar mantenimiento"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
      setLoadingStep("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            Agregar Registro de Mantenimiento
          </DialogTitle>
          <DialogDescription>Registra un nuevo servicio o mantenimiento realizado al vehículo.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Mantenimiento *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {maintenanceTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="service_date">Fecha de Servicio *</Label>
              <Input
                id="service_date"
                type="date"
                value={formData.service_date}
                onChange={(e) => setFormData({ ...formData, service_date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Input
              id="description"
              placeholder="Descripción breve del servicio realizado"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost">Costo (€)</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mileage">Kilometraje</Label>
              <Input
                id="mileage"
                type="number"
                placeholder="50000"
                value={formData.mileage}
                onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
              />
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h4 className="text-sm font-medium text-foreground mb-3">Próximo Servicio (Opcional)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="next_service_date">Fecha del Próximo Servicio</Label>
                <Input
                  id="next_service_date"
                  type="date"
                  value={formData.next_service_date}
                  onChange={(e) => setFormData({ ...formData, next_service_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="next_service_mileage">Kilometraje del Próximo Servicio</Label>
                <Input
                  id="next_service_mileage"
                  type="number"
                  placeholder="55000"
                  value={formData.next_service_mileage}
                  onChange={(e) => setFormData({ ...formData, next_service_mileage: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas Adicionales</Label>
            <Textarea
              id="notes"
              placeholder="Cualquier información adicional sobre el servicio..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.type}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Agregando...
                </>
              ) : (
                "Agregar Mantenimiento"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
