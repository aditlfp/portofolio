import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getCertificates, createCertificate } from '@/lib/db';
import { revalidatePublicSiteCache } from '@/lib/site-cache';

export async function GET() {
  try {
    const certificates = await getCertificates();
    return NextResponse.json(certificates);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await request.json();
    const id = await createCertificate(data);
    revalidatePublicSiteCache();

    return NextResponse.json({ success: true, id });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
