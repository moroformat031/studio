
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { User } from '@/types/ehr';

export async function POST(request: Request) {
  try {
    const { username, password, plan, clinicName } = (await request.json()) as Omit<User, 'id'> & { password?: string};

    const existingUser = db.findUser(username);
    if (existingUser) {
      return NextResponse.json({ message: 'Username already exists' }, { status: 409 });
    }
    
    const newUser = db.createUser({ username, password, plan, clinicName });
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(userWithoutPassword, { status: 201 });

  } catch (error) {
    return NextResponse.json({ message: 'An error occurred during signup' }, { status: 500 });
  }
}
