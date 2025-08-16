
"use client";
import React, { useState, useEffect, useMemo } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Procedure } from '@/types/ehr';
import { useToast } from '@/hooks/use-toast';
import { Combobox } from '@/components/ui/combobox';

interface ProcedureDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (procedure: Omit<Procedure, 'id'> | Procedure) => void;
    procedure: Procedure | null;
}

const sampleProcedures = [
    'Biopsia de piel',
    'Colonoscopia',
    'Endoscopia',
    'Electrocardiograma (ECG)',
    'Radiografía de tórax',
    'Ultrasonido abdominal',
    'Sutura de herida'
];
const procedureOptions = sampleProcedures.map(p => ({ label: p, value: p }));

const sampleProviders = [
    'Dr. Smith',
    'Dra. Jones',
    'Dr. Martinez',
    'Técnico Radiólogo',
    'Cirujano General'
];
const providerOptions = sampleProviders.map(p => ({label: p, value: p}));

export function ProcedureDialog({ isOpen, onClose, onSave, procedure }: ProcedureDialogProps) {
    const { toast } = useToast();
    const initialState = useMemo(() => ({
        date: new Date().toISOString().split('T')[0],
        name: '',
        notes: '',
        performingProvider: ''
    }), []);

    const [formData, setFormData] = useState(initialState);
    
    useEffect(() => {
        if (procedure) {
            setFormData({
                ...procedure,
                date: new Date(procedure.date).toISOString().split('T')[0]
            });
        } else {
            setFormData(initialState);
        }
    }, [procedure, isOpen, initialState]);


    const handleSave = () => {
        if (!formData.date || !formData.name || !formData.performingProvider) {
            toast({
                variant: 'destructive',
                title: 'Campos Faltantes',
                description: 'Por favor, complete todos los campos requeridos.'
            });
            return;
        }

        const dataToSave = procedure 
            ? { ...procedure, ...formData } 
            : formData;
        
        onSave(dataToSave);
        onClose();
        toast({
            title: `Procedimiento ${procedure ? 'Actualizado' : 'Agregado'}`,
            description: `El procedimiento ha sido ${procedure ? 'actualizado' : 'guardado'} exitosamente.`
        })
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    }

    const handleSelectChange = (id: string, value: string) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{procedure ? 'Editar Procedimiento' : 'Agregar Nuevo Procedimiento'}</DialogTitle>
          <DialogDescription>
            {procedure ? 'Actualice los detalles de este procedimiento.' : 'Introduzca los detalles del nuevo procedimiento.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Fecha
            </Label>
            <Input id="date" type="date" value={formData.date} onChange={handleInputChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nombre
            </Label>
            <div className="col-span-3">
                <Combobox
                    options={procedureOptions}
                    value={formData.name}
                    onChange={(value) => handleSelectChange('name', value)}
                    placeholder="Seleccionar procedimiento"
                    searchPlaceholder="Buscar procedimiento..."
                    emptyMessage="No se encontró procedimiento."
                />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="performingProvider" className="text-right">
              Proveedor
            </Label>
             <div className="col-span-3">
                <Combobox
                    options={providerOptions}
                    value={formData.performingProvider}
                    onChange={(value) => handleSelectChange('performingProvider', value)}
                    placeholder="Seleccionar proveedor"
                    searchPlaceholder="Buscar proveedor..."
                    emptyMessage="No se encontró proveedor."
                />
            </div>
          </div>
           <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="notes" className="text-right pt-2">
              Notas
            </Label>
            <Textarea id="notes" placeholder="Notas sobre el procedimiento..." value={formData.notes} onChange={handleInputChange} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" onClick={handleSave}>Guardar Procedimiento</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

    