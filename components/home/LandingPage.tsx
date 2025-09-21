"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import {
  Car,
  Shield,
  Calendar,
  BarChart3,
  Users,
  CheckCircle,
} from "lucide-react";

export function LandingPage() {
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
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Iniciar Sesión</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">Registrarse</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-foreground mb-6 leading-tight">
            Gestiona el cuidado de tu{" "}
            <span className="text-primary">vehículo</span> de manera{" "}
            <span className="text-primary">inteligente</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Mantén un registro completo del mantenimiento, recibe recordatorios
            personalizados y prolonga la vida útil de tu automóvil con CarCare
            Pro.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              asChild
              className="bg-primary hover:bg-primary/90"
            >
              <Link href="/auth/signup">Comenzar Gratis</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/login">Iniciar Sesión</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-foreground mb-4">
            Todo lo que necesitas para cuidar tu vehículo
          </h3>
          <p className="text-lg text-muted-foreground">
            Herramientas profesionales al alcance de todos
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <Car className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-xl">Registro de Vehículos</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Gestiona múltiples vehículos con información detallada y
                fotografías.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-xl">Recordatorios</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Recibe notificaciones automáticas sobre próximos mantenimientos
                y servicios.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-xl">Análisis</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Visualiza estadísticas de costos, frecuencia y patrones de
                mantenimiento.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-xl">Seguridad</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Tus datos están protegidos con encriptación de nivel
                empresarial.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-16 bg-card/30 rounded-3xl mx-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-3xl font-bold text-foreground mb-6">
              Beneficios de usar CarCare Pro
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground">
                    Ahorra dinero
                  </h4>
                  <p className="text-muted-foreground">
                    Prevén reparaciones costosas con mantenimiento preventivo
                    oportuno.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground">
                    Prolonga la vida útil
                  </h4>
                  <p className="text-muted-foreground">
                    Mantén tu vehículo en óptimas condiciones por más tiempo.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground">
                    Aumenta el valor de reventa
                  </h4>
                  <p className="text-muted-foreground">
                    Un historial completo de mantenimiento incrementa el valor
                    de tu auto.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground">
                    Tranquilidad total
                  </h4>
                  <p className="text-muted-foreground">
                    Nunca más olvides un cambio de aceite o revisión importante.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-8 text-center">
            <Users className="h-16 w-16 text-primary mx-auto mb-4" />
            <h4 className="text-2xl font-bold text-foreground mb-2">
              +10,000 usuarios confían en nosotros
            </h4>
            <p className="text-muted-foreground">
              Únete a la comunidad de propietarios responsables que cuidan sus
              vehículos de manera profesional.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="text-center py-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              ¿Listo para comenzar?
            </h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Únete a miles de usuarios que ya confían en CarCare Pro para
              mantener sus vehículos en perfecto estado.
            </p>
            <Button
              size="lg"
              asChild
              className="bg-primary hover:bg-primary/90"
            >
              <Link href="/auth/signup">Crear Cuenta Gratis</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Car className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold text-foreground">
              CarCare Pro
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 CarCare Pro. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
