
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PatientNote } from '@/types/ehr';

export async function POST(
  request: Request,
  { params }: { params: { patientId: string } }
) {
  try {
    const patientId = params.patientId;
    const note = (await request.json()) as Omit<PatientNote, 'id'>;
    const updatedPatient = db.addNoteToPatient(patientId, note);

    if (updatedPatient) {
      return NextResponse.json(updatedPatient, { status: 201 });
    }
    return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}
