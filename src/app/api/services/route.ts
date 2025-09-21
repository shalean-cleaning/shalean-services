import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';

// Lazy seeding function for empty tables
async function ensureMinimalData(supabase: any) {
  try {
    // Check if services table is empty
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('id')
      .limit(1);

    if (servicesError) {
      console.warn('Could not check services table:', servicesError.message);
      return;
    }

    // If no services exist, seed minimal data
    if (!services || services.length === 0) {
      console.log('Services table is empty, seeding minimal data...');
      
      const minimalServices = [
        {
          name: 'Standard Cleaning',
          slug: 'standard-cleaning',
          description: 'Regular home cleaning service',
          base_fee: 100.00,
          active: true
        },
        {
          name: 'Deep Cleaning',
          slug: 'deep-cleaning',
          description: 'Intensive cleaning service',
          base_fee: 150.00,
          active: true
        }
      ];

      for (const service of minimalServices) {
        await supabase
          .from('services')
          .upsert(service, { onConflict: 'slug' });
      }
    }

    // Check if extras table is empty
    const { data: extras, error: extrasError } = await supabase
      .from('extras')
      .select('id')
      .limit(1);

    if (!extrasError && (!extras || extras.length === 0)) {
      console.log('Extras table is empty, seeding minimal data...');
      
      const minimalExtras = [
        {
          name: 'Inside Fridge',
          slug: 'inside-fridge',
          description: 'Clean and sanitize fridge interior',
          price_cents: 2000,
          active: true
        },
        {
          name: 'Inside Oven',
          slug: 'inside-oven',
          description: 'Clean oven interior',
          price_cents: 2500,
          active: true
        }
      ];

      for (const extra of minimalExtras) {
        await supabase
          .from('extras')
          .upsert(extra, { onConflict: 'slug' });
      }
    }
  } catch (error) {
    console.warn('Error during lazy seeding:', error);
    // Don't throw - continue with empty data
  }
}

export async function GET() {
  const supabase = await createSupabaseServer();
  
  // Ensure minimal data exists
  await ensureMinimalData(supabase);
  
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

  // Get extras (service items)
  const { data: ex, error: exErr } = await supabase
    .from('extras')
    .select('id,name,description,price,active')
    .eq('active', true)
    .order('name');
  
  // Handle case where extras table doesn't exist yet
  if (exErr) {
    console.warn('extras table not found, using empty array:', exErr.message);
    // Return empty array instead of error
  }

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

  // Return services and service items in a flat structure (no categories in PRD)
  return NextResponse.json({ 
    services: servicesNormalized, 
    extras: ex ?? [] 
  });
}