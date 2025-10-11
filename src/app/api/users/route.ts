
import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import type { User, Role, UserType } from '@/types/ehr';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinicId');

    const users = await db.getAllUsers(clinicId || undefined);
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { email, password, role, type, clinicName, firstName, paternalLastName, maternalLastName } = (await request.json()) as { email: string, password?: string, role: Role, type: UserType, clinicName: string, firstName: string, paternalLastName: string, maternalLastName: string };

    if (!email || !password || !role || !type || !clinicName || !firstName || !paternalLastName) {
         return NextResponse.json({ message: 'All fields are required.' }, { status: 400 });
    }
    
    if (await db.findUserByEmail(email)) {
       return NextResponse.json({ message: 'Email already exists' }, { status: 409 });
    }

    const newUser = await db.createUser({ email, password, role, type, clinicName, firstName, paternalLastName, maternalLastName });
    
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(userWithoutPassword, { status: 201 });

  } catch (error) {
    console.error("Error creating user:", error);
    const e = error as Error;
    return NextResponse.json({ message: e.message || 'An error occurred during user creation' }, { status: 500 });
  }
}
