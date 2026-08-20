"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { Car, ChevronLeft, ChevronRight, Cookie, Gauge, LogOut, Menu, Shield, User } from "lucide-react"
import { LogoutControl } from "@/components/auth/logout-control"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useAuthProjection } from "@/contexts"
import { usePrivacyConsent } from "@/components/privacy/consent-provider"
import { ContextErrorBoundary } from "@/components/ui/context-error-boundary"
import { AUTH_STATE_STATUS } from "@/lib/auth/contracts"
import { cn } from "@/lib/utils"

const RAIL_STORAGE_KEY = "keepel.dashboard.rail-expanded"
const navigation = [
  { href: "/", label: "Dashboard", icon: Gauge },
  { href: "/vehicles", label: "Vehículos", icon: Car },
]

const rowClassName =
  "flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm transition-[background-color,color] duration-150 focus-visible:ring-2 focus-visible:ring-[var(--shell-focus)] focus-visible:outline-none motion-reduce:transition-none"
const inactiveRowClassName =
  "text-[var(--shell-muted)] hover:bg-[var(--shell-elevated)] hover:text-[var(--shell-foreground)]"

function RowIcon({ children }: { children: ReactNode }) {
  return <span className="flex w-5 shrink-0 items-center justify-center">{children}</span>
}

function getRowAlignment(expanded: boolean) {
  return !expanded ? "justify-center" : "justify-start"
}

function NavigationLinks({ expanded, mobile = false }: { expanded: boolean; mobile?: boolean }) {
  const pathname = usePathname()
  return (
    <nav aria-label="Navegación principal" className="space-y-2">
      {navigation.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === href : pathname.startsWith(href)
        const link = (
          <Link
            href={href}
            aria-current={active ? "page" : undefined}
            aria-label={label}
            title={!expanded ? label : undefined}
            className={cn(
              rowClassName,
              "font-medium",
              active ? "bg-[var(--shell-active)] text-[var(--shell-active-foreground)]" : inactiveRowClassName,
              getRowAlignment(expanded)
            )}
          >
            <RowIcon>
              <Icon className="h-5 w-5" aria-hidden="true" />
            </RowIcon>
            {mobile || expanded ? <span className={mobile ? undefined : "hidden lg:inline"}>{label}</span> : null}
          </Link>
        )
        return mobile ? (
          <SheetClose asChild key={href}>
            {link}
          </SheetClose>
        ) : (
          <div key={href}>{link}</div>
        )
      })}
    </nav>
  )
}

function AccountControls({
  expanded,
  mobile = false,
  closeMobileNavigation,
  privacyPreferencesReturnFocus,
}: {
  expanded: boolean
  mobile?: boolean
  closeMobileNavigation?: () => void
  privacyPreferencesReturnFocus?: { current: HTMLElement | null }
}) {
  const authState = useAuthProjection()
  const pathname = usePathname()
  const { openPreferences } = usePrivacyConsent()
  if (authState.status !== AUTH_STATE_STATUS.AUTHENTICATED) return null
  const { user } = authState
  const privacyActive = pathname === "/privacidad"
  const privacyLink = (
    <Link
      href="/privacidad"
      aria-current={privacyActive ? "page" : undefined}
      aria-label="Privacidad"
      title={!mobile && !expanded ? "Privacidad" : undefined}
      className={cn(
        rowClassName,
        privacyActive ? "bg-[var(--shell-active)] text-[var(--shell-active-foreground)]" : inactiveRowClassName,
        getRowAlignment(expanded)
      )}
    >
      <RowIcon>
        <Shield className="h-5 w-5" aria-hidden="true" />
      </RowIcon>
      {mobile || expanded ? <span className={mobile ? undefined : "hidden lg:inline"}>Privacidad</span> : null}
    </Link>
  )

  return (
    <div className="flex flex-col gap-2 border-t border-[var(--shell-border)] pt-4">
      <div
        className={cn("flex min-h-11 items-center gap-3 px-3", getRowAlignment(expanded))}
        title={!mobile && !expanded ? user.displayName : undefined}
      >
        <RowIcon>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--shell-elevated)]">
            <User className="h-4 w-4" aria-hidden="true" />
          </span>
        </RowIcon>
        {mobile || expanded ? (
          <span className={cn("min-w-0 text-sm", !mobile && "hidden lg:block")}>
            <span className="block truncate font-medium">Hola, {user.displayName}</span>
            {user.email ? <span className="block truncate text-xs text-[var(--shell-muted)]">{user.email}</span> : null}
          </span>
        ) : (
          <span className="sr-only">Hola, {user.displayName}</span>
        )}
      </div>
      <nav aria-label="Cuenta y privacidad" className="flex flex-col gap-1">
        {mobile ? <SheetClose asChild>{privacyLink}</SheetClose> : privacyLink}
        <Button
          type="button"
          variant="ghost"
          aria-label="Configurar cookies"
          title={!mobile && !expanded ? "Configurar cookies" : undefined}
          onClick={() => {
            if (!closeMobileNavigation) {
              openPreferences()
              return
            }

            closeMobileNavigation()
            window.requestAnimationFrame(() => openPreferences(privacyPreferencesReturnFocus?.current))
          }}
          className={cn(rowClassName, inactiveRowClassName, getRowAlignment(expanded))}
        >
          <RowIcon>
            <Cookie className="h-5 w-5" aria-hidden="true" />
          </RowIcon>
          {mobile || expanded ? (
            <span className={mobile ? undefined : "hidden lg:inline"}>Configurar cookies</span>
          ) : null}
        </Button>
      </nav>
      <LogoutControl className="w-full">
        {({ isPending }) => (
          <Button
            type="submit"
            variant="ghost"
            disabled={isPending}
            aria-label="Cerrar sesión"
            title={!mobile && !expanded ? "Cerrar sesión" : undefined}
            className={cn(rowClassName, inactiveRowClassName, getRowAlignment(expanded))}
          >
            <RowIcon>
              <LogOut className="h-5 w-5" aria-hidden="true" />
            </RowIcon>
            {mobile || expanded ? (
              <span className={mobile ? undefined : "hidden lg:inline"}>
                {isPending ? "Cerrando sesión…" : "Cerrar sesión"}
              </span>
            ) : null}
          </Button>
        )}
      </LogoutControl>
    </div>
  )
}

