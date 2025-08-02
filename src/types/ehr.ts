
export interface PatientNote {
    id: string;
    date: string;
    transcription: string;
    summary: string;
}

export interface Vital {
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
}

export interface Appointment {
    id: string;
    date: string;
    time: string;
    reason: string;
    status: 'Scheduled' | 'Completed' | 'Canceled';
}

export interface Procedure {
    id: string;
    date: string;
    name: string;
    notes: string;
}

export interface Demographics {
    dob: string;
    gender: 'Male' | 'Female' | 'Other';
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
