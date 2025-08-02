
"use client";
import { Patient, PatientNote, Appointment } from '@/types/ehr';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DemographicsTab } from './tabs/DemographicsTab';
import { VitalsTab } from './tabs/VitalsTab';
import { AppointmentsTab } from './tabs/AppointmentsTab';
import { MedicationsTab } from './tabs/MedicationsTab';
import { NotesTab } from './tabs/NotesTab';

interface PatientDetailProps {
    patient: Patient;
    onUpdatePatient: (id: string, data: Partial<Patient>) => void;
    onAddNote: (patientId: string, note: Omit<PatientNote, 'id'>) => void;
    onUpdateAppointments: (patientId: string, appointments: Appointment[]) => void;
}

export function PatientDetail({ patient, onUpdatePatient, onAddNote, onUpdateAppointments }: PatientDetailProps) {

    return (
        <Tabs defaultValue="demographics" className="w-full">
            <div className="flex justify-between items-center mb-4">
                <TabsList>
                    <TabsTrigger value="demographics">Demographics</TabsTrigger>
                    <TabsTrigger value="vitals">Vitals</TabsTrigger>
                    <TabsTrigger value="appointments">Appointments</TabsTrigger>
                    <TabsTrigger value="medications">Medications</TabsTrigger>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                </TabsList>
            </div>
            <TabsContent value="demographics">
                <DemographicsTab patient={patient} onUpdatePatient={onUpdatePatient} />
            </TabsContent>
            <TabsContent value="vitals">
                <VitalsTab patient={patient} />
            </TabsContent>
            <TabsContent value="appointments">
                <AppointmentsTab patient={patient} onUpdateAppointments={onUpdateAppointments} />
            </TabsContent>
            <TabsContent value="medications">
                <MedicationsTab patient={patient} />
            </TabsContent>
            <TabsContent value="notes">
                <NotesTab patient={patient} onAddNote={onAddNote} />
            </TabsContent>
        </Tabs>
    );
}
