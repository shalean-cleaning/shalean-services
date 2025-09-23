import { createSupabaseServer } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { logger } from '@/lib/logger'

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
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })
  }
  
  return sessionId
}

async function handleDraftPost(request: Request): Promise<NextResponse> {
  const requestId = Math.random().toString(36).substring(2, 15);
  const endpoint = '/api/bookings/draft';
  
  logger.apiRequest(endpoint, 'POST', requestId);

  let customerId = null;
  let sessionId = null;
  let requestData: any;

  try {
    const supabase = await createSupabaseServer()
    
    // Check for Authorization header (Bearer token)
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const { data: { user }, error: authError } = await supabase.auth.getUser(token)
      
      if (authError || !user) {
        logger.apiResponse(endpoint, 'POST', requestId, 401, { error: 'Invalid token' });
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
      
        customerId = user.id
      } else {
        // Guest user - get or create session ID
        sessionId = await getOrCreateSessionId()
    }

    // Parse request body
    try {
      requestData = await request.json()
    } catch (parseError) {
      logger.apiResponse(endpoint, 'POST', requestId, 400, { error: 'Invalid JSON' });
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

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

    // If we get a "not found" error, that's actually good - it means no draft exists
    // But if we get any other error, that's a problem
    if (fetchError && fetchError.code !== 'PGRST116') {
      logger.apiResponse(endpoint, 'POST', requestId, 500, { error: 'Database error', details: fetchError });
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // If we found an existing draft, return it
    if (existingDraft) {
      const response = {
        success: true,
        booking: existingDraft,
        message: 'Existing draft booking found'
      };
      logger.apiResponse(endpoint, 'POST', requestId, 200, response);
      return NextResponse.json(response);
    }

    // Create new DRAFT booking with minimal required data
    const insertData: any = {
      status: 'DRAFT',
      booking_date: new Date().toISOString().split('T')[0], // Default to today
      start_time: '09:00', // Default start time
      end_time: '11:00', // Default end time
      total_price: 0 // Default price
    }

    // Add customer_id or session_id
    if (customerId) {
      insertData.customer_id = customerId
    } else if (sessionId) {
      insertData.session_id = sessionId
    }

    // Add optional fields if provided
    if (requestData.serviceId) insertData.service_id = requestData.serviceId
    if (requestData.suburbId) insertData.area_id = requestData.suburbId
    if (requestData.bookingDate) insertData.booking_date = requestData.bookingDate
    if (requestData.startTime) insertData.start_time = requestData.startTime
    if (requestData.endTime) insertData.end_time = requestData.endTime
    if (requestData.postcode) insertData.postcode = requestData.postcode
    if (requestData.bedrooms !== undefined) insertData.bedrooms = requestData.bedrooms
    if (requestData.bathrooms !== undefined) insertData.bathrooms = requestData.bathrooms
    if (requestData.additionalServices) insertData.additional_services = requestData.additionalServices
    if (requestData.specialInstructions) insertData.special_instructions = requestData.specialInstructions

    // Insert the new draft booking
    const { data: newBooking, error: insertError } = await supabase
      .from('bookings')
      .insert(insertData)
      .select()
      .single()

    if (insertError) {
      logger.apiResponse(endpoint, 'POST', requestId, 500, { error: 'Failed to create draft booking', details: insertError });
      return NextResponse.json({ error: 'Failed to create draft booking' }, { status: 500 });
    }

    const response = {
      success: true,
      booking: newBooking,
      message: 'Draft booking created successfully'
    };

    logger.apiResponse(endpoint, 'POST', requestId, 201, response);
    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Draft POST error:', error);
    logger.apiResponse(endpoint, 'POST', requestId, 500, { error: 'Internal server error' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleDraftGet(request: Request): Promise<NextResponse> {
  const requestId = Math.random().toString(36).substring(2, 15);
  const endpoint = '/api/bookings/draft';
  
  logger.apiRequest(endpoint, 'GET', requestId);

  let customerId = null;
  let sessionId = null;

  try {
    const supabase = await createSupabaseServer()
    
    // Check for Authorization header (Bearer token)
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const { data: { user }, error: authError } = await supabase.auth.getUser(token)
      
      if (authError || !user) {
        logger.apiResponse(endpoint, 'GET', requestId, 401, { error: 'Invalid token' });
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
      
        customerId = user.id
      } else {
      // Guest user - get or create session ID
        sessionId = await getOrCreateSessionId()
    }

    // Simple response for now
    const response = {
      success: true,
      message: 'Draft GET endpoint working with auth',
      customerId,
      sessionId,
      timestamp: new Date().toISOString(),
    };

    logger.apiResponse(endpoint, 'GET', requestId, 200, response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('Draft GET error:', error);
    logger.apiResponse(endpoint, 'GET', requestId, 500, { error: 'Internal server error' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export { handleDraftPost as POST, handleDraftGet as GET }