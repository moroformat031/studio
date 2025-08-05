
"use client";
import React, { useState } from 'react';
import { Patient, Vital } from '@/types/ehr';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle, Trash2, Edit } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PlanGate } from '@/components/notasmed/PlanGate';
import { VitalDialog } from './VitalDialog';

interface VitalsTabProps {
    patient: Patient;
    onUpdateVitals: (patientId: string, vitals: Vital[]) => void;
}

export function VitalsTab({ patient, onUpdateVitals }: VitalsTabProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedVital, setSelectedVital] = useState<Vital | null>(null);

    const handleAddClick = () => {
        setSelectedVital(null);
        setIsDialogOpen(true);
    };

    const handleEditClick = (vital: Vital) => {
        setSelectedVital(vital);
        setIsDialogOpen(true);
    };

    const handleDeleteClick = (vitalId: string) => {
        const updatedVitals = patient.vitals.filter(v => v.id !== vitalId);
        onUpdateVitals(patient.id, updatedVitals);
    };

    const handleSaveVital = (vitalData: Omit<Vital, 'id'> | Vital) => {
        let updatedVitals;
        if ('id' in vitalData) {
            // Editing existing vital
            updatedVitals = patient.vitals.map(v =>
                v.id === vitalData.id ? { ...v, ...vitalData } : v
            );
        } else {
            // Adding new vital
            const newVital: Vital = {
                ...vitalData,
                id: `vital-${Date.now()}`
            };
            updatedVitals = [...patient.vitals, newVital];
        }
        onUpdateVitals(patient.id, updatedVitals);
        setIsDialogOpen(false);
    };

    return (
        <>
        <Card>
            <CardHeader>
                 <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Signos Vitales</CardTitle>
                        <CardDescription>Signos vitales registrados del paciente.</CardDescription>
                    </div>
                    <PlanGate allowedPlans={['Pro', 'Admin']}>
                        <Button onClick={handleAddClick} size="sm">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Agregar Signos Vitales
                        </Button>
                    </PlanGate>
                 </div>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>FC</TableHead>
                            <TableHead>PA</TableHead>
                            <TableHead>Temp (°C)</TableHead>
                            <TableHead>FR</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {patient.vitals.length > 0 ? (
                            patient.vitals
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .map((vital) => (
                            <TableRow key={vital.id}>
                                <TableCell>{new Date(vital.date).toLocaleDateString()}</TableCell>
                                <TableCell>{vital.hr}</TableCell>
                                <TableCell>{vital.bp}</TableCell>
                                <TableCell>{vital.temp}</TableCell>
                                <TableCell>{vital.rr}</TableCell>
                                <TableCell className="text-right">
                                    <PlanGate allowedPlans={['Pro', 'Admin']}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Abrir menú</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEditClick(vital)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    <span>Editar</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDeleteClick(vital.id)} className="text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    <span>Eliminar</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                       </PlanGate>
                                </TableCell>
                            </TableRow>
                        ))): (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center">No hay signos vitales registrados.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
        <VitalDialog
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            onSave={handleSaveVital}
            vital={selectedVital}
        />
        </>
    );
}
