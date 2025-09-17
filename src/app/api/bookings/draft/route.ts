import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const supabase = await createClient()
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user already has a DRAFT booking
    const { data: existingDraft, error: fetchError } = await supabase
      .from('bookings')
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
      .eq('customer_id', user.id)
      .eq('status', 'DRAFT')
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching existing draft:', fetchError)
      return NextResponse.json(
        { error: 'Failed to check for existing draft' },
        { status: 500 }
      )
    }

    // If draft exists, return it
    if (existingDraft) {
      // Save booking ID to httpOnly cookie
      const cookieStore = await cookies()
      cookieStore.set('booking-draft-id', existingDraft.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
      })

      return NextResponse.json({
        booking: existingDraft,
        isNew: false
      })
    }

    // Create new DRAFT booking
    const { data: newBooking, error: createError } = await supabase
      .from('bookings')
        .insert({
        customer_id: user.id,
        suburb_id: '00000000-0000-0000-0000-000000000000', // Placeholder - will be updated
        service_id: '00000000-0000-0000-0000-000000000000', // Placeholder - will be updated
        booking_date: new Date().toISOString().split('T')[0],
        start_time: '09:00',
        end_time: '11:00',
        status: 'DRAFT',
        total_price: 0,
        auto_assign: true
      })
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

      if (createError) {
      console.error('Error creating draft booking:', createError)
      return NextResponse.json(
        { error: 'Failed to create draft booking' },
        { status: 500 }
      )
    }

    // Save booking ID to httpOnly cookie
    const cookieStore = await cookies()
    cookieStore.set('booking-draft-id', newBooking.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })
      
      return NextResponse.json({
      booking: newBooking,
      isNew: true
    })

  } catch (error) {
    console.error('Unexpected error in draft API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get draft booking from cookie
    const cookieStore = await cookies()
    const bookingId = cookieStore.get('booking-draft-id')?.value

    if (!bookingId) {
      return NextResponse.json(
        { error: 'No draft booking found' },
        { status: 404 }
      )
    }

    // Fetch the booking with items
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
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
      .eq('id', bookingId)
      .eq('customer_id', user.id)
      .eq('status', 'DRAFT')
      .single()

    if (fetchError) {
      console.error('Error fetching draft booking:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch draft booking' },
        { status: 500 }
      )
    }

    return NextResponse.json({ booking })

  } catch (error) {
    console.error('Unexpected error in draft GET API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}