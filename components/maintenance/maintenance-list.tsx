"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar, DollarSign, Gauge, MoreVertical, Edit, Trash2, AlertCircle, CheckCircle } from "lucide-react"
import { EditMaintenanceDialog } from "./edit-maintenance-dialog"
import { DeleteMaintenanceDialog } from "./delete-maintenance-dialog"
import { useState } from "react"

interface MaintenanceRecord {
  id: string
  type: string
  description?: string
  cost?: number
  mileage?: number
  service_date: string
  next_service_date?: string
  next_service_mileage?: number
  notes?: string
  created_at: string
}

interface MaintenanceListProps {
  records: MaintenanceRecord[]
  vehicleId: string
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

export function MaintenanceList({ records, vehicleId }: MaintenanceListProps) {
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null)
  const [deletingRecord, setDeletingRecord] = useState<MaintenanceRecord | null>(null)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  const isOverdue = (nextServiceDate?: string) => {
    if (!nextServiceDate) return false
    return new Date(nextServiceDate) < new Date()
  }

  const isUpcoming = (nextServiceDate?: string) => {
    if (!nextServiceDate) return false
    const nextDate = new Date(nextServiceDate)
    const today = new Date()
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
    return nextDate >= today && nextDate <= thirtyDaysFromNow
  }

  return (
    <div className="space-y-4">
      {records.map((record) => (
        <Card key={record.id} className="hover:shadow-md transition-shadow border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg text-foreground">
                    {maintenanceTypes[record.type as keyof typeof maintenanceTypes] || record.type}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{formatDate(record.service_date)}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditingRecord(record)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setDeletingRecord(record)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {record.description && <p className="text-sm text-foreground">{record.description}</p>}

            <div className="flex flex-wrap gap-4 text-sm">
              {record.cost && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">{formatCurrency(record.cost)}</span>
                </div>
              )}
              {record.mileage && (
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{record.mileage.toLocaleString()} km</span>
                </div>
              )}
            </div>

            {(record.next_service_date || record.next_service_mileage) && (
              <div className="border-t border-border pt-3">
                <h4 className="text-sm font-medium text-foreground mb-2">Próximo Servicio:</h4>
                <div className="flex flex-wrap gap-2">
                  {record.next_service_date && (
                    <Badge
                      variant={
                        isOverdue(record.next_service_date)
                          ? "destructive"
                          : isUpcoming(record.next_service_date)
                            ? "default"
                            : "secondary"
                      }
                      className="flex items-center gap-1"
                    >
                      {isOverdue(record.next_service_date) ? (
                        <AlertCircle className="h-3 w-3" />
                      ) : isUpcoming(record.next_service_date) ? (
                        <Calendar className="h-3 w-3" />
                      ) : (
                        <CheckCircle className="h-3 w-3" />
                      )}
                      {formatDate(record.next_service_date)}
                    </Badge>
                  )}
                  {record.next_service_mileage && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Gauge className="h-3 w-3" />
                      {record.next_service_mileage.toLocaleString()} km
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {record.notes && (
              <div className="border-t border-border pt-3">
                <h4 className="text-sm font-medium text-foreground mb-1">Notas:</h4>
                <p className="text-sm text-muted-foreground">{record.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {editingRecord && (
        <EditMaintenanceDialog
          record={editingRecord}
          vehicleId={vehicleId}
          open={!!editingRecord}
          onOpenChange={(open) => !open && setEditingRecord(null)}
        />
      )}

      {deletingRecord && (
        <DeleteMaintenanceDialog
          record={deletingRecord}
          open={!!deletingRecord}
          onOpenChange={(open) => !open && setDeletingRecord(null)}
        />
      )}
    </div>
  )
}
