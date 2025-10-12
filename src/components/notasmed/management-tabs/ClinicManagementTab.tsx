
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { Clinic, Plan } from '@/types/ehr';
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
import { ClinicDialog } from './ClinicDialog';

export function ClinicManagementTab() {
    const { toast } = useToast();
    const [clinics, setClinics] = useState<Clinic[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    // Dialog state
    const [isClinicDialogOpen, setIsClinicDialogOpen] = useState(false);
    const [currentClinic, setCurrentClinic] = useState<Clinic | null>(null);

    // Delete confirmation
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [clinicToDelete, setClinicToDelete] = useState<Clinic | null>(null);

    const fetchClinics = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/clinics');
            if(res.ok) {
                const data = await res.json();
                setClinics(data);
            } else {
                throw new Error("Failed to fetch clinics");
            }
        } catch (e) {
            const err = e as Error;
            toast({ variant: 'destructive', title: 'Error', description: err.message || 'No se pudieron cargar las clínicas.' })
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchClinics();
    }, []);

    const handleAddClick = () => {
        setCurrentClinic(null);
        setIsClinicDialogOpen(true);
    };

    const handleEditClick = (clinic: Clinic) => {
        setCurrentClinic(clinic);
        setIsClinicDialogOpen(true);
    };

    const handleDeleteClick = (clinic: Clinic) => {
        setClinicToDelete(clinic);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!clinicToDelete) return;
        try {
            const response = await fetch(`/api/clinics/${clinicToDelete.id}`, { method: 'DELETE' });
            if (!response.ok) {
                const { message } = await response.json();
                throw new Error(message);
            }
            toast({ title: 'Clínica Eliminada', description: `La clínica ${clinicToDelete.name} ha sido eliminada.` });
            fetchClinics();
        } catch (error) {
            const e = error as Error;
            toast({ variant: 'destructive', title: 'Error al Eliminar', description: e.message });
        } finally {
            setIsDeleteDialogOpen(false);
            setClinicToDelete(null);
        }
    };

    const handleSaveClinic = async (clinicData: Omit<Clinic, 'id'> | Partial<Clinic>) => {
        if (!clinicData.name?.trim()) {
            toast({ variant: 'destructive', title: 'Nombre Requerido', description: 'El nombre de la clínica no puede estar vacío.' });
            return;
        }
        setIsSaving(true);

        const url = currentClinic ? `/api/clinics/${currentClinic.id}` : '/api/clinics';
        const method = currentClinic ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(clinicData)
            });
            if (!response.ok) {
                const { message } = await response.json();
                throw new Error(message);
            }
            toast({
                title: `Clínica ${currentClinic ? 'Actualizada' : 'Agregada'}`,
                description: `La clínica ${clinicData.name} ha sido ${currentClinic ? 'actualizada' : 'creada'}.`
            });
            setIsClinicDialogOpen(false);
            fetchClinics();
        } catch (error) {
            const e = error as Error;
            toast({
                variant: 'destructive',
                title: `Error al ${currentClinic ? 'Actualizar' : 'Agregar'} Clínica`,
                description: e.message
            });
        } finally {
            setIsSaving(false);
        }
    }
  
  return (
    <>
    <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Gestionar Clínicas</h3>
                <Button size="sm" onClick={handleAddClick}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Agregar Clínica
                </Button>
            </div>
            <Card className="flex-grow">
                <CardContent className="p-0">
                    <ScrollArea className="h-[calc(100vh-25rem)]">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Plan</TableHead>
                                    <TableHead className="hidden md:table-cell">Dirección</TableHead>
                                    <TableHead className="hidden md:table-cell">Teléfono</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                        <TableRow><TableCell colSpan={5} className="text-center">Cargando...</TableCell></TableRow>
                                    ) : clinics.length > 0 ? (
                                        clinics.map(clinic => (
                                            <TableRow key={clinic.id}>
                                                <TableCell className="font-medium">{clinic.name}</TableCell>
                                                <TableCell>{clinic.plan}</TableCell>
                                                <TableCell className="hidden md:table-cell">{clinic.address || 'N/A'}</TableCell>
                                                <TableCell className="hidden md:table-cell">{clinic.phone || 'N/A'}</TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <span className="sr-only">Abrir menú</span>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleEditClick(clinic)}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                <span>Editar</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleDeleteClick(clinic)} className="text-destructive">
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                <span>Eliminar</span>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow><TableCell colSpan={5} className="text-center">No hay clínicas.</TableCell></TableRow>
                                    )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>

        <ClinicDialog
            isOpen={isClinicDialogOpen}
            onClose={() => setIsClinicDialogOpen(false)}
            onSave={handleSaveClinic}
            clinic={currentClinic}
            isSaving={isSaving}
        />

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                    Esta acción no se puede deshacer. Esto eliminará permanentemente la clínica <span className="font-bold">{clinicToDelete?.name}</span>. Todos los usuarios y pacientes asociados deberán ser reasignados manualmente.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setClinicToDelete(null)}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  )
}
