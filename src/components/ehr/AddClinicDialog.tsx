
"use client";
import React, { useState, ReactNode } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { Building } from 'lucide-react';

interface AddClinicDialogProps {
    children: ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (clinicName: string) => void;
}

export function AddClinicDialog({ children, open, onOpenChange, onSave }: AddClinicDialogProps) {
    const [clinicName, setClinicName] = useState('');
    const { toast } = useToast();

    const handleSave = () => {
        if (!clinicName.trim()) {
            toast({
                variant: 'destructive',
                title: 'Nombre Requerido',
                description: "Por favor, introduce el nombre de la clínica.",
            });
            return;
        }
        onSave(clinicName);
        setClinicName('');
    }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agregar Nueva Clínica</DialogTitle>
          <DialogDescription>
            Introduce los detalles de la nueva clínica. Haz clic en guardar cuando hayas terminado.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="clinicName">
              Nombre de la Clínica
            </Label>
             <div className="relative">
               <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
               <Input
                    id="clinicName"
                    value={clinicName}
                    onChange={e => setClinicName(e.target.value)}
                    className="pl-10"
                    placeholder="p.ej. Clínica Bienestar"
                />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button type="submit" onClick={handleSave}>Guardar Clínica</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
