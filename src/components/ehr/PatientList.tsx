
"use client";
import { Patient } from '@/types/ehr';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface PatientListProps {
    patients: Patient[];
    selectedPatientId: string | null;
    onSelectPatient: (id: string) => void;
}

export function PatientList({ patients, selectedPatientId, onSelectPatient }: PatientListProps) {
    return (
        <Card>
            <CardContent className="p-2">
                <div className="space-y-1">
                    {patients.map(patient => (
                        <button
                            key={patient.id}
                            onClick={() => onSelectPatient(patient.id)}
                            className={cn(
                                'w-full text-left p-2 rounded-md transition-colors flex items-center gap-3',
                                selectedPatientId === patient.id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-accent'
                            )}
                        >
                            <Avatar>
                                <AvatarImage src={`https://placehold.co/100x100.png`} data-ai-hint="person" />
                                <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 truncate">
                                <p className="font-semibold truncate">{patient.name}</p>
                                <p className={cn("text-xs truncate", selectedPatientId === patient.id ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                                    FDN: {patient.demographics.dob}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
