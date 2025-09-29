// Example of updating a dialog component to use contexts
// This shows the pattern for migrating existing dialog components

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, useData } from "@/contexts";
import type { Vehicle } from "@/contexts";

interface AddVehicleDialogContextProps {
  children: React.ReactNode;
}

export function AddVehicleDialogContext({ children }: AddVehicleDialogContextProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use contexts instead of direct hooks
  const { user } = useAuth();
  const { addVehicleOptimistic } = useData();

  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    license_plate: "",
    vin: "",
    color: "",
    mileage: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      // Use optimistic update from context
      await addVehicleOptimistic({
        make: formData.make,
        model: formData.model,
        year: formData.year,
        license_plate: formData.license_plate || undefined,
        vin: formData.vin || undefined,
        color: formData.color || undefined,
        mileage: formData.mileage,
      });

      // Reset form and close dialog
      setFormData({
        make: "",
        model: "",
        year: new Date().getFullYear(),
        license_plate: "",
        vin: "",
        color: "",
        mileage: 0,
      });
      setOpen(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error al agregar vehículo");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Vehículo</DialogTitle>
          <DialogDescription>
            Completa la información de tu vehículo para comenzar a gestionar su mantenimiento.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="make">Marca *</Label>
              <Input
                id="make"
                value={formData.make}
                onChange={(e) => setFormData(prev => ({ ...prev, make: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="model">Modelo *</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                required
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Agregando..." : "Agregar Vehículo"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
