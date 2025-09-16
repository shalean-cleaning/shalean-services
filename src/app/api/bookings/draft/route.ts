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

// Strict input validation schema with comprehensive field validation
const DraftBookingSchema = z.object({
  // Required fields with explicit validation (customerId derived from session)
  serviceId: z.string().uuid("serviceId must be a valid UUID"),
  regionId: z.string().uuid("regionId must be a valid UUID").optional(),
  suburbId: z.string().uuid("suburbId must be a valid UUID"),
  totalPrice: z.number().positive("totalPrice must be a positive number"),
  
  // Time handling - either bookingDate + startTime OR startISO + endISO
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "bookingDate must be in YYYY-MM-DD format").optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "startTime must be in HH:mm format").optional(),
  startISO: z.string().refine(isValidISODate, "startISO must be a valid ISO 8601 datetime string").optional(),
  endISO: z.string().refine(isValidISODate, "endISO must be a valid ISO 8601 datetime string").optional(),
  
  // Location details
  address: z.string().min(1, "address is required"),
  postcode: z.string().min(1, "postcode is required"),
  
  // Room counts and extras
  bedrooms: z.number().int().min(1, "at least 1 bedroom required").default(1),
  bathrooms: z.number().int().min(1, "at least 1 bathroom required").default(1),
  extras: z.array(z.object({
    id: z.string().uuid("extra id must be a valid UUID"),
    quantity: z.number().int().min(1, "quantity must be at least 1").default(1),
    price: z.number().positive("extra price must be positive")
  })).default([]),
  
  // Optional fields
  specialInstructions: z.string().optional(),
  frequency: z.enum(['one-time', 'weekly', 'bi-weekly', 'monthly']).default('one-time'),
  timezone: z.string().default('Africa/Johannesburg'),
  
  // Cleaner selection
  selectedCleanerId: z.string().uuid("selectedCleanerId must be a valid UUID").optional(),
  autoAssign: z.boolean().default(false)
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
  supabaseServer: ReturnType<typeof createSupabaseServer>
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


