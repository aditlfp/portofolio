import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { updateCertificate, deleteCertificate } from '@/lib/db';
import { revalidatePublicSiteCache } from '@/lib/site-cache';

type Params = Promise<{ id: string }>;

export async function PUT(request: Request, { params }: { params: Params }) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const data = await request.json();
    await updateCertificate(id, data);
    revalidatePublicSiteCache();

    return NextResponse.json({ success: true, message: 'Certificate updated' });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Params }) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await deleteCertificate(id);
    revalidatePublicSiteCache();

    return NextResponse.json({ success: true, message: 'Certificate deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
