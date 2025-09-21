import { createSupabaseServer } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { env } from '@/env.server'
import { updateBookingTotalPrice } from '@/lib/validation/price-calculation'
import { getCurrentBookingStep } from '@/lib/validation/booking-validation'

// Helper function to generate session ID for guest users
function generateSessionId(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// Helper function to get or create session ID for guest users
async function getOrCreateSessionId(): Promise<string> {
  const cookieStore = await cookies()
  let sessionId = cookieStore.get('booking-session-id')?.value
  
  if (!sessionId) {
    sessionId = generateSessionId()
    cookieStore.set('booking-session-id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })
  }
  
  return sessionId
}

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServer()
    
    // Check if Supabase is properly configured
    if (env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') || 
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.includes('placeholder')) {
      console.error('Supabase not configured - using placeholder values')
      return NextResponse.json(
        { 
          error: 'Database not configured',
          details: 'Supabase environment variables are not set correctly'
        },
        { status: 503 }
      )
    }
    
    // Check for Authorization header (Bearer token) - optional for guest bookings
    const authHeader = request.headers.get('authorization')
    let user = null
    let customerId = null
    let sessionId = null
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Handle Bearer token authentication
      const token = authHeader.substring(7)
      const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(token)
      
      if (!tokenError && tokenUser) {
        user = tokenUser
        customerId = user.id
      }
    } else {
      // Handle cookie-based authentication (existing flow)
      const { data: { user: cookieUser }, error: authError } = await supabase.auth.getUser()
      
      if (!authError && cookieUser) {
        user = cookieUser
        customerId = user.id
      } else {
        // Guest user - get or create session ID
        sessionId = await getOrCreateSessionId()
      }
    }

    // Parse request body
    let requestData;
    try {
      requestData = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    // For DRAFT creation, we only need customer_id OR session_id
    // Other fields are optional and can be added later

    // Check if user already has a DRAFT booking
    let existingDraft = null
    let fetchError = null
    
    if (customerId) {
      // Authenticated user - check by customer_id
      const result = await supabase
        .from('bookings')
        .select('*')
        .eq('customer_id', customerId)
        .eq('status', 'DRAFT')
        .single()
      existingDraft = result.data
      fetchError = result.error
    } else if (sessionId) {
      // Guest user - check by session_id
      const result = await supabase
        .from('bookings')
        .select('*')
        .eq('session_id', sessionId)
        .eq('status', 'DRAFT')
        .single()
      existingDraft = result.data
      fetchError = result.error
    }

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching existing draft:', {
        error: fetchError,
        errorCode: fetchError.code,
        errorMessage: fetchError.message,
        userId: customerId,
        supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        isPlaceholderUrl: env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')
      })
      return NextResponse.json(
        { 
          error: 'Failed to check for existing draft',
          details: process.env.NODE_ENV === 'development' ? fetchError.message : undefined
        },
        { status: 500 }
      )
    }

    // If draft exists, update it with new data
    if (existingDraft) {
      const updateData: any = {
        updated_at: new Date().toISOString()
      }

      // Only update fields that are provided in the request
      if (requestData.serviceId) updateData.service_id = requestData.serviceId
      if (requestData.suburbId) updateData.area_id = requestData.suburbId
      if (requestData.bookingDate) updateData.booking_date = requestData.bookingDate
      if (requestData.startTime) updateData.start_time = requestData.startTime
      if (requestData.endTime) updateData.end_time = requestData.endTime
      if (requestData.address) updateData.address = requestData.address
      if (requestData.postcode) updateData.postcode = requestData.postcode
      if (requestData.bedrooms !== undefined) updateData.bedrooms = requestData.bedrooms
      if (requestData.bathrooms !== undefined) updateData.bathrooms = requestData.bathrooms
      if (requestData.specialInstructions) updateData.special_instructions = requestData.specialInstructions
      if (requestData.autoAssign !== undefined) updateData.auto_assign = requestData.autoAssign

      // Update the booking first
      const { data: updatedBooking, error: updateError } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', existingDraft.id)
        .select('*')
        .single()

      if (updateError) {
        console.error('Error updating draft booking:', updateError)
        return NextResponse.json(
          { error: 'Failed to update draft booking' },
          { status: 500 }
        )
      }

      // Calculate and update total_price if we have enough data
      const priceResult = await updateBookingTotalPrice(supabase, updatedBooking)
      if (!priceResult.success) {
        console.warn('Failed to calculate total price:', priceResult.error)
        // Don't fail the request, just log the warning
      }

      // Get the updated booking with calculated price
      const { data: finalBooking, error: finalError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', existingDraft.id)
        .single()

      if (finalError) {
        console.error('Error fetching updated booking:', finalError)
        return NextResponse.json(
          { error: 'Failed to fetch updated booking' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        booking: finalBooking,
        isNew: false,
        currentStep: getCurrentBookingStep(finalBooking),
        priceCalculated: priceResult.success
      })
    }

    // Create new DRAFT booking with minimal required data
    const insertData: any = {
      status: 'DRAFT',
      booking_date: new Date().toISOString().split('T')[0], // Default to today
      start_time: '09:00', // Default start time
      end_time: '11:00', // Default end time
      total_price: 0 // Default price
    }

    // Set customer_id or session_id (at least one is required)
    if (customerId) {
      insertData.customer_id = customerId
    } else if (sessionId) {
      insertData.session_id = sessionId
    } else {
      return NextResponse.json(
        { error: 'Either customer authentication or session is required' },
        { status: 401 }
      )
    }

    // Add optional fields if provided
    if (requestData.serviceId) insertData.service_id = requestData.serviceId
    if (requestData.suburbId) insertData.area_id = requestData.suburbId
    if (requestData.bookingDate) insertData.booking_date = requestData.bookingDate
    if (requestData.startTime) insertData.start_time = requestData.startTime
    if (requestData.endTime) insertData.end_time = requestData.endTime
    if (requestData.address) insertData.address = requestData.address
    if (requestData.postcode) insertData.postcode = requestData.postcode
    if (requestData.bedrooms !== undefined) insertData.bedrooms = requestData.bedrooms
    if (requestData.bathrooms !== undefined) insertData.bathrooms = requestData.bathrooms
    if (requestData.specialInstructions) insertData.special_instructions = requestData.specialInstructions

    const { data: newBooking, error: createError } = await supabase
      .from('bookings')
      .insert(insertData)
      .select('*')
      .single()

    if (createError) {
      console.error('Error creating draft booking:', createError)
      return NextResponse.json(
        { error: 'Failed to create draft booking' },
        { status: 500 }
      )
    }

    // Calculate and update total_price if we have enough data
    const priceResult = await updateBookingTotalPrice(supabase, newBooking)
    if (!priceResult.success) {
      console.warn('Failed to calculate total price for new booking:', priceResult.error)
      // Don't fail the request, just log the warning
    }

    // Get the final booking with calculated price
    const { data: finalBooking, error: finalError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', newBooking.id)
      .single()

    if (finalError) {
      console.error('Error fetching new booking:', finalError)
      return NextResponse.json(
        { error: 'Failed to fetch new booking' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      booking: finalBooking,
      isNew: true,
      currentStep: getCurrentBookingStep(finalBooking),
      priceCalculated: priceResult.success
    })

  } catch (error) {
    console.error('Unexpected error in draft API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createSupabaseServer()
    
    // Check for Authorization header (Bearer token)
    const authHeader = request.headers.get('authorization')
    let user = null
    let customerId = null
    let sessionId = null
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Handle Bearer token authentication
      const token = authHeader.substring(7)
      const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(token)
      
      if (!tokenError && tokenUser) {
        user = tokenUser
        customerId = user.id
      }
    } else {
      // Handle cookie-based authentication (existing flow)
      const { data: { user: cookieUser }, error: authError } = await supabase.auth.getUser()
      
      if (!authError && cookieUser) {
        user = cookieUser
        customerId = user.id
      } else {
        // Guest user - get session ID
        sessionId = await getOrCreateSessionId()
      }
    }

    // Fetch the draft booking
    let booking = null
    let fetchError = null
    
    if (customerId) {
      // Authenticated user - get by customer_id
      const result = await supabase
        .from('bookings')
        .select('*')
        .eq('customer_id', customerId)
        .eq('status', 'DRAFT')
        .single()
      booking = result.data
      fetchError = result.error
    } else if (sessionId) {
      // Guest user - get by session_id
      const result = await supabase
        .from('bookings')
        .select('*')
        .eq('session_id', sessionId)
        .eq('status', 'DRAFT')
        .single()
      booking = result.data
      fetchError = result.error
    }

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching draft booking:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch draft booking' },
        { status: 500 }
      )
    }

    if (!booking) {
      return NextResponse.json(
        { error: 'No draft booking found' },
        { status: 404 }
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