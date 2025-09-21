import { createSupabaseServer } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { env } from '@/env.server'
import { updateBookingTotalPrice } from '@/lib/validation/price-calculation'
import { getCurrentBookingStep } from '@/lib/validation/booking-validation'
import { ApiErrorHandler, withErrorHandler, createSuccessResponse } from '@/lib/api-error-handler'
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
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })
  }
  
  return sessionId
}

async function handleDraftPost(request: Request): Promise<NextResponse> {
  const requestId = Math.random().toString(36).substring(2, 15);
  const endpoint = '/api/bookings/draft';
  
  logger.apiRequest(endpoint, 'POST', requestId);

  try {
    const supabase = await createSupabaseServer()
    
    // Environment variables are now validated at startup, so if we reach here they should be valid
    // But we'll add a safety check just in case
    if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw ApiErrorHandler.databaseError('Supabase environment variables are missing');
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
      throw ApiErrorHandler.validationError('Invalid JSON in request body');
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
      logger.databaseError(fetchError, 'SELECT bookings WHERE customer_id/session_id', requestId);
      throw ApiErrorHandler.databaseError('Failed to check for existing draft', {
        errorCode: fetchError.code,
        errorMessage: fetchError.message,
        userId: customerId,
        sessionId: sessionId,
      });
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
        logger.databaseError(updateError, 'UPDATE bookings', requestId);
        throw ApiErrorHandler.databaseError('Failed to update draft booking', {
          bookingId: existingDraft.id,
          updateData,
        });
      }

      // Calculate and update total_price if we have enough data
      const priceResult = await updateBookingTotalPrice(supabase, updatedBooking)
      if (!priceResult.success) {
        logger.warn('Failed to calculate total price for updated booking', {
          requestId,
          bookingId: existingDraft.id,
          error: priceResult.error,
        });
        // Don't fail the request, just log the warning
      }

      // Get the updated booking with calculated price
      const { data: finalBooking, error: finalError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', existingDraft.id)
        .single()

      if (finalError) {
        logger.databaseError(finalError, 'SELECT bookings WHERE id', requestId);
        throw ApiErrorHandler.databaseError('Failed to fetch updated booking', {
          bookingId: existingDraft.id,
        });
      }

      const response = {
        booking: finalBooking,
        isNew: false,
        currentStep: getCurrentBookingStep(finalBooking),
        priceCalculated: priceResult.success
      };

      logger.apiResponse(endpoint, 'POST', requestId, 200, { bookingId: finalBooking.id, isNew: false });
      return createSuccessResponse(response);
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
      throw ApiErrorHandler.unauthorizedError('Either customer authentication or session is required');
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
      logger.databaseError(createError, 'INSERT bookings', requestId);
      throw ApiErrorHandler.databaseError('Failed to create draft booking', {
        insertData,
        customerId,
        sessionId,
      });
    }

    // Calculate and update total_price if we have enough data
    const priceResult = await updateBookingTotalPrice(supabase, newBooking)
    if (!priceResult.success) {
      logger.warn('Failed to calculate total price for new booking', {
        requestId,
        bookingId: newBooking.id,
        error: priceResult.error,
      });
      // Don't fail the request, just log the warning
    }

    // Get the final booking with calculated price
    const { data: finalBooking, error: finalError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', newBooking.id)
      .single()

    if (finalError) {
      logger.databaseError(finalError, 'SELECT bookings WHERE id', requestId);
      throw ApiErrorHandler.databaseError('Failed to fetch new booking', {
        bookingId: newBooking.id,
      });
    }
    
    const response = {
      booking: finalBooking,
      isNew: true,
      currentStep: getCurrentBookingStep(finalBooking),
      priceCalculated: priceResult.success
    };

    logger.apiResponse(endpoint, 'POST', requestId, 200, { bookingId: finalBooking.id, isNew: true });
    return createSuccessResponse(response);

  } catch (error) {
    // Extract context for error handling
    const context = {
      endpoint,
      method: 'POST',
      userId: customerId,
      sessionId: sessionId,
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      body: requestData,
      headers: Object.fromEntries(request.headers.entries()),
    };

    return ApiErrorHandler.handle(error, context);
  }
}

// Export the wrapped handler
export const POST = withErrorHandler(handleDraftPost, '/api/bookings/draft');

async function handleDraftGet(request: Request): Promise<NextResponse> {
  const requestId = Math.random().toString(36).substring(2, 15);
  const endpoint = '/api/bookings/draft';
  
  logger.apiRequest(endpoint, 'GET', requestId);

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
      logger.databaseError(fetchError, 'SELECT bookings WHERE customer_id/session_id', requestId);
      throw ApiErrorHandler.databaseError('Failed to fetch draft booking', {
        errorCode: fetchError.code,
        errorMessage: fetchError.message,
        userId: customerId,
        sessionId: sessionId,
      });
    }

    if (!booking) {
      throw ApiErrorHandler.notFoundError('No draft booking found');
    }

    const response = { booking };
    logger.apiResponse(endpoint, 'GET', requestId, 200, { bookingId: booking.id });
    return createSuccessResponse(response);

  } catch (error) {
    // Extract context for error handling
    const context = {
      endpoint,
      method: 'GET',
      userId: customerId,
      sessionId: sessionId,
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      headers: Object.fromEntries(request.headers.entries()),
    };

    return ApiErrorHandler.handle(error, context);
  }
}

// Export the wrapped handler
export const GET = withErrorHandler(handleDraftGet, '/api/bookings/draft');