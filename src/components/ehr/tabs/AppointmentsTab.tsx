
"use client";
import { Patient } from '@/types/ehr';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface AppointmentsTabProps {
    patient: Patient;
}

export function AppointmentsTab({ patient }: AppointmentsTabProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Appointments</CardTitle>
                <CardDescription>Scheduled and past appointments.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Reason</TableHead>
                             <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {patient.appointments.map((appt) => (
                            <TableRow key={appt.id}>
                                <TableCell>{new Date(appt.date).toLocaleDateString()}</TableCell>
                                <TableCell>{appt.time}</TableCell>
                                <TableCell>{appt.reason}</TableCell>
                                <TableCell>
                                    <Badge variant={appt.status === 'Completed' ? 'default' : appt.status === 'Canceled' ? 'destructive' : 'secondary'}>
                                        {appt.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                         {patient.appointments.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center">No appointments scheduled.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
