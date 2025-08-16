
import mysql from 'mysql2/promise';
import { Patient, User, PatientNote, Appointment, Vital, Medication, Procedure, Clinic, Plan, Demographics } from '@/types/ehr';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const dbConfig = {
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Utility to get a connection
const getConnection = () => pool.getConnection();


// This function will format the date to YYYY-MM-DD
const formatDate = (date: Date): string => {
    if (!date || !(date instanceof Date)) return '';
    return date.toISOString().split('T')[0];
}

const initializeAdmin = async () => {
    const connection = await getConnection();
    try {
        const [rows] = await connection.execute('SELECT * FROM users WHERE username = ?', ['admin']);
        const users = rows as User[];
        if (users.length === 0) {
            console.log('Admin user not found, creating one...');
            const hashedPassword = await bcrypt.hash('code', 10);
            const adminId = uuidv4();

            // Ensure the 'Hospital Central' clinic exists
            let [clinicRows] = await connection.execute('SELECT * FROM clinics WHERE name = ?', ['Hospital Central']);
            let clinics = clinicRows as Clinic[];
            let clinicId: string;

            if (clinics.length === 0) {
                clinicId = uuidv4();
                 await connection.execute(
                    'INSERT INTO clinics (id, name, address, phone) VALUES (?, ?, ?, ?)',
                    [clinicId, 'Hospital Central', '123 Admin Way', '555-0000']
                );
            } else {
                clinicId = clinics[0].id;
            }

            await connection.execute(
                'INSERT INTO users (id, username, password, plan, clinicId) VALUES (?, ?, ?, ?, ?)',
                [adminId, 'admin', hashedPassword, 'Admin', clinicId]
            );
            console.log('Admin user created successfully.');
        }
    } catch (error) {
        console.error("Error during admin initialization:", error);
    } finally {
        connection.release();
    }
};

// Initialize admin user on startup
initializeAdmin();


// This object will now contain methods that interact with the MySQL database
export const db = {
    // --- User operations ---
    getAllUsers: async (): Promise<Omit<User, 'password'>[]> => {
        const connection = await getConnection();
        try {
            const [rows] = await connection.execute(`
                SELECT u.id, u.username, u.plan, u.clinicId, c.name as clinicName 
                FROM users u 
                LEFT JOIN clinics c ON u.clinicId = c.id
            `);
            return rows as Omit<User, 'password'>[];
        } finally {
            connection.release();
        }
    },
    findUser: async (username: string): Promise<User | null> => {
        const connection = await getConnection();
        try {
            const [rows] = await connection.execute(`
                SELECT u.id, u.username, u.password, u.plan, u.clinicId, c.name as clinicName 
                FROM users u
                LEFT JOIN clinics c ON u.clinicId = c.id
                WHERE u.username = ?
            `, [username]);
            const users = rows as User[];
            return users.length > 0 ? users[0] : null;
        } finally {
            connection.release();
        }
    },
    createUser: async (userData: { username: string, password?: string, plan: Plan, clinicName: string }): Promise<Omit<User, 'password'>> => {
        const connection = await getConnection();
        try {
            const existingUser = await db.findUser(userData.username);
            if (existingUser) {
                throw new Error('Username already exists');
            }

            if (!userData.clinicName) {
                throw new Error('Clinic name is required to create a user.');
            }

            // Find or create clinic
            let clinic = await db.findClinicByName(userData.clinicName);
            if (!clinic) {
                clinic = await db.createClinic({ name: userData.clinicName, address: '', phone: ''});
            }

            const hashedPassword = await bcrypt.hash(userData.password!, 10);
            const newUserId = uuidv4();
            
            await connection.execute(
                'INSERT INTO users (id, username, password, plan, clinicId) VALUES (?, ?, ?, ?, ?)',
                [newUserId, userData.username, hashedPassword, userData.plan, clinic.id]
            );
            
            const newUser: Omit<User, 'password'> = {
                id: newUserId,
                username: userData.username,
                plan: userData.plan,
                clinicId: clinic.id,
                clinicName: clinic.name,
            };

            return newUser;
        } finally {
            connection.release();
        }
    },
    updateUser: async (id: string, userData: Partial<Omit<User, 'id' | 'password'>> & { password?: string, clinicName?: string }): Promise<Omit<User, 'password'> | null> => {
        const connection = await getConnection();
        try {
            const { username, password, plan, clinicName } = userData;
            let query = 'UPDATE users SET ';
            const params: (string | Plan)[] = [];
            
            const fieldsToUpdate: { [key: string]: any } = { username, plan };

            if (password) {
                 fieldsToUpdate.password = await bcrypt.hash(password, 10);
            }
            
            if (clinicName) {
                let clinic = await db.findClinicByName(clinicName);
                if (!clinic) {
                    clinic = await db.createClinic({ name: clinicName });
                }
                fieldsToUpdate.clinicId = clinic.id;
            }


            const queryParts = Object.keys(fieldsToUpdate)
                .filter(key => fieldsToUpdate[key] !== undefined)
                .map(key => {
                    params.push(fieldsToUpdate[key]);
                    return `${key} = ?`;
                });
            
            if(queryParts.length === 0) {
                // Nothing to update
                 const [currentRows] = await connection.execute('SELECT u.id, u.username, u.plan, u.clinicId, c.name as clinicName FROM users u LEFT JOIN clinics c ON u.clinicId = c.id WHERE u.id = ?', [id]);
                return (currentRows as any)[0] || null;
            }

            query += queryParts.join(', ');
            query += ' WHERE id = ?';
            params.push(id);

            const [result] = await connection.execute(query, params) as any;
            if (result.affectedRows === 0) {
                return null;
            }
            
            const [rows] = await connection.execute('SELECT u.id, u.username, u.plan, u.clinicId, c.name as clinicName FROM users u LEFT JOIN clinics c ON u.clinicId = c.id WHERE u.id = ?', [id]);
            return (rows as any)[0] || null;

        } finally {
            connection.release();
        }
    },
    deleteUser: async (id: string): Promise<boolean> => {
        const connection = await getConnection();
        try {
            const [result] = await connection.execute('DELETE FROM users WHERE id = ?', [id]) as any;
            return result.affectedRows > 0;
        } finally {
            connection.release();
        }
    },
    // --- Patient operations ---
    getAllPatients: async (clinicId: string): Promise<Patient[]> => {
        const connection = await getConnection();
        try {
            const [rows] = await connection.execute('SELECT * FROM patients WHERE clinicId = ?', [clinicId]);
            const patients = (rows as any[]).map(p => {
                const { dob, ...rest } = p;
                return {
                    ...rest,
                    demographics: {
                        dob: formatDate(new Date(dob)),
                        gender: p.gender,
                        address: p.address,
                        phone: p.phone,
                        email: p.email,
                    },
                    vitals: [], 
                    medications: [], 
                    appointments: [], 
                    procedures: [], 
                    notes: []
                }
            })
            return patients;
        } finally {
            connection.release();
        }
    },
    getPatient: async (id: string): Promise<Patient | null> => {
        const connection = await getConnection();
        try {
            const [patientRows] = await connection.execute('SELECT * FROM patients WHERE id = ?', [id]);
            const patients = patientRows as any[];
            if (patients.length === 0) return null;

            const patientData = patients[0];

            const { dob, gender, address, phone, email, ...patientInfo } = patientData;
            
            const demographics: Demographics = {
                dob: formatDate(new Date(dob)),
                gender,
                address,
                phone,
                email
            };

            const patient: Patient = {
                ...patientInfo,
                demographics,
                vitals: [],
                medications: [],
                appointments: [],
                procedures: [],
                notes: []
            };

            // Fetch related data
            const [vitals] = await connection.execute('SELECT * FROM vitals WHERE patient_id = ?', [id]);
            const [medications] = await connection.execute('SELECT * FROM medications WHERE patient_id = ?', [id]);
            const [appointments] = await connection.execute('SELECT * FROM appointments WHERE patient_id = ?', [id]);
            const [procedures] = await connection.execute('SELECT * FROM procedures WHERE patient_id = ?', [id]);
            const [notes] = await connection.execute('SELECT * FROM patient_notes WHERE patient_id = ?', [id]);
            
            patient.vitals = (vitals as Vital[]).map(v => ({...v, date: formatDate(new Date(v.date))}));
            patient.medications = (medications as Medication[]).map(m => ({...m, prescribedDate: formatDate(new Date(m.prescribedDate))}));
            patient.appointments = (appointments as Appointment[]).map(a => ({...a, date: formatDate(new Date(a.date))}));
            patient.procedures = (procedures as Procedure[]).map(p => ({...p, date: formatDate(new Date(p.date))}));
            patient.notes = (notes as PatientNote[]).map(n => ({...n, date: formatDate(new Date(n.date))}));

            return patient;

        } finally {
            connection.release();
        }
    },
    addPatient: async (patientData: Omit<Patient, 'id'>): Promise<Patient> => {
        const connection = await getConnection();
        try {
            const { name, demographics, clinicId } = patientData;
            const newId = uuidv4();
            await connection.execute(
                'INSERT INTO patients (id, name, dob, gender, address, phone, email, clinicId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [newId, name, demographics.dob, demographics.gender, demographics.address, demographics.phone, demographics.email, clinicId]
            );
            return { ...patientData, id: newId, vitals: [], medications: [], appointments: [], procedures: [], notes: [] };
        } finally {
            connection.release();
        }
    },
    // ... other methods will be implemented directly in API routes
    // --- Clinic operations ---
    getAllClinics: async (): Promise<Clinic[]> => {
        const connection = await getConnection();
        try {
            const [rows] = await connection.execute('SELECT * FROM clinics');
            return rows as Clinic[];
        } finally {
            connection.release();
        }
    },
    findClinicByName: async (name: string): Promise<Clinic | null> => {
        const connection = await getConnection();
        try {
            const [rows] = await connection.execute('SELECT * FROM clinics WHERE name = ?', [name]);
            const clinics = rows as Clinic[];
            return clinics.length > 0 ? clinics[0] : null;
        } finally {
            connection.release();
        }
    },
    createClinic: async (clinicData: Omit<Clinic, 'id'> & { name: string }): Promise<Clinic> => {
        const connection = await getConnection();
        try {
            const { name, address, phone } = clinicData;
             if (await db.findClinicByName(name)) {
                throw new Error('Clinic with that name already exists');
            }
            const newId = uuidv4();
            await connection.execute(
                'INSERT INTO clinics (id, name, address, phone) VALUES (?, ?, ?, ?)',
                [newId, name, address, phone]
            );
            return { id: newId, name, address: address || '', phone: phone || '' };
        } finally {
            connection.release();
        }
    },
    updateClinic: async(id: string, clinicData: Partial<Omit<Clinic, 'id'>>): Promise<Clinic | null> => {
        const connection = await getConnection();
        try {
            const { name, address, phone } = clinicData;
            
            const fieldsToUpdate: { [key: string]: any } = { name, address, phone };
            const queryParts = Object.keys(fieldsToUpdate)
                .filter(key => fieldsToUpdate[key] !== undefined)
                .map(key => `${key} = ?`);

            if (queryParts.length === 0) {
                 const [currentRows] = await connection.execute('SELECT * FROM clinics WHERE id = ?', [id]);
                 return (currentRows as any)[0] || null;
            }

            let query = `UPDATE clinics SET ${queryParts.join(', ')} WHERE id = ?`;
            const params = [...Object.values(fieldsToUpdate).filter(v => v !== undefined), id];

            const [result] = await connection.execute(query, params) as any;

            if (result.affectedRows === 0) {
                return null;
            }

            const [rows] = await connection.execute('SELECT * FROM clinics WHERE id = ?', [id]);
            return (rows as any)[0] || null;

        } finally {
            connection.release();
        }
    },
    deleteClinic: async (id: string): Promise<boolean> => {
        const connection = await getConnection();
        try {
            // Un-assign users from this clinic
            await connection.execute('UPDATE users SET clinicId = NULL WHERE clinicId = ?', [id]);
            // Re-assign patients or delete them? For now, let's just delete the clinic.
            // In a real-world app, you'd need a more robust strategy for orphaned patients.
            const [result] = await connection.execute('DELETE FROM clinics WHERE id = ?', [id]) as any;
            return result.affectedRows > 0;
        } finally {
            connection.release();
        }
    }
};
