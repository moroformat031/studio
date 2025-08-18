
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import type { Patient } from '@/types/ehr';
import { db } from '@/lib/db';

const prisma = new PrismaClient();

const formatDate = (date: Date | null): string => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
}


export async function GET(
  request: Request,
  { params }: { params: { patientId: string } }
) {
  try {
    const patientId = params.patientId;
    const patient = await db.getPatient(patientId);

    if (patient) {
      return NextResponse.json(patient);
    }
    return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
  } catch (error) {
    console.error("Error fetching patient:", error);
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { patientId: string } }
) {
  try {
    const patientId = params.patientId;
    const updatedData = (await request.json()) as Partial<Patient>;

    const { name, demographics, clinicId } = updatedData;
    const dataToUpdate: any = {};
    if (name) dataToUpdate.name = name;
    if (clinicId) dataToUpdate.clinicId = clinicId;
    if (demographics) {
        if(demographics.dob) dataToUpdate.dob = new Date(demographics.dob);
        if(demographics.gender) dataToUpdate.gender = demographics.gender;
        if(demographics.address) dataToUpdate.address = demographics.address;
        if(demographics.phone) dataToUpdate.phone = demographics.phone;
        if(demographics.email) dataToUpdate.email = demographics.email;
    }

    const updatedPatient = await prisma.patient.update({
        where: { id: patientId },
        data: dataToUpdate,
    });

    const fullPatient = await db.getPatient(updatedPatient.id);

    return NextResponse.json(fullPatient);

  } catch (error) {
    console.error("Error updating patient:", error);
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { patientId: string } }
) {
    try {
        const patientId = params.patientId;
        const success = await db.deletePatient(patientId);
        if (success) {
            return NextResponse.json({ message: 'Patient deleted successfully' });
        }
        return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
    } catch (error) {
        console.error("Error deleting patient:", error);
        return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
    }
}
