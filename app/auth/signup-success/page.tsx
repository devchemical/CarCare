import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Car, Mail } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Car className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">CarCare Pro</h1>
          </div>

          <Card className="border-border/50 shadow-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl text-foreground">¡Cuenta Creada Exitosamente!</CardTitle>
              <CardDescription className="text-muted-foreground">Verifica tu email para continuar</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-6">
                Te hemos enviado un enlace de confirmación a tu email. Por favor, revisa tu bandeja de entrada y haz
                clic en el enlace para activar tu cuenta.
              </p>
              <div className="space-y-3">
                <Button asChild className="w-full bg-primary hover:bg-primary/90">
                  <Link href="/auth/login">Ir a Iniciar Sesión</Link>
                </Button>
                <p className="text-xs text-muted-foreground">¿No recibiste el email? Revisa tu carpeta de spam.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
