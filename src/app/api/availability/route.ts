
import { NextResponse, NextRequest } from 'next/server';
import { getAvailableSlots } from '@/lib/availability';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');
    const date = searchParams.get('date');
    
    if (!providerId || !date) {
      return NextResponse.json({ message: 'Provider ID and date are required' }, { status: 400 });
    }

    const slots = await getAvailableSlots(providerId, date);
    return NextResponse.json(slots);

  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}
