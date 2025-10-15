"use client"

import { useEffect, useState } from "react"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function usePWA() {
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    // Verificar si ya está instalado
    const checkIfInstalled = () => {
      if (typeof window !== "undefined") {
        const isStandaloneMode = window.matchMedia("(display-mode: standalone)").matches
        const isIOSStandalone = (window.navigator as any).standalone === true
        const isInstalledMode = isStandaloneMode || isIOSStandalone

        setIsStandalone(isInstalledMode)
        setIsInstalled(isInstalledMode)

        // Si ya está instalado, no es instalable
        if (isInstalledMode) {
          setIsInstallable(false)
        }
      }
    }

    checkIfInstalled()

    // Listener para el evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log("beforeinstallprompt event fired")
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    // Listener para cuando la app se instala
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
      console.log("Keepel ha sido instalada exitosamente")
    }

    // Detectar si el service worker está registrado
    const checkServiceWorker = async () => {
      if ("serviceWorker" in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration()
          if (registration) {
            console.log("Service Worker está registrado")
          } else {
            console.warn("Service Worker no está registrado")
          }
        } catch (error) {
          console.error("Error verificando Service Worker:", error)
        }
      }
    }

    checkServiceWorker()

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    // Verificar periódicamente si el estado cambia
    const intervalId = setInterval(checkIfInstalled, 1000)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
      clearInterval(intervalId)
    }
  }, [])

  const installApp = async () => {
    if (!deferredPrompt) return false

    try {
      await deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice

      if (choiceResult.outcome === "accepted") {
        console.log("Usuario aceptó instalar la PWA")
        setIsInstallable(false)
        setDeferredPrompt(null)
        return true
      } else {
        console.log("Usuario canceló la instalación")
        return false
      }
    } catch (error) {
      console.error("Error durante la instalación:", error)
      return false
    }
  }

  const getInstallInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase()

    if (userAgent.includes("chrome") && !userAgent.includes("edg")) {
      return {
        browser: "Chrome",
        steps: [
          "Toca el menú (⋮) en la esquina superior derecha",
          'Selecciona "Instalar app" o "Añadir a pantalla de inicio"',
          "Confirma la instalación",
        ],
      }
    } else if (userAgent.includes("firefox")) {
      return {
        browser: "Firefox",
        steps: ["Toca el menú (⋮) en la esquina superior derecha", 'Selecciona "Instalar"', "Confirma la instalación"],
      }
    } else if (userAgent.includes("safari")) {
      return {
        browser: "Safari",
        steps: [
          "Toca el botón compartir (⬆️) en la parte inferior",
          'Desplázate y selecciona "Añadir a pantalla de inicio"',
          'Toca "Añadir" para confirmar',
        ],
      }
    } else if (userAgent.includes("edg")) {
      return {
        browser: "Edge",
        steps: [
          "Toca el menú (...) en la esquina superior derecha",
          'Selecciona "Instalar esta aplicación"',
          "Confirma la instalación",
        ],
      }
    }

    return {
      browser: "Navegador",
      steps: [
        'Busca la opción "Instalar app" en el menú del navegador',
        "Selecciona la opción de instalación",
        "Confirma la instalación",
      ],
    }
  }

  return {
    isInstallable,
    isInstalled,
    isStandalone,
    installApp,
    getInstallInstructions,
    canInstall: isInstallable && !isInstalled,
  }
}
