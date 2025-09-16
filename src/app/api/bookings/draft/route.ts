import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdmin, createSupabaseServer } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

// Helper function to validate ISO 8601 dates with timezone support
const isValidISODate = (dateString: string): boolean => {
  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && dateString.includes('T');
  } catch {
    return false;
  }
};

// Helper function to normalize ISO date to UTC
const normalizeToUTC = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    return date.toISOString();
  } catch {
    throw new Error(`Invalid ISO date format: ${isoString}`);
  }
};

// Flexible input validation schema for partial updates
const DraftBookingSchema = z.object({
  // Core required fields (can be partial for updates)
  serviceId: z.string().uuid("serviceId must be a valid UUID").optional(),
  regionId: z.string().uuid("regionId must be a valid UUID").optional(),
  suburbId: z.string().uuid("suburbId must be a valid UUID").optional(),
  totalPrice: z.number().positive("totalPrice must be a positive number").optional(),
  
  // Time handling - either bookingDate + startTime OR startISO + endISO
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "bookingDate must be in YYYY-MM-DD format").optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "startTime must be in HH:mm format").optional(),
  startISO: z.string().refine(isValidISODate, "startISO must be a valid ISO 8601 datetime string").optional(),
  endISO: z.string().refine(isValidISODate, "endISO must be a valid ISO 8601 datetime string").optional(),
  
  // Location details
  address: z.string().min(1, "address is required").optional(),
  postcode: z.string().min(1, "postcode is required").optional(),
  
  // Room counts and extras
  bedrooms: z.number().int().min(1, "at least 1 bedroom required").default(1).optional(),
  bathrooms: z.number().int().min(1, "at least 1 bathroom required").default(1).optional(),
  extras: z.array(z.object({
    id: z.string().uuid("extra id must be a valid UUID"),
    quantity: z.number().int().min(1, "quantity must be at least 1").default(1),
    price: z.number().positive("extra price must be positive")
  })).default([]).optional(),
  
  // Optional fields
  specialInstructions: z.string().optional(),
  frequency: z.enum(['one-time', 'weekly', 'bi-weekly', 'monthly']).default('one-time').optional(),
  timezone: z.string().default('Africa/Johannesburg').optional(),
  
  // Cleaner selection
  selectedCleanerId: z.string().uuid("selectedCleanerId must be a valid UUID").optional(),
  autoAssign: z.boolean().default(false).optional()
});

// Schema for complete booking creation (when all required fields are present)
const CompleteBookingSchema = z.object({
  serviceId: z.string().uuid("serviceId must be a valid UUID"),
  suburbId: z.string().uuid("suburbId must be a valid UUID"),
  totalPrice: z.number().positive("totalPrice must be a positive number"),
  address: z.string().min(1, "address is required"),
  postcode: z.string().min(1, "postcode is required"),
  bedrooms: z.number().int().min(1, "at least 1 bedroom required").default(1),
  bathrooms: z.number().int().min(1, "at least 1 bathroom required").default(1),
  extras: z.array(z.object({
    id: z.string().uuid("extra id must be a valid UUID"),
    quantity: z.number().int().min(1, "quantity must be at least 1").default(1),
    price: z.number().positive("extra price must be positive")
  })).default([]),
  specialInstructions: z.string().optional(),
  frequency: z.enum(['one-time', 'weekly', 'bi-weekly', 'monthly']).default('one-time'),
  timezone: z.string().default('Africa/Johannesburg'),
  selectedCleanerId: z.string().uuid("selectedCleanerId must be a valid UUID").optional(),
  autoAssign: z.boolean().default(false),
  // Time handling
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "bookingDate must be in YYYY-MM-DD format").optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "startTime must be in HH:mm format").optional(),
  startISO: z.string().refine(isValidISODate, "startISO must be a valid ISO 8601 datetime string").optional(),
  endISO: z.string().refine(isValidISODate, "endISO must be a valid ISO 8601 datetime string").optional()
}).refine(
  (data) => {
    // Either bookingDate + startTime OR startISO (endISO can be derived) must be provided
    const hasDateAndTime = data.bookingDate && data.startTime;
    const hasStartISO = data.startISO;
    return hasDateAndTime || hasStartISO;
  },
  {
    message: "Missing required scheduling fields. Provide either bookingDate+startTime or startISO",
    path: ["scheduling"]
  }
);

