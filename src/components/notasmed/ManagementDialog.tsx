
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagementTab } from './management-tabs/UserManagementTab';
import { ClinicManagementTab } from './management-tabs/ClinicManagementTab';

interface ManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManagementDialog({ open, onOpenChange }: ManagementDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Panel de Administración</DialogTitle>
          <DialogDescription>
            Gestiona usuarios y clínicas en el sistema.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="users" className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="users">Usuarios</TabsTrigger>
                <TabsTrigger value="clinics">Clínicas</TabsTrigger>
            </TabsList>
            <TabsContent value="users" className="mt-4">
                <UserManagementTab />
            </TabsContent>
            <TabsContent value="clinics" className="mt-4">
                <ClinicManagementTab />
            </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

    