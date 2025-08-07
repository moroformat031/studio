
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { User } from '@/types/ehr';

// GET all users
export async function GET() {
  try {
    const users = db.getAllUsers();
    // IMPORTANT: Never send passwords to the client
    const safeUsers = users.map(({ password, ...user }) => user);
    return NextResponse.json(safeUsers);
  } catch (error) {
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}

// POST a new user (simulates admin adding a user)
export async function POST(request: Request) {
  try {
    const { username, password, plan, clinicName } = (await request.json()) as Omit<User, 'id'>;

    if (!username || !password || !plan) {
         return NextResponse.json({ message: 'Username, password, and plan are required' }, { status: 400 });
    }

    const newUser = db.createUser({ username, password, plan, clinicName });

    if (!newUser) {
       return NextResponse.json({ message: 'Username already exists' }, { status: 409 });
    }
    
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(userWithoutPassword, { status: 201 });

  } catch (error) {
    return NextResponse.json({ message: 'An error occurred during user creation' }, { status: 500 });
  }
}
