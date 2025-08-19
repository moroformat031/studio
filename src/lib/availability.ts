
import { db } from './db';
import { User } from '@/types/ehr';
import { prisma } from '@prisma/client';

// Returns available slots for a given provider and date
export const getAvailableSlots = async (providerId: string, date: string): Promise<string[]> => {
    // The incoming date is a string like 'YYYY-MM-DD'. Creating a Date object from it
    // without a time component can lead to timezone issues.
    // We treat it as a UTC date to get the correct day of the week regardless of server location.
    const targetDate = new Date(`${date}T00:00:00Z`);
    const dayOfWeek = targetDate.getUTCDay(); // Sunday = 0, ..., Saturday = 6.
    
    // Prisma schema uses Monday = 0, so we adjust.
    const adjustedDayOfWeek = (dayOfWeek === 0) ? 6 : dayOfWeek - 1;

    const availability = await db.getDoctorAvailability(providerId);
    
    const dayAvailability = availability.find(a => a.dayOfWeek === adjustedDayOfWeek);

    if (!dayAvailability || !dayAvailability.isAvailable) {
        return []; // Provider is not available on this day
    }
    
    const provider = await db.findUserById(providerId);
    if (!provider) return [];

    const appointments = await db.getAppointmentsForProviderOnDate(provider.username, date);
    
    const appointmentDuration = 30; // in minutes
    const slots: string[] = [];

    // Create start and end times in UTC to match the date.
    const startTime = new Date(`${date}T${dayAvailability.startTime}:00.000Z`);
    const endTime = new Date(`${date}T${dayAvailability.endTime}:00.000Z`);
    
    let currentSlot = new Date(startTime);

    while (currentSlot < endTime) {
        const isBooked = appointments.some(appt => {
            const apptTime = new Date(`${date}T${appt.time}`);
            return apptTime.getTime() === currentSlot.getTime();
        });

        if (!isBooked) {
            slots.push(currentSlot.toISOString());
        }

        currentSlot.setUTCMinutes(currentSlot.getUTCMinutes() + appointmentDuration);
    }

    return slots;
};
