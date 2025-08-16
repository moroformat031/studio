
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import type { Medication } from '@/types/ehr';
import { db } from '@/lib/db';

const prisma = new PrismaClient();

export async function PUT(
  request: Request,
  { params }: { params: { patientId: string } }
) {
  try {
    const patientId = params.patientId;
    const medications = (await request.json()) as Medication[];

    await prisma.$transaction(async (tx) => {
        await tx.medication.deleteMany({
            where: { patientId: patientId }
        });

        if (medications.length > 0) {
            await tx.medication.createMany({
                data: medications.map(m => ({
                    id: m.id,
                    patientId: patientId,
                    name: m.name,
                    dosage: m.dosage,
                    frequency: m.frequency,
                    prescribedDate: new Date(m.prescribedDate),
                    prescribingProvider: m.prescribingProvider
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
    console.error("Error updating medications:", error);
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}
