import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { useSupabase } from "@/hooks/useSupabase";

interface GoogleSignInButtonProps {
  redirectTo?: string;
  className?: string;
  children?: React.ReactNode;
  supabaseClient?: ReturnType<typeof createClient>;
}

export function GoogleSignInButton({
  redirectTo = "/dashboard",
  className,
  children = "Continuar con Google",
  supabaseClient,
}: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const defaultSupabase = useSupabase();
  // Usar el cliente pasado como prop o el hook por defecto
  const supabase = supabaseClient || defaultSupabase;

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `https://v0-car-maintenance-app-devchemicals-projects.vercel.app/auth/callback?next=${redirectTo}`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        console.error("Error al iniciar sesión con Google:", error.message);
      }
    } catch (error) {
      console.error("Error inesperado:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Icons.google className="mr-2 h-4 w-4" />
      )}
      {children}
    </Button>
  );
}
