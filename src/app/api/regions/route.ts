// app/api/regions/route.ts
import { NextResponse } from 'next/server';

import { getServerSupabase } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ error: 'Missing NEXT_PUBLIC_SUPABASE_URL' }, { status: 500 });
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: 'Missing Supabase key (service or anon)' }, { status: 500 });
  }

  try {
    const supabase = getServerSupabase();
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