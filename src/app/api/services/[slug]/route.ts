import { NextRequest, NextResponse } from 'next/server';

import { supabaseAdmin } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Fetch service by slug
    const { data: service, error: serviceError } = await supabaseAdmin()
      .from('services')
      .select(`
        *,
        service_categories (
          id,
          name,
          description,
          icon
        )
      `)
      .eq('is_active', true)
      .eq('slug', slug)
      .single();

    if (serviceError || !service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Fetch available extras
    const { data: extras, error: extrasError } = await supabaseAdmin()
      .from('extras')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (extrasError) {
      console.error('Error fetching extras:', extrasError);
    }

    // Fetch pricing rules for this service
    const { data: pricingRules, error: pricingError } = await supabaseAdmin()
      .from('pricing_rules')
      .select('*')
      .eq('is_active', true);

    if (pricingError) {
      console.error('Error fetching pricing rules:', pricingError);
    }

    return NextResponse.json({
      service,
      extras: extras || [],
      pricingRules: pricingRules || [],
    });

  } catch (error) {
    console.error('Error in service API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
