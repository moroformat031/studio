
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import type { Appointment } from '@/types/ehr';
import { db } from '@/lib/db';

const prisma = new PrismaClient();

export async function PUT(
  request: Request,
  { params }: { params: { patientId: string } }
) {
  try {
    const patientId = params.patientId;
    const appointments = (await request.json()) as Appointment[];
    
    await prisma.$transaction(async (tx) => {
        await tx.appointment.deleteMany({
            where: { patientId: patientId }
        });

        if (appointments.length > 0) {
            await tx.appointment.createMany({
                data: appointments.map(a => ({
                    id: a.id,
                    patientId: patientId,
                    date: new Date(a.date),
                    time: a.time,
                    reason: a.reason,
                    status: a.status,
                    visitProvider: a.visitProvider,
                    billingProvider: a.billingProvider
                }))
            });
        }
    });

    const updatedPatient = await db.getPatient(patientId);

    if (updatedPatient) {
      return NextResponse.json(updatedPatient);
    }
    return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
  } catch (error) {
    console.error("Error updating appointments:", error);
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}

    