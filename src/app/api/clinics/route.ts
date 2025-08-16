
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Clinic } from '@/types/ehr';

export async function GET() {
  try {
    const clinics = await db.getAllClinics();
    return NextResponse.json(clinics);
  } catch (error) {
    console.error("Error fetching clinics:", error);
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, address, phone } = (await request.json()) as Omit<Clinic, 'id'>;

    if (!name) {
         return NextResponse.json({ message: 'Clinic name is required' }, { status: 400 });
    }

    const existingClinic = await db.findClinicByName(name);
    if(existingClinic) {
        return NextResponse.json({ message: 'Clinic with that name already exists' }, { status: 409 });
    }

    const newClinic = await db.createClinic({ name, address, phone });

    return NextResponse.json(newClinic, { status: 201 });

  } catch (error) {
    console.error("Error creating clinic:", error);
    const e = error as Error;
    return NextResponse.json({ message: e.message || 'An error occurred during clinic creation' }, { status: 500 });
  }
}

    