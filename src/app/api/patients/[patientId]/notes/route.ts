
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import type { PatientNote } from '@/types/ehr';
import { db } from '@/lib/db';

const prisma = new PrismaClient();

export async function POST(
  request: Request,
  { params }: { params: { patientId: string } }
) {
  try {
    const patientId = params.patientId;
    const note = (await request.json()) as Omit<PatientNote, 'id'>;
    
    await prisma.patientNote.create({
        data: {
            patientId: patientId,
            date: new Date(note.date),
            provider: note.provider,
            transcription: note.transcription,
            summary: note.summary
        }
    });

    const updatedPatient = await db.getPatient(patientId);

    if (updatedPatient) {
      return NextResponse.json(updatedPatient, { status: 201 });
    }
    return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
  } catch (error) {
    console.error("Error adding note:", error);
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}

    