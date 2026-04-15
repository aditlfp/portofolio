import { NextResponse } from 'next/server';
import { dbProviderName } from '@/lib/db';

export async function GET() {
  return NextResponse.json({
    message: 'Database provider debug info',
    dbProviderName,
    environment: {
      DB_PROVIDER: process.env.DB_PROVIDER,
      MONGODB_URI: process.env.MONGODB_URI ? '[SET]' : '[NOT SET]',
      MONGODB_DB: process.env.MONGODB_DB,
      SUPABASE_URL: process.env.SUPABASE_URL ? '[SET]' : '[NOT SET]',
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
    },
    timestamp: new Date().toISOString(),
  });
}