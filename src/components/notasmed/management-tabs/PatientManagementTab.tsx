
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { Patient, Clinic } from '@/types/ehr';
import { PlusCircle, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { PatientDialog } from './PatientDialog';
import { usePatientData } from '@/hooks/use-patient-data';


export function PatientManagementTab() {
    const { toast } = useToast();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [clinics, setClinics] = useState<Clinic[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    // Dialog state
    const [isPatientDialogOpen, setIsPatientDialogOpen] = useState(false);
    const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);

    // Delete confirmation
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

    const fetchClinics = async () => {
        try {
            const res = await fetch('/api/clinics');
            if (res.ok) {
                const data = await res.json();
                setClinics(data);
                return data;
            } else {
                throw new Error("Failed to fetch clinics");
            }
        } catch (e) {
            const err = e as Error;
            toast({ variant: 'destructive', title: 'Error', description: err.message || 'No se pudieron cargar las clínicas.' });
            return [];
        }
    }

    const fetchPatientsLocal = useCallback(async () => {
        setIsLoading(true);
        try {
            const clinicsData = await fetchClinics();
            const res = await fetch('/api/patients/all');
            if (res.ok) {
                let patientData = await res.json() as Patient[];
                // Map clinic name
                patientData = patientData.map(p => ({
                    ...p,
                    clinicName: clinicsData.find((c: Clinic) => c.id === p.clinicId)?.name || 'N/A'
                }));
                setPatients(patientData);
            } else {
                throw new Error("Failed to fetch patients");
            }
        } catch (e) {
            const err = e as Error;
            toast({ variant: 'destructive', title: 'Error', description: err.message || 'No se pudieron cargar los pacientes.' });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    const { fetchPatients, addPatient, patients: globalPatients } = usePatientData();

    useEffect(() => {
        // load clinics then ensure global patients are fetched on mount
        (async () => {
            await fetchClinics();
            fetchPatients();
        })();
    }, [fetchPatients]);

    // map global patients into the local table (adds clinicName)
    useEffect(() => {
        const mapped = (globalPatients || []).map(p => ({
            ...p,
            clinicName: clinics.find((c: Clinic) => c.id === p.clinicId)?.name || 'N/A'
        }));
        setPatients(mapped);
    }, [globalPatients, clinics]);

    const handleAddClick = () => {
        setCurrentPatient(null);
        setIsPatientDialogOpen(true);
    };

    const handleEditClick = (patient: Patient) => {
        setCurrentPatient(patient);
        setIsPatientDialogOpen(true);
    };

    const handleDeleteClick = (patient: Patient) => {
        setPatientToDelete(patient);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!patientToDelete) return;
        try {
            const response = await fetch(`/api/patients/${patientToDelete.id}`, { method: 'DELETE' });
            if (!response.ok) {
                const { message } = await response.json();
                throw new Error(message);
            }
            toast({ title: 'Paciente Eliminado', description: `El paciente ${patientToDelete.firstName} ${patientToDelete.paternalLastName} ha sido eliminado.` });
            // refresh global list so EHRApp and combobox update
            fetchPatients();
            // notify other parts of the app (in case hooks/components need to react)
            window.dispatchEvent(new CustomEvent('patients:changed'));
        } catch (error) {
            const e = error as Error;
            toast({ variant: 'destructive', title: 'Error al Eliminar', description: e.message });
        } finally {
            setIsDeleteDialogOpen(false);
            setPatientToDelete(null);
        }
    };

    const handleSavePatient = async (patientData: Omit<Patient, 'id'> | Partial<Patient>) => {
        setIsSaving(true);
        const url = currentPatient ? `/api/patients/${currentPatient.id}` : '/api/patients';
        const method = currentPatient ? 'PUT' : 'POST';

        try {
            if (!currentPatient && addPatient) {
                const created = await addPatient(patientData as Omit<Patient, 'id'>);
                toast({
                    title: `Paciente Agregado`,
                    description: `El paciente ${created.firstName} ${created.paternalLastName} ha sido creado.`
                });
                setIsPatientDialogOpen(false);
                // notify other parts of the app (in case hooks/components need to react)
                window.dispatchEvent(new CustomEvent('patients:changed'));
                return;
            }

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(patientData)
            });
            if (!response.ok) {
                const { message } = await response.json();
                throw new Error(message);
            }
            toast({
                title: `Paciente ${currentPatient ? 'Actualizado' : 'Agregado'}`,
                description: `El paciente ${patientData.firstName} ${patientData.paternalLastName} ha sido ${currentPatient ? 'actualizado' : 'creado'}.`
            });
            setIsPatientDialogOpen(false);
            // refresh global list so EHRApp and combobox update
            fetchPatients();
            // notify other parts of the app (in case hooks/components need to react)
            window.dispatchEvent(new CustomEvent('patients:changed'));
        } catch (error) {
            const e = error as Error;
            toast({
                variant: 'destructive',
                title: `Error al ${currentPatient ? 'Actualizar' : 'Agregar'} Paciente`,
                description: e.message
            });
        } finally {
            setIsSaving(false);
        }
    };

    const getPatientName = (patient: Patient) => {
        return `${patient.firstName} ${patient.paternalLastName} ${patient.maternalLastName || ''}`.trim();
    }
  
  return (
    <>
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Gestionar Pacientes</h3>
                <Button size="sm" onClick={handleAddClick}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Agregar Paciente
                </Button>
            </div>
            <Card className="flex-grow">
                <CardContent className="p-0 h-full">
                    <ScrollArea className="h-[calc(100vh-25rem)]">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Clínica</TableHead>
                                    <TableHead className="hidden md:table-cell">F. de Nacimiento</TableHead>
                                    <TableHead className="hidden md:table-cell">Género</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={5} className="text-center">Cargando...</TableCell></TableRow>
                                ) : (globalPatients && globalPatients.length > 0) ? (
                                    (globalPatients || []).map(patient => (
                                        <TableRow key={patient.id}>
                                            <TableCell className="font-medium">{getPatientName(patient)}</TableCell>
                                            <TableCell>{clinics.find((c: Clinic) => c.id === patient.clinicId)?.name || 'N/A'}</TableCell>
                                            <TableCell className="hidden md:table-cell">{patient.demographics?.dob}</TableCell>
                                            <TableCell className="hidden md:table-cell">{patient.demographics?.gender}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Abrir menú</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleEditClick(patient)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            <span>Editar</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDeleteClick(patient)} className="text-destructive">
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            <span>Eliminar</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow><TableCell colSpan={5} className="text-center">No hay pacientes.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>

        <PatientDialog
            isOpen={isPatientDialogOpen}
            onClose={() => setIsPatientDialogOpen(false)}
            onSave={handleSavePatient}
            patient={currentPatient}
            clinics={clinics}
            isSaving={isSaving}
        />

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                    Esta acción no se puede deshacer. Esto eliminará permanentemente al paciente <span className="font-bold">{patientToDelete ? getPatientName(patientToDelete) : ''}</span> y todos sus datos médicos asociados.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setPatientToDelete(null)}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  )
}
