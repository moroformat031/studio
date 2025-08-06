
import { Patient, User, PatientNote, Appointment, Vital, Medication, Procedure, Plan } from '@/types/ehr';
import { initialPatients } from './ehr-data';

// --- Mock Database ---
let users: User[] = [
  { id: 'user-1', username: 'victor', password: 'codigo', plan: 'Hospital' },
  { id: 'user-2', username: 'clinica-user', password: 'clinica', plan: 'Clinica', clinicName: 'Clínica Central' },
  { id: 'user-3', username: 'free-user', password: 'free', plan: 'Free', clinicName: 'Consultorio Dr. Ejemplo' },
];

let patients: Patient[] = initialPatients;

// This is a simplified in-memory "database"
export const db = {
  // User operations
  findUser: (username: string) => users.find(u => u.username.toLowerCase() === username.toLowerCase()),
  createUser: (userData: Omit<User, 'id'>) => {
    const newUser: User = { ...userData, id: `user-${Date.now()}` };
    users.push(newUser);
    return newUser;
  },

  // Patient operations
  getAllPatients: () => patients,
  getPatient: (id: string) => patients.find(p => p.id === id) || null,
  addPatient: (patientData: Omit<Patient, 'id'>) => {
    const newPatient: Patient = { ...patientData, id: `pat-${Date.now()}` };
    patients.push(newPatient);
    return newPatient;
  },
  updatePatient: (id: string, updatedData: Partial<Patient>) => {
    let patientToUpdate = patients.find(p => p.id === id);
    if (patientToUpdate) {
      patientToUpdate = { ...patientToUpdate, ...updatedData };
      patients = patients.map(p => (p.id === id ? patientToUpdate! : p));
      return patientToUpdate;
    }
    return null;
  },

  // Note operations
  addNoteToPatient: (patientId: string, note: Omit<PatientNote, 'id'>) => {
    const patient = db.getPatient(patientId);
    if (patient) {
      const newNote = { ...note, id: `note-${Date.now()}` };
      const updatedNotes = [...patient.notes, newNote];
      return db.updatePatient(patientId, { notes: updatedNotes });
    }
    return null;
  },

  // Sub-record updates
  updatePatientAppointments: (patientId: string, appointments: Appointment[]) => {
    return db.updatePatient(patientId, { appointments });
  },
  updatePatientVitals: (patientId: string, vitals: Vital[]) => {
    return db.updatePatient(patientId, { vitals });
  },
  updatePatientMedications: (patientId: string, medications: Medication[]) => {
    return db.updatePatient(patientId, { medications });
  },
  updatePatientProcedures: (patientId: string, procedures: Procedure[]) => {
    return db.updatePatient(patientId, { procedures });
  },
};
