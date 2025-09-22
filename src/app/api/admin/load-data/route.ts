import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/server';

/**
 * Admin API route to load and display all Supabase data
 * This endpoint provides a comprehensive view of all data in the database
 */

export async function GET() {
  try {
    const supabase = createSupabaseAdmin();
    
    // Test connection
    const { data: testData, error: testError } = await supabase
      .from('service_categories')
      .select('count')
      .limit(1);
    
    if (testError) {
      return NextResponse.json({ 
        error: 'Connection failed', 
        details: testError.message 
      }, { status: 500 });
    }
    
    // Define tables to query with their columns
    const tables = [
      { 
        name: 'service_categories', 
        columns: 'id, name, slug, description, icon, sort_order, created_at' 
      },
      { 
        name: 'services', 
        columns: 'id, category_id, name, slug, description, base_price, base_price_cents, duration_minutes, sort_order, created_at' 
      },
      { 
        name: 'service_items', 
        columns: 'id, service_id, name, description, price, sort_order, created_at' 
      },
      { 
        name: 'extras', 
        columns: 'id, name, slug, description, price, price_cents, sort_order, created_at' 
      },
      { 
        name: 'regions', 
        columns: 'id, name, slug, description, sort_order, created_at' 
      },
      { 
        name: 'suburbs', 
        columns: 'id, region_id, name, slug, postcode, sort_order, created_at' 
      },
      { 
        name: 'areas', 
        columns: 'id, suburb_id, name, description, sort_order, created_at' 
      },
      { 
        name: 'cleaners', 
        columns: 'id, user_id, first_name, last_name, email, phone, bio, experience_years, hourly_rate, is_available, rating, total_reviews, profile_image_url, created_at' 
      },
      { 
        name: 'bookings', 
        columns: 'id, customer_id, session_id, cleaner_id, area_id, service_id, service_slug, region_id, booking_date, start_time, end_time, status, total_price, notes, special_instructions, auto_assign, address, postcode, bedrooms, bathrooms, paystack_ref, paystack_status, created_at' 
      },
      { 
        name: 'booking_extras', 
        columns: 'id, booking_id, extra_id, quantity, price, created_at' 
      },
      { 
        name: 'testimonials', 
        columns: 'id, customer_name, customer_email, rating, review_text, service_type, is_featured, is_approved, created_at' 
      },
      { 
        name: 'blog_posts', 
        columns: 'id, title, slug, excerpt, content, featured_image_url, author_name, author_email, is_published, published_at, created_at' 
      },
      { 
        name: 'frequency_discounts', 
        columns: 'id, name, frequency_weeks, discount_percentage, is_active, created_at' 
      },
      { 
        name: 'profiles', 
        columns: 'id, first_name, last_name, phone, avatar_url, created_at' 
      }
    ];
    
    // Load data from all tables
    const results: Record<string, any> = {};
    const summary: Record<string, number> = {};
    
    for (const table of tables) {
      try {
        // Get data
        const { data, error } = await supabase
          .from(table.name)
          .select(table.columns)
          .order('created_at');
        
        if (error) {
          results[table.name] = { error: error.message };
          summary[table.name] = 0;
        } else {
          results[table.name] = data || [];
          summary[table.name] = data?.length || 0;
        }
        
        // Get count
        const { count, error: countError } = await supabase
          .from(table.name)
          .select('*', { count: 'exact', head: true });
        
        if (!countError) {
          summary[table.name] = count || 0;
        }
        
      } catch (err) {
        results[table.name] = { error: (err as Error).message };
        summary[table.name] = 0;
      }
    }
    
    return NextResponse.json({
      success: true,
      connection: 'Connected successfully',
      timestamp: new Date().toISOString(),
      summary,
      data: results
    });
    
  } catch (error) {
    console.error('Error in load-data API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: (error as Error).message 
    }, { status: 500 });
  }
}
