
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
import { Patient, Clinic, Demographics } from '@/types/ehr';
import { useToast } from '@/hooks/use-toast';
import { Combobox } from '@/components/ui/combobox';
import { PlusCircle } from 'lucide-react';

interface PatientDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (patient: Omit<Patient, 'id'>) => void;
    patient: Patient | null;
    clinics: Clinic[];
    isSaving: boolean;
}

export function PatientDialog({ isOpen, onClose, onSave, patient, clinics, isSaving }: PatientDialogProps) {
    const { toast } = useToast();
    
    const initialState = useMemo(() => ({
        name: '',
        clinicId: '',
        demographics: {
            dob: '',
            gender: 'Otro' as const,
            address: '',
            phone: '',
            email: ''
        }
    }), []);

    const [formData, setFormData] = useState(initialState);
    
    useEffect(() => {
        if (isOpen) {
            if (patient) {
                setFormData({
                    name: patient.name,
                    clinicId: patient.clinicId,
                    demographics: patient.demographics
                });
            } else {
                setFormData(initialState);
            }
        }
    }, [patient, isOpen, initialState]);


    const handleSave = () => {
        if (!formData.name || !formData.demographics.dob || !formData.clinicId) {
            toast({
                variant: 'destructive',
                title: 'Campos Faltantes',
                description: 'Nombre, Fecha de Nacimiento y Clínica son requeridos.'
            });
            return;
        }

        const dataToSave = {
            ...formData,
            // ensure empty records are not created
            vitals: [],
            medications: [],
            appointments: [],
            procedures: [],
            notes: []
        };
        
        onSave(dataToSave);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        if (id in formData.demographics) {
            setFormData(prev => ({
                ...prev,
                demographics: {
                    ...prev.demographics,
                    [id]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [id]: value }));
        }
    }
    
    const handleSelectChange = (id: string, value: string) => {
        if(id === 'gender') {
             setFormData(prev => ({ ...prev, demographics: { ...prev.demographics, gender: value as Demographics['gender'] } }));
        } else {
            setFormData(prev => ({ ...prev, [id]: value }));
        }
    }

    const clinicOptions = clinics.map(c => ({ label: c.name, value: c.id }));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{patient ? 'Editar Paciente' : 'Agregar Nuevo Paciente'}</DialogTitle>
          <DialogDescription>
            {patient ? 'Actualice los detalles de este paciente.' : 'Introduzca los detalles del nuevo paciente.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nombre
            </Label>
            <Input id="name" value={formData.name} onChange={handleInputChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="clinicId" className="text-right">
              Clínica
            </Label>
            <div className="col-span-3">
                <Combobox
                    options={clinicOptions}
                    value={formData.clinicId}
                    onChange={(value) => handleSelectChange('clinicId', value)}
                    placeholder="Seleccionar clínica"
                    searchPlaceholder="Buscar clínica..."
                    emptyMessage="No se encontró clínica."
                />
            </div>
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dob" className="text-right">
              F. de Nac.
            </Label>
            <Input id="dob" type="date" value={formData.demographics.dob} onChange={handleInputChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="gender" className="text-right">
              Género
            </Label>
             <Select onValueChange={(value: string) => handleSelectChange('gender', value)} value={formData.demographics.gender}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar género" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Femenino">Femenino</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
            </Select>
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address" className="text-right">
              Dirección
            </Label>
            <Input id="address" value={formData.demographics.address} onChange={handleInputChange} className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              Teléfono
            </Label>
            <Input id="phone" value={formData.demographics.phone} onChange={handleInputChange} className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input id="email" type="email" value={formData.demographics.email} onChange={handleInputChange} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancelar</Button>
          <Button type="submit" onClick={handleSave} disabled={isSaving}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {isSaving ? 'Guardando...' : (patient ? 'Guardar Cambios' : 'Guardar Paciente')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
