"use client"

import { useState } from "react"
import { X, Smartphone, Download, Info } from "lucide-react"
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
import { usePWA } from "@/hooks/usePWA"

interface InstallPromptProps {
  onDismiss?: () => void
  className?: string
}

export function InstallPrompt({ onDismiss, className }: InstallPromptProps) {
  const { canInstall, installApp, getInstallInstructions, isStandalone } = usePWA()
  const [isVisible, setIsVisible] = useState(true)
  const [showInstructions, setShowInstructions] = useState(false)

  // No mostrar si no se puede instalar o ya está en modo standalone
  if (!canInstall || isStandalone || !isVisible) {
    return null
  }

  const handleInstall = async () => {
    const success = await installApp()
    if (success) {
      setIsVisible(false)
      onDismiss?.()
    } else {
      // Si falla la instalación automática, mostrar instrucciones manuales
      setShowInstructions(true)
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  const instructions = getInstallInstructions()

  return (
    <>
      <Card className={`border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950 ${className}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <CardTitle className="text-lg text-blue-900 dark:text-blue-100">Instalar CarCare</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="text-blue-700 dark:text-blue-300">
            Instala la app en tu dispositivo para acceso rápido y una mejor experiencia
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-2">
            <Button onClick={handleInstall} className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Instalar App
            </Button>
            <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Info className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Cómo instalar en {instructions.browser}</DialogTitle>
                  <DialogDescription>Sigue estos pasos para instalar CarCare en tu dispositivo:</DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  {instructions.steps.map((step, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                        {index + 1}
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{step}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    💡 Una vez instalada, podrás acceder a CarCare desde tu pantalla de inicio como cualquier otra
                    aplicación.
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

// Componente más simple para mostrar en el header
export function InstallButton() {
  const { canInstall, installApp, isStandalone } = usePWA()

  if (!canInstall || isStandalone) {
    return null
  }

  const handleInstall = async () => {
    await installApp()
  }

  return (
    <Button variant="outline" size="sm" onClick={handleInstall}>
      <Download className="mr-2 h-4 w-4" />
      Instalar App
    </Button>
  )
}
