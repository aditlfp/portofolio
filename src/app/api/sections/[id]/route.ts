import { NextResponse } from 'next/server';
import { updateSectionById } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { revalidatePublicSiteCache } from '@/lib/site-cache';

type Params = Promise<{ id: string }>;

export async function PUT(request: Request, { params }: { params: Params }) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const data = await request.json();
    await updateSectionById(id, data);
    revalidatePublicSiteCache();

    return NextResponse.json({ success: true, message: 'Section updated' });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
