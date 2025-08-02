
"use client";
import { Patient } from '@/types/ehr';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface MedicationsTabProps {
    patient: Patient;
}

export function MedicationsTab({ patient }: MedicationsTabProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Medications</CardTitle>
                <CardDescription>Current and past medications.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date Prescribed</TableHead>
                            <TableHead>Medication</TableHead>
                            <TableHead>Dosage</TableHead>
                            <TableHead>Frequency</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {patient.medications
                          .sort((a, b) => new Date(b.prescribedDate).getTime() - new Date(a.prescribedDate).getTime())
                          .map((med) => (
                            <TableRow key={med.id}>
                                <TableCell>{new Date(med.prescribedDate).toLocaleDateString()}</TableCell>
                                <TableCell>{med.name}</TableCell>
                                <TableCell>{med.dosage}</TableCell>
                                <TableCell>{med.frequency}</TableCell>
                            </TableRow>
                        ))}
                        {patient.medications.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center">No medications prescribed.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
