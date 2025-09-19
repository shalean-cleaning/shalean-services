import { NextResponse } from 'next/server'
import { env } from '@/env.server'

export async function GET() {
  try {
    // Check environment variables without exposing sensitive data
    const envCheck = {
      hasSupabaseUrl: !!env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseAnonKey: !!env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceRoleKey: !!env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseUrlValid: env.NEXT_PUBLIC_SUPABASE_URL?.includes('supabase.co') || false,
      isPlaceholderUrl: env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') || false,
      isPlaceholderKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.includes('placeholder') || false,
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    }

    return NextResponse.json({
      status: 'Environment check complete',
      environment: envCheck
    })
  } catch (error) {
    console.error('Environment check failed:', error)
    return NextResponse.json(
      { 
        error: 'Environment check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
