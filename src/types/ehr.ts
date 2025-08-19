
import type { Plan as PrismaPlan, Role as PrismaRole, UserType as PrismaUserType } from '@prisma/client';

export type Plan = PrismaPlan;
export type Role = PrismaRole;
export type UserType = PrismaUserType;


export interface User {
  id: string;
  username: string;
  password?: string;
  role: Role;
  type: UserType;
  clinicId: string | null;
  clinicName?: string;
  clinic?: Clinic;
}

export interface DoctorAvailability {
  id?: string;
  userId: string;
  dayOfWeek: number; // 0 = Lunes, 1 = Martes, ..., 6 = Domingo
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  isAvailable: boolean;
}

export interface Clinic {
    id: string;
    name: string;
    address: string;
    phone: string;
    plan: Plan;
}

export interface PatientNote {
    id:string;
    patientId: string;
    date: string;
    provider: string;
    transcription: string;
    summary: string;
}

export interface Vital {
    id: string;
    patientId: string;
    date: string;
    hr: number;
    bp: string;
    temp: number;
    rr: number;
    provider: string;
}

export interface Medication {
    id: string;
    patientId: string;
    name: string;
    dosage: string;
    frequency: string;
    prescribedDate: string;
    prescribingProvider: string;
}

export interface Appointment {
    id: string;
    patientId: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    reason: string;
    status: 'Programada' | 'Completada' | 'Cancelada';
    visitProvider: string; // User ID
    billingProvider: string; // User ID
}

export interface Procedure {
    id: string;
    patientId: string;
    date: string;
    name: string;
    notes: string;
    performingProvider: string;
}

export interface Demographics {
    dob: string;
    gender: 'Masculino' | 'Femenino' | 'Otro';
    address: string;
    phone: string;
    email: string;
}

export interface Patient {
    id: string;
    name: string;
    demographics: Demographics;
    vitals: Vital[];
    medications: Medication[];
    appointments: Appointment[];
    procedures: Procedure[];
    notes: PatientNote[];
    clinicId: string;
    clinicName?: string;
}

export interface MasterMedication {
    id: string;
    name: string;
}

export interface MasterProcedure {
    id: string;
    name: string;
}
