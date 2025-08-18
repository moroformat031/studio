
import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import type { Appointment } from '@/types/ehr';
import { getAvailableSlots } from '@/lib/availability';
import { emailService } from '@/lib/email';
import { prisma } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const appointmentData = (await request.json()) as Omit<Appointment, 'id' | 'patientId'> & { patientId: string };
    
    const provider = await db.findUser(appointmentData.visitProvider);
    if (!provider) {
        return NextResponse.json({ message: 'Provider not found' }, { status: 404 });
    }

    // Verify slot is available before creating
    const availableSlots = await getAvailableSlots(provider.id, appointmentData.date);
    const requestedSlot = new Date(`${appointmentData.date}T${appointmentData.time}`);

    const isSlotAvailable = availableSlots.some(slot => new Date(slot).getTime() === requestedSlot.getTime());

    if (!isSlotAvailable) {
        return NextResponse.json({ message: 'The selected appointment slot is no longer available.' }, { status: 409 });
    }

    const newAppointment = await db.createAppointment(appointmentData);

    // Placeholder for sending confirmation email
    const patient = await db.getPatient(newAppointment.patientId);
    if(patient) {
       await emailService.sendAppointmentConfirmation(patient, newAppointment);
    }

    return NextResponse.json(newAppointment, { status: 201 });
  } catch (error) {
    console.error("Error adding appointment:", error);
    const e = error as Error;
    return NextResponse.json({ message: 'An error occurred', details: e.message }, { status: 500 });
  }
}
