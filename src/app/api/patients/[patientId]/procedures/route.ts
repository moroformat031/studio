
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import type { Procedure } from '@/types/ehr';
import { db } from '@/lib/db';

const prisma = new PrismaClient();

export async function PUT(
  request: Request,
  { params }: { params: { patientId: string } }
) {
  try {
    const patientId = params.patientId;
    const procedures = (await request.json()) as Procedure[];

    await prisma.$transaction(async (tx) => {
        await tx.procedure.deleteMany({
            where: { patientId: patientId }
        });

        if (procedures.length > 0) {
            await tx.procedure.createMany({
                data: procedures.map(p => ({
                    id: p.id,
                    patientId: patientId,
                    date: new Date(p.date),
                    name: p.name,
                    notes: p.notes,
                    performingProvider: p.performingProvider
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
    console.error("Error updating procedures:", error);
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}

    