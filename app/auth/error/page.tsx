import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Car, AlertCircle } from "lucide-react"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

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
                <div className="p-3 bg-destructive/10 rounded-full">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
              </div>
              <CardTitle className="text-2xl text-foreground">Error de Autenticación</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              {params?.error ? (
                <p className="text-sm text-muted-foreground mb-6">Código de error: {params.error}</p>
              ) : (
                <p className="text-sm text-muted-foreground mb-6">
                  Ocurrió un error no especificado durante la autenticación.
                </p>
              )}
              <Button asChild className="w-full bg-primary hover:bg-primary/90">
                <Link href="/auth/login">Volver a Iniciar Sesión</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
