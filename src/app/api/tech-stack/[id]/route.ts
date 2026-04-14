import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { updateTechItem, deleteTechItem } from '@/lib/db';
import { revalidatePublicSiteCache } from '@/lib/site-cache';

type Params = Promise<{ id: string }>;

export async function PUT(request: Request, { params }: { params: Params }) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const data = await request.json();
    await updateTechItem(id, data);
    revalidatePublicSiteCache();

    return NextResponse.json({ success: true, message: 'Tech item updated' });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Params }) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await deleteTechItem(id);
    revalidatePublicSiteCache();

    return NextResponse.json({ success: true, message: 'Tech item deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
