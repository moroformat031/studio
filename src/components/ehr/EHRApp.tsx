
"use client";
import { useState } from 'react';
import { usePatientData } from '@/hooks/use-patient-data';
import { PatientList } from './PatientList';
import { PatientDetail } from './PatientDetail';
import { Header } from '../notasmed/Header';
import { AddPatientDialog } from './AddPatientDialog';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Patient } from '@/types/ehr';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import { PlanGate } from '../notasmed/PlanGate';

export function EHRApp() {
    const { patients, addPatient, updatePatient, addNoteToPatient } = usePatientData();
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
        addPatient(newPatientData);
        setIsAddPatientDialogOpen(false);
    };

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
            <Header />
            <main
                className="flex-1 container mx-auto p-4 sm:p-6 md:p-8"
                style={{ fontSize: `${fontSize}px` }}
            >
                <div className="grid gap-8 md:grid-cols-[300px_1fr]">
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Patients</h2>
                             <PlanGate allowedPlans={['Pro', 'Admin']}>
                                <AddPatientDialog
                                    open={isAddPatientDialogOpen}
                                    onOpenChange={setIsAddPatientDialogOpen}
                                    onSave={handleAddPatient}
                                >
                                    <Button size="sm">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Patient
                                    </Button>
                                </AddPatientDialog>
                            </PlanGate>
                        </div>
                        <PatientList
                            patients={patients}
                            selectedPatientId={selectedPatientId}
                            onSelectPatient={setSelectedPatientId}
                        />
                    </div>
                    <div>
                        {selectedPatient ? (
                            <PatientDetail
                                patient={selectedPatient}
                                onUpdatePatient={updatePatient}
                                onAddNote={addNoteToPatient}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                Select a patient to view their details.
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
