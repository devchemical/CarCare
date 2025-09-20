"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Car, Plus, Gauge } from "lucide-react";
import Link from "next/link";
import { formatMileage } from "@/lib/formatters";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  license_plate?: string;
  color?: string;
  mileage: number;
}

interface VehicleOverviewProps {
  vehicles: Vehicle[];
}

export function VehicleOverview({ vehicles }: VehicleOverviewProps) {
  if (vehicles.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5 text-primary" />
            Mis Vehículos
          </CardTitle>
          <CardDescription>No tienes vehículos registrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="p-4 bg-muted rounded-full w-fit mx-auto mb-4">
              <Car className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">
              Comienza agregando tu primer vehículo
            </p>
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link href="/vehicles">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Vehículo
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-primary" />
              Mis Vehículos
            </CardTitle>
            <CardDescription>
              {vehicles.length} vehículo{vehicles.length !== 1 ? "s" : ""}{" "}
              registrado{vehicles.length !== 1 ? "s" : ""}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/vehicles">Ver Todos</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {vehicles.slice(0, 3).map((vehicle) => (
            <div
              key={vehicle.id}
              className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Car className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-foreground">
                    {vehicle.make} {vehicle.model}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary" className="text-xs">
                      {vehicle.year}
                    </Badge>
                    {vehicle.license_plate && (
                      <span>{vehicle.license_plate}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Gauge className="h-4 w-4" />
                <span>{formatMileage(vehicle.mileage)}</span>
              </div>
            </div>
          ))}

          {vehicles.length > 3 && (
            <div className="text-center pt-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/vehicles">
                  Ver {vehicles.length - 3} vehículo
                  {vehicles.length - 3 !== 1 ? "s" : ""} más
                </Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
