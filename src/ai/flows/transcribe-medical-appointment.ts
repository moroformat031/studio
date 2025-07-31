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
  prompt: `You are an expert medical transcriptionist specializing in Spanish audio.

You will transcribe the audio provided into text. Ensure the transcription is accurate and reflects the spoken content.

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
