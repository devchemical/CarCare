"use client"

import { useEffect, useState } from "react"
import { Bell, BellOff, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type NotificationPermission = "default" | "granted" | "denied"

export function NotificationManager() {
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const [isSupported, setIsSupported] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    // Verificar soporte para notificaciones
    if (typeof window !== "undefined" && "Notification" in window) {
      setIsSupported(true)
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async () => {
    if (!isSupported) return

    try {
      const result = await Notification.requestPermission()
      setPermission(result)

      if (result === "granted") {
        // Enviar notificación de bienvenida
        new Notification("¡Keepel habilitado!", {
          body: "Recibirás recordatorios de mantenimiento",
          icon: "/icons/icon-192x192.png",
          badge: "/icons/icon-96x96.png",
          tag: "welcome",
        })
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error)
    }
  }

  const sendTestNotification = () => {
    if (permission === "granted") {
      new Notification("Recordatorio de Mantenimiento", {
        body: "Es hora de revisar el aceite de tu Toyota Camry 2018",
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-96x96.png",
        tag: "maintenance-reminder",
        requireInteraction: true,
        // Las acciones están disponibles en algunos navegadores pero no en TypeScript estándar
        data: {
          actions: [
            { action: "view", title: "Ver detalles" },
            { action: "dismiss", title: "Recordar más tarde" },
          ],
        },
      })
    }
  }

  // Función para programar recordatorios (simulada)
  const scheduleMaintenanceReminder = (vehicleId: string, maintenanceType: string, dueDate: Date) => {
    if (permission !== "granted") return

    const timeUntilDue = dueDate.getTime() - Date.now()
    const oneDayBefore = timeUntilDue - 24 * 60 * 60 * 1000 // 1 día antes

    if (oneDayBefore > 0) {
      setTimeout(() => {
        new Notification(`Recordatorio: ${maintenanceType}`, {
          body: `Tu vehículo necesita ${maintenanceType} mañana`,
          icon: "/icons/icon-192x192.png",
          badge: "/icons/icon-96x96.png",
          tag: `maintenance-${vehicleId}`,
          requireInteraction: true,
        })
      }, oneDayBefore)
    }
  }

  if (!isSupported) {
    return null
  }

  return (
    <>
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {permission === "granted" ? (
                <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              ) : (
                <BellOff className="h-5 w-5 text-gray-500" />
              )}
              <CardTitle className="text-lg text-blue-900 dark:text-blue-100">Notificaciones</CardTitle>
            </div>
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Configuración de Notificaciones</DialogTitle>
                  <DialogDescription>Gestiona cómo y cuándo recibir recordatorios de mantenimiento</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <h4 className="mb-2 font-medium">Estado actual</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {permission === "granted" && "✅ Notificaciones habilitadas"}
                      {permission === "denied" && "❌ Notificaciones bloqueadas"}
                      {permission === "default" && "⏳ Pendiente de configurar"}
                    </p>
                  </div>

                  {permission === "granted" && (
                    <div>
                      <h4 className="mb-2 font-medium">Probar notificaciones</h4>
                      <Button onClick={sendTestNotification} variant="outline" size="sm">
                        Enviar notificación de prueba
                      </Button>
                    </div>
                  )}

                  {permission === "denied" && (
                    <div className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        Las notificaciones están bloqueadas. Para habilitarlas:
                        <br />
                        1. Ve a la configuración de tu navegador
                        <br />
                        2. Busca la sección de permisos del sitio
                        <br />
                        3. Cambia las notificaciones a "Permitir"
                      </p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <CardDescription className="text-blue-700 dark:text-blue-300">
            {permission === "granted"
              ? "Recibirás recordatorios automáticos de mantenimiento"
              : "Habilita las notificaciones para recordatorios de mantenimiento"}
          </CardDescription>
        </CardHeader>
        {permission !== "granted" && (
          <CardContent className="pt-0">
            <Button onClick={requestPermission} className="w-full">
              <Bell className="mr-2 h-4 w-4" />
              Habilitar Notificaciones
            </Button>
          </CardContent>
        )}
      </Card>
    </>
  )
}

// Hook para usar las notificaciones en otros componentes
export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setIsSupported(true)
      setPermission(Notification.permission)
    }
  }, [])

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (permission === "granted" && isSupported) {
      return new Notification(title, {
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-96x96.png",
        ...options,
      })
    }
    return null
  }

  const requestPermission = async () => {
    if (!isSupported) return false

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result === "granted"
    } catch (error) {
      console.error("Error requesting notification permission:", error)
      return false
    }
  }

  return {
    permission,
    isSupported,
    canSend: permission === "granted" && isSupported,
    sendNotification,
    requestPermission,
  }
}
