
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Appointment } from '@/types/ehr';
import mysql from 'mysql2/promise';

// This function needs to be adapted for a real DB. 
// Replacing a whole sub-collection is not standard.
// It will delete all existing and insert the new ones.
export async function PUT(
  request: Request,
  { params }: { params: { patientId: string } }
) {
  try {
    const patientId = params.patientId;
    const appointments = (await request.json()) as Appointment[];
    
    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
    });
    
    await connection.beginTransaction();

    // Delete existing appointments for the patient
    await connection.execute('DELETE FROM appointments WHERE patient_id = ?', [patientId]);

    // Insert new appointments
    if (appointments.length > 0) {
        const appointmentValues = appointments.map(a => [
            a.id, // Assuming frontend generates a temporary ID
            patientId,
            new Date(a.date), 
            a.time,
            a.reason,
            a.status,
            a.visitProvider,
            a.billingProvider
        ]);

        await connection.query(
            'INSERT INTO appointments (id, patient_id, date, time, reason, status, visitProvider, billingProvider) VALUES ?',
            [appointmentValues]
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
    console.error("Error updating appointments:", error);
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}
