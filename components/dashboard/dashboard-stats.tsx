"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Car, Wrench, DollarSign, AlertTriangle } from "lucide-react"

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
}

interface MaintenanceRecord {
  id: string
  cost?: number
  next_service_date?: string
}

interface DashboardStatsProps {
  vehicles: Vehicle[]
  maintenanceRecords: MaintenanceRecord[]
}

export function DashboardStats({ vehicles, maintenanceRecords }: DashboardStatsProps) {
  const totalVehicles = vehicles.length
  const totalMaintenanceRecords = maintenanceRecords.length

  const totalCost = maintenanceRecords.reduce((sum, record) => {
    return sum + (record.cost || 0)
  }, 0)

  const upcomingServices = maintenanceRecords.filter((record) => {
    if (!record.next_service_date) return false
    const nextDate = new Date(record.next_service_date)
    const today = new Date()
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
    return nextDate >= today && nextDate <= thirtyDaysFromNow
  }).length

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  const stats = [
    {
      title: "Total Vehículos",
      value: totalVehicles.toString(),
      icon: Car,
      description: "Vehículos registrados",
      color: "text-primary",
    },
    {
      title: "Mantenimientos",
      value: totalMaintenanceRecords.toString(),
      icon: Wrench,
      description: "Servicios realizados",
      color: "text-blue-600",
    },
    {
      title: "Gasto Total",
      value: formatCurrency(totalCost),
      icon: DollarSign,
      description: "En mantenimientos",
      color: "text-green-600",
    },
    {
      title: "Próximos Servicios",
      value: upcomingServices.toString(),
      icon: AlertTriangle,
      description: "En los próximos 30 días",
      color: upcomingServices > 0 ? "text-orange-600" : "text-gray-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.title} className="hover:shadow-md transition-shadow border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