type DraftBookingInput = z.infer<typeof DraftBookingSchema>;

// Session and profile management
async function getOrCreateCustomerProfile(
  supabaseAdmin: ReturnType<typeof createSupabaseAdmin>,
  supabaseServer: Awaited<ReturnType<typeof createSupabaseServer>>
): Promise<{ customerId: string; isGuest: boolean }> {
  try {
    // Get the current session
    const { data: { session }, error: sessionError } = await supabaseServer.auth.getSession();
    
    if (sessionError) {
      logger.error('Session error:', sessionError);
      throw new Error('Authentication failed');
    }

    if (!session?.user) {
      // For now, we'll require authentication
      // In the future, you could implement guest booking here
      throw new Error('Authentication required');
    }

    const userId = session.user.id;
    
    // Check if profile exists
    const { data: existingProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = no rows returned
      logger.error('Profile check error:', profileError);
      throw new Error('Failed to check profile');
    }

    if (!existingProfile) {
      // Create minimal profile if it doesn't exist
      const { data: newProfile, error: createError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          email: session.user.email || '',
          first_name: session.user.user_metadata?.first_name || 'User',
          last_name: session.user.user_metadata?.last_name || '',
          role: 'CUSTOMER'
        })
        .select('id')
        .single();

      if (createError) {
        logger.error('Profile creation error:', createError);
        throw new Error('Failed to create profile');
      }

      logger.info('Created new profile for user:', userId);
      return { customerId: newProfile.id, isGuest: false };
    }

    return { customerId: existingProfile.id, isGuest: false };
  } catch (error) {
    logger.error('Profile management error:', error);
    throw error;
  }
}

// Database validation functions
async function validateDatabaseReferences(
  supabase: ReturnType<typeof createSupabaseAdmin>,
  data: DraftBookingInput
): Promise<{ isValid: boolean; errors: Array<{ field: string; message: string }> }> {
  const errors: Array<{ field: string; message: string }> = [];

  try {
    // Validate serviceId exists in services
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('id')
      .eq('id', data.serviceId)
      .single();

    if (serviceError || !service) {
      errors.push({ field: 'serviceId', message: 'No service found for this serviceId' });
    }

    // Validate suburbId exists in suburbs
    const { data: suburb, error: suburbError } = await supabase
      .from('suburbs')
      .select('id')
      .eq('id', data.suburbId)
      .single();

    if (suburbError || !suburb) {
      errors.push({ field: 'suburbId', message: 'No suburb found for this suburbId' });
    }

    // Validate regionId if provided
    if (data.regionId) {
      const { data: region, error: regionError } = await supabase
        .from('regions')
        .select('id')
        .eq('id', data.regionId)
        .single();

      if (regionError || !region) {
        errors.push({ field: 'regionId', message: 'No region found for this regionId' });
      }
    }

    // Validate extras exist
    if (data.extras.length > 0) {
      const extraIds = data.extras.map(extra => extra.id);
      const { data: extras, error: extrasError } = await supabase
        .from('extras')
        .select('id')
        .in('id', extraIds);

      if (extrasError) {
        errors.push({ field: 'extras', message: 'Failed to validate extras' });
      } else if (extras && extras.length !== extraIds.length) {
        errors.push({ field: 'extras', message: 'One or more extras do not exist' });
      }
    }

    return { isValid: errors.length === 0, errors };
  } catch (error) {
    logger.error('Database validation error:', error);
    return { isValid: false, errors: [{ field: 'database', message: 'Database validation failed' }] };
  }
}

// Timezone-aware date/time utilities
function toAfricaJohannesburgISO(dateStr: string, timeStr: string): { startISO: string; endISO: string } {
  // Combine date and time in Africa/Johannesburg timezone
  const localDateTime = new Date(`${dateStr}T${timeStr}:00`);
  
  // Convert to UTC for storage
  const startISO = localDateTime.toISOString();
  
  // Default duration of 2 hours if not specified
  const endDateTime = new Date(localDateTime.getTime() + (2 * 60 * 60 * 1000));
  const endISO = endDateTime.toISOString();
  
  return { startISO, endISO };
}

