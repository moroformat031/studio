
"use client";
import React, { useState } from 'react';
import { Patient, Procedure } from '@/types/ehr';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Trash2, Edit } from 'lucide-react';
import { PlanGate } from '@/components/notasmed/PlanGate';
import { ProcedureDialog } from './ProcedureDialog';


interface ProceduresTabProps {
    patient: Patient;
    onUpdateProcedures: (patientId: string, procedures: Procedure[]) => void;
}

export function ProceduresTab({ patient, onUpdateProcedures }: ProceduresTabProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedProcedure, setSelectedProcedure] = useState<Procedure | null>(null);

    const handleAddClick = () => {
        setSelectedProcedure(null);
        setIsDialogOpen(true);
    };

    const handleEditClick = (procedure: Procedure) => {
        setSelectedProcedure(procedure);
        setIsDialogOpen(true);
    };

    const handleDeleteClick = (procedureId: string) => {
        const updatedProcedures = patient.procedures.filter(proc => proc.id !== procedureId);
        onUpdateProcedures(patient.id, updatedProcedures);
    };

    const handleSaveProcedure = (procedureData: Omit<Procedure, 'id'> | Procedure) => {
        let updatedProcedures;
        if ('id' in procedureData) {
            updatedProcedures = patient.procedures.map(proc =>
                proc.id === procedureData.id ? procedureData : proc
            );
        } else {
            const newProcedure: Procedure = {
                ...procedureData,
                id: `proc-${Date.now()}`
            };
            updatedProcedures = [...patient.procedures, newProcedure];
        }
        onUpdateProcedures(patient.id, updatedProcedures);
        setIsDialogOpen(false);
    };


    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Procedimientos</CardTitle>
                            <CardDescription>Procedimientos realizados al paciente.</CardDescription>
                        </div>
                         <PlanGate allowedPlans={['Admin']}>
                            <Button onClick={handleAddClick} size="sm">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Agregar Procedimiento
                            </Button>
                        </PlanGate>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Proveedor</TableHead>
                                <TableHead>Notas</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {patient.procedures.length > 0 ? (
                                patient.procedures
                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                .map((proc) => (
                                    <TableRow key={proc.id}>
                                        <TableCell>{new Date(proc.date).toLocaleDateString()}</TableCell>
                                        <TableCell>{proc.name}</TableCell>
                                        <TableCell>{proc.performingProvider}</TableCell>
                                        <TableCell className="max-w-[300px] truncate">{proc.notes}</TableCell>
                                        <TableCell className="text-right">
                                            <PlanGate allowedPlans={['Admin']}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Abrir menú</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleEditClick(proc)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            <span>Editar</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDeleteClick(proc.id)} className="text-destructive">
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
                                    <TableCell colSpan={5} className="text-center">No hay procedimientos registrados.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <ProcedureDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSave={handleSaveProcedure}
                procedure={selectedProcedure}
            />
        </>
    );
}
