
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Appointment } from '@/types/ehr';
import { useToast } from '@/hooks/use-toast';
import { Combobox } from '@/components/ui/combobox';
import { useProviders } from '@/hooks/use-providers';

interface AppointmentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (appointment: Omit<Appointment, 'id'> | Appointment) => void;
    appointment: Appointment | null;
    selectedDate?: Date;
    selectedTime?: string | null;
}

export function AppointmentDialog({ isOpen, onClose, onSave, appointment, selectedDate, selectedTime }: AppointmentDialogProps) {
    const { toast } = useToast();
    const { providers, loading: loadingProviders } = useProviders();

    const getInitialState = useCallback(() => {
        const baseState = {
            date: new Date().toISOString().split('T')[0],
            time: '',
            reason: '',
            status: 'Programada' as const,
            visitProvider: '',
            billingProvider: ''
        };

        if (selectedDate) {
            baseState.date = selectedDate.toISOString().split('T')[0];
        }
        if (selectedTime) {
            baseState.time = selectedTime;
        }
        return baseState;
    }, [selectedDate, selectedTime]);


    const [formData, setFormData] = useState(getInitialState());
    
    useEffect(() => {
        if (appointment) {
            setFormData({
                ...appointment,
                date: new Date(appointment.date).toISOString().split('T')[0]
            });
        } else {
            setFormData(getInitialState());
        }
    }, [appointment, isOpen, getInitialState]);


    const handleSave = () => {
        if (!formData.date || !formData.time || !formData.reason || (!appointment && (!formData.visitProvider || !formData.billingProvider))) {
            toast({
                variant: 'destructive',
                title: 'Campos Faltantes',
                description: 'Por favor, complete todos los campos requeridos.'
            });
            return;
        }

        const dataToSave = appointment 
            ? { ...appointment, ...formData } 
            : formData;
        
        onSave(dataToSave);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    }
    
    const handleSelectChange = (id: string, value: string) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    }


    const handleStatusChange = (value: Appointment['status']) => {
        setFormData(prev => ({ ...prev, status: value }));
    }
    
    const providerOptions = useMemo(() => providers.map(p => ({label: p.username, value: p.username})), [providers]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{appointment ? 'Editar Cita' : 'Programar Nueva Cita'}</DialogTitle>
          <DialogDescription>
            {appointment ? 'Actualice los detalles de esta cita.' : 'Introduzca los detalles de la nueva cita.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Fecha
            </Label>
            <Input id="date" type="date" value={formData.date} onChange={handleInputChange} className="col-span-3" readOnly={!appointment} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="time" className="text-right">
              Hora
            </Label>
            <Input id="time" type="time" value={formData.time} onChange={handleInputChange} className="col-span-3" readOnly={!appointment}/>
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reason" className="text-right">
              Motivo
            </Label>
            <Input id="reason" value={formData.reason} onChange={handleInputChange} className="col-span-3" />
          </div>
          {appointment && (
            <>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="visitProvider" className="text-right">
                    Prov. Visita
                    </Label>
                    <div className="col-span-3">
                        <Combobox
                            options={providerOptions}
                            value={formData.visitProvider}
                            onChange={(value) => handleSelectChange('visitProvider', value)}
                            placeholder="Seleccionar proveedor"
                            searchPlaceholder="Buscar proveedor..."
                            emptyMessage="No se encontró proveedor."
                        />
                    </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="billingProvider" className="text-right">
                    Prov. Factura
                    </Label>
                    <div className="col-span-3">
                        <Combobox
                            options={providerOptions}
                            value={formData.billingProvider}
                            onChange={(value) => handleSelectChange('billingProvider', value)}
                            placeholder="Seleccionar proveedor"
                            searchPlaceholder="Buscar proveedor..."
                            emptyMessage="No se encontró proveedor."
                        />
                    </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">
                    Estado
                    </Label>
                    <Select onValueChange={handleStatusChange} value={formData.status}>
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Programada">Programada</SelectItem>
                            <SelectItem value="Completada">Completada</SelectItem>
                            <SelectItem value="Cancelada">Cancelada</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" onClick={handleSave}>Guardar Cita</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
