"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PWAStatus {
  hasManifest: boolean
  hasServiceWorker: boolean
  hasValidIcons: boolean
  isHTTPS: boolean
  manifestData: any
  errors: string[]
}

export function PWADebug() {
  const [status, setStatus] = useState<PWAStatus>({
    hasManifest: false,
    hasServiceWorker: false,
    hasValidIcons: false,
    isHTTPS: false,
    manifestData: null,
    errors: [],
  })
  const [isLoading, setIsLoading] = useState(false)

  const checkPWAStatus = async () => {
    setIsLoading(true)
    const errors: string[] = []
    let manifestData = null

    try {
      // Verificar HTTPS
      const isHTTPS = location.protocol === "https:" || location.hostname === "localhost"

      // Verificar Manifest
      let hasManifest = false
      let hasValidIcons = false

      try {
        const manifestResponse = await fetch("/manifest.json")
        if (manifestResponse.ok) {
          manifestData = await manifestResponse.json()
          hasManifest = true

          // Verificar iconos
          const hasRequiredIcons =
            manifestData.icons &&
            manifestData.icons.some((icon: any) => icon.sizes.includes("192x192") || icon.sizes.includes("512x512"))
          hasValidIcons = hasRequiredIcons

          if (!hasRequiredIcons) {
            errors.push("Faltan iconos de 192x192 o 512x512 px")
          }
        } else {
          errors.push("No se pudo cargar el manifest.json")
        }
      } catch (e) {
        errors.push("Error al verificar manifest: " + e)
      }

      // Verificar Service Worker
      const hasServiceWorker = "serviceWorker" in navigator
      if (!hasServiceWorker) {
        errors.push("Service Worker no soportado")
      } else {
        try {
          const registration = await navigator.serviceWorker.getRegistration()
          if (!registration) {
            errors.push("Service Worker no registrado")
          }
        } catch (e) {
          errors.push("Error al verificar Service Worker: " + e)
        }
      }

      // Verificar otros requisitos
      if (!isHTTPS) {
        errors.push("Se requiere conexión HTTPS (excepto localhost)")
      }

      setStatus({
        hasManifest,
        hasServiceWorker,
        hasValidIcons,
        isHTTPS,
        manifestData,
        errors,
      })
    } catch (error) {
      errors.push("Error general: " + error)
      setStatus((prev) => ({ ...prev, errors }))
    }

    setIsLoading(false)
  }

  useEffect(() => {
    checkPWAStatus()
  }, [])

  const StatusItem = ({ label, status, description }: { label: string; status: boolean; description?: string }) => (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div>
        <div className="font-medium">{label}</div>
        {description && <div className="text-muted-foreground text-sm">{description}</div>}
      </div>
      {status ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
    </div>
  )

  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV === "production") {
    return null
  }

  return (
    <Card className="mx-auto mt-4 w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              PWA Debug Status
            </CardTitle>
            <CardDescription>Estado de los requisitos para instalación PWA</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={checkPWAStatus} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <StatusItem
          label="Conexión HTTPS"
          status={status.isHTTPS}
          description="Requerido para PWA (excepto localhost)"
        />

        <StatusItem label="Manifest.json" status={status.hasManifest} description="Archivo de configuración PWA" />

        <StatusItem
          label="Iconos Válidos"
          status={status.hasValidIcons}
          description="Iconos de 192x192 y 512x512 px requeridos"
        />

        <StatusItem label="Service Worker" status={status.hasServiceWorker} description="Funcionalidad offline" />

        {status.errors.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-red-600">Errores encontrados:</h4>
            {status.errors.map((error, index) => (
              <Badge key={index} variant="destructive" className="block w-fit">
                {error}
              </Badge>
            ))}
          </div>
        )}

        {status.manifestData && (
          <details className="mt-4">
            <summary className="cursor-pointer font-medium">Ver datos del Manifest</summary>
            <pre className="bg-muted mt-2 overflow-auto rounded-lg p-3 text-xs">
              {JSON.stringify(status.manifestData, null, 2)}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  )
}
