import { NextResponse } from 'next/server';
import { getProfile, updateProfile } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { revalidatePublicSiteCache } from '@/lib/site-cache';

export async function GET() {
  try {
    const profile = await getProfile();
    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await request.json();
    await updateProfile(data);
    revalidatePublicSiteCache();

    return NextResponse.json({ success: true, message: 'Profile updated' });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
