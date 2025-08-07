
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Clinic } from '@/types/ehr';

export async function GET() {
  try {
    const clinics = db.getAllClinics();
    return NextResponse.json(clinics);
  } catch (error) {
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name } = (await request.json()) as Omit<Clinic, 'id'>;

    if (!name) {
         return NextResponse.json({ message: 'Clinic name is required' }, { status: 400 });
    }

    const existingClinic = db.findClinicByName(name);
    if(existingClinic) {
        return NextResponse.json({ message: 'Clinic with that name already exists' }, { status: 409 });
    }

    const newClinic = db.createClinic({ name });

    return NextResponse.json(newClinic, { status: 201 });

  } catch (error) {
    return NextResponse.json({ message: 'An error occurred during clinic creation' }, { status: 500 });
  }
}
