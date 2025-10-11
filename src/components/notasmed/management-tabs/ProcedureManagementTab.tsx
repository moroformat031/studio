
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { MasterProcedure } from '@/types/ehr';
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
import { MasterItemDialog } from './MasterItemDialog';

export function ProcedureManagementTab() {
    const { toast } = useToast();
    const [procedures, setProcedures] = useState<MasterProcedure[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<MasterProcedure | null>(null);

    // Delete confirmation
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<MasterProcedure | null>(null);

    const fetchProcedures = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/master-data/procedures');
            if(res.ok) {
                const data = await res.json();
                setProcedures(data);
            } else {
                throw new Error("Failed to fetch procedures");
            }
        } catch (e) {
            const err = e as Error;
            toast({ variant: 'destructive', title: 'Error', description: err.message || 'No se pudieron cargar los procedimientos.' })
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchProcedures();
    }, []);

    const handleAddClick = () => {
        setCurrentItem(null);
        setIsDialogOpen(true);
    };

    const handleEditClick = (proc: MasterProcedure) => {
        setCurrentItem(proc);
        setIsDialogOpen(true);
    };

    const handleDeleteClick = (proc: MasterProcedure) => {
        setItemToDelete(proc);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            const response = await fetch(`/api/master-data/procedures/${itemToDelete.id}`, { method: 'DELETE' });
            if (!response.ok) {
                const { message } = await response.json();
                throw new Error(message);
            }
            toast({ title: 'Procedimiento Eliminado', description: `El procedimiento ${itemToDelete.name} ha sido eliminado.` });
            fetchProcedures();
        } catch (error) {
            const e = error as Error;
            toast({ variant: 'destructive', title: 'Error al Eliminar', description: e.message });
        } finally {
            setIsDeleteDialogOpen(false);
            setItemToDelete(null);
        }
    };

    const handleSave = async (itemName: string) => {
        if (!itemName.trim()) {
            toast({ variant: 'destructive', title: 'Nombre Requerido', description: 'El nombre del procedimiento no puede estar vacío.' });
            return;
        }
        setIsSaving(true);

        const url = currentItem ? `/api/master-data/procedures/${currentItem.id}` : '/api/master-data/procedures';
        const method = currentItem ? 'PUT' : 'POST';
        const body = { name: itemName };

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
                title: `Procedimiento ${currentItem ? 'Actualizado' : 'Agregado'}`,
                description: `El procedimiento ${itemName} ha sido ${currentItem ? 'actualizado' : 'creado'}.`
            });
            setIsDialogOpen(false);
            fetchProcedures();
        } catch (error) {
            const e = error as Error;
            toast({
                variant: 'destructive',
                title: `Error al ${currentItem ? 'Actualizar' : 'Agregar'} Procedimiento`,
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
                <h3 className="font-semibold text-lg">Lista Maestra de Procedimientos</h3>
                 <Button size="sm" onClick={handleAddClick}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Agregar Procedimiento
                </Button>
        </div>
        <Card className="flex-grow">
            <CardContent className="p-0 h-full">
                <ScrollArea className="h-[calc(100vh-25rem)]">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre del Procedimiento</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                    <TableRow><TableCell colSpan={2} className="text-center">Cargando...</TableCell></TableRow>
                                ) : procedures.length > 0 ? (
                                    procedures.map(proc => (
                                        <TableRow key={proc.id}>
                                            <TableCell className="font-medium">{proc.name}</TableCell>
                                            <TableCell className="text-right">
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
                                                        <DropdownMenuItem onClick={() => handleDeleteClick(proc)} className="text-destructive">
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            <span>Eliminar</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow><TableCell colSpan={2} className="text-center">No hay procedimientos.</TableCell></TableRow>
                                )}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </CardContent>
        </Card>
    </div>

    <MasterItemDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
        item={currentItem}
        isSaving={isSaving}
        itemName="Procedimiento"
        itemIcon="Stethoscope"
    />

    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
                Esta acción no se puede deshacer. Esto eliminará permanentemente el procedimiento <span className="font-bold">{itemToDelete?.name}</span> de la lista maestra.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  )
}
