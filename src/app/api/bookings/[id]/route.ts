import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params;
    
    if (!bookingId) {
      return NextResponse.json({ 
        error: "booking_not_found",
        message: "Booking ID is required" 
      }, { status: 400 });
    }

    // Create server client that reads cookies for authentication
    const supabase = await createSupabaseServer();

    // Get the current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      return NextResponse.json({
        error: "authentication_required",
        message: "Please sign in to access booking details"
      }, { status: 401 });
    }

    const customerId = session.user.id;

    // Fetch booking with ownership check
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        id,
        customer_id,
        total_price,
        status,
        created_at,
        updated_at,
        service_id,
        suburb_id,
        bedroom_count,
        bathroom_count,
        selected_date,
        selected_time,
        address,
        postcode,
        special_instructions,
        cleaner_id,
        auto_assign,
        services (name),
        suburbs (name),
        payments (
          id,
          status,
          reference,
          amount_minor,
          created_at
        )
      `)
      .eq('id', bookingId)
      .eq('customer_id', customerId) // Ownership filter
      .single();

    if (bookingError) {
      if (bookingError.code === 'PGRST116') {
        return NextResponse.json({ 
          error: "booking_not_found",
          message: "Booking not found or access denied" 
        }, { status: 404 });
      }
      
      logger.error('Error fetching booking:', bookingError);
      return NextResponse.json({ 
        error: "fetch_failed",
        message: "Failed to fetch booking details" 
      }, { status: 500 });
    }

    if (!booking) {
      return NextResponse.json({ 
        error: "booking_not_found",
        message: "Booking not found or access denied" 
      }, { status: 404 });
    }

    // Return the booking data
    return NextResponse.json({
      success: true,
      booking: booking
    }, { status: 200 });

  } catch (error) {
    logger.error("Error in GET /api/bookings/[id]:", error);
    
    return NextResponse.json({
      error: "internal_error",
      message: "Internal server error"
    }, { status: 500 });
  }
}
