import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Car, Shield, Calendar, BarChart3, Users, CheckCircle } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">CarCare Pro</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/auth/login">Iniciar Sesión</Link>
            </Button>
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link href="/auth/signup">Registrarse</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Gestiona el Mantenimiento de tus Vehículos
          </h2>
          <p className="text-xl text-muted-foreground mb-8 text-pretty">
            Mantén un registro completo del mantenimiento de todos tus vehículos, programa servicios y controla gastos
            desde una sola plataforma.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-primary hover:bg-primary/90">
              <Link href="/auth/signup">Comenzar Gratis</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/login">Ya tengo cuenta</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-foreground mb-4">Todo lo que necesitas para cuidar tus vehículos</h3>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Una solución completa para el mantenimiento automotriz profesional
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-border/50 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Car className="h-10 w-10 text-primary mb-2" />
              <CardTitle className="text-foreground">Gestión de Vehículos</CardTitle>
              <CardDescription>Registra y organiza todos tus vehículos con información detallada</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border/50 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Calendar className="h-10 w-10 text-primary mb-2" />
              <CardTitle className="text-foreground">Programación de Servicios</CardTitle>
              <CardDescription>Programa y recibe recordatorios de mantenimientos próximos</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border/50 hover:shadow-lg transition-shadow">
            <CardHeader>
              <BarChart3 className="h-10 w-10 text-primary mb-2" />
              <CardTitle className="text-foreground">Control de Gastos</CardTitle>
              <CardDescription>Rastrea costos y analiza patrones de gastos en mantenimiento</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border/50 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Shield className="h-10 w-10 text-primary mb-2" />
              <CardTitle className="text-foreground">Historial Completo</CardTitle>
              <CardDescription>Mantén un registro detallado de todos los servicios realizados</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border/50 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-10 w-10 text-primary mb-2" />
              <CardTitle className="text-foreground">Multi-usuario</CardTitle>
              <CardDescription>Gestiona vehículos familiares o de empresa con acceso compartido</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border/50 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CheckCircle className="h-10 w-10 text-primary mb-2" />
              <CardTitle className="text-foreground">Fácil de Usar</CardTitle>
              <CardDescription>Interfaz intuitiva diseñada para usuarios de todos los niveles</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="text-center py-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">¿Listo para comenzar?</h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Únete a miles de usuarios que ya confían en CarCare Pro para mantener sus vehículos en perfecto estado.
            </p>
            <Button size="lg" asChild className="bg-primary hover:bg-primary/90">
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
            <span className="text-lg font-semibold text-foreground">CarCare Pro</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2024 CarCare Pro. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
