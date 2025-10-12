
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { User, Plan } from '@/types/ehr';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password, plan, clinicName, firstName, paternalLastName, maternalLastName } = (await request.json()) as { email: string, password?: string, plan: Plan, clinicName: string, firstName: string, paternalLastName: string, maternalLastName: string };

    if (!password) {
      return NextResponse.json({ message: 'Password is required' }, { status: 400 });
    }
     if (!clinicName) {
      return NextResponse.json({ message: 'Clinic name is required' }, { status: 400 });
    }
    if (!email || !firstName || !paternalLastName) {
        return NextResponse.json({ message: 'Email, first name, and paternal last name are required.' }, { status: 400 });
    }


    const existingUser = await db.findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ message: 'Email already exists' }, { status: 409 });
    }
    
    // The first user signing up for a clinic is an ADMIN
    const newUser = await db.createUser({ 
        email, 
        password: password, 
        role: 'ADMIN',
        type: 'Otro', // Admins can be of any type, default to 'Other'
        clinicName,
        clinicPlan: plan,
        firstName,
        paternalLastName,
        maternalLastName,
    });

    return NextResponse.json(newUser, { status: 201 });

  } catch (error) {
    console.error("Signup error:", error);
    const e = error as Error;
    return NextResponse.json({ message: e.message || 'An error occurred during signup' }, { status: 500 });
  }
}

