
"use client";
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Pill, Stethoscope } from 'lucide-react';
import { MasterMedication, MasterProcedure } from '@/types/ehr';

interface MasterItemDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string) => void;
    item: MasterMedication | MasterProcedure | null;
    isSaving: boolean;
    itemName: 'Medicamento' | 'Procedimiento';
    itemIcon: 'Pill' | 'Stethoscope';
}

const icons = {
    Pill: Pill,
    Stethoscope: Stethoscope
};

export function MasterItemDialog({ isOpen, onClose, onSave, item, isSaving, itemName, itemIcon }: MasterItemDialogProps) {
    const [name, setName] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (item) {
                setName(item.name);
            } else {
                setName('');
            }
        }
    }, [item, isOpen]);

    const handleSave = () => {
        onSave(name);
    };

    const Icon = icons[itemIcon];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{item ? `Editar ${itemName}` : `Agregar Nuevo ${itemName}`}</DialogTitle>
          <DialogDescription>
            {`Introduzca el nombre del ${itemName.toLowerCase()}.`}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="item-name">{`Nombre del ${itemName}`}</Label>
                <div className="relative">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="item-name" value={name} onChange={e => setName(e.target.value)} required disabled={isSaving} className="pl-10" />
                </div>
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancelar</Button>
          <Button type="submit" onClick={handleSave} disabled={isSaving}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {isSaving ? 'Guardando...' : (item ? `Actualizar ${itemName}` : `Agregar ${itemName}`)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
