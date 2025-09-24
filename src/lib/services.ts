import 'server-only';
import { Service } from "@/lib/database.types";
import { logger } from "@/lib/logger";
import { createSupabaseServer } from "@/lib/supabase/server";

// Extended service type with additional computed fields
export type ServiceWithPricing = Service & {
  base_price_cents: number;
  base_price: number;
  per_bedroom: number;
  per_bathroom: number;
  service_fee_flat: number;
  service_fee_pct: number;
};

export async function getServices(): Promise<ServiceWithPricing[]> {
  // For now, return fallback data to avoid Supabase connection issues
  // TODO: Re-enable database queries once Supabase is properly configured
  logger.info("[getServices] Using fallback services data");
  return getFallbackServices();
}

// Fallback services data when database is not accessible
function getFallbackServices(): ServiceWithPricing[] {
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
      active: true,
      created_at: new Date().toISOString()
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
      active: true,
      created_at: new Date().toISOString()
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
      active: true,
      created_at: new Date().toISOString()
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
      active: true,
      created_at: new Date().toISOString()
    }
  ];
}
