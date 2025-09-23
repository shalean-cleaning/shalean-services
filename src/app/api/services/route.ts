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
      
      const minimalServices = [
        {
          name: 'Standard Cleaning',
          slug: 'standard-cleaning',
          description: 'Regular home cleaning service',
          base_price_cents: 10000, // R100.00 in cents
          base_price: 100.00
        },
        {
          name: 'Deep Cleaning',
          slug: 'deep-cleaning',
          description: 'Intensive cleaning service',
          base_price_cents: 15000, // R150.00 in cents
          base_price: 150.00
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
      
      const minimalExtras = [
        {
          name: 'Inside Fridge',
          slug: 'inside-fridge',
          description: 'Clean and sanitize fridge interior',
          price_cents: 2000, // R20.00 in cents
          price: 20.00
        },
        {
          name: 'Inside Oven',
          slug: 'inside-oven',
          description: 'Clean oven interior',
          price_cents: 2500, // R25.00 in cents
          price: 25.00
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
  try {
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
        base_price_cents,
        base_price,
        active
      `)
      .order('name');
    
    if (svcsErr) {
      console.error('Error fetching services:', svcsErr);
      return NextResponse.json({ error: svcsErr.message }, { status: 500 });
    }

    // Get extras (service items) - handle gracefully if table doesn't exist
    let extras: any[] = [];
    try {
      const { data: ex, error: exErr } = await supabase
        .from('extras')
        .select('id,name,description,price_cents,price')
        .order('name');
      
      if (exErr) {
        console.warn('extras table not found, using empty array:', exErr.message);
      } else {
        extras = ex ?? [];
      }
    } catch (err) {
      console.warn('Error fetching extras:', err);
      extras = [];
    }

    // Normalize services data
    const servicesNormalized = (svcs ?? []).map(s => {
      // Use base_price_cents if available, otherwise calculate from base_price
      const cents = s.base_price_cents != null ? Number(s.base_price_cents) : 
                   (s.base_price != null ? Math.round(Number(s.base_price) * 100) : 0);
      const price = cents / 100;
      
      return { 
        ...s, 
        base_price_cents: cents, 
        base_price: price,
        base_fee: price, // For backward compatibility
        active: s.active ?? true, // Default to true if not set
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
      extras 
    });
  } catch (error) {
    console.error('Unexpected error in services API:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}