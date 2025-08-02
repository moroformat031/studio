
import { Patient } from "@/types/ehr";

export const initialPatients: Patient[] = [
    {
        id: 'pat-1',
        name: 'Ana García',
        demographics: {
            dob: '1985-05-20',
            gender: 'Female',
            address: 'Calle Falsa 123, Springfield',
            phone: '555-0101',
            email: 'ana.garcia@example.com'
        },
        vitals: [
            { date: '2024-07-15T10:00:00Z', hr: 75, bp: '120/80', temp: 36.8, rr: 16 }
        ],
        medications: [
            { id: 'med-1', name: 'Lisinopril', dosage: '10mg', frequency: 'Once a day'}
        ],
        appointments: [
            { id: 'apt-1', date: '2024-08-01', time: '11:00', reason: 'Follow-up', status: 'Scheduled'}
        ],
        procedures: [],
        notes: [
            { 
                id: 'note-1',
                date: '2024-07-15T10:00:00Z',
                transcription: 'The patient reports feeling well, with no new complaints. Blood pressure is well-controlled on current medication.',
                summary: 'Stable patient, continue current treatment plan.'
            }
        ]
    },
    {
        id: 'pat-2',
        name: 'Carlos Rodriguez',
        demographics: {
            dob: '1972-11-30',
            gender: 'Male',
            address: 'Avenida Siempreviva 742, Springfield',
            phone: '555-0102',
            email: 'carlos.r@example.com'
        },
        vitals: [
             { date: '2024-07-18T09:30:00Z', hr: 82, bp: '130/85', temp: 37.0, rr: 18 }
        ],
        medications: [
            { id: 'med-2', name: 'Metformin', dosage: '500mg', frequency: 'Twice a day'}
        ],
        appointments: [
            { id: 'apt-2', date: '2024-07-18', time: '09:30', reason: 'Routine Checkup', status: 'Completed'},
            { id: 'apt-3', date: '2025-01-18', time: '09:30', reason: '6-month follow-up', status: 'Scheduled'}
        ],
        procedures: [],
        notes: []
    }
]
