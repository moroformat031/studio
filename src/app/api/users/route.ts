
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
    const { username, password, role, type, clinicName } = (await request.json()) as { username: string, password?: string, role: Role, type: UserType, clinicName: string };

    if (!username || !password || !role || !type || !clinicName) {
         return NextResponse.json({ message: 'Username, password, role, type, and clinic name are required' }, { status: 400 });
    }
    
    if (await db.findUser(username)) {
       return NextResponse.json({ message: 'Username already exists' }, { status: 409 });
    }

    const newUser = await db.createUser({ username, password, role, type, clinicName });
    
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(userWithoutPassword, { status: 201 });

  } catch (error) {
    console.error("Error creating user:", error);
    const e = error as Error;
    return NextResponse.json({ message: e.message || 'An error occurred during user creation' }, { status: 500 });
  }
}
