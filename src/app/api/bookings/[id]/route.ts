import { createSupabaseServer } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServer()
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: bookingId } = await params

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Fetch the booking with related data (enhanced for new booking flow)
    const { data: booking, error: fetchError } = await supabase
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
        ),
        booking_items (
          id,
          service_item_id,
          item_type,
          qty,
          unit_price,
          subtotal
        )
      `)
      .eq('id', bookingId as string)
      .single()

    if (fetchError) {
      console.error('Error fetching booking:', fetchError)
      
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch booking' },
        { status: 500 }
      )
    }

    // Additional security check - ensure user owns this booking or is admin
    if (booking.customer_id !== user.id) {
      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        )
      }
    }

    // Transform the data for the frontend (enhanced format for new booking flow)
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
        name: user.user_metadata?.full_name || user.email || 'Unknown',
        email: user.email || '',
        phone: user.user_metadata?.phone || '',
      },
      // Include original booking_items for backward compatibility
      booking_items: booking.booking_items || []
    };

    return NextResponse.json({ booking: transformedBooking })

  } catch (error) {
    console.error('Unexpected error in booking GET API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServer()
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: bookingId } = await params
    const updates = await request.json()

    // First, check if the booking exists and user has access
    const { data: existingBooking, error: fetchError } = await supabase
      .from('bookings')
      .select('customer_id, status')
      .eq('id', bookingId as string)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to fetch booking' },
        { status: 500 }
      )
    }

    // Check if user owns this booking or is admin
    if (existingBooking.customer_id !== user.id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        )
      }
    }

    // Only allow updates to DRAFT or READY_FOR_PAYMENT bookings
    if (!['DRAFT', 'READY_FOR_PAYMENT'].includes(existingBooking.status)) {
      return NextResponse.json(
        { error: 'Cannot update booking in current status' },
        { status: 400 }
      )
    }

    // Update the booking
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId as string)
      .select(`
        *,
        booking_items (
          id,
          service_item_id,
          item_type,
          qty,
          unit_price,
          subtotal
        )
      `)
      .single()

    if (updateError) {
      console.error('Error updating booking:', updateError)
      return NextResponse.json(
        { error: 'Failed to update booking' },
        { status: 500 }
      )
    }

    return NextResponse.json({ booking: updatedBooking })

  } catch (error) {
    console.error('Unexpected error in booking PUT API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}