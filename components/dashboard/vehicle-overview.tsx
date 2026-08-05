"use client"

import Link from "next/link"
import { ArrowRight, Car, Gauge, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Vehicle } from "@/contexts"
import { formatMileage } from "@/lib/formatters"

export function VehicleOverview({ vehicles }: { vehicles: Vehicle[] }) {
  return (
    <Card className="border-[var(--shell-border)] bg-[var(--shell-surface)] shadow-[0_12px_36px_rgba(31,49,38,0.06)]">
      <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle id="vehicles-heading" className="flex items-center gap-2 text-lg">
            <Car className="h-5 w-5 text-green-700" aria-hidden="true" />
            Mis vehículos
          </CardTitle>
          <CardDescription className="mt-1">
            {vehicles.length === 0
              ? "Empieza añadiendo el vehículo que quieres cuidar."
              : `${vehicles.length} vehículo${vehicles.length === 1 ? "" : "s"} registrado${vehicles.length === 1 ? "" : "s"}`}
          </CardDescription>
        </div>
        {vehicles.length > 0 ? (
          <Button variant="outline" size="sm" asChild>
            <Link href="/vehicles">Gestionar vehículos</Link>
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        {vehicles.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--shell-border)] bg-[var(--shell-elevated)] p-6 text-center sm:p-8">
            <Car className="mx-auto mb-3 h-9 w-9 text-green-700" aria-hidden="true" />
            <p className="mb-5 text-sm text-[var(--shell-muted)]">
              Añade tu primer vehículo para registrar y programar mantenimientos.
            </p>
            <Button asChild>
              <Link href="/vehicles">
                <Plus aria-hidden="true" />
                Añadir primer vehículo
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {vehicles.slice(0, 3).map((vehicle) => (
              <article
                key={vehicle.id}
                className="flex min-w-0 flex-col rounded-xl border border-[var(--shell-border)] bg-[var(--shell-elevated)] p-4 transition-[border-color,transform] duration-150 hover:-translate-y-0.5 hover:border-green-700/40 motion-reduce:transform-none motion-reduce:transition-none"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <span className="rounded-lg bg-white p-2 text-green-700 shadow-sm">
                    <Car className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <Badge variant="secondary">{vehicle.year}</Badge>
                </div>
                <h3 className="truncate font-semibold">
                  {vehicle.make} {vehicle.model}
                </h3>
                <p className="mt-1 min-h-5 truncate text-sm text-[var(--shell-muted)]">
                  {vehicle.license_plate || "Sin matrícula"}
                </p>
                <p className="mt-3 flex items-center gap-2 text-sm text-[var(--shell-muted)]">
                  <Gauge className="h-4 w-4" aria-hidden="true" />
                  {formatMileage(vehicle.mileage)}
                </p>
                <Button variant="ghost" size="sm" className="mt-4 w-full justify-between" asChild>
                  <Link href={`/vehicles/${vehicle.id}`}>
                    Ver vehículo
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              </article>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
