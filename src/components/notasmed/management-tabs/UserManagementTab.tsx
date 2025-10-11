
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { Role, User, UserType } from '@/types/ehr';
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
import { useAuth } from '@/context/AuthContext';
import { UserDialog } from './UserDialog';

type OmittedUser = Omit<User, 'password'>;

export function UserManagementTab() {
    const { user: adminUser } = useAuth();
    const { toast } = useToast();
    const [users, setUsers] = useState<OmittedUser[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Dialog state
    const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<OmittedUser | null>(null);

    // Delete confirmation
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<OmittedUser | null>(null);

    const getUserName = (user: OmittedUser) => {
        return `${user.firstName} ${user.paternalLastName} ${user.maternalLastName || ''}`.trim();
    }

    const fetchUsers = async () => {
        if (!adminUser?.clinicId) return;
        setIsLoading(true);
        try {
            const res = await fetch(`/api/users?clinicId=${adminUser.clinicId}`);
            if(res.ok) {
                const data = await res.json();
                setUsers(data);
            } else {
                throw new Error("Failed to fetch users");
            }
        } catch (e) {
            const err = e as Error;
            toast({ variant: 'destructive', title: 'Error', description: err.message || 'No se pudieron cargar los usuarios.' })
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if(adminUser?.clinicId){
            fetchUsers();
        }
    }, [adminUser]);

    const handleAddClick = () => {
        setCurrentUser(null);
        setIsUserDialogOpen(true);
    };

    const handleEditClick = (user: OmittedUser) => {
        setCurrentUser(user);
        setIsUserDialogOpen(true);
    };

    const handleDeleteClick = (user: OmittedUser) => {
        if (user.id === adminUser?.id) {
            toast({ variant: 'destructive', title: 'Acción no permitida', description: 'No puede eliminarse a sí mismo.' });
            return;
        }
        setUserToDelete(user);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;
        try {
            const response = await fetch(`/api/users/${userToDelete.id}`, { method: 'DELETE' });
            if (!response.ok) {
                const { message } = await response.json();
                throw new Error(message);
            }
            toast({ title: 'Usuario Eliminado', description: `El usuario ${getUserName(userToDelete)} ha sido eliminado.` });
            fetchUsers();
        } catch (error) {
            const e = error as Error;
            toast({ variant: 'destructive', title: 'Error al Eliminar', description: e.message });
        } finally {
            setIsDeleteDialogOpen(false);
            setUserToDelete(null);
        }
    };

    const handleSaveUser = async (userData: Partial<User> & { password?: string }) => {
        if(!adminUser?.clinicName){
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo determinar la clínica del administrador.'});
            return;
        }
        setIsSaving(true);

        const url = currentUser ? `/api/users/${currentUser.id}` : '/api/users';
        const method = currentUser ? 'PUT' : 'POST';

        const body = {
            ...userData,
            clinicName: adminUser.clinicName
        };

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
                title: `Empleado ${currentUser ? 'Actualizado' : 'Agregado'}`,
                description: `El empleado ${userData.firstName} ${userData.paternalLastName} ha sido ${currentUser ? 'actualizado' : 'creado'}.`
            });
            setIsUserDialogOpen(false);
            fetchUsers();
        } catch (error) {
            const e = error as Error;
            toast({
                variant: 'destructive',
                title: `Error al ${currentUser ? 'Actualizar' : 'Agregar'} Empleado`,
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
                <h3 className="font-semibold text-lg">Gestionar Empleados</h3>
                <Button size="sm" onClick={handleAddClick}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Agregar Empleado
                </Button>
            </div>
            <Card className="flex-grow">
                <CardContent className="p-0 h-full">
                     <ScrollArea className="h-[calc(100vh-25rem)]">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead className="hidden md:table-cell">Rol</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                        <TableRow><TableCell colSpan={4} className="text-center">Cargando...</TableCell></TableRow>
                                ) : users.length > 0 ? (
                                    users.map(user => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{getUserName(user)}</TableCell>
                                            <TableCell>{user.type}</TableCell>
                                            <TableCell className="hidden md:table-cell">{user.role}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Abrir menú</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleEditClick(user)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            <span>Editar</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDeleteClick(user)} className="text-destructive" disabled={user.id === adminUser?.id}>
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            <span>Eliminar</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow><TableCell colSpan={4} className="text-center">No hay empleados.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>

        <UserDialog
            isOpen={isUserDialogOpen}
            onClose={() => setIsUserDialogOpen(false)}
            onSave={handleSaveUser}
            user={currentUser}
            isSaving={isSaving}
            adminUser={adminUser}
        />

         <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                    Esta acción no se puede deshacer. Esto eliminará permanentemente al usuario <span className="font-bold">{userToDelete ? getUserName(userToDelete) : ''}</span> y todos sus datos asociados.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  )
}
