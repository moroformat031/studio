
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Clinic } from '@/types/ehr';

export async function PUT(
  request: Request,
  { params }: { params: { clinicId: string } }
) {
  try {
    const clinicId = params.clinicId;
    const clinicData = (await request.json()) as Partial<Clinic>;

    delete clinicData.id;

    const updatedClinic = await db.updateClinic(clinicId, clinicData);

    if (updatedClinic) {
      return NextResponse.json(updatedClinic);
    }
    return NextResponse.json({ message: 'Clinic not found' }, { status: 404 });
  } catch (error) {
    console.error("Error updating clinic:", error);
    const e = error as Error;
    return NextResponse.json({ message: e.message || 'An error occurred' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { clinicId: string } }
) {
  try {
    const clinicId = params.clinicId;
    const success = await db.deleteClinic(clinicId);

    if (success) {
      return NextResponse.json({ message: 'Clinic deleted successfully' });
    }
    return NextResponse.json({ message: 'Clinic not found or could not be deleted' }, { status: 404 });
  } catch (error) {
    console.error("Error deleting clinic:", error);
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}
