
"use client";
import React, { useState } from 'react';
import { Patient, Appointment } from '@/types/ehr';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Trash2, Edit } from 'lucide-react';
import { AppointmentDialog } from './AppointmentDialog';
import { PlanGate } from '@/components/notasmed/PlanGate';

interface AppointmentsTabProps {
    patient: Patient;
    onUpdateAppointments: (patientId: string, appointments: Appointment[]) => void;
}

export function AppointmentsTab({ patient, onUpdateAppointments }: AppointmentsTabProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    const handleAddClick = () => {
        setSelectedAppointment(null);
        setIsDialogOpen(true);
    };

    const handleEditClick = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
        setIsDialogOpen(true);
    };

    const handleDeleteClick = (appointmentId: string) => {
        const updatedAppointments = patient.appointments.filter(appt => appt.id !== appointmentId);
        onUpdateAppointments(patient.id, updatedAppointments);
    };

    const handleSaveAppointment = (appointmentData: Omit<Appointment, 'id'> | Appointment) => {
        let updatedAppointments;
        if ('id' in appointmentData) {
            // Editing existing appointment
            updatedAppointments = patient.appointments.map(appt =>
                appt.id === appointmentData.id ? appointmentData : appt
            );
        } else {
            // Adding new appointment
            const newAppointment: Appointment = {
                id: `appt-${Date.now()}`,
                date: appointmentData.date,
                time: appointmentData.time,
                reason: appointmentData.reason,
                status: appointmentData.status,
                visitProvider: appointmentData.visitProvider,
                billingProvider: appointmentData.billingProvider
            };
            updatedAppointments = [...patient.appointments, newAppointment];
        }
        onUpdateAppointments(patient.id, updatedAppointments);
        setIsDialogOpen(false);
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Citas</CardTitle>
                            <CardDescription>Citas programadas y pasadas.</CardDescription>
                        </div>
                        <PlanGate allowedPlans={['Pro', 'Admin']}>
                            <Button onClick={handleAddClick} size="sm">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Agregar Cita
                            </Button>
                        </PlanGate>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Hora</TableHead>
                                <TableHead>Motivo</TableHead>
                                <TableHead>Prov. Visita</TableHead>
                                <TableHead>Prov. Factura</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {patient.appointments.length > 0 ? (
                                patient.appointments
                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                .map((appt) => (
                                <TableRow key={appt.id}>
                                    <TableCell>{new Date(appt.date).toLocaleDateString()}</TableCell>
                                    <TableCell>{appt.time}</TableCell>
                                    <TableCell>{appt.reason}</TableCell>
                                    <TableCell>{appt.visitProvider}</TableCell>
                                    <TableCell>{appt.billingProvider}</TableCell>
                                    <TableCell>
                                        <Badge variant={appt.status === 'Completada' ? 'default' : appt.status === 'Cancelada' ? 'destructive' : 'secondary'}>
                                            {appt.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                     <PlanGate allowedPlans={['Pro', 'Admin']}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Abrir menú</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEditClick(appt)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    <span>Editar</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDeleteClick(appt.id)} className="text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    <span>Eliminar</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                       </PlanGate>
                                    </TableCell>
                                </TableRow>
                            ))): (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center">No hay citas programadas.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <AppointmentDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSave={handleSaveAppointment}
                appointment={selectedAppointment}
            />
        </>
    );
}
