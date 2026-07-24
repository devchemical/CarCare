"use client"

import Image from "next/image"
import Link from "next/link"
import { PrivacySettingsTrigger } from "@/components/privacy/privacy-settings-trigger"

export function Footer() {
  return (
    <footer className="border-border/50 bg-background/80 border-t backdrop-blur-sm">
      <div className="container mx-auto flex flex-col items-center gap-4 px-4 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <div className="flex items-center justify-center gap-2 sm:justify-start">
            <Image src="/logo_keepel_grueso.svg" alt="" width={26} height={20} />
            <span className="text-foreground text-lg font-semibold">Keepel</span>
          </div>
          <p className="text-muted-foreground mt-2 text-sm">© 2026 Keepel. Todos los derechos reservados.</p>
        </div>

        <nav aria-label="Privacidad" className="flex flex-wrap items-center justify-center gap-1 sm:justify-end">
          <Link
            href="/privacidad"
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded-md px-3 py-2 text-sm underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:outline-none"
          >
            Privacidad y cookies
          </Link>
          <PrivacySettingsTrigger variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            Configurar cookies
          </PrivacySettingsTrigger>
        </nav>
      </div>
    </footer>
  )
}
