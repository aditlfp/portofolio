import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { deleteExperience, updateExperience } from '@/lib/db';
import { revalidatePublicSiteCache } from '@/lib/site-cache';

type Params = Promise<{ id: string }>;

export async function PUT(request: Request, { params }: { params: Params }) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const data = await request.json();
    const role = String(data?.role || data?.role_en || '').trim();
    const company = String(data?.company || data?.company_en || '').trim();
    if (!role || !company) {
      return NextResponse.json({ error: 'Role and company are required' }, { status: 400 });
    }

    await updateExperience(id, data);
    revalidatePublicSiteCache();

    return NextResponse.json({ success: true, message: 'Experience updated' });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Params }) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await deleteExperience(id);
    revalidatePublicSiteCache();

    return NextResponse.json({ success: true, message: 'Experience deleted' });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
