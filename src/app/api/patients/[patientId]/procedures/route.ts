
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Procedure } from '@/types/ehr';
import mysql from 'mysql2/promise';

export async function PUT(
  request: Request,
  { params }: { params: { patientId: string } }
) {
  try {
    const patientId = params.patientId;
    const procedures = (await request.json()) as Procedure[];

    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
    });
    
    await connection.beginTransaction();

    await connection.execute('DELETE FROM procedures WHERE patient_id = ?', [patientId]);

    if (procedures.length > 0) {
        const procedureValues = procedures.map(p => [
            p.id,
            patientId,
            new Date(p.date),
            p.name,
            p.notes,
            p.performingProvider
        ]);
        await connection.query(
            'INSERT INTO procedures (id, patient_id, date, name, notes, performingProvider) VALUES ?',
            [procedureValues]
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
    console.error("Error updating procedures:", error);
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}