export async function GET(req: Request) {
  try {
    const supabaseAdmin = createSupabaseAdmin();
    const supabaseServer = createSupabaseServer();

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
    
    // Validate input with Zod
    const validationResult = DraftBookingSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      
      return NextResponse.json({
        success: false,
        error: "Validation failed",
        details: errors
      }, { status: 400 });
    }

    const data = validationResult.data;
    const supabaseAdmin = createSupabaseAdmin();
    const supabaseServer = createSupabaseServer();

    // Get or create customer profile from session
    let customerId: string;
    try {
      const profileResult = await getOrCreateCustomerProfile(supabaseAdmin, supabaseServer);
      customerId = profileResult.customerId;
    } catch (error) {
      logger.error("Authentication error:", error);
      
      return NextResponse.json({
        success: false,
        error: "NEED_AUTH",
        message: "Please sign in to create your booking draft."
      }, { status: 401 });
    }

    // Validate database references exist
    const dbValidation = await validateDatabaseReferences(supabaseAdmin, data);
    if (!dbValidation.isValid) {
      return NextResponse.json({
        success: false,
        error: "Validation failed",
        details: dbValidation.errors
      }, { status: 400 });
    }

    // Handle time conversion and normalization
    let startISO: string;
    let endISO: string;
    let bookingDate: string;

    if (data.bookingDate && data.startTime) {
      // Convert bookingDate + startTime to ISO
      const timeResult = toAfricaJohannesburgISO(data.bookingDate, data.startTime);
      startISO = normalizeToUTC(timeResult.startISO);
      endISO = normalizeToUTC(timeResult.endISO);
      bookingDate = data.bookingDate;
    } else if (data.startISO) {
      // Use provided startISO and normalize to UTC
      startISO = normalizeToUTC(data.startISO);
      bookingDate = extractDateFromISO(startISO);
      
      // Derive endISO from duration if not provided
      if (data.endISO) {
        endISO = normalizeToUTC(data.endISO);
      } else {
        // Get service duration and calculate end time
        const { data: serviceData, error: serviceError } = await supabaseAdmin
          .from('services')
          .select('duration_minutes')
          .eq('id', data.serviceId)
          .single();

        if (serviceError || !serviceData) {
          return NextResponse.json({
            success: false,
            error: "Validation failed",
            details: [{ field: "serviceId", message: "Service not found" }]
          }, { status: 400 });
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
      }, { status: 400 });
    }

    // Compute server-side pricing
    const { totalPrice: computedPrice, breakdown } = await computeBookingPrice(
      supabaseAdmin,
      data.serviceId,
      data.suburbId,
      data.extras
    );

    // Validate computed price matches client price (with small tolerance for rounding)
    const priceDifference = Math.abs(computedPrice - data.totalPrice);
    if (priceDifference > 0.01) {
      logger.warn(`Price mismatch: client=${data.totalPrice}, server=${computedPrice}`);
      // Use server-computed price for security
    }

    // Prepare booking data for database insert with proper field mapping
    const bookingData = {
      customer_id: customerId, // Use session-derived customerId
      service_id: data.serviceId,
      suburb_id: data.suburbId,
      booking_date: bookingDate,
      start_time: extractTimeFromISO(startISO),
      end_time: extractTimeFromISO(endISO),
      status: 'PENDING' as const,
      total_price: computedPrice,
      notes: data.specialInstructions || null,
      special_instructions: data.specialInstructions || null,
      // Add cleaner selection fields
      cleaner_id: data.selectedCleanerId || null,
      auto_assign: data.autoAssign
    };

    // Validate all required fields are non-null before insert
    const requiredFields = ['customer_id', 'service_id', 'suburb_id', 'booking_date', 'start_time', 'end_time', 'total_price'];
    const nullFields = requiredFields.filter(field => {
      const value = bookingData[field as keyof typeof bookingData];
      return value === null || value === undefined || value === '';
    });

    if (nullFields.length > 0) {
      return NextResponse.json({
        success: false,
        error: "Validation failed",
        details: [{ field: "database", message: `Missing required fields: ${nullFields.join(', ')}` }]
      }, { status: 400 });
    }

    // Check if a draft booking already exists for this customer
    const { data: existingDraft, error: draftCheckError } = await supabaseAdmin
      .from('bookings')
      .select('id, total_price, created_at')
      .eq('customer_id', customerId)
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let booking;
    let isNewBooking = false;

    if (existingDraft && !draftCheckError) {
      // Draft already exists, return it
      logger.info(`Found existing draft booking ${existingDraft.id} for customer ${customerId}`);
      booking = existingDraft;
      isNewBooking = false;
    } else {
      // No existing draft, create a new one
      try {
        const { data: bookingResult, error: insertError } = await supabaseAdmin
          .from('bookings')
          .insert(bookingData)
          .select('id')
          .single();

        if (insertError) {
          logger.error("Booking insert error:", insertError);
          return NextResponse.json({
            success: false,
            error: "Database error",
            details: insertError.message
          }, { status: 500 });
        }

        booking = bookingResult;
        isNewBooking = true;
      } catch (dbError) {
        logger.error("Database insert failed:", dbError);
        return NextResponse.json({
          success: false,
          error: "Database error",
          details: dbError instanceof Error ? dbError.message : "Unknown database error"
        }, { status: 500 });
      }
    }

    // Insert booking extras if any
    if (data.extras.length > 0) {
      const bookingExtras = data.extras.map(extra => ({
        booking_id: booking.id,
        extra_id: extra.id,
        quantity: extra.quantity,
        price: extra.price
      }));

      try {
        const { error: extrasError } = await supabaseAdmin
          .from('booking_extras')
          .insert(bookingExtras);

        if (extrasError) {
          logger.error("Booking extras insert error:", extrasError);
          // Don't fail the whole request, just log the error
        }
      } catch (extrasDbError) {
        logger.error("Booking extras database insert failed:", extrasDbError);
        // Don't fail the whole request, just log the error
      }
    }

    // Return appropriate response based on whether this is a new or existing booking
    const responseData = {
      success: true,
      bookingId: booking.id,
      totalPrice: isNewBooking ? computedPrice : existingDraft.total_price,
      breakdown: isNewBooking ? breakdown : undefined,
      message: isNewBooking ? "Booking draft created successfully" : "Existing booking draft found"
    };

    return NextResponse.json(responseData, { 
      status: isNewBooking ? 201 : 200,
      headers: {
        'Location': `/booking/review?bookingId=${booking.id}`
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error("Draft booking creation failed:", error);
    
    return NextResponse.json({
      success: false,
      error: "Internal server error",
      details: errorMessage
    }, { status: 500 });
  }
}