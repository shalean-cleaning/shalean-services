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

    // For now, we'll use suburbs as areas since the PRD mentions areas but the current schema uses suburbs
    // This can be updated when the areas table is properly implemented
    let query = supabaseAdmin
      .from('suburbs')
      .select(`
        id,
        name,
        postcode,
        delivery_fee,
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
      console.error('[api/areas] Supabase error:', error);
      return NextResponse.json({ error: error.message, details: error }, { status: 500 });
    }

    // Transform suburbs to areas format for PRD compliance
    const areas = (data ?? []).map(suburb => ({
      id: suburb.id,
      slug: suburb.name.toLowerCase().replace(/\s+/g, '-'),
      name: suburb.name,
      price_adjustment_pct: 0, // Default for now
      active: true,
      postcode: suburb.postcode,
      delivery_fee: suburb.delivery_fee,
      region: suburb.regions
    }));

    return NextResponse.json(areas, { status: 200 });
  } catch (err: unknown) {
    console.error('[api/areas] Handler error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}
