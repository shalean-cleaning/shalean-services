import { createSupabaseServer } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
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

    // Parse request body
    let requestData;
    try {
      requestData = await request.json()
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!requestData.serviceId || !requestData.suburbId) {
      return NextResponse.json(
        { error: 'Service and suburb selection are required' },
        { status: 422 }
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

    // If draft exists, update it with new data
    if (existingDraft) {
      const updateData: any = {
        service_id: requestData.serviceId,
        suburb_id: requestData.suburbId,
        total_price: requestData.totalPrice || 0,
        updated_at: new Date().toISOString()
      }

      // Add optional fields if provided
      if (requestData.bookingDate) updateData.booking_date = requestData.bookingDate
      if (requestData.startTime) updateData.start_time = requestData.startTime
      if (requestData.address) updateData.address = requestData.address
      if (requestData.postcode) updateData.postcode = requestData.postcode
      if (requestData.bedrooms !== undefined) updateData.bedrooms = requestData.bedrooms
      if (requestData.bathrooms !== undefined) updateData.bathrooms = requestData.bathrooms
      if (requestData.specialInstructions) updateData.special_instructions = requestData.specialInstructions
      if (requestData.autoAssign !== undefined) updateData.auto_assign = requestData.autoAssign

      const { data: updatedBooking, error: updateError } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', existingDraft.id)
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
        console.error('Error updating draft booking:', updateError)
        return NextResponse.json(
          { error: 'Failed to update draft booking' },
          { status: 500 }
        )
      }

      // Save booking ID to httpOnly cookie
      const cookieStore = await cookies()
      cookieStore.set('booking-draft-id', updatedBooking.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
      })

      return NextResponse.json({
        booking: updatedBooking,
        isNew: false
      })
    }

    // Create new DRAFT booking with provided data
    const insertData: any = {
      customer_id: user.id,
      service_id: requestData.serviceId,
      suburb_id: requestData.suburbId,
      booking_date: requestData.bookingDate || new Date().toISOString().split('T')[0],
      start_time: requestData.startTime || '09:00',
      end_time: requestData.endTime || '11:00',
      status: 'DRAFT',
      total_price: requestData.totalPrice || 0,
      auto_assign: requestData.autoAssign !== undefined ? requestData.autoAssign : true
    }

    // Add optional fields if provided
    if (requestData.address) insertData.address = requestData.address
    if (requestData.postcode) insertData.postcode = requestData.postcode
    if (requestData.bedrooms !== undefined) insertData.bedrooms = requestData.bedrooms
    if (requestData.bathrooms !== undefined) insertData.bathrooms = requestData.bathrooms
    if (requestData.specialInstructions) insertData.special_instructions = requestData.specialInstructions

    const { data: newBooking, error: createError } = await supabase
      .from('bookings')
      .insert(insertData)
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
    const supabase = await createSupabaseServer()
    
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