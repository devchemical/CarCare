import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MaintenanceList } from "@/components/maintenance/maintenance-list";
import { AddMaintenanceDialog } from "@/components/maintenance/add-maintenance-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Car, Plus, Wrench, Gauge } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function VehicleMaintenancePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  // Fetch vehicle details
  const { data: vehicle, error: vehicleError } = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", id)
    .eq("user_id", data.user.id)
    .single();

  if (vehicleError || !vehicle) {
    redirect("/vehicles");
  }

  // Fetch maintenance records
  const { data: maintenanceRecords, error: maintenanceError } = await supabase
    .from("maintenance_records")
    .select("*")
    .eq("vehicle_id", id)
    .eq("user_id", data.user.id)
    .order("service_date", { ascending: false });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/vehicles" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver a Vehículos
          </Link>
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Car className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle className="text-2xl">
                    {vehicle.make} {vehicle.model}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-1">
                    <Badge variant="secondary">{vehicle.year}</Badge>
                    {vehicle.license_plate && (
                      <span>Placa: {vehicle.license_plate}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <Gauge className="h-4 w-4" />
                      {vehicle.mileage.toLocaleString("es-ES")} km
                    </span>
                  </CardDescription>
                </div>
              </div>
              <AddMaintenanceDialog vehicleId={id}>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Mantenimiento
                </Button>
              </AddMaintenanceDialog>
            </div>
          </CardHeader>
        </Card>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Wrench className="h-6 w-6 text-primary" />
            Historial de Mantenimiento
          </h2>
          <p className="text-muted-foreground mt-1">
            {maintenanceRecords?.length || 0} registro(s) de mantenimiento
          </p>
        </div>
      </div>

      {maintenanceRecords && maintenanceRecords.length > 0 ? (
        <MaintenanceList records={maintenanceRecords} vehicleId={id} />
      ) : (
        <Card className="text-center py-12">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-muted rounded-full">
                <Wrench className="h-12 w-12 text-muted-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl text-foreground">
              No hay registros de mantenimiento
            </CardTitle>
            <CardDescription className="text-lg">
              Comienza agregando el primer registro de mantenimiento para este
              vehículo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddMaintenanceDialog vehicleId={id}>
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                <Plus className="h-5 w-5 mr-2" />
                Agregar Primer Mantenimiento
              </Button>
            </AddMaintenanceDialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
