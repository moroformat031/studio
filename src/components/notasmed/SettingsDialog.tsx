"use client";

import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface SettingsDialogProps {
  children: ReactNode;
}

export function SettingsDialog({ children }: SettingsDialogProps) {
  const [fontSize, setFontSize] = useLocalStorage("notasmed-fontSize", 16);

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configuración</DialogTitle>
          <DialogDescription>
            Ajusta tus preferencias para la aplicación.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="font-size" className="text-right">
              Tamaño de Fuente
            </Label>
            <div className="col-span-3 flex items-center gap-4">
              <Slider
                id="font-size"
                min={12}
                max={24}
                step={1}
                value={[fontSize]}
                onValueChange={(value) => setFontSize(value[0])}
              />
              <span className="text-sm font-medium w-8 text-center">{fontSize}px</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
