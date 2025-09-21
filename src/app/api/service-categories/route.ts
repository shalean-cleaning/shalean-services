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

    // Fetch categories from database if available, otherwise return empty array
    let categories: any[] = [];
    
    try {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('service_categories')
        .select('id, name, description, icon, sort_order')
        .eq('active', true)
        .order('sort_order');

      if (!categoriesError && categoriesData) {
        categories = categoriesData;
      }
    } catch (error) {
      console.warn('Service categories table not available:', error);
    }

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
