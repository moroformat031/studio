
"use client";

import { LogOut, Settings, Stethoscope, Building, Users, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SettingsDialog } from './SettingsDialog';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { PlanGate } from './PlanGate';
import { ManagementDialog } from './ManagementDialog';
import { useState } from 'react';

export function Header() {
  const { user, logout } = useAuth();
  const [isManagementOpen, setIsManagementOpen] = useState(false);

  return (
    <>
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 md:px-8">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-7 w-7 text-primary" />
          <div className="flex flex-col">
            <h1 className="text-xl font-bold font-headline tracking-tight">
                NotasMed EHR
            </h1>
            {user?.clinicName && (
                <p className="text-xs text-muted-foreground -mt-1">{user.clinicName}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <SettingsDialog>
            <Button variant="outline" size="icon" aria-label="Abrir Configuración">
              <Settings className="h-4 w-4" />
            </Button>
          </SettingsDialog>
          <PlanGate allowedPlans={['Admin']}>
            <Button variant="outline" size="sm" onClick={() => setIsManagementOpen(true)}>
                <Briefcase className="h-4 w-4 mr-2" />
                Gestionar
            </Button>
          </PlanGate>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer h-9 w-9">
                <AvatarImage src={`https://placehold.co/100x100.png`} alt={user?.username} />
                <AvatarFallback>{user?.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.username}</p>
                   {user?.clinicName && (
                     <p className="text-xs leading-none text-muted-foreground flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        {user.clinicName}
                    </p>
                  )}
                  <p className="text-xs leading-none text-muted-foreground">Plan {user?.plan}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
    <ManagementDialog open={isManagementOpen} onOpenChange={setIsManagementOpen} />
    </>
  );
}
