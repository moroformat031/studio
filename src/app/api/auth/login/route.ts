
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    const user = db.findUser(username);

    if (user && user.password === password) {
      const { password: _, ...userWithoutPassword } = user;
      const response = NextResponse.json({
        message: 'Login successful',
        user: userWithoutPassword,
      });

      // Simple token simulation
      const token = Buffer.from(JSON.stringify({ username: user.username, timestamp: Date.now() })).toString('base64');
      response.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        maxAge: 60 * 60 * 24, // 1 day
        path: '/',
      });

      return response;
    }

    return NextResponse.json({ message: 'Invalid username or password' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}
