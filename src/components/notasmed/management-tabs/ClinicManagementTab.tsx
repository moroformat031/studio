
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { Clinic } from '@/types/ehr';
import { PlusCircle, Building, MapPin, Phone, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
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

export function ClinicManagementTab() {
    const { toast } = useToast();
    const [clinics, setClinics] = useState<Clinic[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Form state
    const [isEditing, setIsEditing] = useState(false);
    const [currentClinic, setCurrentClinic] = useState<Clinic | null>(null);
    const [clinicName, setClinicName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');

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

    const resetForm = () => {
        setIsEditing(false);
        setCurrentClinic(null);
        setClinicName('');
        setAddress('');
        setPhone('');
    }

    const handleEditClick = (clinic: Clinic) => {
        setIsEditing(true);
        setCurrentClinic(clinic);
        setClinicName(clinic.name);
        setAddress(clinic.address || '');
        setPhone(clinic.phone || '');
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!clinicName.trim()) {
            toast({ variant: 'destructive', title: 'Nombre Requerido', description: 'El nombre de la clínica no puede estar vacío.' });
            return;
        }
        setIsLoading(true);

        const url = isEditing && currentClinic ? `/api/clinics/${currentClinic.id}` : '/api/clinics';
        const method = isEditing ? 'PUT' : 'POST';

        const body = { name: clinicName, address, phone };

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
                title: `Clínica ${isEditing ? 'Actualizada' : 'Agregada'}`,
                description: `La clínica ${clinicName} ha sido ${isEditing ? 'actualizada' : 'creada'}.`
            });
            resetForm();
            fetchClinics();
        } catch (error) {
            const e = error as Error;
            toast({
                variant: 'destructive',
                title: `Error al ${isEditing ? 'Actualizar' : 'Agregar'} Clínica`,
                description: e.message
            });
        } finally {
            setIsLoading(false);
        }
    }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 h-full">
        {/* Clinic List */}
        <div className="lg:col-span-2 space-y-4">
            <h3 className="font-semibold text-lg">Clínicas Existentes</h3>
            <Card className="h-[calc(100%-40px)]">
                <CardContent className="p-0 h-full overflow-y-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Dirección</TableHead>
                                <TableHead>Teléfono</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                     <TableRow><TableCell colSpan={4} className="text-center">Cargando...</TableCell></TableRow>
                                ) : clinics.length > 0 ? (
                                    clinics.map(clinic => (
                                        <TableRow key={clinic.id}>
                                            <TableCell className="font-medium">{clinic.name}</TableCell>
                                            <TableCell>{clinic.address || 'N/A'}</TableCell>
                                            <TableCell>{clinic.phone || 'N/A'}</TableCell>
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
                                    <TableRow><TableCell colSpan={4} className="text-center">No hay clínicas.</TableCell></TableRow>
                                )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
        {/* Add/Edit Clinic Form */}
        <div className="space-y-4">
                <h3 className="font-semibold text-lg">{isEditing ? 'Editar Clínica' : 'Agregar Nueva Clínica'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
                <div className="space-y-2">
                    <Label htmlFor="clinic-name">Nombre de la Clínica</Label>
                    <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="clinic-name" value={clinicName} onChange={e => setClinicName(e.target.value)} required disabled={isLoading} className="pl-10" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="clinic-address">Dirección</Label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="clinic-address" value={address} onChange={e => setAddress(e.target.value)} disabled={isLoading} className="pl-10" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="clinic-phone">Teléfono</Label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="clinic-phone" value={phone} onChange={e => setPhone(e.target.value)} disabled={isLoading} className="pl-10" />
                    </div>
                </div>
                <div className="flex gap-2">
                    {isEditing && <Button type="button" variant="outline" onClick={resetForm} disabled={isLoading}>Cancelar</Button>}
                    <Button type="submit" disabled={isLoading} className="w-full">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        {isLoading ? (isEditing ? 'Actualizando...' : 'Agregando...') : (isEditing ? 'Actualizar Clínica' : 'Agregar Clínica')}
                    </Button>
                </div>
                </form>
        </div>

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
    </div>
  )
}

    