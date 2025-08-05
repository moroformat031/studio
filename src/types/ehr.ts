
export interface PatientNote {
    id: string;
    date: string;
    transcription: string;
    summary: string;
}

export interface Vital {
    id: string;
    date: string;
    hr: number;
    bp: string;
    temp: number;
    rr: number;
}

export interface Medication {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    prescribedDate: string;
}

export interface Appointment {
    id: string;
    date: string;
    time: string;
    reason: string;
    status: 'Programada' | 'Completada' | 'Cancelada';
}

export interface Procedure {
    id: string;
    date: string;
    name: string;
    notes: string;
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
}
