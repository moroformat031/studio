
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const procedures = await db.getAllMasterProcedures();
    return NextResponse.json(procedures);
  } catch (error) {
    console.error("Error fetching master procedures:", error);
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json() as { name: string };

    if (!name) {
         return NextResponse.json({ message: 'Name is required' }, { status: 400 });
    }

    const newProc = await db.createMasterProcedure({ name });

    return NextResponse.json(newProc, { status: 201 });

  } catch (error) {
    console.error("Error creating master procedure:", error);
    const e = error as Error;
    return NextResponse.json({ message: e.message || 'An error occurred' }, { status: 500 });
  }
}
