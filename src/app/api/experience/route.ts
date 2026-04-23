import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { createExperience, getExperience } from '@/lib/db';
import { revalidatePublicSiteCache } from '@/lib/site-cache';

export async function GET() {
  try {
    const experience = await getExperience();
    return NextResponse.json(experience);
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await request.json();
    const role = String(data?.role || data?.role_en || '').trim();
    const company = String(data?.company || data?.company_en || '').trim();
    if (!role || !company) {
      return NextResponse.json({ error: 'Role and company are required' }, { status: 400 });
    }

    const id = await createExperience(data);
    revalidatePublicSiteCache();

    return NextResponse.json({ success: true, id });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
