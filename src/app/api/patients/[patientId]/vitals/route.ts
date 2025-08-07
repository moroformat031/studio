
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Vital } from '@/types/ehr';
import mysql from 'mysql2/promise';

export async function PUT(
  request: Request,
  { params }: { params: { patientId: string } }
) {
  try {
    const patientId = params.patientId;
    const vitals = (await request.json()) as Vital[];

    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
    });
    
    await connection.beginTransaction();

    await connection.execute('DELETE FROM vitals WHERE patient_id = ?', [patientId]);

    if (vitals.length > 0) {
        const vitalValues = vitals.map(v => [
            v.id,
            patientId,
            new Date(v.date),
            v.hr,
            v.bp,
            v.temp,
            v.rr,
            v.provider
        ]);
        await connection.query(
            'INSERT INTO vitals (id, patient_id, date, hr, bp, temp, rr, provider) VALUES ?',
            [vitalValues]
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
    console.error("Error updating vitals:", error);
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}