function extractDateFromISO(isoString: string): string {
  return new Date(isoString).toISOString().split('T')[0];
}

function extractTimeFromISO(isoString: string): string {
  return new Date(isoString).toISOString().split('T')[1].substring(0, 5);
}

// Server-side pricing computation
async function computeBookingPrice(
  supabase: ReturnType<typeof createSupabaseAdmin>,
  serviceId: string,
  suburbId: string,
  extras: Array<{ id: string; quantity: number; price: number }>
): Promise<{ totalPrice: number; breakdown: any }> {
  try {
    // Convert extras to the format expected by the database function
    const extrasJson = extras.map(extra => ({
      extra_id: extra.id,
      quantity: extra.quantity,
      price: extra.price
    }));

    // Call the database function to calculate price
    const { data: calculatedPrice, error: priceError } = await supabase.rpc('calculate_booking_price', {
      p_service_id: serviceId,
      p_suburb_id: suburbId,
      p_extras: extrasJson
    });

    if (priceError) {
      logger.error("Price calculation error:", priceError);
      throw new Error(`Failed to calculate price: ${priceError.message}`);
    }

    // Get additional pricing details for breakdown
    const { data: serviceData, error: serviceError } = await supabase
      .from('services')
      .select('base_price, name, duration_minutes')
      .eq('id', serviceId)
      .single();

    const { data: suburbData, error: suburbError } = await supabase
      .from('suburbs')
      .select('delivery_fee, name')
      .eq('id', suburbId)
      .single();

    if (serviceError || suburbError) {
      throw new Error('Failed to fetch pricing details');
    }

    // Calculate service fee (10% of base price)
    const serviceFee = serviceData.base_price * 0.10;
    
    // Calculate extras total
    const extrasTotal = extras.reduce((sum, extra) => {
      return sum + (extra.price * extra.quantity);
    }, 0);

    const breakdown = {
      base_price: serviceData.base_price,
      service_fee: serviceFee,
      delivery_fee: suburbData.delivery_fee,
      extras_total: extrasTotal,
      total: calculatedPrice,
      service_name: serviceData.name,
      suburb_name: suburbData.name,
      duration_minutes: serviceData.duration_minutes
    };

    return { totalPrice: calculatedPrice, breakdown };
  } catch (error) {
    logger.error("Pricing computation failed:", error);
    throw error;
  }
}


