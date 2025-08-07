
"use client";
import { useState } from 'react';
import { Patient, Demographics } from '@/types/ehr';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PlanGate } from '@/components/notasmed/PlanGate';

interface DemographicsTabProps {
    patient: Patient;
    onUpdatePatient: (id: string, data: Partial<Patient>) => void;
}

export function DemographicsTab({ patient, onUpdatePatient }: DemographicsTabProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Demographics>(patient.demographics);
    const { toast } = useToast();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleGenderChange = (value: Demographics['gender']) => {
        setFormData({ ...formData, gender: value });
    }

    const handleSave = () => {
        onUpdatePatient(patient.id, { demographics: formData });
        setIsEditing(false);
        toast({ title: 'Éxito', description: 'Datos demográficos del paciente actualizados.' });
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Información del Paciente</CardTitle>
                        <CardDescription>Información personal del paciente.</CardDescription>
                    </div>
                    <PlanGate allowedPlans={['Admin']}>
                        {!isEditing ? (
                            <Button variant="outline" onClick={() => setIsEditing(true)}>Editar</Button>
                        ) : (
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => { setIsEditing(false); setFormData(patient.demographics); }}>Cancelar</Button>
                                <Button onClick={handleSave}>Guardar</Button>
                            </div>
                        )}
                    </PlanGate>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <Label htmlFor="name">Nombre Completo</Label>
                        <Input id="name" value={patient.name} readOnly disabled className="mt-1" />
                    </div>
                    <div>
                        <Label htmlFor="dob">Fecha de Nacimiento</Label>
                        <Input id="dob" type="date" value={formData.dob} readOnly={!isEditing} onChange={handleInputChange} className="mt-1" />
                    </div>
                    <div>
                        <Label htmlFor="gender">Género</Label>
                        {isEditing ? (
                             <Select onValueChange={handleGenderChange} value={formData.gender}>
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
                            <Input id="gender" value={formData.gender} readOnly disabled className="mt-1" />
                        )}
                    </div>
                     <div>
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input id="phone" value={formData.phone} readOnly={!isEditing} onChange={handleInputChange} className="mt-1" />
                    </div>
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={formData.email} readOnly={!isEditing} onChange={handleInputChange} className="mt-1" />
                    </div>
                     <div className="md:col-span-2">
                        <Label htmlFor="address">Dirección</Label>
                        <Input id="address" value={formData.address} readOnly={!isEditing} onChange={handleInputChange} className="mt-1" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
