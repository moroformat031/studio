
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { User } from '@/types/ehr';

export async function GET() {
  try {
    const users = await db.getAllUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { username, password, plan, clinicName } = (await request.json()) as Omit<User, 'id' | 'clinicId'> & { password?: string, clinicName: string };

    if (!username || !password || !plan || !clinicName) {
         return NextResponse.json({ message: 'Username, password, plan, and clinic name are required' }, { status: 400 });
    }
    
    if (await db.findUser(username)) {
       return NextResponse.json({ message: 'Username already exists' }, { status: 409 });
    }

    const newUser = await db.createUser({ username, password, plan, clinicName });
    
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(userWithoutPassword, { status: 201 });

  } catch (error) {
    console.error("Error creating user:", error);
    const e = error as Error;
    return NextResponse.json({ message: e.message || 'An error occurred during user creation' }, { status: 500 });
  }
}

    