
import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import type { Patient } from '@/types/ehr';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinicId');
    
    if (!clinicId) {
      return NextResponse.json({ message: 'Clinic ID is required' }, { status: 400 });
    }

    const patients = await db.getAllPatients(clinicId);
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

    