export function AuthenticatedApplicationShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const mobileNavigationTriggerRef = useRef<HTMLButtonElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setExpanded(window.localStorage.getItem(RAIL_STORAGE_KEY) === "true")
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  function toggleRail() {
    setExpanded((current) => {
      const next = !current
      window.localStorage.setItem(RAIL_STORAGE_KEY, String(next))
      return next
    })
  }

  return (
    <div className="dashboard-shell min-h-screen bg-[var(--shell-canvas)] text-[var(--shell-foreground)]">
      <header className="fixed inset-x-0 top-0 z-40 h-16 border-b border-[var(--shell-border)] bg-[color:var(--shell-surface)]/95 backdrop-blur-sm">
        <div className="flex h-full items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg focus-visible:ring-2 focus-visible:ring-[var(--shell-focus)] focus-visible:outline-none"
          >
            <Image src="/logo_keepel_grueso.svg" alt="" width={36} height={28} priority />
            <span className="text-xl font-semibold tracking-tight">Keepel</span>
          </Link>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                ref={mobileNavigationTriggerRef}
                variant="outline"
                size="icon"
                className="md:hidden"
                aria-label="Abrir navegación"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="dashboard-shell flex w-[min(20rem,88vw)] flex-col border-[var(--shell-border)] bg-[var(--shell-surface)]"
            >
              <SheetHeader className="text-left">
                <SheetTitle>Navegación de Keepel</SheetTitle>
                <SheetDescription className="sr-only">
                  Accede al dashboard, a tus vehículos y a los controles de sesión.
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 flex flex-1 flex-col justify-between">
                <NavigationLinks expanded mobile />
                <AccountControls
                  expanded
                  mobile
                  closeMobileNavigation={() => setMobileOpen(false)}
                  privacyPreferencesReturnFocus={mobileNavigationTriggerRef}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <aside
        className={cn(
          "fixed top-16 bottom-0 left-0 z-30 hidden flex-col border-r border-[var(--shell-border)] bg-[var(--shell-surface)] p-3 pb-20 transition-[width] duration-200 motion-reduce:transition-none md:flex",
          expanded ? "w-20 lg:w-64" : "w-20"
        )}
      >
        <div className="flex-1">
          <Button
            type="button"
            variant="ghost"
            onClick={toggleRail}
            aria-expanded={expanded}
            aria-label={expanded ? "Contraer navegación" : "Expandir navegación"}
            className={cn(rowClassName, inactiveRowClassName, "mt-4 hidden justify-center lg:flex")}
          >
            <RowIcon>
              {expanded ? (
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              ) : (
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              )}
            </RowIcon>
            <span className="sr-only">{expanded ? "Contraer navegación" : "Expandir navegación"}</span>
          </Button>
          <NavigationLinks expanded={expanded} />
        </div>
        <AccountControls expanded={expanded} />
      </aside>

      <main
        id="contenido-principal"
        className={cn(
          "min-w-0 pt-16 transition-[margin-left] duration-200 motion-reduce:transition-none md:ml-20",
          expanded && "lg:ml-64"
        )}
      >
        {children}
      </main>
    </div>
  )
}

function isAuthenticatedApplicationPath(pathname: string) {
  return pathname === "/" || pathname === "/privacidad" || pathname === "/vehicles" || pathname.startsWith("/vehicles/")
}

export function AuthenticatedApplicationBoundary({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const authState = useAuthProjection()

  if (authState.status !== AUTH_STATE_STATUS.AUTHENTICATED || !isAuthenticatedApplicationPath(pathname)) {
    return children
  }

  return (
    <AuthenticatedApplicationShell>
      <ContextErrorBoundary
        key={pathname}
        fallback={
          <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12" role="alert">
            <div className="max-w-md text-center">
              <h1 className="text-xl font-semibold">No se pudo cargar esta vista</h1>
              <p className="mt-2 text-sm text-[var(--shell-muted)]">
                La navegación sigue disponible. Recarga la página para volver a intentarlo.
              </p>
              <Button type="button" className="mt-4" onClick={() => window.location.reload()}>
                Recargar página
              </Button>
            </div>
          </section>
        }
      >
        {children}
      </ContextErrorBoundary>
    </AuthenticatedApplicationShell>
  )
}
