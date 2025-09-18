import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdmin, createSupabaseServer } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

// Schema for partial booking updates (step-aware)
const BookingUpdateSchema = z.object({
  bookingId: z.string().uuid("bookingId must be a valid UUID"),
  
  // Step 1: Service selection
  serviceId: z.string().uuid("serviceId must be a valid UUID").optional(),
  suburbId: z.string().uuid("suburbId must be a valid UUID").optional(),
  
  // Step 2: Rooms/Extras
  bedrooms: z.number().int().min(0, "bedrooms must be non-negative").optional(),
  bathrooms: z.number().int().min(0, "bathrooms must be non-negative").optional(),
  extras: z.array(z.object({
    id: z.string().uuid("extra id must be a valid UUID"),
    quantity: z.number().int().min(1, "quantity must be at least 1").default(1),
    price: z.number().positive("extra price must be positive")
  })).optional(),
  
  // Step 3: Location/Time
  address: z.string().min(1, "address cannot be empty").optional(),
  postcode: z.string().min(1, "postcode cannot be empty").optional(),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "bookingDate must be in YYYY-MM-DD format").optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "startTime must be in HH:mm format").optional(),
  startISO: z.string().optional(),
  endISO: z.string().optional(),
  
  // Step 4: Cleaner selection
  selectedCleanerId: z.string().uuid("selectedCleanerId must be a valid UUID").optional(),
  autoAssign: z.boolean().optional(),
  
  // General fields
  specialInstructions: z.string().optional(),
  totalPrice: z.number().positive("totalPrice must be positive").optional(),
  
  // Timezone
  timezone: z.string().default('Africa/Johannesburg').optional()
});

type BookingUpdateInput = z.infer<typeof BookingUpdateSchema>;

// Helper function to validate ISO 8601 dates
const isValidISODate = (dateString: string): boolean => {
  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && dateString.includes('T');
  } catch {
    return false;
  }
};

// Helper function to extract date from ISO
const extractDateFromISO = (isoString: string): string => {
  return new Date(isoString).toISOString().split('T')[0];
};

// Helper function to extract time from ISO
const extractTimeFromISO = (isoString: string): string => {
  return new Date(isoString).toISOString().split('T')[1].substring(0, 5);
};

// Session validation
async function validateSession(
  supabaseServer: Awaited<ReturnType<typeof createSupabaseServer>>
): Promise<string> {
  const { data: { session }, error: sessionError } = await supabaseServer.auth.getSession();
  
  if (sessionError) {
    logger.error('Session error:', sessionError);
    throw new Error('Authentication failed');
  }

  if (!session?.user) {
    throw new Error('Authentication required');
  }

  return session.user.id;
}

