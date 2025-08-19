
import { NextResponse, NextRequest } from 'next/server';
import { getAvailableSlots } from '@/lib/availability';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');
    const date = searchParams.get('date');
    
    if (!providerId || !date) {
      return NextResponse.json({ message: 'Provider ID and date are required' }, { status: 400 });
    }

    const slots = await getAvailableSlots(providerId, date);
    const provider = await db.findUserById(providerId);
    if (!provider) {
        return NextResponse.json({ message: 'Provider not found' }, { status: 404 });
    }
    const appointments = await db.getAppointmentsForProviderOnDate(provider.username, date);

    return NextResponse.json({ slots, appointments });

  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}
