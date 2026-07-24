"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import type { PrivacyConsentPreference } from "@/lib/privacy/consent"

interface PrivacyPreferencesDialogProps {
  error: string | null
  isOpen: boolean
  isPending: boolean
  preference: PrivacyConsentPreference
  onAccept(): void
  onClose(): void
  onOpenChange(open: boolean): void
  onReject(): void
}

export function PrivacyPreferencesDialog({
  error,
  isOpen,
  isPending,
  preference,
  onAccept,
  onClose,
  onOpenChange,
  onReject,
}: PrivacyPreferencesDialogProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="mx-auto max-h-[90dvh] max-w-xl overflow-y-auto rounded-t-3xl">
        <SheetHeader>
          <SheetTitle>Preferencias de privacidad</SheetTitle>
          <SheetDescription>
            Las cookies necesarias siempre están activas. La analítica anónima es opcional y solo registra contadores de
            accesos y cierres de sesión completados, sin identificarte.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-3">
          <div className="border-border rounded-lg border p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-foreground font-medium">Cookies necesarias</h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  Permiten autenticarte, proteger el servicio y recordar esta elección.
                </p>
              </div>
              <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs font-medium">
                Siempre activas
              </span>
            </div>
          </div>

          <div className="border-border rounded-lg border p-4">
            <h3 className="text-foreground font-medium">Analítica anónima</h3>
            <p className="text-muted-foreground mt-1 text-sm leading-6">
              No enviamos nombre, correo, identificadores, rutas, dirección IP ni datos del navegador. Al retirar el
              consentimiento dejamos de registrar eventos futuros; los agregados anónimos anteriores se eliminan al
              cumplir un máximo de 13 meses.
            </p>
            <p className="text-muted-foreground mt-2 text-xs">
              Estado actual:{" "}
              {preference === "accepted" ? "aceptada" : preference === "rejected" ? "rechazada" : "sin decidir"}.
            </p>
          </div>

          {error && (
            <p className="text-destructive text-sm" role="alert">
              {error}
            </p>
          )}

          <p className="text-muted-foreground text-sm">
            Consulta todos los detalles en la{" "}
            <Link
              href="/privacidad"
              className="text-primary font-medium underline underline-offset-4"
              onClick={onClose}
            >
              Política de Privacidad y Cookies
            </Link>
            .
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <Button type="button" variant="outline" disabled={isPending} onClick={onReject}>
            Usar solo necesarias
          </Button>
          <Button type="button" variant="outline" disabled={isPending} onClick={onAccept}>
            Permitir analítica
          </Button>
        </div>
        <Button type="button" variant="ghost" disabled={isPending} onClick={onClose}>
          Cerrar
        </Button>
      </SheetContent>
    </Sheet>
  )
}
