
"use client";
import React, { useState } from 'react';
import { Patient, Medication } from '@/types/ehr';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Trash2, Edit } from 'lucide-react';
import { PlanGate } from '@/components/notasmed/PlanGate';
import { MedicationDialog } from './MedicationDialog';


interface MedicationsTabProps {
    patient: Patient;
    onUpdateMedications: (patientId: string, medications: Medication[]) => void;
}

export function MedicationsTab({ patient, onUpdateMedications }: MedicationsTabProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);

    const handleAddClick = () => {
        setSelectedMedication(null);
        setIsDialogOpen(true);
    };

    const handleEditClick = (medication: Medication) => {
        setSelectedMedication(medication);
        setIsDialogOpen(true);
    };

    const handleDeleteClick = (medicationId: string) => {
        const updatedMedications = patient.medications.filter(med => med.id !== medicationId);
        onUpdateMedications(patient.id, updatedMedications);
    };

    const handleSaveMedication = (medicationData: Omit<Medication, 'id'> | Medication) => {
        let updatedMedications;
        if ('id' in medicationData) {
            // Editing existing medication
            updatedMedications = patient.medications.map(med =>
                med.id === medicationData.id ? medicationData : med
            );
        } else {
            // Adding new medication
            const newMedication: Medication = {
                ...medicationData,
                id: `med-${Date.now()}`
            };
            updatedMedications = [...patient.medications, newMedication];
        }
        onUpdateMedications(patient.id, updatedMedications);
        setIsDialogOpen(false);
    };


    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Medicamentos</CardTitle>
                            <CardDescription>Medicamentos actuales y pasados.</CardDescription>
                        </div>
                         <PlanGate allowedPlans={['Pro', 'Admin']}>
                            <Button onClick={handleAddClick} size="sm">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Agregar Medicamento
                            </Button>
                        </PlanGate>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha Prescrita</TableHead>
                                <TableHead>Medicamento</TableHead>
                                <TableHead>Dosis</TableHead>
                                <TableHead>Frecuencia</TableHead>
                                <TableHead>Proveedor</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {patient.medications.length > 0 ? (
                                patient.medications
                                .sort((a, b) => new Date(b.prescribedDate).getTime() - new Date(a.prescribedDate).getTime())
                                .map((med) => (
                                    <TableRow key={med.id}>
                                        <TableCell>{new Date(med.prescribedDate).toLocaleDateString()}</TableCell>
                                        <TableCell>{med.name}</TableCell>
                                        <TableCell>{med.dosage}</TableCell>
                                        <TableCell>{med.frequency}</TableCell>
                                        <TableCell>{med.prescribingProvider}</TableCell>
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
                                                        <DropdownMenuItem onClick={() => handleEditClick(med)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            <span>Editar</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDeleteClick(med.id)} className="text-destructive">
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
                                    <TableCell colSpan={6} className="text-center">No hay medicamentos prescritos.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <MedicationDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSave={handleSaveMedication}
                medication={selectedMedication}
            />
        </>
    );
}
