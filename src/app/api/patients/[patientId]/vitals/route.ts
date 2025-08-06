
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Vital } from '@/types/ehr';

export async function PUT(
  request: Request,
  { params }: { params: { patientId: string } }
) {
  try {
    const patientId = params.patientId;
    const vitals = (await request.json()) as Vital[];
    const updatedPatient = db.updatePatientVitals(patientId, vitals);

    if (updatedPatient) {
      return NextResponse.json(updatedPatient);
    }
    return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}
