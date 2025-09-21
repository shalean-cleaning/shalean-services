import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createSupabaseServer();
    
    // Since service_categories table was removed in PRD migration,
    // we'll return a flat structure with services grouped by type
    const { data: services, error: servicesErr } = await supabase
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

    if (servicesErr) {
      console.error('Error fetching services:', servicesErr);
      return NextResponse.json({ error: servicesErr.message }, { status: 500 });
    }

    // Create mock categories based on service names for backward compatibility
    const categories = [
      {
        id: 'standard-cleaning',
        name: 'Standard Cleaning',
        description: 'Regular home cleaning services',
        icon: 'home',
        sort_order: 0
      },
      {
        id: 'deep-cleaning',
        name: 'Deep Cleaning',
        description: 'Intensive clean including hard-to-reach areas',
        icon: 'sparkles',
        sort_order: 1
      },
      {
        id: 'move-in-out',
        name: 'Move-In/Out Cleaning',
        description: 'Pre/post move deep clean',
        icon: 'truck',
        sort_order: 2
      },
      {
        id: 'post-construction',
        name: 'Post-Construction',
        description: 'Dust & residue removal after builds',
        icon: 'construction',
        sort_order: 3
      },
      {
        id: 'airbnb',
        name: 'Airbnb/Short-Let',
        description: 'Turnover cleaning for hosts',
        icon: 'apartment',
        sort_order: 4
      }
    ];

    return NextResponse.json({ 
      categories,
      services: services ?? []
    });
  } catch (error) {
    console.error('Error in service-categories API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
