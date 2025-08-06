
import { Patient } from "@/types/ehr";

export const initialPatients: Patient[] = [
    {
        id: 'pat-1',
        name: 'Ana García',
        demographics: {
            dob: '1985-05-20',
            gender: 'Femenino',
            address: 'Calle Falsa 123, Springfield',
            phone: '555-0101',
            email: 'ana.garcia@example.com'
        },
        vitals: [
            { id: 'vital-1', date: '2024-07-15T10:00:00Z', hr: 75, bp: '120/80', temp: 36.8, rr: 16 }
        ],
        medications: [
            { id: 'med-1', name: 'Lisinopril', dosage: '10mg', frequency: 'Una vez al día', prescribedDate: '2024-07-15' }
        ],
        appointments: [
            { id: 'apt-1', date: '2024-08-01', time: '11:00', reason: 'Seguimiento', status: 'Programada', visitProvider: 'Dr. Smith', billingProvider: 'Clínica General'}
        ],
        procedures: [],
        notes: [
            { 
                id: 'note-1',
                date: '2024-07-15T10:00:00Z',
                transcription: 'La paciente informa que se siente bien, sin nuevas quejas. La presión arterial está bien controlada con la medicación actual.',
                summary: 'Paciente estable, continuar con el plan de tratamiento actual.'
            }
        ]
    },
    {
        id: 'pat-2',
        name: 'Carlos Rodríguez',
        demographics: {
            dob: '1972-11-30',
            gender: 'Masculino',
            address: 'Avenida Siempreviva 742, Springfield',
            phone: '555-0102',
            email: 'carlos.r@example.com'
        },
        vitals: [
             { id: 'vital-2', date: '2024-07-18T09:30:00Z', hr: 82, bp: '130/85', temp: 37.0, rr: 18 }
        ],
        medications: [
            { id: 'med-2', name: 'Metformina', dosage: '500mg', frequency: 'Dos veces al día', prescribedDate: '2024-07-18' }
        ],
        appointments: [
            { id: 'apt-2', date: '2024-07-18', time: '09:30', reason: 'Chequeo de rutina', status: 'Completada', visitProvider: 'Dra. Jones', billingProvider: 'Hospital Central'},
            { id: 'apt-3', date: '2025-01-18', time: '09:30', reason: 'Seguimiento de 6 meses', status: 'Programada', visitProvider: 'Dra. Jones', billingProvider: 'Hospital Central'}
        ],
        procedures: [],
        notes: []
    }
]
