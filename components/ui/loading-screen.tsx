"use client";

import { Car } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = "Cargando..." }: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
      <div className="flex flex-col items-center gap-4">
        <Car className="h-8 w-8 text-primary animate-pulse" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
