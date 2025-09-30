// utils/pwa.ts - Utilidades PWA
export const isPWAInstalled = (): boolean => {
  if (typeof window === "undefined") return false

  // Verificar si está en modo standalone (instalado)
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches
  const isIOSStandalone = (window.navigator as any).standalone === true

  return isStandalone || isIOSStandalone
}

export const getPWADisplayMode = (): string => {
  if (typeof window === "undefined") return "browser"

  if (window.matchMedia("(display-mode: standalone)").matches) {
    return "standalone"
  }
  if (window.matchMedia("(display-mode: minimal-ui)").matches) {
    return "minimal-ui"
  }
  if (window.matchMedia("(display-mode: fullscreen)").matches) {
    return "fullscreen"
  }

  return "browser"
}

export const isMobile = (): boolean => {
  if (typeof window === "undefined") return false

  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

export const isIOS = (): boolean => {
  if (typeof window === "undefined") return false

  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

export const isAndroid = (): boolean => {
  if (typeof window === "undefined") return false

  return /Android/.test(navigator.userAgent)
}

// Detectar si el service worker está registrado
export const isServiceWorkerRegistered = (): boolean => {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return false
  }

  return navigator.serviceWorker.controller !== null
}

// Utilidad para actualizar la app
export const updateApp = async (): Promise<boolean> => {
  if (!("serviceWorker" in navigator)) return false

  try {
    const registration = await navigator.serviceWorker.getRegistration()
    if (registration) {
      await registration.update()
      return true
    }
  } catch (error) {
    console.error("Error updating app:", error)
  }

  return false
}
