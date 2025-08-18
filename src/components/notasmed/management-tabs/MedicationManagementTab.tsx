
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { MasterMedication } from '@/types/ehr';
import { PlusCircle, Pill, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
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

export function MedicationManagementTab() {
    const { toast } = useToast();
    const [medications, setMedications] = useState<MasterMedication[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Form state
    const [isEditing, setIsEditing] = useState(false);
    const [currentMed, setCurrentMed] = useState<MasterMedication | null>(null);
    const [medName, setMedName] = useState('');

    // Delete confirmation
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [medToDelete, setMedToDelete] = useState<MasterMedication | null>(null);

    const fetchMedications = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/master-data/medications');
            if(res.ok) {
                const data = await res.json();
                setMedications(data);
            } else {
                throw new Error("Failed to fetch medications");
            }
        } catch (e) {
            const err = e as Error;
            toast({ variant: 'destructive', title: 'Error', description: err.message || 'No se pudieron cargar los medicamentos.' })
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchMedications();
    }, []);

    const resetForm = () => {
        setIsEditing(false);
        setCurrentMed(null);
        setMedName('');
    }

    const handleEditClick = (med: MasterMedication) => {
        setIsEditing(true);
        setCurrentMed(med);
        setMedName(med.name);
    };

    const handleDeleteClick = (med: MasterMedication) => {
        setMedToDelete(med);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!medToDelete) return;
        try {
            const response = await fetch(`/api/master-data/medications/${medToDelete.id}`, { method: 'DELETE' });
            if (!response.ok) {
                const { message } = await response.json();
                throw new Error(message);
            }
            toast({ title: 'Medicamento Eliminado', description: `El medicamento ${medToDelete.name} ha sido eliminado.` });
            fetchMedications();
        } catch (error) {
            const e = error as Error;
            toast({ variant: 'destructive', title: 'Error al Eliminar', description: e.message });
        } finally {
            setIsDeleteDialogOpen(false);
            setMedToDelete(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!medName.trim()) {
            toast({ variant: 'destructive', title: 'Nombre Requerido', description: 'El nombre del medicamento no puede estar vacío.' });
            return;
        }
        setIsLoading(true);

        const url = isEditing && currentMed ? `/api/master-data/medications/${currentMed.id}` : '/api/master-data/medications';
        const method = isEditing ? 'PUT' : 'POST';

        const body = { name: medName };

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (!response.ok) {
                const { message } = await response.json();
                throw new Error(message);
            }
            toast({
                title: `Medicamento ${isEditing ? 'Actualizado' : 'Agregado'}`,
                description: `El medicamento ${medName} ha sido ${isEditing ? 'actualizado' : 'creado'}.`
            });
            resetForm();
            fetchMedications();
        } catch (error) {
            const e = error as Error;
            toast({
                variant: 'destructive',
                title: `Error al ${isEditing ? 'Actualizar' : 'Agregar'} Medicamento`,
                description: e.message
            });
        } finally {
            setIsLoading(false);
        }
    }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
        {/* Medication List */}
        <div className="lg:col-span-2 space-y-4 flex flex-col">
            <h3 className="font-semibold text-lg">Lista Maestra de Medicamentos</h3>
            <Card className="flex-grow">
                <CardContent className="p-0 h-full">
                    <ScrollArea className="h-[calc(100vh-28rem)]">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre del Medicamento</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                        <TableRow><TableCell colSpan={2} className="text-center">Cargando...</TableCell></TableRow>
                                    ) : medications.length > 0 ? (
                                        medications.map(med => (
                                            <TableRow key={med.id}>
                                                <TableCell className="font-medium">{med.name}</TableCell>
                                                <TableCell className="text-right">
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
                                                            <DropdownMenuItem onClick={() => handleDeleteClick(med)} className="text-destructive">
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                <span>Eliminar</span>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow><TableCell colSpan={2} className="text-center">No hay medicamentos.</TableCell></TableRow>
                                    )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
        {/* Add/Edit Medication Form */}
        <div className="space-y-4">
                <h3 className="font-semibold text-lg">{isEditing ? 'Editar Medicamento' : 'Agregar Nuevo Medicamento'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
                    <div className="space-y-2">
                        <Label htmlFor="med-name">Nombre del Medicamento</Label>
                        <div className="relative">
                            <Pill className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input id="med-name" value={medName} onChange={e => setMedName(e.target.value)} required disabled={isLoading} className="pl-10" />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {isEditing && <Button type="button" variant="outline" onClick={resetForm} disabled={isLoading}>Cancelar</Button>}
                        <Button type="submit" disabled={isLoading} className="w-full">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            {isLoading ? (isEditing ? 'Actualizando...' : 'Agregando...') : (isEditing ? 'Actualizar' : 'Agregar')}
                        </Button>
                    </div>
                </form>
        </div>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                    Esta acción no se puede deshacer. Esto eliminará permanentemente el medicamento <span className="font-bold">{medToDelete?.name}</span> de la lista maestra.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setMedToDelete(null)}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  )
}
