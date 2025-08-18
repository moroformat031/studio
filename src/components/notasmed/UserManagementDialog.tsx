
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plan, User } from '@/types/ehr';
import { PlusCircle, Building, User as UserIcon, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

interface UserManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserManagementDialog({ open, onOpenChange }: UserManagementDialogProps) {
    const { toast } = useToast();
    const [users, setUsers] = useState<Omit<User, 'password'>[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Add user form state
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [plan, setPlan] = useState<Plan>('Medico');
    const [clinicName, setClinicName] = useState('');

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/users');
            if(res.ok) {
                const data = await res.json();
                setUsers(data);
            } else {
                throw new Error("Failed to fetch users");
            }
        } catch (e) {
            const err = e as Error;
            toast({
                variant: 'destructive',
                title: 'Error',
                description: err.message || 'No se pudieron cargar los usuarios.'
            })
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (open) {
            fetchUsers();
        }
    }, [open]);

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, plan, clinicName })
            });
            if (!response.ok) {
                const { message } = await response.json();
                throw new Error(message);
            }
            toast({
                title: 'Usuario Agregado',
                description: `El usuario ${username} ha sido creado.`
            });
            // Reset form
            setUsername('');
            setPassword('');
            setShowPassword(false);
            setPlan('Medico');
            setClinicName('');
            // Refresh user list
            fetchUsers();
        } catch (error) {
            const e = error as Error;
            toast({
                variant: 'destructive',
                title: 'Error al Agregar Usuario',
                description: e.message
            });
        } finally {
            setIsLoading(false);
        }
    }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Gestionar Usuarios</DialogTitle>
          <DialogDescription>
            Ver usuarios existentes y agregar nuevos.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
            {/* User List */}
            <div className="space-y-4">
                <h3 className="font-semibold">Usuarios Existentes</h3>
                <Card>
                    <CardContent className="p-0 max-h-[400px] overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Usuario</TableHead>
                                    <TableHead>Plan</TableHead>
                                    <TableHead>Clínica/Hospital</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                     <TableRow><TableCell colSpan={3} className="text-center">Cargando...</TableCell></TableRow>
                                ) : users.length > 0 ? (
                                    users.map(user => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.username}</TableCell>
                                            <TableCell>{user.plan}</TableCell>
                                            <TableCell>{user.clinicName || 'N/A'}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow><TableCell colSpan={3} className="text-center">No hay usuarios.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            {/* Add User Form */}
            <div className="space-y-4">
                 <h3 className="font-semibold">Agregar Nuevo Usuario</h3>
                 <form onSubmit={handleAddUser} className="space-y-4 p-4 border rounded-lg">
                    <div className="space-y-2">
                        <Label htmlFor="new-username">Usuario</Label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input id="new-username" value={username} onChange={e => setUsername(e.target.value)} required disabled={isLoading} className="pl-10" />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="new-password">Contraseña</Label>
                         <div className="relative">
                            <Input id="new-password" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required disabled={isLoading} className="pr-10" />
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
                        <Label htmlFor="new-plan">Plan</Label>
                        <Select value={plan} onValueChange={(value: Plan) => setPlan(value)} required disabled={isLoading}>
                            <SelectTrigger id="new-plan">
                                <SelectValue placeholder="Seleccionar plan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Medico">Medico</SelectItem>
                                <SelectItem value="Nurse">Nurse</SelectItem>
                                <SelectItem value="Admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="new-clinicname">Nombre Clínica/Hospital</Label>
                        <div className="relative">
                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input id="new-clinicname" value={clinicName} onChange={e => setClinicName(e.target.value)} disabled={isLoading} className="pl-10" />
                        </div>
                    </div>
                    <Button type="submit" disabled={isLoading} className="w-full">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        {isLoading ? 'Agregando...' : 'Agregar Usuario'}
                    </Button>
                 </form>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
