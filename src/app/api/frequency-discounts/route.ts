import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createSupabaseServer();
    
    const { data, error } = await supabase
      .from('frequency_discounts')
      .select('*')
      .eq('active_from', '<=', new Date().toISOString())
      .or(`active_to.is.null,active_to.gte.${new Date().toISOString()}`)
      .order('frequency');

    if (error) {
      console.error('[api/frequency-discounts] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? [], { status: 200 });
  } catch (err: unknown) {
    console.error('[api/frequency-discounts] Handler error:', err);
    return NextResponse.json({ 
      error: err instanceof Error ? err.message : 'Unknown error' 
    }, { status: 500 });
  }
}
