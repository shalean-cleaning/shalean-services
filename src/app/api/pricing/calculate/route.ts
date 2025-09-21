import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

interface PricingRequest {
  serviceId: string;
  bedrooms: number;
  bathrooms: number;
  extras: Array<{
    id: string;
    quantity: number;
  }>;
  suburbId?: string;
}

interface PricingResponse {
  basePrice: number;
  totalPrice: number;
  deliveryFee: number;
  serviceFee: number;
  discounts: number;
  breakdown: {
    baseService: number;
    bedrooms: number;
    bathrooms: number;
    extras: number;
    deliveryFee: number;
    serviceFee: number;
    discounts: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: PricingRequest = await request.json();
    const { serviceId, bedrooms, bathrooms, extras, suburbId } = body;

    if (!serviceId) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServer();

    // Fetch service pricing
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('id, base_fee, per_bedroom, per_bathroom, service_fee_flat, service_fee_pct')
      .eq('id', serviceId)
      .single();

    if (serviceError || !service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Fetch delivery fee for suburb
    let deliveryFee = 0;
    if (suburbId) {
      const { data: suburb } = await supabase
        .from('suburbs')
        .select('delivery_fee')
        .eq('id', suburbId)
        .single();
      
      deliveryFee = suburb?.delivery_fee || 0;
    }

    // Fetch extras pricing
    let extrasTotal = 0;
    if (extras.length > 0) {
      const extraIds = extras.map(e => e.id);
      const { data: extrasData } = await supabase
        .from('extras')
        .select('id, price')
        .in('id', extraIds);

      if (extrasData) {
        extrasTotal = extras.reduce((total, extra) => {
          const extraData = extrasData.find(e => e.id === extra.id);
          return total + ((extraData?.price || 0) * extra.quantity);
        }, 0);
      }
    }

    // Calculate pricing breakdown
    const baseService = service.base_fee || 0;
    const perBedroom = service.per_bedroom || 20;
    const perBathroom = service.per_bathroom || 15;
    
    const bedroomsCost = Math.max(0, bedrooms - 1) * perBedroom;
    const bathroomsCost = Math.max(0, bathrooms - 1) * perBathroom;
    
    const serviceFeeFlat = service.service_fee_flat || 0;
    const serviceFeePct = service.service_fee_pct || 0;
    
    const subtotal = baseService + bedroomsCost + bathroomsCost + extrasTotal + deliveryFee;
    const serviceFee = serviceFeeFlat + (subtotal * serviceFeePct / 100);
    
    // Apply discounts (for now, no discounts)
    const discounts = 0;
    
    const totalPrice = subtotal + serviceFee - discounts;

    const response: PricingResponse = {
      basePrice: baseService,
      totalPrice,
      deliveryFee,
      serviceFee,
      discounts,
      breakdown: {
        baseService,
        bedrooms: bedroomsCost,
        bathrooms: bathroomsCost,
        extras: extrasTotal,
        deliveryFee,
        serviceFee,
        discounts,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Pricing calculation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