export async function GET() {
  try {
    const supabaseAdmin = createSupabaseAdmin();
    const supabaseServer = await createSupabaseServer();

    // Get customer profile from session
    let customerId: string;
    try {
      const profileResult = await getOrCreateCustomerProfile(supabaseAdmin, supabaseServer);
      customerId = profileResult.customerId;
    } catch (error) {
      logger.error("Authentication error:", error);
      
      return NextResponse.json({
        success: false,
        error: "NEED_AUTH",
        message: "Please sign in to access your booking draft."
      }, { status: 401 });
    }

    // Find existing draft booking for this customer
    const { data: existingDraft, error: draftError } = await supabaseAdmin
      .from('bookings')
      .select('id, total_price, created_at, status')
      .eq('customer_id', customerId)
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (draftError || !existingDraft) {
      return NextResponse.json({
        success: false,
        error: "NOT_FOUND",
        message: "No draft booking found"
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      bookingId: existingDraft.id,
      totalPrice: existingDraft.total_price,
      message: "Existing booking draft found"
    }, { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error("Draft booking fetch failed:", error);
    
    return NextResponse.json({
      success: false,
      error: "Internal server error",
      details: errorMessage
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    
    // INSTRUMENTATION: Log input payload
    logger.info('DRAFT API POST - Input payload:', JSON.stringify(body, null, 2));
    logger.info('DRAFT API POST - Request headers:', JSON.stringify(req.headers, null, 2));
    
    // Validate input with flexible schema
    const validationResult = DraftBookingSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      
      logger.warn('DRAFT API POST - Validation failed:', errors);
      return NextResponse.json({
        success: false,
        error: "Validation failed",
        details: errors
      }, { status: 422 });
    }

    const data = validationResult.data;
    const supabaseAdmin = createSupabaseAdmin();
    const supabaseServer = await createSupabaseServer();

    // Get or create customer profile from session
    let customerId: string;
    try {
      const profileResult = await getOrCreateCustomerProfile(supabaseAdmin, supabaseServer);
      customerId = profileResult.customerId;
      
      // INSTRUMENTATION: Log auth result
      logger.info('DRAFT API POST - Auth result:', { customerId, isGuest: profileResult.isGuest });
    } catch (error) {
      logger.error("DRAFT API POST - Authentication error:", error);
      
      return NextResponse.json({
        success: false,
        error: "NEED_AUTH",
        message: "Please sign in to create your booking draft."
      }, { status: 401 });
    }

    // Check if a draft booking already exists for this customer
    const { data: existingDraft, error: draftCheckError } = await supabaseAdmin
      .from('bookings')
      .select('id, total_price, created_at, status, service_id, suburb_id, booking_date, start_time, end_time, address, postcode, bedrooms, bathrooms, special_instructions, cleaner_id, auto_assign')
      .eq('customer_id', customerId)
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(); // Use maybeSingle() instead of single() to handle no results gracefully

    // INSTRUMENTATION: Log draft check result
    logger.info('DRAFT API POST - Draft check result:', { 
      existingDraft: existingDraft ? { id: existingDraft.id, status: existingDraft.status } : null,
      draftCheckError: draftCheckError ? { message: draftCheckError.message, code: draftCheckError.code } : null
    });

    // If we have an existing draft, handle it (idempotency)
    if (existingDraft && !draftCheckError) {
      // If no new data provided, just return existing draft
      if (Object.keys(data).length === 0) {
        logger.info(`Returning existing draft booking ${existingDraft.id} for customer ${customerId}`);
        return NextResponse.json({
          success: true,
          bookingId: existingDraft.id,
          totalPrice: existingDraft.total_price,
          message: "Existing booking draft found"
        }, { status: 200 });
      }

      // If new data provided, update the existing draft
      logger.info(`Updating existing draft booking ${existingDraft.id} for customer ${customerId}`);
      
      // Prepare update data (only include fields that are provided and exist in the schema)
      const updateData: any = {};
      
      if (data.serviceId) updateData.service_id = data.serviceId;
      if (data.suburbId) updateData.suburb_id = data.suburbId;
      if (data.specialInstructions !== undefined) updateData.special_instructions = data.specialInstructions;
      if (data.selectedCleanerId !== undefined) updateData.cleaner_id = data.selectedCleanerId;
      if (data.autoAssign !== undefined) updateData.auto_assign = data.autoAssign;
      
      // REMOVED: address, postcode, bedrooms, bathrooms - these fields don't exist in the bookings table
      // TODO: These fields should be stored in a separate table or added to the schema if needed
      
      // Handle time updates
      if (data.bookingDate) updateData.booking_date = data.bookingDate;
      if (data.startTime) updateData.start_time = data.startTime;
      if (data.startISO) {
        updateData.booking_date = extractDateFromISO(data.startISO);
        updateData.start_time = extractTimeFromISO(data.startISO);
      }
      
      // Update total price if provided
      if (data.totalPrice) updateData.total_price = data.totalPrice;
      
      // Only update if we have data to update
      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabaseAdmin
          .from('bookings')
          .update(updateData)
          .eq('id', existingDraft.id);

        if (updateError) {
          // INSTRUMENTATION: Log detailed update error
          logger.error("DRAFT API POST - Booking update error:", {
            message: updateError.message,
            code: updateError.code,
            details: updateError.details,
            hint: updateError.hint,
            updateData: JSON.stringify(updateData, null, 2)
          });
          
          // Map specific database errors to appropriate HTTP status codes
          if (updateError.code === '23505') { // Unique violation
            return NextResponse.json({
              success: false,
              error: "Conflict",
              details: "A booking with these details already exists",
              code: updateError.code
            }, { status: 409 });
          } else if (updateError.code === '23503') { // Foreign key violation
            return NextResponse.json({
              success: false,
              error: "Validation failed",
              details: "Referenced record does not exist",
              code: updateError.code
            }, { status: 422 });
          } else if (updateError.code === '23502') { // Not null violation
            return NextResponse.json({
              success: false,
              error: "Validation failed",
              details: "Required field is missing",
              code: updateError.code
            }, { status: 422 });
          }
          
          return NextResponse.json({
            success: false,
            error: "Update failed",
            details: updateError.message,
            code: updateError.code
          }, { status: 500 });
        }
      }

      return NextResponse.json({
        success: true,
        bookingId: existingDraft.id,
        totalPrice: updateData.total_price || existingDraft.total_price,
        message: "Booking draft updated successfully"
      }, { status: 200 });
    }

    // For new bookings, validate that we have all required fields
    const completeValidationResult = CompleteBookingSchema.safeParse(data);
    if (!completeValidationResult.success) {
      const missingFields = completeValidationResult.error.issues.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      
      return NextResponse.json({
        success: false,
        error: "Missing required fields for new booking",
        details: missingFields,
        guidance: "Please complete all required fields or update an existing draft"
      }, { status: 422 });
    }

    const completeData = completeValidationResult.data;

    // Validate database references exist
    const dbValidation = await validateDatabaseReferences(supabaseAdmin, completeData);
    if (!dbValidation.isValid) {
      return NextResponse.json({
        success: false,
        error: "Validation failed",
        details: dbValidation.errors
      }, { status: 422 });
    }

    // Handle time conversion and normalization
    let startISO: string;
    let endISO: string;
    let bookingDate: string;

    if (completeData.bookingDate && completeData.startTime) {
      // Convert bookingDate + startTime to ISO
      const timeResult = toAfricaJohannesburgISO(completeData.bookingDate, completeData.startTime);
      startISO = normalizeToUTC(timeResult.startISO);
      endISO = normalizeToUTC(timeResult.endISO);
      bookingDate = completeData.bookingDate;
    } else if (completeData.startISO) {
      // Use provided startISO and normalize to UTC
      startISO = normalizeToUTC(completeData.startISO);
      bookingDate = extractDateFromISO(startISO);
      
      // Derive endISO from duration if not provided
      if (completeData.endISO) {
        endISO = normalizeToUTC(completeData.endISO);
      } else {
        // Get service duration and calculate end time
        const { data: serviceData, error: serviceError } = await supabaseAdmin
          .from('services')
          .select('duration_minutes')
          .eq('id', completeData.serviceId)
          .single();

        if (serviceError || !serviceData) {
          return NextResponse.json({
            success: false,
            error: "Validation failed",
            details: [{ field: "serviceId", message: "Service not found" }]
          }, { status: 422 });
        }

        const durationMinutes = serviceData.duration_minutes || 120; // Default 2 hours
        const startDate = new Date(startISO);
        const endDate = new Date(startDate.getTime() + (durationMinutes * 60 * 1000));
        endISO = endDate.toISOString();
      }
    } else {
      return NextResponse.json({
        success: false,
        error: "Validation failed",
        details: [{ field: "scheduling", message: "Missing required scheduling fields. Provide startISO/endISO or bookingDate+startTime." }]
      }, { status: 422 });
    }

    // Compute server-side pricing
    const { totalPrice: computedPrice, breakdown } = await computeBookingPrice(
      supabaseAdmin,
      completeData.serviceId,
      completeData.suburbId,
      completeData.extras
    );

    // Validate computed price matches client price (with small tolerance for rounding)
    const priceDifference = Math.abs(computedPrice - completeData.totalPrice);
    if (priceDifference > 0.01) {
      logger.warn(`Price mismatch: client=${completeData.totalPrice}, server=${computedPrice}`);
      // Use server-computed price for security
    }

    // Prepare booking data for database insert with proper field mapping
    // NOTE: Only include fields that actually exist in the bookings table schema
    const bookingData = {
      customer_id: customerId, // Use session-derived customerId
      service_id: completeData.serviceId,
      suburb_id: completeData.suburbId,
      booking_date: bookingDate,
      start_time: extractTimeFromISO(startISO),
      end_time: extractTimeFromISO(endISO),
      status: 'PENDING' as const,
      total_price: computedPrice,
      notes: completeData.specialInstructions || null,
      special_instructions: completeData.specialInstructions || null,
      // Add cleaner selection fields (these exist in the schema)
      cleaner_id: completeData.selectedCleanerId || null,
      auto_assign: completeData.autoAssign
      // REMOVED: address, postcode, bedrooms, bathrooms - these fields don't exist in the bookings table
      // TODO: These fields should be stored in a separate table or added to the schema if needed
    };

    // Create new booking
    try {
      // INSTRUMENTATION: Log booking data before insert
      logger.info('DRAFT API POST - Attempting booking insert with data:', JSON.stringify(bookingData, null, 2));
      
      const { data: bookingResult, error: insertError } = await supabaseAdmin
        .from('bookings')
        .insert(bookingData)
        .select('id')
        .single();

      if (insertError) {
        // INSTRUMENTATION: Log detailed insert error
        logger.error("DRAFT API POST - Booking insert error:", {
          message: insertError.message,
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint,
          bookingData: JSON.stringify(bookingData, null, 2)
        });
        
        // Map specific database errors to appropriate HTTP status codes
        if (insertError.code === '23505') { // Unique violation
          return NextResponse.json({
            success: false,
            error: "Conflict",
            details: "A booking with these details already exists",
            code: insertError.code
          }, { status: 409 });
        } else if (insertError.code === '23503') { // Foreign key violation
          return NextResponse.json({
            success: false,
            error: "Validation failed",
            details: "Referenced record does not exist",
            code: insertError.code
          }, { status: 422 });
        } else if (insertError.code === '23502') { // Not null violation
          return NextResponse.json({
            success: false,
            error: "Validation failed",
            details: "Required field is missing",
            code: insertError.code
          }, { status: 422 });
        } else if (insertError.code === 'PGRST204') { // Column doesn't exist
          return NextResponse.json({
            success: false,
            error: "Schema error",
            details: "Database schema mismatch - column does not exist",
            code: insertError.code
          }, { status: 500 });
        }
        
        return NextResponse.json({
          success: false,
          error: "Database error",
          details: insertError.message,
          code: insertError.code
        }, { status: 500 });
      }

      // Insert booking extras if any
      if (completeData.extras.length > 0) {
        const bookingExtras = completeData.extras.map(extra => ({
          booking_id: bookingResult.id,
          extra_id: extra.id,
          quantity: extra.quantity,
          price: extra.price
        }));

        try {
          const { error: extrasError } = await supabaseAdmin
            .from('booking_extras')
            .insert(bookingExtras);

          if (extrasError) {
            // INSTRUMENTATION: Log detailed extras error
            logger.error("DRAFT API POST - Booking extras insert error:", {
              message: extrasError.message,
              code: extrasError.code,
              details: extrasError.details,
              hint: extrasError.hint,
              bookingExtras: JSON.stringify(bookingExtras, null, 2)
            });
            // Don't fail the whole request, just log the error
          }
        } catch (extrasDbError) {
          logger.error("DRAFT API POST - Booking extras database insert failed:", extrasDbError);
          // Don't fail the whole request, just log the error
        }
      }

      // Return success response for new booking
      return NextResponse.json({
        success: true,
        bookingId: bookingResult.id,
        totalPrice: computedPrice,
        breakdown: breakdown,
        message: "Booking draft created successfully"
      }, { 
        status: 201,
        headers: {
          'Location': `/booking/review?bookingId=${bookingResult.id}`
        }
      });

    } catch (dbError) {
      // INSTRUMENTATION: Log database error with full context
      logger.error("DRAFT API POST - Database insert failed:", {
        error: dbError,
        message: dbError instanceof Error ? dbError.message : "Unknown database error",
        stack: dbError instanceof Error ? dbError.stack : undefined
      });
      
      return NextResponse.json({
        success: false,
        error: "Database error",
        details: dbError instanceof Error ? dbError.message : "Unknown database error"
      }, { status: 500 });
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    // INSTRUMENTATION: Log top-level error with full context
    logger.error("DRAFT API POST - Draft booking creation failed:", {
      error: error,
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json({
      success: false,
      error: "Internal server error",
      details: errorMessage
    }, { status: 500 });
  }
}