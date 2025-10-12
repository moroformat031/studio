
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clinic, Plan } from '@/types/ehr';
import { PlusCircle, Building, MapPin, Phone } from 'lucide-react';

interface ClinicDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (clinicData: Omit<Clinic, 'id'> | Partial<Clinic>) => void;
    clinic: Clinic | null;
    isSaving: boolean;
}

export function ClinicDialog({ isOpen, onClose, onSave, clinic, isSaving }: ClinicDialogProps) {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [plan, setPlan] = useState<Plan>('Free');

    useEffect(() => {
        if (isOpen) {
            if (clinic) {
                setName(clinic.name);
                setAddress(clinic.address || '');
                setPhone(clinic.phone || '');
                setPlan(clinic.plan);
            } else {
                setName('');
                setAddress('');
                setPhone('');
                setPlan('Free');
            }
        }
    }, [clinic, isOpen]);

    const handleSave = () => {
        const clinicData: Omit<Clinic, 'id'> | Partial<Clinic> = {
            name,
            address,
            phone,
            plan
        };
        onSave(clinicData);
    };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{clinic ? 'Editar Clínica' : 'Agregar Nueva Clínica'}</DialogTitle>
          <DialogDescription>
            {clinic ? 'Actualice los detalles de esta clínica.' : 'Introduzca los detalles de la nueva clínica.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="clinic-name">Nombre de la Clínica</Label>
                <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="clinic-name" value={name} onChange={e => setName(e.target.value)} required disabled={isSaving} className="pl-10" />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="clinic-plan">Plan</Label>
                 <Select value={plan} onValueChange={(value: Plan) => setPlan(value)} required disabled={isSaving}>
                    <SelectTrigger id="clinic-plan">
                        <SelectValue placeholder="Seleccionar plan" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Free">Free</SelectItem>
                        <SelectItem value="Clinica">Clinica</SelectItem>
                        <SelectItem value="Hospital">Hospital</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="clinic-address">Dirección</Label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="clinic-address" value={address} onChange={e => setAddress(e.target.value)} disabled={isSaving} className="pl-10" />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="clinic-phone">Teléfono</Label>
                <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="clinic-phone" value={phone} onChange={e => setPhone(e.target.value)} disabled={isSaving} className="pl-10" />
                </div>
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancelar</Button>
          <Button type="submit" onClick={handleSave} disabled={isSaving}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {isSaving ? 'Guardando...' : (clinic ? 'Guardar Cambios' : 'Guardar Clínica')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
