import { NextResponse } from 'next/server';
import { createSupabaseServer, createSupabaseAdmin } from '@/lib/supabase/server';
import { env } from '@/env.server';
import { logger } from '@/lib/logger';

export async function GET() {
  const requestId = Math.random().toString(36).substring(2, 15);
  const endpoint = '/api/test-supabase';
  
  logger.apiRequest(endpoint, 'GET', requestId);

  try {
    // Test environment variables
    const envCheck = {
      hasSupabaseUrl: !!env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseAnonKey: !!env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceRoleKey: !!env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
      anonKeyLength: env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
      serviceRoleKeyLength: env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
    };

    // Test Supabase admin client creation
    let adminClientTest = { success: false, error: null };
    try {
      createSupabaseAdmin();
      adminClientTest = { success: true, error: null };
    } catch (error) {
      adminClientTest = { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }

    // Test Supabase server client creation
    let serverClientTest = { success: false, error: null };
    try {
      await createSupabaseServer();
      serverClientTest = { success: true, error: null };
    } catch (error) {
      serverClientTest = { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }

    const testResult = {
      success: true,
      timestamp: new Date().toISOString(),
      environment: envCheck,
      clientCreation: {
        adminClient: adminClientTest,
        serverClient: serverClientTest,
      },
    };

    logger.apiResponse(endpoint, 'GET', requestId, 200, testResult);
    return NextResponse.json(testResult, { status: 200 });

  } catch (error) {
    const errorResult = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    };

    logger.error('Test Supabase error:', errorResult);
    return NextResponse.json(errorResult, { status: 500 });
  }
}
