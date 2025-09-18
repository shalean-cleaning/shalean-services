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
      active,
      service_pricing (
        per_bedroom,
        per_bathroom,
        service_fee_flat,
        service_fee_pct
      )
    `)
    .eq('active', true)
    .order('name');
  if (svcsErr) return NextResponse.json({ error: svcsErr.message }, { status: 500 });

  // Get extras
  const { data: ex, error: exErr } = await supabase
    .from('extras')
    .select('id,name,slug,price,description,active')
    .eq('active', true)
    .order('name');
  if (exErr) return NextResponse.json({ error: exErr.message }, { status: 500 });

  // Normalize services data
  const servicesNormalized = (svcs ?? []).map(s => {
    const price = s.base_fee != null ? Number(s.base_fee) : null;
    const cents = price != null ? Math.round(price * 100) : null;
    return { 
      ...s, 
      base_price_cents: cents, 
      base_price: price,
      // Flatten pricing data
      per_bedroom: s.service_pricing?.[0]?.per_bedroom || 0,
      per_bathroom: s.service_pricing?.[0]?.per_bathroom || 0,
      service_fee_flat: s.service_pricing?.[0]?.service_fee_flat || 0,
      service_fee_pct: s.service_pricing?.[0]?.service_fee_pct || 0
    };
  });

  // Return services and extras in a flat structure (no categories in PRD)
  return NextResponse.json({ 
    services: servicesNormalized, 
    extras: ex ?? [] 
  });
}