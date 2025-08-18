
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { DoctorAvailability } from '@/types/ehr';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;
    const availability = await db.getDoctorAvailability(userId);
    return NextResponse.json(availability);
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;
    const availabilityData = await request.json() as DoctorAvailability[];
    
    const updatedAvailability = await db.updateDoctorAvailability(userId, availabilityData);

    return NextResponse.json(updatedAvailability);
  } catch (error)
 {
    console.error("Error updating availability:", error);
    const e = error as Error;
    return NextResponse.json({ message: e.message || 'An error occurred' }, { status: 500 });
  }
}
