
"use client";
import { Patient } from '@/types/ehr';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface VitalsTabProps {
    patient: Patient;
}

export function VitalsTab({ patient }: VitalsTabProps) {
    return (
        <Card>
            <CardHeader>
                 <CardTitle>Vitals</CardTitle>
                 <CardDescription>Patient's recorded vital signs.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>HR</TableHead>
                            <TableHead>BP</TableHead>
                            <TableHead>Temp (°C)</TableHead>
                             <TableHead>RR</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {patient.vitals.map((vital, index) => (
                            <TableRow key={index}>
                                <TableCell>{new Date(vital.date).toLocaleDateString()}</TableCell>
                                <TableCell>{vital.hr}</TableCell>
                                <TableCell>{vital.bp}</TableCell>
                                <TableCell>{vital.temp}</TableCell>
                                <TableCell>{vital.rr}</TableCell>
                            </TableRow>
                        ))}
                         {patient.vitals.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">No vital signs recorded.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
