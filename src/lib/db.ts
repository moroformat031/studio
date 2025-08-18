
import { PrismaClient, Prisma } from '@prisma/client';
import type { Patient, User, Clinic, Plan, DoctorAvailability, Appointment, MasterMedication, MasterProcedure } from '@/types/ehr';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const formatDate = (date: Date | null): string => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
}

const initializeDatabase = async () => {
    try {
        console.log("Checking database initialization status...");
        const userCount = await prisma.user.count();

        if (userCount > 1) { // Assuming admin is user 1
            console.log("Database already seeded. Skipping initialization.");
            return;
        }

        console.log("Database is empty or only has admin. Seeding with initial data...");

        // --- Clinics ---
        console.log("Creating clinics...");
        const hospitalCentral = await prisma.clinic.upsert({
            where: { name: 'Hospital Central' },
            update: {},
            create: { name: 'Hospital Central', address: '123 Admin Way', phone: '555-0000' }
        });
        const clinicaDelSol = await prisma.clinic.upsert({
            where: { name: 'Clínica del Sol' },
            update: {},
            create: { name: 'Clínica del Sol', address: '456 Sol Avenue', phone: '555-1111' }
        });
        const centroMedicoIntegral = await prisma.clinic.upsert({
            where: { name: 'Centro Médico Integral' },
            update: {},
            create: { name: 'Centro Médico Integral', address: '789 Luna Street', phone: '555-2222' }
        });

        // --- Users (Admin, Doctors, Nurse) ---
        console.log("Creating users...");
        const adminUser = await prisma.user.upsert({
            where: { username: 'admin' },
            update: {},
            create: {
                username: 'admin',
                password: await bcrypt.hash('code', 10),
                plan: 'Admin',
                clinicId: hospitalCentral.id
            }
        });

        const draGarcia = await prisma.user.upsert({
            where: { username: 'Dra. Elena Garcia' },
            update: {},
            create: {
                username: 'Dra. Elena Garcia',
                password: await bcrypt.hash('code', 10),
                plan: 'Medico',
                clinicId: clinicaDelSol.id
            }
        });
        
        const drMartinez = await prisma.user.upsert({
            where: { username: 'Dr. Carlos Martinez' },
            update: {},
            create: {
                username: 'Dr. Carlos Martinez',
                password: await bcrypt.hash('code', 10),
                plan: 'Medico',
                clinicId: centroMedicoIntegral.id
            }
        });

        const nurseJoy = await prisma.user.upsert({
            where: { username: 'Enfermera Joy' },
            update: {},
            create: {
                username: 'Enfermera Joy',
                password: await bcrypt.hash('code', 10),
                plan: 'Nurse',
                clinicId: clinicaDelSol.id
            }
        });

        // --- Doctor Availability ---
        console.log("Setting doctor availability...");
        await prisma.doctorAvailability.createMany({
            data: [
                // Dra. Garcia Availability (Mon, Wed, Fri)
                { userId: draGarcia.id, dayOfWeek: 0, startTime: '09:00', endTime: '17:00', isAvailable: true }, // Monday
                { userId: draGarcia.id, dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isAvailable: true }, // Wednesday
                { userId: draGarcia.id, dayOfWeek: 4, startTime: '10:00', endTime: '15:00', isAvailable: true }, // Friday
                // Dr. Martinez Availability (Tue, Thu)
                { userId: drMartinez.id, dayOfWeek: 1, startTime: '08:00', endTime: '16:00', isAvailable: true }, // Tuesday
                { userId: drMartinez.id, dayOfWeek: 3, startTime: '08:00', endTime: '16:00', isAvailable: true }, // Thursday
            ],
            skipDuplicates: true
        });

        // --- Patients ---
        console.log("Creating patients...");
        const patient1 = await prisma.patient.create({
            data: {
                name: 'Ana Pérez',
                dob: new Date('1985-05-15'),
                gender: 'Femenino',
                address: 'Calle Falsa 123',
                phone: '555-1234',
                email: 'ana.perez@example.com',
                clinicId: clinicaDelSol.id,
            }
        });
        const patient2 = await prisma.patient.create({
             data: {
                name: 'Juan Rodríguez',
                dob: new Date('1990-08-20'),
                gender: 'Masculino',
                address: 'Avenida Siempreviva 742',
                phone: '555-5678',
                email: 'juan.rodriguez@example.com',
                clinicId: clinicaDelSol.id,
            }
        });
         const patient3 = await prisma.patient.create({
            data: {
                name: 'Luisa Gomez',
                dob: new Date('1978-11-30'),
                gender: 'Femenino',
                address: 'Boulevard de los Sueños Rotos 100',
                phone: '555-9012',
                email: 'luisa.gomez@example.com',
                clinicId: centroMedicoIntegral.id,
            }
        });

        // --- Pre-booked Appointments ---
        console.log("Creating sample appointments...");
        const today = new Date();
        const nextMonday = new Date(today);
        nextMonday.setDate(today.getDate() + (1 + 7 - today.getDay()) % 7);
        if (nextMonday < today) nextMonday.setDate(nextMonday.getDate() + 7);
        const nextTuesday = new Date(nextMonday);
        nextTuesday.setDate(nextMonday.getDate() + 1);

        await prisma.appointment.createMany({
            data: [
                {
                    patientId: patient1.id,
                    date: nextMonday,
                    time: '10:00',
                    reason: 'Consulta de seguimiento',
                    status: 'Programada',
                    visitProvider: draGarcia.username,
                    billingProvider: draGarcia.username,
                },
                 {
                    patientId: patient2.id,
                    date: nextMonday,
                    time: '11:30',
                    reason: 'Revisión anual',
                    status: 'Programada',
                    visitProvider: draGarcia.username,
                    billingProvider: draGarcia.username,
                },
                {
                    patientId: patient3.id,
                    date: nextTuesday,
                    time: '09:00',
                    reason: 'Dolor de cabeza crónico',
                    status: 'Programada',
                    visitProvider: drMartinez.username,
                    billingProvider: drMartinez.username,
                }
            ]
        });

        // --- Master Data ---
        console.log("Creating master data for medications and procedures...");
        await prisma.masterMedication.createMany({
            data: [
                { name: 'Paracetamol 500mg' },
                { name: 'Ibuprofeno 400mg' },
                { name: 'Amoxicilina 250mg' },
                { name: 'Loratadina 10mg' },
                { name: 'Omeprazol 20mg' }
            ],
            skipDuplicates: true
        });

        await prisma.masterProcedure.createMany({
            data: [
                { name: 'Consulta General' },
                { name: 'Consulta de Especialidad' },
                { name: 'Radiografía de Tórax' },
                { name: 'Análisis de Sangre Completo' },
                { name: 'Sutura de Herida Simple' }
            ],
            skipDuplicates: true
        });
        
        console.log('Database seeding completed successfully.');

    } catch (error) {
        console.error("Error during database initialization:", error);
    }
};