// Database validation for references
async function validateDatabaseReferences(
  supabase: ReturnType<typeof createSupabaseAdmin>,
  data: Partial<BookingUpdateInput>
): Promise<{ isValid: boolean; errors: Array<{ field: string; message: string }> }> {
  const errors: Array<{ field: string; message: string }> = [];

  try {
    // Validate serviceId if provided
    if (data.serviceId) {
      const { data: service, error: serviceError } = await supabase
        .from('services')
        .select('id')
        .eq('id', data.serviceId)
        .single();

      if (serviceError || !service) {
        errors.push({ field: 'serviceId', message: 'No service found for this serviceId' });
      }
    }

    // Validate suburbId if provided
    if (data.suburbId) {
      const { data: suburb, error: suburbError } = await supabase
        .from('suburbs')
        .select('id')
        .eq('id', data.suburbId)
        .single();

      if (suburbError || !suburb) {
        errors.push({ field: 'suburbId', message: 'No suburb found for this suburbId' });
      }
    }

    // Validate selectedCleanerId if provided
    if (data.selectedCleanerId) {
      const { data: cleaner, error: cleanerError } = await supabase
        .from('cleaners')
        .select('id')
        .eq('id', data.selectedCleanerId)
        .single();

      if (cleanerError || !cleaner) {
        errors.push({ field: 'selectedCleanerId', message: 'No cleaner found for this selectedCleanerId' });
      }
    }

    // Validate extras if provided
    if (data.extras && data.extras.length > 0) {
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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    logger.info('BOOKING UPDATE API - Input payload:', JSON.stringify(body, null, 2));
    
    // Validate input
    const validationResult = BookingUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      
      logger.warn('BOOKING UPDATE API - Validation failed:', errors);
      return NextResponse.json({
        success: false,
        error: "Validation failed",
        details: errors
      }, { status: 422 });
    }

    const data = validationResult.data;
    const supabaseAdmin = createSupabaseAdmin();
    const supabaseServer = await createSupabaseServer();

    // Validate session
    let customerId: string;
    try {
      customerId = await validateSession(supabaseServer);
    } catch (error) {
      logger.error("BOOKING UPDATE API - Authentication error:", error);
      return NextResponse.json({
        success: false,
        error: "NEED_AUTH",
        message: "Please sign in to update your booking."
      }, { status: 401 });
    }

    // Check if booking exists and belongs to customer
    const { data: existingBooking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select('id, customer_id, status, address, postcode, bedrooms, bathrooms')
      .eq('id', data.bookingId)
      .eq('customer_id', customerId)
      .single();

    if (bookingError || !existingBooking) {
      logger.error("BOOKING UPDATE API - Booking not found:", bookingError);
      return NextResponse.json({
        success: false,
        error: "NOT_FOUND",
        message: "Booking not found or access denied"
      }, { status: 404 });
    }

    // Check if booking is in editable state
    if (!['DRAFT', 'PENDING', 'READY_FOR_PAYMENT'].includes(existingBooking.status)) {
      return NextResponse.json({
        success: false,
        error: "NOT_EDITABLE",
        message: "Booking cannot be updated in its current state"
      }, { status: 422 });
    }

    // Validate database references
    const dbValidation = await validateDatabaseReferences(supabaseAdmin, data);
    if (!dbValidation.isValid) {
      return NextResponse.json({
        success: false,
        error: "Validation failed",
        details: dbValidation.errors
      }, { status: 422 });
    }

    // Prepare update data
    const updateData: any = {};
    
    // Service and location
    if (data.serviceId) updateData.service_id = data.serviceId;
    if (data.suburbId) updateData.suburb_id = data.suburbId;
    
    // Customer details (new fields)
    if (data.address !== undefined) updateData.address = data.address;
    if (data.postcode !== undefined) updateData.postcode = data.postcode;
    if (data.bedrooms !== undefined) updateData.bedrooms = data.bedrooms;
    if (data.bathrooms !== undefined) updateData.bathrooms = data.bathrooms;
    
    // Time handling
    if (data.bookingDate) updateData.booking_date = data.bookingDate;
    if (data.startTime) updateData.start_time = data.startTime;
    if (data.startISO) {
      if (!isValidISODate(data.startISO)) {
        return NextResponse.json({
          success: false,
          error: "Validation failed",
          details: [{ field: "startISO", message: "Invalid ISO date format" }]
        }, { status: 422 });
      }
      updateData.booking_date = extractDateFromISO(data.startISO);
      updateData.start_time = extractTimeFromISO(data.startISO);
    }
    
    // Cleaner selection
    if (data.selectedCleanerId !== undefined) updateData.cleaner_id = data.selectedCleanerId;
    if (data.autoAssign !== undefined) updateData.auto_assign = data.autoAssign;
    
    // General fields
    if (data.specialInstructions !== undefined) updateData.special_instructions = data.specialInstructions;
    if (data.totalPrice) updateData.total_price = data.totalPrice;

    // Only update if we have data to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({
        success: true,
        message: "No changes to update"
      }, { status: 200 });
    }

    // Update the booking
    const { error: updateError } = await supabaseAdmin
      .from('bookings')
      .update(updateData)
      .eq('id', data.bookingId);

    if (updateError) {
      logger.error("BOOKING UPDATE API - Update error:", updateError);
      
      // Map specific database errors
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
      }
      
      return NextResponse.json({
        success: false,
        error: "Update failed",
        details: updateError.message,
        code: updateError.code
      }, { status: 500 });
    }

    // Handle booking extras if provided
    if (data.extras && data.extras.length > 0) {
      // Delete existing extras for this booking
      await supabaseAdmin
        .from('booking_extras')
        .delete()
        .eq('booking_id', data.bookingId);

      // Insert new extras
      const bookingExtras = data.extras.map(extra => ({
        booking_id: data.bookingId,
        extra_id: extra.id,
        quantity: extra.quantity,
        price: extra.price
      }));

      const { error: extrasError } = await supabaseAdmin
        .from('booking_extras')
        .insert(bookingExtras);

      if (extrasError) {
        logger.error("BOOKING UPDATE API - Extras update error:", extrasError);
        // Don't fail the whole request, just log the error
      }
    }

    return NextResponse.json({
      success: true,
      message: "Booking updated successfully"
    }, { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error("BOOKING UPDATE API - Update failed:", error);
    
    return NextResponse.json({
      success: false,
      error: "Internal server error",
      details: errorMessage
    }, { status: 500 });
  }
}
