
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Patient } from '@/types/ehr';
import mysql from 'mysql2/promise';

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

    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
    });
    
    const { name, demographics } = updatedData;
    if (demographics) {
        await connection.execute(
            'UPDATE patients SET dob = ?, gender = ?, address = ?, phone = ?, email = ? WHERE id = ?',
            [demographics.dob, demographics.gender, demographics.address, demographics.phone, demographics.email, patientId]
        );
    }
    if (name) {
        await connection.execute('UPDATE patients SET name = ? WHERE id = ?', [name, patientId]);
    }
    
    connection.end();

    const updatedPatient = await db.getPatient(patientId);

    if (updatedPatient) {
      return NextResponse.json(updatedPatient);
    }
    return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
  } catch (error) {
    console.error("Error updating patient:", error);
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}
