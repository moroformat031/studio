
"use client";
import { useState } from 'react';
import { usePatientData } from '@/hooks/use-patient-data';
import { PatientDetail } from './PatientDetail';
import { Header } from '../notasmed/Header';
import { AddPatientDialog } from './AddPatientDialog';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Patient, Appointment } from '@/types/ehr';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import { PlanGate } from '../notasmed/PlanGate';
import { PatientCombobox } from './PatientCombobox';

export function EHRApp() {
    const { patients, addPatient, updatePatient, addNoteToPatient, updatePatientAppointments } = usePatientData();
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(patients[0]?.id || null);
    const [fontSize] = useLocalStorage('notasmed-fontSize', 16);
    const [isAddPatientDialogOpen, setIsAddPatientDialogOpen] = useState(false);
    
    const selectedPatient = patients.find(p => p.id === selectedPatientId) || null;

    const handleAddPatient = (patient: Omit<Patient, 'id' | 'vitals' | 'medications' | 'appointments' | 'procedures' | 'notes'>) => {
        const newPatientData: Omit<Patient, 'id'> = {
            ...patient,
            vitals: [],
            medications: [],
            appointments: [],
            procedures: [],
            notes: []
        };
        const newPatient = addPatient(newPatientData);
        setSelectedPatientId(newPatient.id);
        setIsAddPatientDialogOpen(false);
    };

    const handleUpdateAppointments = (patientId: string, appointments: Appointment[]) => {
        updatePatientAppointments(patientId, appointments);
    };

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
            <Header />
            <main
                className="flex-1 container mx-auto p-4 sm:p-6 md:p-8"
                style={{ fontSize: `${fontSize}px` }}
            >
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                            <h2 className="text-lg font-semibold mb-2">Select Patient</h2>
                             <div className="w-full md:w-[300px]">
                                <PatientCombobox
                                    patients={patients}
                                    selectedPatientId={selectedPatientId}
                                    onSelectPatient={setSelectedPatientId}
                                />
                             </div>
                        </div>
                         <PlanGate allowedPlans={['Pro', 'Admin']}>
                            <AddPatientDialog
                                open={isAddPatientDialogOpen}
                                onOpenChange={setIsAddPatientDialogOpen}
                                onSave={handleAddPatient}
                            >
                                <Button size="sm" variant="outline" className="w-full md:w-auto">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Patient
                                </Button>
                            </AddPatientDialog>
                        </PlanGate>
                    </div>
                    
                    <div>
                        {selectedPatient ? (
                            <PatientDetail
                                patient={selectedPatient}
                                onUpdatePatient={updatePatient}
                                onAddNote={addNoteToPatient}
                                onUpdateAppointments={handleUpdateAppointments}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-[400px] text-muted-foreground border-2 border-dashed rounded-lg">
                                Select a patient to view their details or add a new patient.
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
