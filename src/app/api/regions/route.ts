// app/api/regions/route.ts
import 'server-only';
import { NextResponse } from 'next/server';

import { supabaseAdmin } from '@/lib/supabase/server';
import { env } from '@/env.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Lazy seeding function for regions
async function ensureMinimalRegions(supabase: any) {
  try {
    const { data: regions, error } = await supabase
      .from('regions')
      .select('id')
      .limit(1);

    if (error) {
      console.warn('Could not check regions table:', error.message);
      return;
    }

    if (!regions || regions.length === 0) {
      
      const minimalRegions = [
        {
          name: 'Cape Town CBD',
          slug: 'cape-town-cbd',
          state: 'Western Cape'
        },
        {
          name: 'Atlantic Seaboard',
          slug: 'atlantic-seaboard',
          state: 'Western Cape'
        },
        {
          name: 'Southern Suburbs',
          slug: 'southern-suburbs',
          state: 'Western Cape'
        }
      ];

      for (const region of minimalRegions) {
        await supabase
          .from('regions')
          .upsert(region, { onConflict: 'slug' });
      }
    }
  } catch (error) {
    console.warn('Error during regions lazy seeding:', error);
  }
}

export async function GET() {
  if (!env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ error: 'Missing NEXT_PUBLIC_SUPABASE_URL' }, { status: 500 });
  }
  if (!env.SUPABASE_SERVICE_ROLE_KEY && !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: 'Missing Supabase key (service or anon)' }, { status: 500 });
  }

  try {
    const supabase = supabaseAdmin();
    
    // Ensure minimal regions exist
    await ensureMinimalRegions(supabase);
    
    const { data, error } = await supabase
      .from('regions')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('[api/regions] Supabase error:', error);
      return NextResponse.json({ error: error.message, details: error }, { status: 500 });
    }
    return NextResponse.json(data ?? [], { status: 200 });
  } catch (err: unknown) {
    console.error('[api/regions] Handler error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}