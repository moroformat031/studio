
"use client";
import { useState } from 'react';
import { Patient, PatientNote } from '@/types/ehr';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DemographicsTab } from './tabs/DemographicsTab';
import { VitalsTab } from './tabs/VitalsTab';
import { AppointmentsTab } from './tabs/AppointmentsTab';
import { MedicationsTab } from './tabs/MedicationsTab';
import { NotesTab } from './tabs/NotesTab';
import { Button } from '../ui/button';
import { PlusCircle } from 'lucide-react';
import { NotasMedApp } from '../notasmed/NotasMedApp';

interface PatientDetailProps {
    patient: Patient;
    onUpdatePatient: (id: string, data: Partial<Patient>) => void;
    onAddNote: (patientId: string, note: Omit<PatientNote, 'id'>) => void;
}

export function PatientDetail({ patient, onUpdatePatient, onAddNote }: PatientDetailProps) {
    const [view, setView] = useState<'details' | 'new-note'>('details');

    const handleSaveNote = (note: { transcription: string; summary: string; date: string }) => {
        onAddNote(patient.id, note);
        setView('details');
    }

    if (view === 'new-note') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>New Consultation Note for {patient.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <NotasMedApp onSave={handleSaveNote} onCancel={() => setView('details')} />
                </CardContent>
            </Card>
        )
    }

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
                <Button onClick={() => setView('new-note')}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Consultation
                </Button>
            </div>
            <TabsContent value="demographics">
                <DemographicsTab patient={patient} onUpdatePatient={onUpdatePatient} />
            </TabsContent>
            <TabsContent value="vitals">
                <VitalsTab patient={patient} />
            </TabsContent>
            <TabsContent value="appointments">
                <AppointmentsTab patient={patient} />
            </TabsContent>
            <TabsContent value="medications">
                <MedicationsTab patient={patient} />
            </TabsContent>
            <TabsContent value="notes">
                <NotesTab patient={patient} />
            </TabsContent>
        </Tabs>
    );
}
