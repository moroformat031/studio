
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Medication } from '@/types/ehr';

export async function PUT(
  request: Request,
  { params }: { params: { patientId: string } }
) {
  try {
    const patientId = params.patientId;
    const medications = (await request.json()) as Medication[];
    const updatedPatient = db.updatePatientMedications(patientId, medications);

    if (updatedPatient) {
      return NextResponse.json(updatedPatient);
    }
    return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}
