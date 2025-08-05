'use server';
/**
 * @fileOverview A flow for transcribing medical appointments in real-time from Spanish audio.
 *
 * - transcribeMedicalAppointment - A function that handles the transcription process.
 * - TranscribeMedicalAppointmentInput - The input type for the transcribeMedicalAppointment function.
 * - TranscribeMedicalAppointmentOutput - The return type for the transcribeMedicalAppointment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranscribeMedicalAppointmentInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "Audio data of the medical appointment, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type TranscribeMedicalAppointmentInput = z.infer<typeof TranscribeMedicalAppointmentInputSchema>;

const TranscribeMedicalAppointmentOutputSchema = z.object({
  transcription: z.string().describe('The transcribed text of the medical appointment.'),
});
export type TranscribeMedicalAppointmentOutput = z.infer<typeof TranscribeMedicalAppointmentOutputSchema>;

export async function transcribeMedicalAppointment(input: TranscribeMedicalAppointmentInput): Promise<TranscribeMedicalAppointmentOutput> {
  return transcribeMedicalAppointmentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'transcribeMedicalAppointmentPrompt',
  input: {schema: TranscribeMedicalAppointmentInputSchema},
  output: {schema: TranscribeMedicalAppointmentOutputSchema},
  prompt: `Eres un transcriptor médico experto especializado en audio en español.

Transcribirás el audio proporcionado a texto. Asegúrate de que la transcripción sea precisa y refleje el contenido hablado.

Audio: {{media url=audioDataUri}}`,
});

const transcribeMedicalAppointmentFlow = ai.defineFlow(
  {
    name: 'transcribeMedicalAppointmentFlow',
    inputSchema: TranscribeMedicalAppointmentInputSchema,
    outputSchema: TranscribeMedicalAppointmentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
