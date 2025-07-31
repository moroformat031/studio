import { config } from 'dotenv';
config();

import '@/ai/flows/transcribe-medical-appointment.ts';
import '@/ai/flows/summarize-medical-appointment.ts';