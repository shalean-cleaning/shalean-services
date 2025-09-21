// app/api/extras/route.ts
import 'server-only';
import { NextResponse } from 'next/server';

import { supabaseAdmin } from '@/lib/supabase/server';
import { env } from '@/env.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ error: 'Missing NEXT_PUBLIC_SUPABASE_URL' }, { status: 500 });
  }
  if (!env.SUPABASE_SERVICE_ROLE_KEY && !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: 'Missing Supabase key (service or anon)' }, { status: 500 });
  }

  try {
    const { data, error } = await supabaseAdmin()
      .from('extras')
      .select('id, name, slug, description, price_cents')
      .eq('active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('[api/extras] Supabase error:', error);
      return NextResponse.json({ error: error.message, details: error }, { status: 500 });
    }
    
    // Transform data to match component expectations
    const transformedData = (data ?? []).map(extra => ({
      id: extra.id,
      name: extra.name,
      slug: extra.slug,
      description: extra.description,
      price: extra.price_cents ? Number(extra.price_cents) / 100 : 0, // Convert cents to dollars
      price_cents: extra.price_cents,
    }));
    
    return NextResponse.json(transformedData, { status: 200 });
  } catch (err: unknown) {
    console.error('[api/extras] Handler error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}