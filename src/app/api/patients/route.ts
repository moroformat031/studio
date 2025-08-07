
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Patient } from '@/types/ehr';

export async function GET() {
  try {
    const patients = await db.getAllPatients();
    return NextResponse.json(patients);
  } catch (error) {
    console.error("Error fetching patients:", error);
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const patientData = (await request.json()) as Omit<Patient, 'id'>;
    const newPatient = await db.addPatient(patientData);
    return NextResponse.json(newPatient, { status: 201 });
  } catch (error) {
    console.error("Error adding patient:", error);
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}
