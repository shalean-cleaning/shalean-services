import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    version: process.env.npm_package_version || '0.1.0',
    time: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
}
