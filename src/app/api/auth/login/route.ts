import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';
import { getAdminUserByUsername } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const defaultAdminUsername = (process.env.DEFAULT_ADMIN_USERNAME || '').trim();
    const defaultAdminPassword = process.env.DEFAULT_ADMIN_PASSWORD || '';
    if (!defaultAdminUsername || !defaultAdminPassword) {
      return NextResponse.json(
        {
          error: 'Default admin account is not configured. Please set DEFAULT_ADMIN_USERNAME and DEFAULT_ADMIN_PASSWORD in .env.',
        },
        { status: 503 }
      );
    }

    const { username, password } = await request.json();

    const user = await getAdminUserByUsername(username);

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = signToken({ id: user.id, username: user.username });

    const response = NextResponse.json({ success: true, message: 'LoggedIn Successful' });
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
