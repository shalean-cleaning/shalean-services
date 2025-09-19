import 'server-only';
import { Service } from "@/lib/database.types";
import { logger } from "@/lib/logger";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function getServices(): Promise<Service[]> {
  try {
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
    
    if (svcsErr) {
      logger.error("[getServices] Supabase error:", svcsErr);
      return [];
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
    
    return servicesNormalized;
  } catch (error) {
    logger.error("[getServices] error:", error);
    return [];
  }
}
