
"use client";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Patient, Appointment } from '@/types/ehr';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { es } from 'date-fns/locale';
import { Combobox } from '@/components/ui/combobox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';
import { useProviders } from '@/hooks/use-providers';
import { AppointmentDialog } from './AppointmentDialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SchedulingTabProps {
    patient: Patient;
}

const AppointmentCard = ({ appointment, onEdit }: { appointment: Appointment; onEdit: (appointment: Appointment) => void; }) => {
    const startTime = new Date(`${new Date(appointment.date).toISOString().split('T')[0]}T${appointment.time}`);
    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000); // Assuming 30min duration

    const startHour = startTime.getHours();
    const startMinutes = startTime.getMinutes();

    const top = (startHour * 60 + startMinutes) / 30 * 2; // Each slot is 2rem high

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div 
                        className="absolute left-[4.5rem] right-0 bg-primary/20 border-l-4 border-primary rounded-r-md px-2 py-1 cursor-pointer overflow-hidden"
                        style={{ top: `${top}rem`, height: '1.9rem' }}
                        onClick={() => onEdit(appointment)}
                    >
                        <p className="text-xs font-semibold truncate text-primary-foreground">{appointment.reason}</p>
                        <p className="text-xs truncate text-primary-foreground/80">{appointment.visitProvider}</p>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                     <p>{startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};


export function SchedulingTab({ patient }: SchedulingTabProps) {
    const { toast } = useToast();
    const { doctors, loading: loadingProviders } = useProviders();
    const [selectedProviderId, setSelectedProviderId] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [availableSlots, setAvailableSlots] = useState<Date[]>([]);
    const [bookedAppointments, setBookedAppointments] = useState<Appointment[]>([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [isScheduling, setIsScheduling] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Dialog state
    const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);
    const [currentAppointment, setCurrentAppointment] = useState<Appointment | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);

     useEffect(() => {
        if (doctors.length > 0 && !selectedProviderId) {
            setSelectedProviderId(doctors[0].id);
        }
    }, [doctors, selectedProviderId]);

    const fetchScheduleData = useCallback(async () => {
        if (!selectedProviderId || !selectedDate) return;

        setIsLoadingSlots(true);
        setError(null);
        try {
            const dateString = selectedDate.toISOString().split('T')[0];
            const res = await fetch(`/api/availability?providerId=${selectedProviderId}&date=${dateString}`);
            
            if (!res.ok) {
                const { message } = await res.json();
                throw new Error(message || "No se pudo cargar la disponibilidad.");
            }
            
            const { slots, appointments } = await res.json();
            setAvailableSlots(slots.map((s: string) => new Date(s)));
            setBookedAppointments(appointments);

        } catch (e) {
            const err = e as Error;
            setError(err.message || "Ocurrió un error de red.");
            setAvailableSlots([]);
            setBookedAppointments([]);
        } finally {
            setIsLoadingSlots(false);
        }
    }, [selectedProviderId, selectedDate]);


    useEffect(() => {
        fetchScheduleData();
    }, [fetchScheduleData]);

    const handleSaveAppointment = async (appointmentData: Omit<Appointment, 'id'> | Appointment) => {
        const selectedProvider = doctors.find(p => p.id === selectedProviderId);
        if (!patient || !selectedProvider) return;

        setIsScheduling(true);
        
        const dataToSend = 'id' in appointmentData ?
            // Editing existing
            { ...appointmentData, patientId: patient.id } :
            // Creating new
            {
                ...appointmentData,
                patientId: patient.id,
                visitProvider: selectedProvider.username,
                billingProvider: selectedProvider.username,
            };

        const url = 'id' in appointmentData ? `/api/appointments/${appointmentData.id}` : '/api/appointments';
        const method = 'id' in appointmentData ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend),
            });

            if (!res.ok) {
                const { message } = await res.json();
                throw new Error(message || 'No se pudo programar la cita.');
            }

            toast({
                title: `Cita ${'id' in appointmentData ? 'Actualizada' : 'Programada'}`,
                description: `La cita para ${patient.name} ha sido guardada.`,
            });
            fetchScheduleData(); // Refresh schedule
            setIsAppointmentDialogOpen(false);

        } catch (error) {
            const e = error as Error;
            toast({ variant: 'destructive', title: 'Error al Programar', description: e.message });
        } finally {
            setIsScheduling(false);
        }
    };

    const openAppointmentDialog = (slot: Date) => {
        setCurrentAppointment(null);
        setSelectedSlot(slot);
        setIsAppointmentDialogOpen(true);
    };
    
    const openEditDialog = (appointment: Appointment) => {
        setSelectedSlot(null);
        setCurrentAppointment(appointment);
        setIsAppointmentDialogOpen(true);
    }

    const timeSlots = useMemo(() => {
        const slots = [];
        for (let i = 0; i < 48; i++) {
            const date = new Date();
            date.setHours(Math.floor(i / 2), (i % 2) * 30, 0, 0);
            slots.push(date);
        }
        return slots;
    }, []);

    const providerOptions = useMemo(() => doctors.map(p => ({ label: p.username, value: p.id })), [doctors]);
    
    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Programar Cita</CardTitle>
                    <CardDescription>Seleccione un proveedor y una fecha para ver los horarios disponibles.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-1 space-y-4">
                         <div>
                            <Label htmlFor="provider">Proveedor</Label>
                             <Combobox
                                options={providerOptions}
                                value={selectedProviderId}
                                onChange={setSelectedProviderId}
                                placeholder="Seleccionar doctor"
                                searchPlaceholder="Buscar doctor..."
                                emptyMessage="No se encontró doctor."
                            />
                        </div>
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            locale={es}
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            className="rounded-md border"
                        />
                    </div>
                    <div className="md:col-span-2 space-y-4">
                        <h3 className="font-semibold text-lg">
                           Horarios para {selectedDate?.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </h3>
                        <div className="border rounded-lg h-[600px] overflow-y-auto relative">
                             {isLoadingSlots || loadingProviders ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center h-full text-destructive bg-destructive/10 rounded-md p-4">
                                    <AlertCircle className="h-8 w-8 mb-2" />
                                    <p className="font-semibold">Error</p>
                                    <p className="text-sm text-center">{error}</p>
                                </div>
                            ) : (
                                <>
                                    {timeSlots.map((slot, index) => {
                                        const timeLabel = slot.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                                        const isAvailable = availableSlots.some(s => s.getHours() === slot.getHours() && s.getMinutes() === slot.getMinutes());
                                        return (
                                            <div key={index} className="flex h-8 border-t relative">
                                                <div className="w-16 text-xs text-muted-foreground text-right pr-2 pt-1 -mt-2">
                                                   {slot.getMinutes() === 0 ? timeLabel : ''}
                                                </div>
                                                <div 
                                                    className="flex-1 border-l"
                                                    onClick={() => { if(isAvailable) openAppointmentDialog(slot) }}
                                                >
                                                    {isAvailable && (
                                                        <div className="h-full w-full bg-primary/10 hover:bg-primary/20 cursor-pointer" />
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}

                                    {bookedAppointments.map(app => (
                                        <AppointmentCard key={app.id} appointment={app} onEdit={openEditDialog} />
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <AppointmentDialog
                isOpen={isAppointmentDialogOpen}
                onClose={() => setIsAppointmentDialogOpen(false)}
                onSave={handleSaveAppointment}
                appointment={currentAppointment}
                selectedDate={selectedDate}
                selectedTime={selectedSlot ? selectedSlot.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' }) : null}
            />
        </>
    );
}
