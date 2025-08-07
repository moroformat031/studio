
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PatientNote } from '@/types/ehr';
import mysql from 'mysql2/promise';

export async function POST(
  request: Request,
  { params }: { params: { patientId: string } }
) {
  try {
    const patientId = params.patientId;
    const note = (await request.json()) as Omit<PatientNote, 'id'>;
    
    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
    });
    
    await connection.execute(
        'INSERT INTO patient_notes (patient_id, date, provider, transcription, summary) VALUES (?, ?, ?, ?, ?)',
        [patientId, new Date(note.date), note.provider, note.transcription, note.summary]
    );

    connection.end();

    const updatedPatient = await db.getPatient(patientId);

    if (updatedPatient) {
      return NextResponse.json(updatedPatient, { status: 201 });
    }
    return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
  } catch (error) {
    console.error("Error adding note:", error);
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}
