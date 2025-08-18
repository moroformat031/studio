
import { PrismaClient, Prisma } from '@prisma/client';
import type { Patient, User, Clinic, Plan, DoctorAvailability, Appointment } from '@/types/ehr';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const formatDate = (date: Date | null): string => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
}

const initializeAdmin = async () => {
    try {
        const adminUser = await prisma.user.findUnique({ where: { username: 'admin' } });
        if (!adminUser) {
            console.log('Admin user not found, creating one...');
            const hashedPassword = await bcrypt.hash('code', 10);

            let clinic = await prisma.clinic.findUnique({ where: { name: 'Hospital Central' } });
            if (!clinic) {
                clinic = await prisma.clinic.create({
                    data: {
                        name: 'Hospital Central',
                        address: '123 Admin Way',
                        phone: '555-0000'
                    }
                });
            }

            await prisma.user.create({
                data: {
                    username: 'admin',
                    password: hashedPassword,
                    plan: 'Admin',
                    clinicId: clinic.id
                }
            });
            console.log('Admin user created successfully.');
        }
    } catch (error) {
        console.error("Error during admin initialization:", error);
    }
};

initializeAdmin();

export const db = {
    // --- User operations ---
    getAllUsers: async (): Promise<Omit<User, 'password'>[]> => {
        const users = await prisma.user.findMany({
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
        return { ...newPatient, demographics, vitals: [], medications: [], appointments: [], procedures: [], notes: [] };
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
    getAppointmentsForProviderOnDate: async (providerId: string, date: string): Promise<Appointment[]> => {
        const appointments = await prisma.appointment.findMany({
            where: {
                visitProvider: providerId,
                date: new Date(date)
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
    }
};
