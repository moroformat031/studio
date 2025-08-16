
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { User } from '@/types/ehr';

export async function PUT(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;
    const userData = (await request.json()) as Partial<User>;
    
    delete userData.id;

    const updatedUser = await db.updateUser(userId, userData);

    if (updatedUser) {
      return NextResponse.json(updatedUser);
    }
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  } catch (error) {
    console.error("Error updating user:", error);
    const e = error as Error;
    return NextResponse.json({ message: e.message || 'An error occurred' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;
    const success = await db.deleteUser(userId);

    if (success) {
      return NextResponse.json({ message: 'User deleted successfully' });
    }
    return NextResponse.json({ message: 'User not found or could not be deleted' }, { status: 404 });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}

    