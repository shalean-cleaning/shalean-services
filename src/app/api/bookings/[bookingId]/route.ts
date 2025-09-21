import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const { bookingId } = params;
    
    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServer();

    // Get customer from session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const customerId = session.user.id;

    // Fetch booking with related data
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        services (
          id,
          name,
          description,
          base_fee
        ),
        cleaners (
          id,
          name,
          phone
        ),
        suburbs (
          id,
          name,
          postcode
        )
      `)
      .eq('id', bookingId)
      .eq('customer_id', customerId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Transform the data for the frontend
    const transformedBooking = {
      id: booking.id,
      status: booking.status,
      total_price: booking.total_price,
      booking_date: booking.booking_date,
      start_time: booking.start_time,
      end_time: booking.end_time,
      address: booking.address,
      postcode: booking.postcode,
      bedrooms: booking.bedrooms,
      bathrooms: booking.bathrooms,
      special_instructions: booking.special_instructions,
      service: {
        name: booking.services?.name || 'Unknown Service',
        description: booking.services?.description || '',
      },
      cleaner: booking.cleaners ? {
        name: booking.cleaners.name,
        phone: booking.cleaners.phone,
      } : null,
      customer: {
        name: session.user.user_metadata?.full_name || session.user.email || 'Unknown',
        email: session.user.email || '',
        phone: session.user.user_metadata?.phone || '',
      },
    };

    return NextResponse.json({ booking: transformedBooking });
  } catch (error) {
    console.error('Booking fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
