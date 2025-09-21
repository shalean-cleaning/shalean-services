import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Simple test endpoint working',
    timestamp: new Date().toISOString(),
  });
}

export async function POST() {
  return NextResponse.json({
    success: true,
    message: 'Simple POST test endpoint working',
    timestamp: new Date().toISOString(),
  });
}
