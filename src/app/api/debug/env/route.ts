import { NextResponse } from 'next/server';

export async function GET() {
  const envVars = {
    DB_PROVIDER: process.env.DB_PROVIDER,
    MONGODB_URI: process.env.MONGODB_URI ? '[SET]' : '[NOT SET]',
    MONGODB_DB: process.env.MONGODB_DB,
    SUPABASE_URL: process.env.SUPABASE_URL ? '[SET]' : '[NOT SET]',
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
  };

  return NextResponse.json({
    message: 'Environment variables check',
    envVars,
    timestamp: new Date().toISOString(),
  });
}