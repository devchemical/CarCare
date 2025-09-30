"use client"

import { useEffect, useState } from "react"
import { Wifi, WifiOff, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [showOfflineMessage, setShowOfflineMessage] = useState(false)

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine
      setIsOnline(online)

      if (!online) {
        setShowOfflineMessage(true)
      } else if (showOfflineMessage) {
        // Ocultar el mensaje después de 3 segundos cuando vuelva la conexión
        setTimeout(() => setShowOfflineMessage(false), 3000)
      }
    }

    // Establecer estado inicial
    updateOnlineStatus()

    window.addEventListener("online", updateOnlineStatus)
    window.addEventListener("offline", updateOnlineStatus)

    return () => {
      window.removeEventListener("online", updateOnlineStatus)
      window.removeEventListener("offline", updateOnlineStatus)
    }
  }, [showOfflineMessage])

  const handleRetry = () => {
    if (navigator.onLine) {
      window.location.reload()
    }
  }

  if (!showOfflineMessage) {
    return null
  }

  return (
    <div className="fixed right-4 bottom-4 left-4 z-50 md:right-4 md:left-auto md:w-96">
      <Card
        className={`border-2 ${
          isOnline
            ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
            : "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950"
        }`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-green-600 dark:text-green-400" />
            ) : (
              <WifiOff className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            )}
            <CardTitle
              className={`text-lg ${
                isOnline ? "text-green-900 dark:text-green-100" : "text-orange-900 dark:text-orange-100"
              }`}
            >
              {isOnline ? "Conexión Restaurada" : "Sin Conexión"}
            </CardTitle>
          </div>
          <CardDescription
            className={isOnline ? "text-green-700 dark:text-green-300" : "text-orange-700 dark:text-orange-300"}
          >
            {isOnline
              ? "Ya puedes acceder a todas las funcionalidades"
              : "Trabajando en modo offline. Algunas funciones pueden estar limitadas."}
          </CardDescription>
        </CardHeader>
        {!isOnline && (
          <CardContent className="pt-0">
            <Button onClick={handleRetry} variant="outline" size="sm" className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar Conexión
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  )
}

// Hook para usar el estado de conexión en otros componentes
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    updateOnlineStatus()

    window.addEventListener("online", updateOnlineStatus)
    window.addEventListener("offline", updateOnlineStatus)

    return () => {
      window.removeEventListener("online", updateOnlineStatus)
      window.removeEventListener("offline", updateOnlineStatus)
    }
  }, [])

  return isOnline
}
