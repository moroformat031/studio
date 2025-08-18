
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
import { PatientManagementTab } from "./management-tabs/PatientManagementTab";
import { ProviderManagementTab } from "./management-tabs/ProviderManagementTab";

interface ManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManagementDialog({ open, onOpenChange }: ManagementDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Panel de Administración</DialogTitle>
          <DialogDescription>
            Gestiona usuarios, clínicas y pacientes en el sistema.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="users" className="w-full mt-4 flex-grow flex flex-col">
            <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="users">Usuarios</TabsTrigger>
                <TabsTrigger value="medicos">Medicos</TabsTrigger>
                <TabsTrigger value="clinics">Clínicas</TabsTrigger>
                <TabsTrigger value="patients">Pacientes</TabsTrigger>
                <TabsTrigger value="medications" disabled>Medicamentos</TabsTrigger>
                <TabsTrigger value="procedures" disabled>Procedimientos</TabsTrigger>
            </TabsList>
            <div className="flex-grow overflow-hidden mt-4">
                <TabsContent value="users" className="h-full">
                    <UserManagementTab />
                </TabsContent>
                <TabsContent value="medicos" className="h-full">
                    <ProviderManagementTab />
                </TabsContent>
                <TabsContent value="clinics" className="h-full">
                    <ClinicManagementTab />
                </TabsContent>
                <TabsContent value="patients" className="h-full">
                    <PatientManagementTab />
                </TabsContent>
                <TabsContent value="medications">
                    {/* Placeholder for future implementation */}
                </TabsContent>
                 <TabsContent value="procedures">
                    {/* Placeholder for future implementation */}
                </TabsContent>
            </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
