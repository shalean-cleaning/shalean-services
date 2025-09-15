import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  const { data: cats, error: catsErr } = await supabase
    .from('service_categories')
    .select('id,name,slug,description,icon,sort_order')
    .order('sort_order', { ascending: true });
  if (catsErr) return NextResponse.json({ error: catsErr.message }, { status: 500 });

  const { data: svcs, error: svcsErr } = await supabase
    .from('services')
    .select('id,category_id,name,slug,base_price_cents,base_price,description,duration_minutes,sort_order');
  if (svcsErr) return NextResponse.json({ error: svcsErr.message }, { status: 500 });

  const servicesNormalized = (svcs ?? []).map(s => {
    const cents = s.base_price_cents ?? (s.base_price != null ? Math.round(Number(s.base_price) * 100) : null);
    const price = s.base_price ?? (cents != null ? cents / 100 : null);
    return { ...s, base_price_cents: cents, base_price: price };
  });

  const byCat = new Map<string, any[]>();
  servicesNormalized.forEach(s => {
    const arr = byCat.get(s.category_id) ?? [];
    arr.push(s);
    byCat.set(s.category_id, arr);
  });

  const { data: ex, error: exErr } = await supabase
    .from('extras')
    .select('id,name,slug,price_cents,price,description,duration_minutes,sort_order')
    .order('name');
  if (exErr) return NextResponse.json({ error: exErr.message }, { status: 500 });

  const categories = (cats ?? []).map(c => ({ ...c, services: byCat.get(c.id) ?? [] }));
  return NextResponse.json({ categories, extras: ex ?? [] });
}