
"use client";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Patient, User } from '@/types/ehr';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { es } from 'date-fns/locale';
import { Combobox } from '@/components/ui/combobox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface SchedulingTabProps {
    patient: Patient;
}

export function SchedulingTab({ patient }: SchedulingTabProps) {
    const { toast } = useToast();
    const [providers, setProviders] = useState<User[]>([]);
    const [selectedProviderId, setSelectedProviderId] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [reason, setReason] = useState('');
    const [isConfirming, setIsConfirming] = useState(false);
    const [isScheduling, setIsScheduling] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        const fetchProviders = async () => {
            try {
                const res = await fetch('/api/users');
                if (res.ok) {
                    const allUsers: User[] = await res.json();
                    const medicos = allUsers.filter(u => u.plan === 'Medico' || u.plan === 'Admin');
                    setProviders(medicos);
                    if (medicos.length > 0) {
                        setSelectedProviderId(medicos[0].id);
                    }
                }
            } catch (e) {
                console.error(e);
            }
        };
        fetchProviders();
    }, []);

    const fetchAvailableSlots = useCallback(async () => {
        if (!selectedProviderId || !selectedDate) return;

        setIsLoadingSlots(true);
        setError(null);
        try {
            const dateString = selectedDate.toISOString().split('T')[0];
            const res = await fetch(`/api/availability?providerId=${selectedProviderId}&date=${dateString}`);
            if (res.ok) {
                const slots = await res.json();
                setAvailableSlots(slots);
            } else {
                const { message } = await res.json();
                setError(message || "No se pudo cargar la disponibilidad.");
                setAvailableSlots([]);
            }
        } catch (e) {
            setError("Ocurrió un error de red.");
            setAvailableSlots([]);
        } finally {
            setIsLoadingSlots(false);
        }
    }, [selectedProviderId, selectedDate]);


    useEffect(() => {
        fetchAvailableSlots();
    }, [fetchAvailableSlots]);
    
    useEffect(() => {
        setSelectedSlot(null);
    }, [selectedDate, selectedProviderId]);


    const handleScheduleAppointment = async () => {
        if (!patient || !selectedProviderId || !selectedDate || !selectedSlot || !reason) {
            toast({
                variant: 'destructive',
                title: 'Faltan Datos',
                description: 'Por favor, complete todos los campos para programar la cita.',
            });
            return;
        }

        setIsScheduling(true);
        const appointmentData = {
            patientId: patient.id,
            date: selectedDate.toISOString().split('T')[0],
            time: selectedSlot.split('T')[1].substring(0, 5),
            reason,
            status: 'Programada' as const,
            visitProvider: selectedProviderId,
            billingProvider: selectedProviderId // Assuming same provider for billing for now
        };

        try {
            const res = await fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(appointmentData),
            });

            if (!res.ok) {
                const { message } = await res.json();
                throw new Error(message || 'No se pudo programar la cita.');
            }

            toast({
                title: 'Cita Programada',
                description: `Cita para ${patient.name} con ${providers.find(p => p.id === selectedProviderId)?.username} programada exitosamente.`,
            });
            // Reset form
            setSelectedSlot(null);
            setReason('');
            fetchAvailableSlots(); // Refresh slots

        } catch (error) {
            const e = error as Error;
            toast({ variant: 'destructive', title: 'Error al Programar', description: e.message });
        } finally {
            setIsScheduling(false);
            setIsConfirming(false);
        }
    };


    const providerOptions = useMemo(() => providers.map(p => ({ label: p.username, value: p.id })), [providers]);
    const selectedProvider = providers.find(p => p.id === selectedProviderId);

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
                                placeholder="Seleccionar proveedor"
                                searchPlaceholder="Buscar proveedor..."
                                emptyMessage="No se encontró proveedor."
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
                        <h3 className="font-semibold">Horarios Disponibles para {selectedDate?.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                        {isLoadingSlots ? (
                            <div className="flex items-center justify-center h-48">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : error ? (
                             <div className="flex flex-col items-center justify-center h-48 text-destructive bg-destructive/10 rounded-md p-4">
                                <AlertCircle className="h-8 w-8 mb-2" />
                                <p className="font-semibold">Error</p>
                                <p className="text-sm text-center">{error}</p>
                            </div>
                        ) : availableSlots.length > 0 ? (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                {availableSlots.map(slot => (
                                    <Button 
                                        key={slot}
                                        variant={selectedSlot === slot ? "default" : "outline"}
                                        onClick={() => setSelectedSlot(slot)}
                                    >
                                        {new Date(slot).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                    </Button>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-48 text-muted-foreground border-2 border-dashed rounded-lg">
                                No hay horarios disponibles para este día.
                            </div>
                        )}
                        
                        {selectedSlot && (
                            <div className="space-y-4 pt-4 border-t">
                                 <h3 className="font-semibold">Detalles de la Cita</h3>
                                 <p className="text-sm">
                                    Programando cita para <span className="font-bold">{patient.name}</span> con <span className="font-bold">{selectedProvider?.username}</span> el <span className="font-bold">{selectedDate?.toLocaleDateString()}</span> a las <span className="font-bold">{new Date(selectedSlot).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>.
                                </p>
                                <div className="space-y-2">
                                    <Label htmlFor="reason">Motivo de la Cita</Label>
                                    <Input
                                        id="reason"
                                        placeholder="p.ej. Consulta de seguimiento"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                    />
                                </div>
                                <Button className="w-full" onClick={() => setIsConfirming(true)} disabled={!reason || isScheduling}>
                                    {isScheduling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    {isScheduling ? 'Programando...' : 'Programar Cita'}
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <AlertDialog open={isConfirming} onOpenChange={setIsConfirming}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Cita</AlertDialogTitle>
                        <AlertDialogDescription>
                           ¿Está seguro de que desea programar la siguiente cita?
                           <br/><br/>
                           <strong>Paciente:</strong> {patient.name}<br/>
                           <strong>Proveedor:</strong> {selectedProvider?.username}<br/>
                           <strong>Fecha:</strong> {selectedDate?.toLocaleDateString('es-ES', { dateStyle: 'long' })}<br/>
                           <strong>Hora:</strong> {selectedSlot ? new Date(selectedSlot).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : ''}<br/>
                           <strong>Motivo:</strong> {reason}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleScheduleAppointment} disabled={isScheduling}>
                            {isScheduling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Confirmar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
