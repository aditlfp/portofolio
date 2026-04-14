import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { countUnreadContacts } from '@/lib/db';

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const count = await countUnreadContacts();
    return NextResponse.json({ count });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
