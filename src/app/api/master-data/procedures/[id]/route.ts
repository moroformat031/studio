
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const { code, name } = await request.json() as { code: string, name: string };
    
    if (!code || !name) {
         return NextResponse.json({ message: 'Code and name are required' }, { status: 400 });
    }

    const updatedProc = await db.updateMasterProcedure(id, { code, name });
    return NextResponse.json(updatedProc);

  } catch (error) {
    console.error("Error updating master procedure:", error);
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
    await db.deleteMasterProcedure(id);
    return NextResponse.json({ message: 'Procedure deleted successfully' });
  } catch (error) {
    console.error("Error deleting master procedure:", error);
    const e = error as Error;
    return NextResponse.json({ message: e.message || 'An error occurred' }, { status: 500 });
  }
}
