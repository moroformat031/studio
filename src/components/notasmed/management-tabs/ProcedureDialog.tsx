
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
import { PlusCircle, Stethoscope, Hash } from 'lucide-react';
import { MasterProcedure } from '@/types/ehr';

interface ProcedureDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { code: string, name: string }) => void;
    item: MasterProcedure | null;
    isSaving: boolean;
}

export function ProcedureDialog({ isOpen, onClose, onSave, item, isSaving }: ProcedureDialogProps) {
    const [code, setCode] = useState('');
    const [name, setName] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (item) {
                setCode(item.code);
                setName(item.name);
            } else {
                setCode('');
                setName('');
            }
        }
    }, [item, isOpen]);

    const handleSave = () => {
        onSave({ code, name });
    };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{item ? `Editar Procedimiento` : `Agregar Nuevo Procedimiento`}</DialogTitle>
          <DialogDescription>
            {`Introduzca el código y nombre del procedimiento.`}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="item-code">Código del Procedimiento</Label>
                <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="item-code" value={code} onChange={e => setCode(e.target.value)} required disabled={isSaving} className="pl-10 font-mono" />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="item-name">Nombre del Procedimiento</Label>
                <div className="relative">
                    <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="item-name" value={name} onChange={e => setName(e.target.value)} required disabled={isSaving} className="pl-10" />
                </div>
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancelar</Button>
          <Button type="submit" onClick={handleSave} disabled={isSaving}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {isSaving ? 'Guardando...' : (item ? `Actualizar Procedimiento` : `Agregar Procedimiento`)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
