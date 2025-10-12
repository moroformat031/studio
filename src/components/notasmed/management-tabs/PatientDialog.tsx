
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
    onSave: (patient: Omit<Patient, 'id'> | Partial<Patient>) => void;
    patient: Patient | null;
    clinics: Clinic[];
    isSaving: boolean;
}

export function PatientDialog({ isOpen, onClose, onSave, patient, clinics, isSaving }: PatientDialogProps) {
    const { toast } = useToast();
    
    const initialState = useMemo(() => ({
        firstName: '',
        paternalLastName: '',
        maternalLastName: '',
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
                    firstName: patient.firstName,
                    paternalLastName: patient.paternalLastName,
                    maternalLastName: patient.maternalLastName,
                    clinicId: patient.clinicId,
                    demographics: patient.demographics
                });
            } else {
                setFormData(initialState);
            }
        }
    }, [patient, isOpen, initialState]);


    const handleSave = () => {
        if (!formData.firstName || !formData.paternalLastName || !formData.demographics.dob || !formData.clinicId) {
            toast({
                variant: 'destructive',
                title: 'Campos Faltantes',
                description: 'Nombre, Apellido Paterno, Fecha de Nacimiento y Clínica son requeridos.'
            });
            return;
        }

        const dataToSave: Omit<Patient, 'id'> | Partial<Patient> = patient 
            ? { ...patient, ...formData }
            : {
                ...formData,
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
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{patient ? 'Editar Paciente' : 'Agregar Nuevo Paciente'}</DialogTitle>
          <DialogDescription>
            {patient ? 'Actualice los detalles de este paciente.' : 'Introduzca los detalles del nuevo paciente.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="firstName">Nombre(s)</Label>
                    <Input id="firstName" value={formData.firstName} onChange={handleInputChange} disabled={isSaving} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="paternalLastName">Apellido Paterno</Label>
                    <Input id="paternalLastName" value={formData.paternalLastName} onChange={handleInputChange} disabled={isSaving} />
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="maternalLastName">Apellido Materno</Label>
                    <Input id="maternalLastName" value={formData.maternalLastName || ''} onChange={handleInputChange} disabled={isSaving} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="clinicId">Clínica</Label>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="dob">Fecha de Nacimiento</Label>
                    <Input id="dob" type="date" value={formData.demographics.dob} onChange={handleInputChange} disabled={isSaving} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="gender">Género</Label>
                    <Select onValueChange={(value: string) => handleSelectChange('gender', value)} value={formData.demographics.gender}>
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccionar género" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Masculino">Masculino</SelectItem>
                            <SelectItem value="Femenino">Femenino</SelectItem>
                            <SelectItem value="Otro">Otro</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input id="address" value={formData.demographics.address} onChange={handleInputChange} disabled={isSaving} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input id="phone" value={formData.demographics.phone} onChange={handleInputChange} disabled={isSaving} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={formData.demographics.email} onChange={handleInputChange} disabled={isSaving} />
                </div>
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
