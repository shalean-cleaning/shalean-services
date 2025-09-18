import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createSupabaseServer();
  
  // Get services with pricing information
  const { data: svcs, error: svcsErr } = await supabase
    .from('services')
    .select(`
      id,
      name,
      slug,
      description,
      base_fee,
      active
    `)
    .eq('active', true)
    .order('name');
  if (svcsErr) return NextResponse.json({ error: svcsErr.message }, { status: 500 });

  // Get extras
  const { data: ex, error: exErr } = await supabase
    .from('extras')
    .select('id,name,description,price,active')
    .eq('active', true)
    .order('name');
  if (exErr) return NextResponse.json({ error: exErr.message }, { status: 500 });

  // Normalize services data
  const servicesNormalized = (svcs ?? []).map(s => {
    const price = s.base_fee != null ? Number(s.base_fee) : 0;
    const cents = Math.round(price * 100);
    return { 
      ...s, 
      base_price_cents: cents, 
      base_price: price, // For backward compatibility
      base_fee: price,
      // Default pricing values (these should come from a pricing rules table in the future)
      per_bedroom: 20, // $20 per additional bedroom
      per_bathroom: 15, // $15 per additional bathroom
      service_fee_flat: 0,
      service_fee_pct: 0
    };
  });

  // Return services and extras in a flat structure (no categories in PRD)
  return NextResponse.json({ 
    services: servicesNormalized, 
    extras: ex ?? [] 
  });
}