
"use client";
import { Patient } from '@/types/ehr';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface NotesTabProps {
    patient: Patient;
}

export function NotesTab({ patient }: NotesTabProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Consultation Notes</CardTitle>
                <CardDescription>Transcriptions and summaries from consultations.</CardDescription>
            </CardHeader>
            <CardContent>
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
                    <div className="text-center text-muted-foreground py-8">
                        No consultation notes found for this patient.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