initializeDatabase();

export const db = {
    // --- User operations ---
    getAllUsers: async (clinicId?: string): Promise<Omit<User, 'password'>[]> => {
        const whereClause = clinicId ? { clinicId } : {};
        const users = await prisma.user.findMany({
            where: whereClause,
            include: { clinic: true },
        });
        return users.map(({ password, clinic, ...user }) => ({
            ...user,
            plan: user.plan as Plan,
            clinicName: clinic?.name || '',
        }));
    },
    findUser: async (username: string): Promise<User | null> => {
        const user = await prisma.user.findUnique({
            where: { username },
            include: { clinic: true },
        });
        if (!user) return null;
        const { clinic, ...rest } = user;
        return { ...rest, plan: rest.plan as Plan, clinicName: clinic?.name || '' };
    },
     findUserById: async (id: string): Promise<User | null> => {
        const user = await prisma.user.findUnique({
            where: { id },
            include: { clinic: true },
        });
        if (!user) return null;
        const { clinic, ...rest } = user;
        return { ...rest, plan: rest.plan as Plan, clinicName: clinic?.name || '' };
    },
    createUser: async (userData: { username: string, password?: string, plan: Plan, clinicName: string }): Promise<Omit<User, 'password'>> => {
        const existingUser = await db.findUser(userData.username);
        if (existingUser) {
            throw new Error('Username already exists');
        }

        if (!userData.clinicName) {
            throw new Error('Clinic name is required to create a user.');
        }

        let clinic = await db.findClinicByName(userData.clinicName);
        if (!clinic) {
            clinic = await db.createClinic({ name: userData.clinicName, address: '', phone: '' });
        }

        const hashedPassword = await bcrypt.hash(userData.password!, 10);

        const newUser = await prisma.user.create({
            data: {
                username: userData.username,
                password: hashedPassword,
                plan: userData.plan,
                clinicId: clinic.id,
            }
        });

        return {
            id: newUser.id,
            username: newUser.username,
            plan: newUser.plan as Plan,
            clinicId: clinic.id,
            clinicName: clinic.name,
        };
    },
    updateUser: async (id: string, userData: Partial<Omit<User, 'id' | 'password'>> & { password?: string, clinicName?: string }): Promise<Omit<User, 'password'> | null> => {
        const { password, clinicName, ...otherData } = userData;
        const dataToUpdate: any = { ...otherData };

        if (password) {
            dataToUpdate.password = await bcrypt.hash(password, 10);
        }

        if (clinicName) {
            let clinic = await db.findClinicByName(clinicName);
            if (!clinic) {
                clinic = await db.createClinic({ name: clinicName });
            }
            dataToUpdate.clinicId = clinic.id;
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: dataToUpdate,
            include: { clinic: true },
        });

        const { password: _, clinic, ...userWithoutPassword } = updatedUser;
        return { ...userWithoutPassword, plan: userWithoutPassword.plan as Plan, clinicName: clinic?.name || '' };
    },
    deleteUser: async (id: string): Promise<boolean> => {
        await prisma.doctorAvailability.deleteMany({ where: { userId: id } });
        await prisma.user.delete({ where: { id } });
        return true;
    },

    // --- Patient operations ---
    getAllPatients: async (clinicId?: string): Promise<Patient[]> => {
        const whereClause = clinicId ? { clinicId } : {};
        const patients = await prisma.patient.findMany({
            where: whereClause,
            include: { clinic: true },
        });
        return patients.map(p => ({
            ...p,
            clinicName: p.clinic.name,
            demographics: {
                dob: formatDate(p.dob),
                gender: p.gender as 'Masculino' | 'Femenino' | 'Otro',
                address: p.address || '',
                phone: p.phone || '',
                email: p.email || '',
            },
            vitals: [],
            medications: [],
            appointments: [],
            procedures: [],
            notes: []
        }));
    },
    getPatient: async (id: string): Promise<Patient | null> => {
        const patient = await prisma.patient.findUnique({
            where: { id },
            include: {
                vitals: { orderBy: { date: 'desc' } },
                medications: { orderBy: { prescribedDate: 'desc' } },
                appointments: { orderBy: { date: 'desc' } },
                procedures: { orderBy: { date: 'desc' } },
                notes: { orderBy: { date: 'desc' } },
                clinic: true,
            },
        });

        if (!patient) return null;

        return {
            ...patient,
            clinicName: patient.clinic.name,
            demographics: {
                dob: formatDate(patient.dob),
                gender: patient.gender as 'Masculino' | 'Femenino' | 'Otro',
                address: patient.address || '',
                phone: patient.phone || '',
                email: patient.email || '',
            },
            vitals: patient.vitals.map(v => ({ ...v, date: formatDate(v.date), temp: v.temp.valueOf() })),
            medications: patient.medications.map(m => ({ ...m, prescribedDate: formatDate(m.prescribedDate) })),
            appointments: patient.appointments.map(a => ({ ...a, date: formatDate(a.date), status: a.status as 'Programada' | 'Completada' | 'Cancelada' })),
            procedures: patient.procedures.map(p => ({ ...p, date: formatDate(p.date), notes: p.notes || '' })),
            notes: patient.notes.map(n => ({ ...n, date: n.date.toISOString() })),
        };
    },
    addPatient: async (patientData: Omit<Patient, 'id'>): Promise<Patient> => {
        const { name, demographics, clinicId } = patientData;
        const newPatient = await prisma.patient.create({
            data: {
                name,
                dob: new Date(demographics.dob),
                gender: demographics.gender,
                address: demographics.address,
                phone: demographics.phone,
                email: demographics.email,
                clinicId: clinicId!,
            }
        });
        const fullPatient = await db.getPatient(newPatient.id);
        return fullPatient!;
    },
     deletePatient: async (id: string): Promise<boolean> => {
        await prisma.patient.delete({ where: { id } });
        return true;
    },

    // --- Clinic operations ---
    getAllClinics: async (): Promise<Clinic[]> => {
        return prisma.clinic.findMany();
    },
    findClinicByName: async (name: string): Promise<Clinic | null> => {
        return prisma.clinic.findUnique({ where: { name } });
    },
    createClinic: async (clinicData: Omit<Clinic, 'id'>): Promise<Clinic> => {
        return prisma.clinic.create({ data: clinicData });
    },
    updateClinic: async (id: string, clinicData: Partial<Omit<Clinic, 'id'>>): Promise<Clinic | null> => {
        return prisma.clinic.update({
            where: { id },
            data: clinicData,
        });
    },
    deleteClinic: async (id: string): Promise<boolean> => {
        const patientCount = await prisma.patient.count({ where: { clinicId: id } });
        if (patientCount > 0) {
            throw new Error("Cannot delete clinic with associated patients. Please reassign patients first.");
        }
        await prisma.user.updateMany({ where: { clinicId: id }, data: { clinicId: null } });
        await prisma.clinic.delete({ where: { id } });
        return true;
    },

    // --- Availability operations ---
    getDoctorAvailability: async (userId: string): Promise<DoctorAvailability[]> => {
        return prisma.doctorAvailability.findMany({ where: { userId } });
    },
    updateDoctorAvailability: async (userId: string, availabilityData: DoctorAvailability[]): Promise<DoctorAvailability[]> => {
        const transactions = availabilityData.map(avail => 
            prisma.doctorAvailability.upsert({
                where: { userId_dayOfWeek: { userId, dayOfWeek: avail.dayOfWeek } },
                update: { startTime: avail.startTime, endTime: avail.endTime, isAvailable: avail.isAvailable },
                create: { userId, ...avail }
            })
        );
        return prisma.$transaction(transactions);
    },

    // --- Appointment operations ---
    getAppointmentsForProviderOnDate: async (providerUsername: string, date: string): Promise<Appointment[]> => {
        const provider = await db.findUser(providerUsername);
        if(!provider) return [];
        
        const appointments = await prisma.appointment.findMany({
            where: {
                visitProvider: provider.username,
                date: new Date(`${date}T00:00:00Z`)
            }
        });
        return appointments.map(a => ({...a, date: formatDate(a.date), status: a.status as 'Programada' | 'Completada' | 'Cancelada' }));
    },
     getAppointmentsBetween: async (startDate: Date, endDate: Date): Promise<Appointment[]> => {
        const appointments = await prisma.appointment.findMany({
            where: {
                date: {
                    gte: startDate,
                    lt: endDate,
                }
            }
        });
        return appointments.map(a => ({...a, date: formatDate(a.date), status: a.status as 'Programada' | 'Completada' | 'Cancelada' }));
    },
    createAppointment: async (appointmentData: Omit<Appointment, 'id'>): Promise<Appointment> => {
        const newAppointment = await prisma.appointment.create({
            data: {
                patientId: appointmentData.patientId,
                date: new Date(appointmentData.date),
                time: appointmentData.time,
                reason: appointmentData.reason,
                status: appointmentData.status,
                visitProvider: appointmentData.visitProvider,
                billingProvider: appointmentData.billingProvider
            }
        });
        return { ...newAppointment, date: formatDate(newAppointment.date), status: newAppointment.status as 'Programada' | 'Completada' | 'Cancelada' };
    },

    // --- Master Data Operations ---
    getAllMasterMedications: async (): Promise<MasterMedication[]> => {
        return prisma.masterMedication.findMany({ orderBy: { name: 'asc' } });
    },
    createMasterMedication: async (data: { name: string }): Promise<MasterMedication> => {
        return prisma.masterMedication.create({ data });
    },
    updateMasterMedication: async (id: string, data: { name: string }): Promise<MasterMedication> => {
        return prisma.masterMedication.update({ where: { id }, data });
    },
    deleteMasterMedication: async (id: string): Promise<boolean> => {
        await prisma.masterMedication.delete({ where: { id }});
        return true;
    },
    getAllMasterProcedures: async (): Promise<MasterProcedure[]> => {
        return prisma.masterProcedure.findMany({ orderBy: { name: 'asc' } });
    },
    createMasterProcedure: async (data: { name: string }): Promise<MasterProcedure> => {
        return prisma.masterProcedure.create({ data });
    },
    updateMasterProcedure: async (id: string, data: { name: string }): Promise<MasterProcedure> => {
        return prisma.masterProcedure.update({ where: { id }, data });
    },
    deleteMasterProcedure: async (id: string): Promise<boolean> => {
        await prisma.masterProcedure.delete({ where: { id }});
        return true;
    },
};
