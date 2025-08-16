
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import type { Patient } from '@/types/ehr';

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
    const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        include: {
            vitals: { orderBy: { date: 'desc' } },
            medications: { orderBy: { prescribedDate: 'desc' } },
            appointments: { orderBy: { date: 'desc' } },
            procedures: { orderBy: { date: 'desc' } },
            notes: { orderBy: { date: 'desc' } },
        },
    });

    if (patient) {
      const responseData = {
            ...patient,
            demographics: {
                dob: formatDate(patient.dob),
                gender: patient.gender,
                address: patient.address,
                phone: patient.phone,
                email: patient.email,
            },
            vitals: patient.vitals.map(v => ({ ...v, date: formatDate(v.date) })),
            medications: patient.medications.map(m => ({ ...m, prescribedDate: formatDate(m.prescribedDate) })),
            appointments: patient.appointments.map(a => ({ ...a, date: formatDate(a.date) })),
            procedures: patient.procedures.map(p => ({ ...p, date: formatDate(p.date) })),
            notes: patient.notes.map(n => ({ ...n, date: n.date.toISOString() })),
        };
      return NextResponse.json(responseData);
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

    const { name, demographics } = updatedData;
    const dataToUpdate: any = {};
    if (name) dataToUpdate.name = name;
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
        include: {
            vitals: { orderBy: { date: 'desc' } },
            medications: { orderBy: { prescribedDate: 'desc' } },
            appointments: { orderBy: { date: 'desc' } },
            procedures: { orderBy: { date: 'desc' } },
            notes: { orderBy: { date: 'desc' } },
        },
    });

    const responseData = {
        ...updatedPatient,
        demographics: {
            dob: formatDate(updatedPatient.dob),
            gender: updatedPatient.gender,
            address: updatedPatient.address,
            phone: updatedPatient.phone,
            email: updatedPatient.email,
        },
        vitals: updatedPatient.vitals.map(v => ({ ...v, date: formatDate(v.date) })),
        medications: updatedPatient.medications.map(m => ({ ...m, prescribedDate: formatDate(m.prescribedDate) })),
        appointments: updatedPatient.appointments.map(a => ({ ...a, date: formatDate(a.date) })),
        procedures: updatedPatient.procedures.map(p => ({ ...p, date: formatDate(p.date) })),
        notes: updatedPatient.notes.map(n => ({ ...n, date: n.date.toISOString() })),
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error("Error updating patient:", error);
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}

    