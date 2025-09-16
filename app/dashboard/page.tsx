import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { UpcomingMaintenance } from "@/components/dashboard/upcoming-maintenance";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { VehicleOverview } from "@/components/dashboard/vehicle-overview";
import { Button } from "@/components/ui/button";
import { Car, Plus, LogOut } from "lucide-react";
import Link from "next/link";

// Force dynamic rendering para páginas que usan Supabase
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  // Fetch vehicles
  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("*")
    .eq("user_id", data.user.id)
    .order("created_at", { ascending: false });

  // Fetch maintenance records
  const { data: maintenanceRecords } = await supabase
    .from("maintenance_records")
    .select(
      `
      *,
      vehicles (
        make,
        model,
        year
      )
    `
    )
    .eq("user_id", data.user.id)
    .order("service_date", { ascending: false })
    .limit(10);

  // Fetch upcoming maintenance (next 30 days)
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const { data: upcomingMaintenance } = await supabase
    .from("maintenance_records")
    .select(
      `
      *,
      vehicles (
        make,
        model,
        year,
        license_plate
      )
    `
    )
    .eq("user_id", data.user.id)
    .not("next_service_date", "is", null)
    .lte("next_service_date", thirtyDaysFromNow.toISOString().split("T")[0])
    .order("next_service_date", { ascending: true });

  const handleSignOut = async () => {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">CarCare Pro</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Hola, {profile?.full_name || data.user.email}
            </span>
            <form action={handleSignOut}>
              <Button variant="ghost" size="sm" type="submit">
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Panel de Control
          </h2>
          <p className="text-muted-foreground">
            Resumen de tus vehículos y mantenimientos
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/vehicles">
              <Car className="h-4 w-4 mr-2" />
              Ver Vehículos
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/vehicles">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Vehículo
            </Link>
          </Button>
        </div>

        {/* Dashboard Stats */}
        <DashboardStats
          vehicles={vehicles || []}
          maintenanceRecords={maintenanceRecords || []}
        />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mt-8">
          {/* Left Column - Vehicle Overview */}
          <div className="lg:col-span-2 space-y-6">
            <VehicleOverview vehicles={vehicles || []} />
            <RecentActivity maintenanceRecords={maintenanceRecords || []} />
          </div>

          {/* Right Column - Upcoming Maintenance */}
          <div className="space-y-6">
            <UpcomingMaintenance
              upcomingMaintenance={upcomingMaintenance || []}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
