import { NextResponse } from 'next/server'
export const runtime = 'nodejs'

export async function GET() {
  return NextResponse.json(
    { ok: true, ts: Date.now(), envReady: Boolean(process.env.NEXT_PUBLIC_APP_URL) },
    { status: 200 }
  )
}
