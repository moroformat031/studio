
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { MasterProcedure } from '@/types/ehr';
import { PlusCircle, Stethoscope, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../ui/dropdown-menu';
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
import { ScrollArea } from '../ui/scroll-area';

export function ProcedureManagementTab() {
    const { toast } = useToast();
    const [procedures, setProcedures] = useState<MasterProcedure[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Form state
    const [isEditing, setIsEditing] = useState(false);
    const [currentProc, setCurrentProc] = useState<MasterProcedure | null>(null);
    const [procName, setProcName] = useState('');

    // Delete confirmation
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [procToDelete, setProcToDelete] = useState<MasterProcedure | null>(null);

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

    const resetForm = () => {
        setIsEditing(false);
        setCurrentProc(null);
        setProcName('');
    }

    const handleEditClick = (proc: MasterProcedure) => {
        setIsEditing(true);
        setCurrentProc(proc);
        setProcName(proc.name);
    };

    const handleDeleteClick = (proc: MasterProcedure) => {
        setProcToDelete(proc);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!procToDelete) return;
        try {
            const response = await fetch(`/api/master-data/procedures/${procToDelete.id}`, { method: 'DELETE' });
            if (!response.ok) {
                const { message } = await response.json();
                throw new Error(message);
            }
            toast({ title: 'Procedimiento Eliminado', description: `El procedimiento ${procToDelete.name} ha sido eliminado.` });
            fetchProcedures();
        } catch (error) {
            const e = error as Error;
            toast({ variant: 'destructive', title: 'Error al Eliminar', description: e.message });
        } finally {
            setIsDeleteDialogOpen(false);
            setProcToDelete(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!procName.trim()) {
            toast({ variant: 'destructive', title: 'Nombre Requerido', description: 'El nombre del procedimiento no puede estar vacío.' });
            return;
        }
        setIsLoading(true);

        const url = isEditing && currentProc ? `/api/master-data/procedures/${currentProc.id}` : '/api/master-data/procedures';
        const method = isEditing ? 'PUT' : 'POST';

        const body = { name: procName };

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
                title: `Procedimiento ${isEditing ? 'Actualizado' : 'Agregado'}`,
                description: `El procedimiento ${procName} ha sido ${isEditing ? 'actualizado' : 'creado'}.`
            });
            resetForm();
            fetchProcedures();
        } catch (error) {
            const e = error as Error;
            toast({
                variant: 'destructive',
                title: `Error al ${isEditing ? 'Actualizar' : 'Agregar'} Procedimiento`,
                description: e.message
            });
        } finally {
            setIsLoading(false);
        }
    }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
        {/* Procedure List */}
        <div className="lg:col-span-2 space-y-4 flex flex-col">
            <h3 className="font-semibold text-lg">Lista Maestra de Procedimientos</h3>
            <Card className="flex-grow">
                <CardContent className="p-0 h-full">
                    <ScrollArea className="h-[calc(100vh-28rem)]">
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
        {/* Add/Edit Procedure Form */}
        <div className="space-y-4">
                <h3 className="font-semibold text-lg">{isEditing ? 'Editar Procedimiento' : 'Agregar Nuevo Procedimiento'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
                    <div className="space-y-2">
                        <Label htmlFor="proc-name">Nombre del Procedimiento</Label>
                        <div className="relative">
                            <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input id="proc-name" value={procName} onChange={e => setProcName(e.target.value)} required disabled={isLoading} className="pl-10" />
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
                    Esta acción no se puede deshacer. Esto eliminará permanentemente el procedimiento <span className="font-bold">{procToDelete?.name}</span> de la lista maestra.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setProcToDelete(null)}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  )
}
