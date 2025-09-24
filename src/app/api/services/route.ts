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
    // For now, return fallback data to avoid database connection issues
    // TODO: Re-enable database queries once Supabase is properly configured
    return NextResponse.json({ 
      services: getFallbackServicesData(), 
      extras: getFallbackExtrasData()
    });
  } catch (error) {
    console.error('Unexpected error in services API:', error);
    // Return fallback data instead of error
    return NextResponse.json({ 
      services: getFallbackServicesData(), 
      extras: getFallbackExtrasData()
    });
  }
}

// Fallback services data
function getFallbackServicesData() {
  return [
    {
      id: 'fallback-1',
      name: 'Standard Cleaning',
      slug: 'standard-cleaning',
      description: 'Regular home cleaning service including kitchen, bathrooms, bedrooms, and common areas',
      base_price_cents: 12000,
      base_price: 120.00,
      base_fee: 120.00,
      per_bedroom: 20,
      per_bathroom: 15,
      service_fee_flat: 0,
      service_fee_pct: 0,
      active: true
    },
    {
      id: 'fallback-2',
      name: 'Deep Cleaning',
      slug: 'deep-cleaning',
      description: 'Intensive cleaning service for move-in/out or special occasions',
      base_price_cents: 20000,
      base_price: 200.00,
      base_fee: 200.00,
      per_bedroom: 20,
      per_bathroom: 15,
      service_fee_flat: 0,
      service_fee_pct: 0,
      active: true
    },
    {
      id: 'fallback-3',
      name: 'Move-in/Move-out Cleaning',
      slug: 'move-in-out',
      description: 'Comprehensive cleaning for new tenants or departing residents',
      base_price_cents: 25000,
      base_price: 250.00,
      base_fee: 250.00,
      per_bedroom: 20,
      per_bathroom: 15,
      service_fee_flat: 0,
      service_fee_pct: 0,
      active: true
    },
    {
      id: 'fallback-4',
      name: 'Post-Construction Cleaning',
      slug: 'post-construction',
      description: 'Specialized cleaning after construction or renovation work',
      base_price_cents: 30000,
      base_price: 300.00,
      base_fee: 300.00,
      per_bedroom: 20,
      per_bathroom: 15,
      service_fee_flat: 0,
      service_fee_pct: 0,
      active: true
    }
  ];
}

// Fallback extras data
function getFallbackExtrasData() {
  return [
    {
      id: 'fallback-extra-1',
      name: 'Inside Refrigerator',
      description: 'Deep clean inside refrigerator including shelves and drawers',
      price_cents: 2500,
      price: 25.00
    },
    {
      id: 'fallback-extra-2',
      name: 'Inside Oven',
      description: 'Clean inside oven including racks and door',
      price_cents: 3000,
      price: 30.00
    },
    {
      id: 'fallback-extra-3',
      name: 'Laundry Service',
      description: 'Wash, dry, and fold one load of laundry',
      price_cents: 2000,
      price: 20.00
    },
    {
      id: 'fallback-extra-4',
      name: 'Garage Cleaning',
      description: 'Clean garage floor and organize items',
      price_cents: 4000,
      price: 40.00
    }
  ];
}