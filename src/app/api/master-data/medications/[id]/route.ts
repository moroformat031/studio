
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { MasterMedication } from '@/types/ehr';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const { name } = await request.json() as { name: string };
    
    if (!name) {
         return NextResponse.json({ message: 'Name is required' }, { status: 400 });
    }

    const updatedMed = await db.updateMasterMedication(id, { name });
    return NextResponse.json(updatedMed);

  } catch (error) {
    console.error("Error updating master medication:", error);
    const e = error as Error;
    return NextResponse.json({ message: e.message || 'An error occurred' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    await db.deleteMasterMedication(id);
    return NextResponse.json({ message: 'Medication deleted successfully' });
  } catch (error) {
    console.error("Error deleting master medication:", error);
    const e = error as Error;
    return NextResponse.json({ message: e.message || 'An error occurred' }, { status: 500 });
  }
}
