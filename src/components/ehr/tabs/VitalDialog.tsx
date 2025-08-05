
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
import { Vital } from '@/types/ehr';
import { useToast } from '@/hooks/use-toast';

interface VitalDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (vital: Omit<Vital, 'id'> | Vital) => void;
    vital: Vital | null;
}

export function VitalDialog({ isOpen, onClose, onSave, vital }: VitalDialogProps) {
    const { toast } = useToast();
    const initialState = useMemo(() => ({
        date: new Date().toISOString().split('T')[0],
        hr: '',
        bp: '',
        temp: '',
        rr: ''
    }), []);

    const [formData, setFormData] = useState(initialState);
    
    useEffect(() => {
        if (vital) {
            setFormData({
                ...vital,
                date: new Date(vital.date).toISOString().split('T')[0],
                hr: String(vital.hr),
                temp: String(vital.temp),
                rr: String(vital.rr),
            });
        } else {
            setFormData(initialState);
        }
    }, [vital, isOpen, initialState]);


    const handleSave = () => {
        if (!formData.date || !formData.hr || !formData.bp || !formData.temp || !formData.rr) {
            toast({
                variant: 'destructive',
                title: 'Campos Faltantes',
                description: 'Por favor, complete todos los campos requeridos.'
            });
            return;
        }

        const dataToSave = {
            date: formData.date,
            hr: Number(formData.hr),
            bp: formData.bp,
            temp: Number(formData.temp),
            rr: Number(formData.rr),
        };

        const finalData = vital 
            ? { ...vital, ...dataToSave } 
            : dataToSave;
        
        onSave(finalData);
        onClose();
        toast({
            title: `Signos Vitales ${vital ? 'Actualizados' : 'Guardados'}`,
            description: `Los signos vitales han sido ${vital ? 'actualizados' : 'guardados'} exitosamente.`
        })
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{vital ? 'Editar Signos Vitales' : 'Agregar Nuevos Signos Vitales'}</DialogTitle>
          <DialogDescription>
            {vital ? 'Actualice los detalles de esta entrada de signos vitales.' : 'Introduzca los detalles de la nueva entrada de signos vitales.'}
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
            <Label htmlFor="bp" className="text-right">
              Presión Arterial
            </Label>
            <Input id="bp" placeholder="p.ej. 120/80" value={formData.bp} onChange={handleInputChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="hr" className="text-right">
              Frec. Cardíaca
            </Label>
            <Input id="hr" type="number" placeholder="p.ej. 75" value={formData.hr} onChange={handleInputChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="temp" className="text-right">
              Temp (°C)
            </Label>
            <Input id="temp" type="number" placeholder="p.ej. 36.8" step="0.1" value={formData.temp} onChange={handleInputChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rr" className="text-right">
             Frec. Resp.
            </Label>
            <Input id="rr" type="number" placeholder="p.ej. 16" value={formData.rr} onChange={handleInputChange} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" onClick={handleSave}>Guardar Signos Vitales</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
