
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Role, User, Clinic, UserType } from '@/types/ehr';
import { PlusCircle, Building, User as UserIcon, Eye, EyeOff, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
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
import { Combobox } from '@/components/ui/combobox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/context/AuthContext';

type OmittedUser = Omit<User, 'password'>;

export function UserManagementTab() {
    const { user: adminUser } = useAuth();
    const { toast } = useToast();
    const [users, setUsers] = useState<OmittedUser[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Form state
    const [isEditing, setIsEditing] = useState(false);
    const [currentUser, setCurrentUser] = useState<OmittedUser | null>(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState<Role>('USER');
    const [type, setType] = useState<UserType>('Enfermera');

    // Delete confirmation
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<OmittedUser | null>(null);

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

    const resetForm = () => {
        setIsEditing(false);
        setCurrentUser(null);
        setUsername('');
        setPassword('');
        setShowPassword(false);
        setRole('USER');
        setType('Enfermera');
    }

    const handleEditClick = (user: OmittedUser) => {
        setIsEditing(true);
        setCurrentUser(user);
        setUsername(user.username);
        setRole(user.role);
        setType(user.type);
        setPassword(''); // Clear password field for security
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
            toast({ title: 'Usuario Eliminado', description: `El usuario ${userToDelete.username} ha sido eliminado.` });
            fetchUsers();
        } catch (error) {
            const e = error as Error;
            toast({ variant: 'destructive', title: 'Error al Eliminar', description: e.message });
        } finally {
            setIsDeleteDialogOpen(false);
            setUserToDelete(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!adminUser?.clinicName){
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo determinar la clínica del administrador.'});
            return;
        }

        setIsLoading(true);

        const url = isEditing && currentUser ? `/api/users/${currentUser.id}` : '/api/users';
        const method = isEditing ? 'PUT' : 'POST';

        const body: Partial<User> & { password?: string, clinicName?: string } = {
            username,
            role,
            type,
            clinicName: adminUser.clinicName
        };

        if(password || !isEditing) {
            body.password = password;
        }

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
                title: `Empleado ${isEditing ? 'Actualizado' : 'Agregado'}`,
                description: `El empleado ${username} ha sido ${isEditing ? 'actualizado' : 'creado'}.`
            });
            resetForm();
            fetchUsers();
        } catch (error) {
            const e = error as Error;
            toast({
                variant: 'destructive',
                title: `Error al ${isEditing ? 'Actualizar' : 'Agregar'} Empleado`,
                description: e.message
            });
        } finally {
            setIsLoading(false);
        }
    }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User List */}
        <div className="lg:col-span-2 space-y-4">
            <h3 className="font-semibold text-lg">Empleados Existentes</h3>
            <Card>
                <CardContent className="p-0">
                     <ScrollArea className="h-[400px]">
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
                                            <TableCell className="font-medium">{user.username}</TableCell>
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
        {/* Add/Edit User Form */}
        <div className="space-y-4">
                <h3 className="font-semibold text-lg">{isEditing ? 'Editar Empleado' : 'Agregar Nuevo Empleado'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
                <div className="space-y-2">
                    <Label htmlFor="new-username">Nombre</Label>
                    <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="new-username" value={username} onChange={e => setUsername(e.target.value)} required disabled={isLoading} className="pl-10" />
                    </div>
                </div>
                    <div className="space-y-2">
                    <Label htmlFor="new-password">Contraseña</Label>
                    <div className="relative">
                        <Input id="new-password" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required={!isEditing} disabled={isLoading} className="pr-10" placeholder={isEditing ? 'Dejar en blanco para no cambiar' : ''} />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                        </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="new-type">Tipo de Empleado</Label>
                    <Select value={type} onValueChange={(value: UserType) => setType(value)} required disabled={isLoading}>
                        <SelectTrigger id="new-type">
                            <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Doctor">Doctor</SelectItem>
                            <SelectItem value="Enfermera">Enfermera</SelectItem>
                            <SelectItem value="Otro">Otro</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="new-role">Rol del Sistema</Label>
                    <Select value={role} onValueChange={(value: Role) => setRole(value)} required disabled={isLoading || (currentUser?.id === adminUser?.id)}>
                        <SelectTrigger id="new-role">
                            <SelectValue placeholder="Seleccionar rol" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="USER">User</SelectItem>
                        </SelectContent>
                    </Select>
                     {currentUser?.id === adminUser?.id && isEditing && <p className="text-xs text-muted-foreground">No puede cambiar su propio rol.</p>}
                </div>
                <div className="flex gap-2">
                    {isEditing && <Button type="button" variant="outline" onClick={resetForm} disabled={isLoading}>Cancelar</Button>}
                    <Button type="submit" disabled={isLoading} className="w-full">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        {isLoading ? (isEditing ? 'Actualizando...' : 'Agregando...') : (isEditing ? 'Actualizar Empleado' : 'Agregar Empleado')}
                    </Button>
                </div>
                </form>
        </div>
         <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                    Esta acción no se puede deshacer. Esto eliminará permanentemente al usuario <span className="font-bold">{userToDelete?.username}</span> y todos sus datos asociados.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  )
}
