
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { Appointment } from '@/types/ehr';

export async function PUT(
  request: Request,
  { params }: { params: { appointmentId: string } }
) {
  try {
    const appointmentId = params.appointmentId;
    const appointmentData = (await request.json()) as Partial<Appointment>;

    delete appointmentData.id;

    const updatedAppointment = await db.updateAppointment(appointmentId, appointmentData);

    if (updatedAppointment) {
      return NextResponse.json(updatedAppointment);
    }
    return NextResponse.json({ message: 'Appointment not found' }, { status: 404 });
  } catch (error) {
    console.error("Error updating appointment:", error);
    const e = error as Error;
    return NextResponse.json({ message: e.message || 'An error occurred' }, { status: 500 });
  }
}
