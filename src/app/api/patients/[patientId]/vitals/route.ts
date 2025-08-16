
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import type { Vital } from '@/types/ehr';
import { db } from '@/lib/db';

const prisma = new PrismaClient();

export async function PUT(
  request: Request,
  { params }: { params: { patientId: string } }
) {
  try {
    const patientId = params.patientId;
    const vitals = (await request.json()) as Vital[];

    await prisma.$transaction(async (tx) => {
        await tx.vital.deleteMany({
            where: { patientId: patientId }
        });

        if (vitals.length > 0) {
            await tx.vital.createMany({
                data: vitals.map(v => ({
                    id: v.id,
                    patientId: patientId,
                    date: new Date(v.date),
                    hr: Number(v.hr),
                    bp: v.bp,
                    temp: Number(v.temp),
                    rr: Number(v.rr),
                    provider: v.provider
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
    console.error("Error updating vitals:", error);
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}

    