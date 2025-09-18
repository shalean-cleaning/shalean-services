import 'server-only';
import { NextRequest, NextResponse } from 'next/server';

import { supabaseAdmin } from '@/lib/supabase/server';
import { env } from '@/env.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ error: 'Missing NEXT_PUBLIC_SUPABASE_URL' }, { status: 500 });
  }
  if (!env.SUPABASE_SERVICE_ROLE_KEY && !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: 'Missing Supabase key (service or anon)' }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const regionId = searchParams.get('region_id');

    let query = supabaseAdmin()
      .from('suburbs')
      .select(`
        id,
        name,
        postcode,
        delivery_fee,
        price_adjustment_pct,
        region_id,
        regions!inner (
          id,
          name,
          state
        )
      `)
      .eq('active', true)
      .order('name', { ascending: true });

    if (regionId) {
      query = query.eq('region_id', regionId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[api/suburbs] Supabase error:', error);
      return NextResponse.json({ error: error.message, details: error }, { status: 500 });
    }

    return NextResponse.json(data ?? [], { status: 200 });
  } catch (err: unknown) {
    console.error('[api/suburbs] Handler error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}
