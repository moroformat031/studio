
"use client";
import { useState } from 'react';
import { Patient, PatientNote } from '@/types/ehr';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { NotasMedApp } from '@/components/notasmed/NotasMedApp';

interface NotesTabProps {
    patient: Patient;
    onAddNote: (patientId: string, note: Omit<PatientNote, 'id'>) => void;
}

export function NotesTab({ patient, onAddNote }: NotesTabProps) {
    const [isCreatingNote, setIsCreatingNote] = useState(false);
    
    const handleSaveNote = (note: { transcription: string; summary: string; date: string }) => {
        onAddNote(patient.id, note);
        setIsCreatingNote(false);
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Consultation Notes</CardTitle>
                        <CardDescription>Transcriptions and summaries from consultations.</CardDescription>
                    </div>
                     <Button onClick={() => setIsCreatingNote(prev => !prev)} variant="outline">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        {isCreatingNote ? 'Cancel' : 'New Note'}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {isCreatingNote && (
                    <div className="mb-6">
                        <NotasMedApp onSave={handleSaveNote} onCancel={() => setIsCreatingNote(false)} />
                    </div>
                )}

                {patient.notes.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full">
                        {patient.notes.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(note => (
                            <AccordionItem value={note.id} key={note.id}>
                                <AccordionTrigger>
                                    <div className="flex justify-between w-full pr-4">
                                        <span>Consultation Note</span>
                                        <span className="text-muted-foreground font-normal">{new Date(note.date).toLocaleString()}</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="space-y-4">
                                        {note.summary && (
                                            <div>
                                                <h4 className="font-semibold mb-2">Summary</h4>
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{note.summary}</p>
                                            </div>
                                        )}
                                        {note.transcription && (
                                            <div>
                                                <h4 className="font-semibold mb-2">Full Transcription</h4>
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{note.transcription}</p>
                                            </div>
                                        )}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                ) : (
                     !isCreatingNote && (
                        <div className="text-center text-muted-foreground py-8">
                            No consultation notes found for this patient.
                        </div>
                    )
                )}
            </CardContent>
        </Card>
    );
}
