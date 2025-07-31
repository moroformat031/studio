'use server';
/**
 * @fileOverview Summarizes key discussion points and action items from a transcribed medical appointment in Mexican Spanish.
 *
 * - summarizeMedicalAppointment - A function that handles the summarization process.
 * - SummarizeMedicalAppointmentInput - The input type for the summarizeMedicalAppointment function.
 * - SummarizeMedicalAppointmentOutput - The return type for the summarizeMedicalAppointment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeMedicalAppointmentInputSchema = z.object({
  transcription: z.string().describe('The transcribed text from the medical appointment.'),
});
export type SummarizeMedicalAppointmentInput = z.infer<typeof SummarizeMedicalAppointmentInputSchema>;

const SummarizeMedicalAppointmentOutputSchema = z.object({
  summary: z.string().describe('A summary of the key discussion points and action items.'),
});
export type SummarizeMedicalAppointmentOutput = z.infer<typeof SummarizeMedicalAppointmentOutputSchema>;

export async function summarizeMedicalAppointment(input: SummarizeMedicalAppointmentInput): Promise<SummarizeMedicalAppointmentOutput> {
  return summarizeMedicalAppointmentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeMedicalAppointmentPrompt',
  input: {schema: SummarizeMedicalAppointmentInputSchema},
  output: {schema: SummarizeMedicalAppointmentOutputSchema},
  prompt: `You are an AI assistant specialized in summarizing medical appointments in Mexican Spanish.
  Please provide a concise summary of the key discussion points and any action items from the following transcription:

  Transcription: {{{transcription}}}

  Summary in Mexican Spanish:`,
});

const summarizeMedicalAppointmentFlow = ai.defineFlow(
  {
    name: 'summarizeMedicalAppointmentFlow',
    inputSchema: SummarizeMedicalAppointmentInputSchema,
    outputSchema: SummarizeMedicalAppointmentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
