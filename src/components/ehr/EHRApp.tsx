
"use client";
import { useState, useEffect } from 'react';
import { usePatientData } from '@/hooks/use-patient-data';
import { PatientDetail } from './PatientDetail';
import { Header } from '../notasmed/Header';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Patient, Appointment, Vital, Medication, Procedure } from '@/types/ehr';
import { PatientCombobox } from './PatientCombobox';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';

export function EHRApp() {
    const { patients, updatePatient, addNoteToPatient, updatePatientAppointments, updatePatientVitals, updatePatientMedications, updatePatientProcedures, loading, fetchPatients } = usePatientData();
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
    const [fontSize] = useLocalStorage('notasmed-fontSize', 16);
    const { user } = useAuth();
    
    const selectedPatient = patients.find(p => p.id === selectedPatientId) || null;

    useEffect(() => {
        if (user) {
            fetchPatients();
        }
    }, [user, fetchPatients]);
    
    // When the list of patients changes (e.g., due to user change),
    // check if the currently selected patient is still in the list.
    // If not, reset the selection.
    useEffect(() => {
        if (selectedPatientId && !patients.some(p => p.id === selectedPatientId)) {
            setSelectedPatientId(null);
        }
    }, [patients, selectedPatientId]);


    const handleUpdateAppointments = (patientId: string, appointments: Appointment[]) => {
        updatePatientAppointments(patientId, appointments);
    };
    
    const handleUpdateVitals = (patientId: string, vitals: Vital[]) => {
        updatePatientVitals(patientId, vitals);
    };

    const handleUpdateMedications = (patientId: string, medications: Medication[]) => {
        updatePatientMedications(patientId, medications);
    }

    const handleUpdateProcedures = (patientId: string, procedures: Procedure[]) => {
        updatePatientProcedures(patientId, procedures);
    }

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
                            <h2 className="text-lg font-semibold mb-2">Seleccionar Paciente</h2>
                             <div className="w-full md:w-[300px]">
                                {loading ? (
                                    <Skeleton className="h-10 w-full" />
                                ) : (
                                    <PatientCombobox
                                        patients={patients}
                                        selectedPatientId={selectedPatientId}
                                        onSelectPatient={setSelectedPatientId}
                                    />
                                )}
                             </div>
                        </div>
                    </div>
                    
                    <div>
                        {loading && !selectedPatient ? (
                             <Skeleton className="h-[600px] w-full" />
                        ) : selectedPatient ? (
                            <PatientDetail
                                key={selectedPatient.id} // Add key to force re-render on patient change
                                patient={selectedPatient}
                                onUpdatePatient={updatePatient}
                                onAddNote={addNoteToPatient}
                                onUpdateAppointments={handleUpdateAppointments}
                                onUpdateVitals={handleUpdateVitals}
                                onUpdateMedications={handleUpdateMedications}
                                onUpdateProcedures={handleUpdateProcedures}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-[400px] text-muted-foreground border-2 border-dashed rounded-lg">
                                {patients.length > 0 ? 'Seleccione un paciente para ver sus detalles.' : 'No hay pacientes en esta clínica.'}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
