import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getSections, saveSections } from '@/lib/db';
import { revalidatePublicSiteCache } from '@/lib/site-cache';

export async function GET() {
  try {
    const sections = await getSections();
    return NextResponse.json(sections);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await request.json();
    if (!Array.isArray(data)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    await saveSections(data);
    revalidatePublicSiteCache();
    return NextResponse.json({ success: true, message: 'Sections saved' });
  } catch (error) {
    console.error('Sections PUT error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
