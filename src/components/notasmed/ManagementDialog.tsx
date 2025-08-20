
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
import { MedicationManagementTab } from "./management-tabs/MedicationManagementTab";
import { ProcedureManagementTab } from "./management-tabs/ProcedureManagementTab";
import { useAuth } from "@/context/AuthContext";

interface ManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManagementDialog({ open, onOpenChange }: ManagementDialogProps) {
  const { user } = useAuth();
  const isHospitalPlan = user?.clinic?.plan === 'Hospital';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Panel de Administración</DialogTitle>
          <DialogDescription>
            Gestiona empleados, clínicas, pacientes y más en el sistema.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="employees" className="w-full mt-4 flex-grow flex flex-col">
            <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="employees">Empleados</TabsTrigger>
                {isHospitalPlan && <TabsTrigger value="clinics">Clínicas</TabsTrigger>}
                <TabsTrigger value="patients">Pacientes</TabsTrigger>
                <TabsTrigger value="medications">Medicamentos</TabsTrigger>
                <TabsTrigger value="procedures">Procedimientos</TabsTrigger>
            </TabsList>
            <div className="flex-grow overflow-hidden mt-4">
                <TabsContent value="employees" className="h-full">
                    <UserManagementTab />
                </TabsContent>
                {isHospitalPlan && (
                    <TabsContent value="clinics" className="h-full">
                        <ClinicManagementTab />
                    </TabsContent>
                )}
                <TabsContent value="patients" className="h-full">
                    <PatientManagementTab />
                </TabsContent>
                <TabsContent value="medications" className="h-full">
                    <MedicationManagementTab />
                </TabsContent>
                 <TabsContent value="procedures" className="h-full">
                    <ProcedureManagementTab />
                </TabsContent>
            </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
