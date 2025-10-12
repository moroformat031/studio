
"use client";
import { useState } from 'react';
import { Patient, Demographics } from '@/types/ehr';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface DemographicsTabProps {
    patient: Patient;
    onUpdatePatient: (id: string, data: Partial<Patient>) => void;
}

export function DemographicsTab({ patient, onUpdatePatient }: DemographicsTabProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<Patient>>(patient);
    const { toast } = useToast();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        if (id in formData.demographics!) {
            setFormData({ ...formData, demographics: { ...formData.demographics!, [id]: value } });
        } else {
            setFormData({ ...formData, [id]: value });
        }
    };

    const handleGenderChange = (value: Demographics['gender']) => {
        setFormData({ ...formData, demographics: { ...formData.demographics!, gender: value } });
    }

    const handleSave = () => {
        onUpdatePatient(patient.id, formData);
        setIsEditing(false);
        toast({ title: 'Éxito', description: 'Datos demográficos del paciente actualizados.' });
    };

    const patientName = `${patient.firstName} ${patient.paternalLastName} ${patient.maternalLastName || ''}`.trim();

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>{patientName}</CardTitle>
                        <CardDescription>Información personal del paciente.</CardDescription>
                    </div>
                    {!isEditing ? (
                        <Button variant="outline" onClick={() => setIsEditing(true)}>Editar</Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => { setIsEditing(false); setFormData(patient); }}>Cancelar</Button>
                            <Button onClick={handleSave}>Guardar</Button>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <Label htmlFor="firstName">Nombre(s)</Label>
                        <Input id="firstName" value={formData.firstName} readOnly={!isEditing} onChange={handleInputChange} className="mt-1" />
                    </div>
                    <div>
                        <Label htmlFor="paternalLastName">Apellido Paterno</Label>
                        <Input id="paternalLastName" value={formData.paternalLastName} readOnly={!isEditing} onChange={handleInputChange} className="mt-1" />
                    </div>
                    <div>
                        <Label htmlFor="maternalLastName">Apellido Materno</Label>
                        <Input id="maternalLastName" value={formData.maternalLastName || ''} readOnly={!isEditing} onChange={handleInputChange} className="mt-1" />
                    </div>
                    <div>
                        <Label htmlFor="dob">Fecha de Nacimiento</Label>
                        <Input id="dob" type="date" value={formData.demographics?.dob} readOnly={!isEditing} onChange={handleInputChange} className="mt-1" />
                    </div>
                    <div>
                        <Label htmlFor="gender">Género</Label>
                        {isEditing ? (
                             <Select onValueChange={handleGenderChange} value={formData.demographics?.gender}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Seleccionar género" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Masculino">Masculino</SelectItem>
                                    <SelectItem value="Femenino">Femenino</SelectItem>
                                    <SelectItem value="Otro">Otro</SelectItem>
                                </SelectContent>
                            </Select>
                        ) : (
                            <Input id="gender" value={formData.demographics?.gender} readOnly disabled className="mt-1" />
                        )}
                    </div>
                     <div>
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input id="phone" value={formData.demographics?.phone} readOnly={!isEditing} onChange={handleInputChange} className="mt-1" />
                    </div>
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={formData.demographics?.email} readOnly={!isEditing} onChange={handleInputChange} className="mt-1" />
                    </div>
                     <div className="md:col-span-2">
                        <Label htmlFor="address">Dirección</Label>
                        <Input id="address" value={formData.demographics?.address} readOnly={!isEditing} onChange={handleInputChange} className="mt-1" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
