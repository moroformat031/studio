
"use client";

import { useLocalStorage } from "./use-local-storage";
import { Patient, Appointment, Vital, Medication, Procedure, PatientNote } from "@/types/ehr";
import { initialPatients } from "@/lib/ehr-data";

const PATIENT_DATA_KEY = "notasmed-patient-data";

export function usePatientData() {
    const [patients, setPatients] = useLocalStorage<Patient[]>(PATIENT_DATA_KEY, initialPatients);

    const getPatient = (id: string | null) => {
        if (!id) return null;
        return patients.find(p => p.id === id) || null;
    };

    const addPatient = (patient: Omit<Patient, 'id'>) => {
        const newPatient: Patient = {
            ...patient,
            id: `pat-${Date.now()}`
        };
        setPatients(prev => [...prev, newPatient]);
        return newPatient;
    };

    const updatePatient = (id: string, updatedData: Partial<Patient>) => {
        setPatients(prev => prev.map(p => p.id === id ? { ...p, ...updatedData } : p));
    };

    const addNoteToPatient = (patientId: string, note: Omit<PatientNote, 'id'>) => {
        const newNote = { ...note, id: `note-${Date.now()}` };
        setPatients(prev => prev.map(p => {
            if (p.id === patientId) {
                return { ...p, notes: [...p.notes, newNote] };
            }
            return p;
        }));
    };
    
    const updatePatientAppointments = (patientId: string, appointments: Appointment[]) => {
        setPatients(prev => prev.map(p => {
            if (p.id === patientId) {
                return { ...p, appointments: appointments };
            }
            return p;
        }));
    };

    const updatePatientVitals = (patientId: string, vitals: Vital[]) => {
        setPatients(prev => prev.map(p => {
            if (p.id === patientId) {
                return { ...p, vitals };
            }
            return p;
        }));
    };
    
    const updatePatientMedications = (patientId: string, medications: Medication[]) => {
        setPatients(prev => prev.map(p => {
            if (p.id === patientId) {
                return { ...p, medications };
            }
            return p;
        }));
    };

    const updatePatientProcedures = (patientId: string, procedures: Procedure[]) => {
        setPatients(prev => prev.map(p => {
            if (p.id === patientId) {
                return { ...p, procedures };
            }
            return p;
        }));
    };

    return {
        patients,
        getPatient,
        addPatient,
        updatePatient,
        addNoteToPatient,
        updatePatientAppointments,
        updatePatientVitals,
        updatePatientMedications,
        updatePatientProcedures,
    };
}
