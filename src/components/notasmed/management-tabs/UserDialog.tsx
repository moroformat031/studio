
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Role, UserType } from '@/types/ehr';
import { PlusCircle, User as UserIcon, Eye, EyeOff } from 'lucide-react';

type OmittedUser = Omit<User, 'password'>;

interface UserDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (userData: Partial<User> & { password?: string }) => void;
    user: OmittedUser | null;
    isSaving: boolean;
    adminUser: User | null;
}

export function UserDialog({ isOpen, onClose, onSave, user, isSaving, adminUser }: UserDialogProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState<Role>('USER');
    const [type, setType] = useState<UserType>('Enfermera');

    useEffect(() => {
        if (isOpen) {
            if (user) {
                setUsername(user.username);
                setRole(user.role);
                setType(user.type);
                setPassword('');
            } else {
                setUsername('');
                setPassword('');
                setShowPassword(false);
                setRole('USER');
                setType('Enfermera');
            }
        }
    }, [user, isOpen]);


    const handleSave = () => {
        const userData: Partial<User> & { password?: string } = {
            username,
            role,
            type
        };
        if (password || !user) {
            userData.password = password;
        }
        onSave(userData);
    };

    const isEditingSelf = user?.id === adminUser?.id;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{user ? 'Editar Empleado' : 'Agregar Nuevo Empleado'}</DialogTitle>
          <DialogDescription>
            {user ? 'Actualice los detalles de este empleado.' : 'Introduzca los detalles del nuevo empleado.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
           <div className="space-y-2">
                <Label htmlFor="new-username">Nombre</Label>
                <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="new-username" value={username} onChange={e => setUsername(e.target.value)} required disabled={isSaving} className="pl-10" />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="new-password">Contraseña</Label>
                <div className="relative">
                    <Input id="new-password" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required={!user} disabled={isSaving} className="pr-10" placeholder={user ? 'Dejar en blanco para no cambiar' : ''} />
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
                <Select value={type} onValueChange={(value: UserType) => setType(value)} required disabled={isSaving}>
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
                <Select value={role} onValueChange={(value: Role) => setRole(value)} required disabled={isSaving || isEditingSelf}>
                    <SelectTrigger id="new-role">
                        <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="USER">User</SelectItem>
                    </SelectContent>
                </Select>
                {isEditingSelf && <p className="text-xs text-muted-foreground">No puede cambiar su propio rol.</p>}
            </div>
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancelar</Button>
            <Button type="submit" onClick={handleSave} disabled={isSaving}>
                <PlusCircle className="mr-2 h-4 w-4" />
                {isSaving ? (user ? 'Actualizando...' : 'Agregando...') : (user ? 'Actualizar Empleado' : 'Agregar Empleado')}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
