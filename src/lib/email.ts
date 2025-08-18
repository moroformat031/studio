
import type { Patient, Appointment } from "@/types/ehr";

/**
 * NOTE: This is a placeholder email service. In a production environment,
 * you would replace this with a real email sending service like SendGrid,
 * Mailgun, or AWS SES.
 */
export const emailService = {
  async sendAppointmentConfirmation(patient: Patient, appointment: Appointment): Promise<void> {
    const subject = `Confirmación de Cita: ${appointment.reason}`;
    const body = `
      Hola ${patient.name},

      Tu cita ha sido programada exitosamente.

      Detalles de la Cita:
      - Fecha: ${new Date(appointment.date).toLocaleDateString('es-MX')}
      - Hora: ${appointment.time}
      - Motivo: ${appointment.reason}
      
      Gracias,
      NotasMed EHR
    `;

    console.log("--- SENDING EMAIL ---");
    console.log(`To: ${patient.demographics.email}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);
    console.log("---------------------");

    // In a real app, you would have something like:
    // await sendGrid.send({ to: patient.email, from: 'no-reply@notasmed.com', subject, text: body });
    return Promise.resolve();
  },

  async sendAppointmentReminder(patient: Patient, appointment: Appointment, type: '24-hour' | '2-hour'): Promise<void> {
    const subject = `Recordatorio de Cita - ${type === '24-hour' ? 'Mañana' : 'En 2 Horas'}`;
    const body = `
      Hola ${patient.name},

      Este es un recordatorio de tu próxima cita.

      Detalles de la Cita:
      - Fecha: ${new Date(appointment.date).toLocaleDateString('es-MX')}
      - Hora: ${appointment.time}
      - Motivo: ${appointment.reason}
      
      Por favor, llega a tiempo.

      Gracias,
      NotasMed EHR
    `;

    console.log("--- SENDING EMAIL REMINDER ---");
    console.log(`To: ${patient.demographics.email}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);
    console.log("------------------------------");

    return Promise.resolve();
  },
};
