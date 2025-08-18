
"use client";
import { Patient, PatientNote, Appointment, Vital, Medication, Procedure } from '@/types/ehr';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DemographicsTab } from './tabs/DemographicsTab';
import { VitalsTab } from './tabs/VitalsTab';
import { SchedulingTab } from './tabs/SchedulingTab';
import { MedicationsTab } from './tabs/MedicationsTab';
import { ProceduresTab } from './tabs/ProceduresTab';
import { NotesTab } from './tabs/NotesTab';

interface PatientDetailProps {
    patient: Patient;
    onUpdatePatient: (id: string, data: Partial<Patient>) => void;
    onAddNote: (patientId: string, note: Omit<PatientNote, 'id'>) => void;
    onUpdateAppointments: (patientId: string, appointments: Appointment[]) => void;
    onUpdateVitals: (patientId: string, vitals: Vital[]) => void;
    onUpdateMedications: (patientId: string, medications: Medication[]) => void;
    onUpdateProcedures: (patientId: string, procedures: Procedure[]) => void;
}

export function PatientDetail({ 
    patient, 
    onUpdatePatient, 
    onAddNote, 
    onUpdateAppointments, 
    onUpdateVitals, 
    onUpdateMedications,
    onUpdateProcedures
}: PatientDetailProps) {

    return (
        <Tabs defaultValue="scheduling" className="w-full">
            <div className="flex justify-between items-center mb-4">
                <TabsList>
                    <TabsTrigger value="scheduling">Citas</TabsTrigger>
                    <TabsTrigger value="notes">Notas</TabsTrigger>
                    <TabsTrigger value="medications">Medicamentos</TabsTrigger>
                    <TabsTrigger value="vitals">Signos Vitales</TabsTrigger>
                    <TabsTrigger value="procedures">Procedimientos</TabsTrigger>
                    <TabsTrigger value="demographics">Paciente</TabsTrigger>
                </TabsList>
            </div>
            <TabsContent value="scheduling">
                <SchedulingTab patient={patient} />
            </TabsContent>
             <TabsContent value="notes">
                <NotesTab patient={patient} onAddNote={onAddNote} />
            </TabsContent>
             <TabsContent value="medications">
                <MedicationsTab patient={patient} onUpdateMedications={onUpdateMedications} />
            </TabsContent>
            <TabsContent value="vitals">
                <VitalsTab patient={patient} onUpdateVitals={onUpdateVitals} />
            </TabsContent>
             <TabsContent value="procedures">
                <ProceduresTab patient={patient} onUpdateProcedures={onUpdateProcedures} />
            </TabsContent>
            <TabsContent value="demographics">
                <DemographicsTab patient={patient} onUpdatePatient={onUpdatePatient} />
            </TabsContent>
        </Tabs>
    );
}
