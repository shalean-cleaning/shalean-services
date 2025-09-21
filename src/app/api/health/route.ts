import { NextResponse } from 'next/server';
import { createSupabaseServer, createSupabaseAdmin } from '@/lib/supabase/server';
import { ApiErrorHandler, createSuccessResponse } from '@/lib/api-error-handler';
import { logger } from '@/lib/logger';

export async function GET() {
  const requestId = Math.random().toString(36).substring(2, 15);
  const endpoint = '/api/health';
  
  logger.apiRequest(endpoint, 'GET', requestId);

  try {
    // Test environment variables
    const envCheck = {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    };

    // Test Supabase admin client
    let adminClientTest = { success: false, error: null };
    try {
      const adminClient = createSupabaseAdmin();
      const { data, error } = await adminClient.from('regions').select('count').limit(1);
      adminClientTest = { success: !error, error: error?.message || null };
    } catch (error) {
      adminClientTest = { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }

    // Test Supabase server client
    let serverClientTest = { success: false, error: null };
    try {
      const serverClient = await createSupabaseServer();
      const { data, error } = await serverClient.from('regions').select('count').limit(1);
      serverClientTest = { success: !error, error: error?.message || null };
    } catch (error) {
      serverClientTest = { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }

    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        ...envCheck,
      },
      database: {
        adminClient: adminClientTest,
        serverClient: serverClientTest,
      },
      overall: envCheck.hasSupabaseUrl && envCheck.hasSupabaseAnonKey && envCheck.hasServiceRoleKey && 
               adminClientTest.success && serverClientTest.success,
    };

    const statusCode = healthStatus.overall ? 200 : 503;
    
    logger.apiResponse(endpoint, 'GET', requestId, statusCode, healthStatus);
    
    if (healthStatus.overall) {
      return createSuccessResponse(healthStatus);
    } else {
      return NextResponse.json(healthStatus, { status: 503 });
    }

  } catch (error) {
    const context = {
      endpoint,
      method: 'GET',
      userAgent: 'health-check',
    };

    return ApiErrorHandler.handle(error, context);
  }
}
