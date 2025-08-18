
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const patients = await db.getAllPatients(); // No clinicId, get all
    return NextResponse.json(patients);
  } catch (error) {
    console.error("Error fetching all patients:", error);
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}
