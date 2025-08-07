
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Medication } from '@/types/ehr';
import mysql from 'mysql2/promise';

export async function PUT(
  request: Request,
  { params }: { params: { patientId: string } }
) {
  try {
    const patientId = params.patientId;
    const medications = (await request.json()) as Medication[];

     const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
    });
    
    await connection.beginTransaction();

    await connection.execute('DELETE FROM medications WHERE patient_id = ?', [patientId]);

    if (medications.length > 0) {
        const medicationValues = medications.map(m => [
            m.id,
            patientId,
            m.name,
            m.dosage,
            m.frequency,
            new Date(m.prescribedDate),
            m.prescribingProvider
        ]);

        await connection.query(
            'INSERT INTO medications (id, patient_id, name, dosage, frequency, prescribedDate, prescribingProvider) VALUES ?',
            [medicationValues]
        );
    }

    await connection.commit();
    connection.end();

    const updatedPatient = await db.getPatient(patientId);
    if (updatedPatient) {
      return NextResponse.json(updatedPatient);
    }
    return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
  } catch (error) {
    console.error("Error updating medications:", error);
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}
