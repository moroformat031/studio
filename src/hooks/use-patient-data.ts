
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Patient, Appointment, Vital, Medication, Procedure, PatientNote } from "@/types/ehr";
import { useAuth } from '@/context/AuthContext';

export function usePatientData() {
    const { user } = useAuth();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPatients = useCallback(async () => {
        if (!user?.clinicId) {
            setPatients([]);
            setLoading(false);
            return;
        };
        try {
            setLoading(true);
            const response = await fetch(`/api/patients?clinicId=${encodeURIComponent(user.clinicId)}`);
            if (!response.ok) {
                throw new Error('Failed to fetch patients');
            }
            const data = await response.json();
            setPatients(data);
        } catch (error) {
            console.error(error);
            // Handle error (e.g., show toast)
        } finally {
            setLoading(false);
        }
    }, [user?.clinicId]);

    useEffect(() => {
        fetchPatients();
    }, [fetchPatients]);

    const getPatient = useCallback((id: string | null) => {
        if (!id) return null;
        return patients.find(p => p.id === id) || null;
    }, [patients]);

    const addPatient = async (patient: Omit<Patient, 'id'>) => {
        if (!user?.clinicId) throw new Error("User has no clinic assigned");
        const patientWithClinic = { ...patient, clinicId: user.clinicId };
        const response = await fetch('/api/patients', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patientWithClinic),
        });
        const newPatient = await response.json();
        setPatients(prev => [...prev, newPatient]);
        return newPatient;
    };

    const updatePatient = async (id: string, updatedData: Partial<Patient>) => {
        const response = await fetch(`/api/patients/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData),
        });
        const updatedPatient = await response.json();
        setPatients(prev => prev.map(p => p.id === id ? updatedPatient : p));
    };

    const addNoteToPatient = async (patientId: string, note: Omit<PatientNote, 'id'>) => {
        const response = await fetch(`/api/patients/${patientId}/notes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(note),
        });
        const updatedPatient = await response.json();
        setPatients(prev => prev.map(p => p.id === patientId ? updatedPatient : p));
    };
    
    const updatePatientAppointments = async (patientId: string, appointments: Appointment[]) => {
        const response = await fetch(`/api/patients/${patientId}/appointments`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appointments),
        });
        const updatedPatient = await response.json();
        setPatients(prev => prev.map(p => p.id === patientId ? updatedPatient : p));
    };

    const updatePatientVitals = async (patientId: string, vitals: Vital[]) => {
        const response = await fetch(`/api/patients/${patientId}/vitals`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(vitals),
        });
        const updatedPatient = await response.json();
        setPatients(prev => prev.map(p => p.id === patientId ? updatedPatient : p));
    };
    
    const updatePatientMedications = async (patientId: string, medications: Medication[]) => {
        const response = await fetch(`/api/patients/${patientId}/medications`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(medications),
        });
        const updatedPatient = await response.json();
        setPatients(prev => prev.map(p => p.id === patientId ? updatedPatient : p));
    };

    const updatePatientProcedures = async (patientId: string, procedures: Procedure[]) => {
         const response = await fetch(`/api/patients/${patientId}/procedures`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(procedures),
        });
        const updatedPatient = await response.json();
        setPatients(prev => prev.map(p => p.id === patientId ? updatedPatient : p));
    };

    return {
        patients,
        loading,
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
