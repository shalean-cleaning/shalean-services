import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/env.server';
import { Database } from '@/lib/database.types';

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

    // Create admin client for server-side operations
    const supabaseAdmin = createClient<Database>(
      env.NEXT_PUBLIC_SUPABASE_URL!,
      env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Use suburbs as areas since the current implementation treats suburbs as areas
    // The areas table exists but suburbs are being used directly
    let query = supabaseAdmin
      .from('suburbs')
      .select('id, name, postcode, delivery_fee, price_adjustment_pct, active, region_id')
      .eq('active', true)
      .order('name', { ascending: true });

    if (regionId) {
      query = query.eq('region_id', regionId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[api/areas] Supabase error:', error);
      return NextResponse.json({ error: error.message, details: error }, { status: 500 });
    }

    // Return suburbs directly as areas since they're being used interchangeably
    const areas = (data ?? []).map((suburb: any) => ({
      id: suburb.id,
      name: suburb.name || 'Unknown Area',
      postcode: suburb.postcode || '',
      delivery_fee: suburb.delivery_fee || 0,
      price_adjustment_pct: suburb.price_adjustment_pct || 0,
      active: suburb.active ?? true,
      region_id: suburb.region_id
    }));

    return NextResponse.json(areas, { status: 200 });
  } catch (err: unknown) {
    console.error('[api/areas] Handler error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}
