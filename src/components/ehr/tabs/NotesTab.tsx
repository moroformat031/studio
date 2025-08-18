
"use client";
import { useState, useMemo } from 'react';
import { Patient, PatientNote } from '@/types/ehr';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { NotasMedApp } from '@/components/notasmed/NotasMedApp';
import { Combobox } from '@/components/ui/combobox';
import { Label } from '@/components/ui/label';
import { useProviders } from '@/hooks/use-providers';

interface NotesTabProps {
    patient: Patient;
    onAddNote: (patientId: string, note: Omit<PatientNote, 'id'>) => void;
}

export function NotesTab({ patient, onAddNote }: NotesTabProps) {
    const [isCreatingNote, setIsCreatingNote] = useState(false);
    const { providers } = useProviders();
    const [provider, setProvider] = useState('');
    
    const handleSaveNote = (note: { transcription: string; summary: string; date: string }) => {
        onAddNote(patient.id, { ...note, provider });
        setIsCreatingNote(false);
        setProvider('');
    }

    const handleCancel = () => {
        setIsCreatingNote(false);
        setProvider('');
    }

    const handleStartNewNote = () => {
        setIsCreatingNote(true);
    }
    
    const providerOptions = useMemo(() => providers.map(p => ({label: p.username, value: p.username})), [providers]);

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Notas de Consulta</CardTitle>
                        <CardDescription>Transcripciones y resúmenes de las consultas.</CardDescription>
                    </div>
                     <Button onClick={() => isCreatingNote ? handleCancel() : handleStartNewNote()} variant="outline">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        {isCreatingNote ? 'Cancelar' : 'Nueva Nota'}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {isCreatingNote && (
                    <div className="mb-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-2">
                             <Label htmlFor="provider" className="md:text-right">
                                Proveedor de la Nota
                            </Label>
                            <div className="md:col-span-2">
                                <Combobox
                                    options={providerOptions}
                                    value={provider}
                                    onChange={setProvider}
                                    placeholder="Seleccionar proveedor"
                                    searchPlaceholder="Buscar proveedor..."
                                    emptyMessage="No se encontró proveedor."
                                />
                            </div>
                        </div>
                        <NotasMedApp 
                            onSave={handleSaveNote} 
                            onCancel={handleCancel}
                            isProviderSelected={!!provider}
                        />
                    </div>
                )}

                {patient.notes.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full">
                        {patient.notes.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(note => (
                            <AccordionItem value={note.id} key={note.id}>
                                <AccordionTrigger>
                                    <div className="flex justify-between w-full pr-4">
                                        <div className="flex flex-col text-left">
                                            <span>Nota de Consulta</span>
                                            <span className="text-xs font-normal text-muted-foreground">{note.provider}</span>
                                        </div>
                                        <span className="text-muted-foreground font-normal">{new Date(note.date).toLocaleString()}</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="space-y-4">
                                        {note.summary && (
                                            <div>
                                                <h4 className="font-semibold mb-2">Resumen</h4>
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{note.summary}</p>
                                            </div>
                                        )}
                                        {note.transcription && (
                                            <div>
                                                <h4 className="font-semibold mb-2">Transcripción Completa</h4>
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
                            No se encontraron notas de consulta para este paciente.
                        </div>
                    )
                )}
            </CardContent>
        </Card>
    );
}
