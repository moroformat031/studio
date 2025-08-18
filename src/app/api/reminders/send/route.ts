
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emailService } from '@/lib/email';
import { Appointment, Patient } from '@/types/ehr';


// This endpoint should be secured and triggered by a trusted cron job service.
export async function POST(request: Request) {
    try {
        console.log("Cron Job Triggered: Checking for appointment reminders to send...");
        
        const now = new Date();
        const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

        // Find appointments for 1-day reminders
        const oneDayAppointments = await db.getAppointmentsBetween(oneDayFromNow, new Date(oneDayFromNow.getTime() + 60 * 1000 * 15)); // 15min window
        
        // Find appointments for 2-hour reminders
        const twoHourAppointments = await db.getAppointmentsBetween(twoHoursFromNow, new Date(twoHoursFromNow.getTime() + 60 * 1000 * 15)); // 15min window

        const remindersToSend: Promise<void>[] = [];

        for (const appt of oneDayAppointments) {
            const patient = await db.getPatient(appt.patientId);
            if (patient) {
                remindersToSend.push(emailService.sendAppointmentReminder(patient, appt, '24-hour'));
            }
        }

        for (const appt of twoHourAppointments) {
            const patient = await db.getPatient(appt.patientId);
            if (patient) {
                remindersToSend.push(emailService.sendAppointmentReminder(patient, appt, '2-hour'));
            }
        }

        await Promise.all(remindersToSend);
        
        const message = `Sent ${remindersToSend.length} reminders.`;
        console.log(message);
        return NextResponse.json({ success: true, message });

    } catch (error) {
        console.error("Error sending reminders:", error);
        const e = error as Error;
        return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
}
