
import { Patient, User, PatientNote, Appointment, Vital, Medication, Procedure, Plan, Clinic } from '@/types/ehr';
import { initialPatients } from './ehr-data';

// --- Mock Database ---
let users: User[] = [
  { id: 'user-1', username: 'victor', password: 'codigo', plan: 'Hospital', clinicName: "Victor's Clinic" },
  { id: 'user-2', username: 'clinica-user', password: 'clinica', plan: 'Clinica', clinicName: 'Clínica Central' },
  { id: 'user-3', username: 'free-user', password: 'free', plan: 'Free', clinicName: 'Consultorio Dr. Ejemplo' },
];

let patients: Patient[] = initialPatients;
let clinics: Clinic[] = [
    { id: 'clinic-1', name: "Victor's Clinic" },
    { id: 'clinic-2', name: 'Clínica Central' },
    { id: 'clinic-3', name: 'Consultorio Dr. Ejemplo' },
];


// This is a simplified in-memory "database"
export const db = {
  // User operations
  getAllUsers: () => users,
  findUser: (username: string) => users.find(u => u.username.toLowerCase() === username.toLowerCase()),
  createUser: (userData: Omit<User, 'id'>) => {
    if (db.findUser(userData.username)) {
      return null; // User already exists
    }
    const newUser: User = { 
        id: `user-${Date.now()}`,
        username: userData.username,
        password: userData.password,
        plan: userData.plan,
        clinicName: userData.clinicName
    };
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

  // Clinic operations
  getAllClinics: () => clinics,
  findClinicByName: (name: string) => clinics.find(c => c.name.toLowerCase() === name.toLowerCase()),
  createClinic: (clinicData: Omit<Clinic, 'id'>) => {
      if(db.findClinicByName(clinicData.name)) {
          return null; // Clinic already exists
      }
      const newClinic: Clinic = { id: `clinic-${Date.now()}`, ...clinicData };
      clinics.push(newClinic);
      return newClinic;
  }
};
