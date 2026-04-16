import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export async function POST(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const ext = path.extname(file.name);
    const filename = `${uuidv4()}${ext}`;

    // ── Vercel / production: use Vercel Blob ──────────────────────────────
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      const { put } = await import('@vercel/blob');

      const blob = await put(`img/${filename}`, file, {
        access: 'public',
        contentType: file.type,
      });

      return NextResponse.json({ success: true, url: blob.url });
    }

    // ── Local development: write to public/img/ ───────────────────────────
    const fs = await import('fs');
    const { join } = await import('path');

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = join(process.cwd(), 'public', 'img');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    fs.writeFileSync(join(uploadDir, filename), buffer);

    return NextResponse.json({ success: true, url: `/img/${filename}` });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}