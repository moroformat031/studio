
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Procedure } from '@/types/ehr';

export async function PUT(
  request: Request,
  { params }: { params: { patientId: string } }
) {
  try {
    const patientId = params.patientId;
    const procedures = (await request.json()) as Procedure[];
    const updatedPatient = db.updatePatientProcedures(patientId, procedures);

    if (updatedPatient) {
      return NextResponse.json(updatedPatient);
    }
    return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}
