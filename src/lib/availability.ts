
import { db } from './db';

// Returns available slots for a given provider and date
export const getAvailableSlots = async (providerId: string, date: string): Promise<string[]> => {
    const dayOfWeek = new Date(date).getUTCDay(); // Sunday = 0, ..., Saturday = 6. We need to adjust for our schema Monday = 0
    const adjustedDayOfWeek = (dayOfWeek === 0) ? 6 : dayOfWeek - 1;

    const availability = await db.getDoctorAvailability(providerId);
    
    const dayAvailability = availability.find(a => a.dayOfWeek === adjustedDayOfWeek);

    if (!dayAvailability || !dayAvailability.isAvailable) {
        return []; // Provider is not available on this day
    }

    const appointments = await db.getAppointmentsForProviderOnDate(providerId, date);
    
    const appointmentDuration = 30; // in minutes
    const slots: string[] = [];

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

        currentSlot.setMinutes(currentSlot.getMinutes() + appointmentDuration);
    }

    return slots;
};
