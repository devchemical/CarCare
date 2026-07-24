"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

interface PrivacyConsentBannerProps {
  error: string | null
  isPending: boolean
  onAccept(): void
  onReject(): void
}

export function PrivacyConsentBanner({ error, isPending, onAccept, onReject }: PrivacyConsentBannerProps) {
  return (
    <section
      aria-label="Preferencias de privacidad"
      className="bg-background/95 border-border fixed inset-x-3 bottom-3 z-50 mx-auto max-w-3xl rounded-xl border p-4 shadow-2xl backdrop-blur-sm sm:bottom-6 sm:p-5"
      role="region"
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <h2 className="text-foreground text-base font-semibold">Tu privacidad, tu elección</h2>
          <p className="text-muted-foreground text-sm leading-6">
            Keepel utiliza cookies necesarias para iniciar sesión y recordar tus preferencias. Solo enviaremos
            estadísticas anónimas y mínimas si aceptas la analítica opcional. Puedes cambiar tu decisión en cualquier
            momento. Consulta la{" "}
            <Link href="/privacidad" className="text-primary font-medium underline underline-offset-4">
              Política de Privacidad y Cookies
            </Link>
            .
          </p>
        </div>

        {error && (
          <p className="text-destructive text-sm" role="alert">
            {error}
          </p>
        )}

        <div className="grid gap-2 sm:grid-cols-2">
          <Button type="button" variant="outline" disabled={isPending} onClick={onReject}>
            Rechazar analítica
          </Button>
          <Button type="button" variant="outline" disabled={isPending} onClick={onAccept}>
            Aceptar analítica
          </Button>
        </div>
      </div>
    </section>
  )
}
