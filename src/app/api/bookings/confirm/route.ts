import { NextResponse } from "next/server";
import { createSupabaseAdmin, createSupabaseServer } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { sendBookingConfirmation } from "@/app/actions/send-booking-confirmation";
import { validateStatusTransition, createValidationErrorMessage } from '@/lib/validation/booking-validation';
import { validateTotalPriceForStatus, updateBookingTotalPrice } from '@/lib/validation/price-calculation';

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { bookingId } = payload;
    
    if (!bookingId) {
      return NextResponse.json({ 
        success: false, 
        error: "VALIDATION_ERROR",
        message: "bookingId is required" 
      }, { status: 400 });
    }

    const supabaseAdmin = createSupabaseAdmin();
    const supabaseServer = await createSupabaseServer();

    // Get current user
    const { data: { session }, error: sessionError } = await supabaseServer.auth.getSession();
    if (sessionError || !session?.user) {
      return NextResponse.json({ 
        success: false, 
        error: "AUTH_REQUIRED",
        message: "Authentication required" 
      }, { status: 401 });
    }

    // Fetch booking with all required fields for validation and related data
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from("bookings")
      .select(`
        *,
        services (name),
        suburbs (name),
        profiles!bookings_customer_id_fkey (
          email,
          first_name,
          last_name,
          full_name
        ),
        cleaners:profiles!bookings_cleaner_id_fkey (
          first_name,
          last_name,
          full_name
        )
      `)
      .eq("id", bookingId)
      .eq("customer_id", session.user.id) // Ensure user owns the booking
      .single();
      
    if (bookingError || !booking) {
      logger.error("Error fetching booking:", bookingError);
      return NextResponse.json({ 
        success: false, 
        error: "NOT_FOUND",
        message: "Booking not found or access denied" 
      }, { status: 404 });
    }

    // Validate booking is in correct state for confirmation
    if (!['DRAFT', 'PENDING', 'READY_FOR_PAYMENT'].includes(booking.status)) {
      return NextResponse.json({
        success: false,
        error: "INVALID_STATUS",
        message: `Booking cannot be confirmed in ${booking.status} status`
      }, { status: 422 });
    }

    // Use new validation system for status transition
    const validationResult = validateStatusTransition(booking, booking.status, 'READY_FOR_PAYMENT');
    
    if (!validationResult.isValid) {
      return NextResponse.json({
        success: false,
        error: "VALIDATION_FAILED",
        message: createValidationErrorMessage(validationResult),
        details: {
          missingFields: validationResult.missingFields,
          errors: validationResult.errors,
          warnings: validationResult.warnings
        }
      }, { status: 422 });
    }

    // Ensure total_price is calculated and valid
    const totalPriceValidation = validateTotalPriceForStatus(booking, 'READY_FOR_PAYMENT');
    if (!totalPriceValidation.isValid) {
      // Try to calculate the price if it's missing
      const supabase = await createSupabaseServer();
      const priceResult = await updateBookingTotalPrice(supabase, booking);
      
      if (!priceResult.success || !priceResult.total_price) {
        return NextResponse.json({
          success: false,
          error: "PRICE_CALCULATION_FAILED",
          message: "Unable to calculate total price for booking",
          details: {
            error: priceResult.error || totalPriceValidation.error
          }
        }, { status: 422 });
      }
      
      // Update the booking with the calculated price
      booking.total_price = priceResult.total_price;
    }

    // Validate field values
    const validationErrors: string[] = [];
    
    if (booking.bedrooms < 0) validationErrors.push('bedrooms must be non-negative');
    if (booking.bathrooms < 0) validationErrors.push('bathrooms must be non-negative');
    if (booking.address.trim().length === 0) validationErrors.push('address cannot be empty');
    if (booking.postcode.trim().length === 0) validationErrors.push('postcode cannot be empty');

    if (validationErrors.length > 0) {
      return NextResponse.json({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Invalid field values",
        details: validationErrors
      }, { status: 422 });
    }

    // Handle cleaner assignment
    let assignedCleaner: string | null = booking.cleaner_id;
    let finalStatus = 'READY_FOR_PAYMENT';

    if (!assignedCleaner && booking.auto_assign === true) {
      // Try to auto-assign a cleaner
      const { data: attempt, error: autoAssignError } = await supabaseAdmin.rpc("try_auto_assign", { 
        booking_id: booking.id 
      });
      
      if (autoAssignError) {
        logger.error("auto-assign RPC error", autoAssignError);
      }
      
      if (attempt && attempt.length) {
        const row = attempt[0];
        if (row.assigned) {
          assignedCleaner = row.cleaner_id;
          finalStatus = 'CONFIRMED';
        }
      }
    } else if (assignedCleaner) {
      // If user manually picked a cleaner, mark as confirmed
      finalStatus = 'CONFIRMED';
    }

    // Update booking status
    const { error: updateError } = await supabaseAdmin
      .from("bookings")
      .update({ 
        status: finalStatus,
        cleaner_id: assignedCleaner
      })
      .eq("id", booking.id);
        
    if (updateError) {
      logger.error("Error updating booking status:", updateError);
      return NextResponse.json({
        success: false,
        error: "UPDATE_FAILED",
        message: "Failed to update booking status"
      }, { status: 500 });
    }

    // Send booking confirmation email
    try {
      const customerProfile = booking.profiles;
      const cleanerProfile = booking.cleaners;
      
      if (customerProfile?.email) {
        const emailData = {
          customerName: customerProfile.full_name || `${customerProfile.first_name || ''} ${customerProfile.last_name || ''}`.trim(),
          customerEmail: customerProfile.email,
          bookingId: booking.id,
          serviceName: booking.services?.name || 'Cleaning Service',
          bookingDate: booking.booking_date,
          bookingTime: booking.start_time,
          address: booking.address || '',
          postcode: booking.postcode || '',
          bedrooms: booking.bedrooms || 0,
          bathrooms: booking.bathrooms || 0,
          totalPrice: booking.total_price,
          cleanerName: cleanerProfile ? 
            (cleanerProfile.full_name || `${cleanerProfile.first_name || ''} ${cleanerProfile.last_name || ''}`.trim()) : 
            undefined,
          specialInstructions: booking.special_instructions || undefined,
        };

        await sendBookingConfirmation(emailData);
        logger.info(`Booking confirmation email sent for booking ${booking.id}`);
      } else {
        logger.warn(`No customer email found for booking ${booking.id}, skipping email notification`);
      }
    } catch (emailError) {
      // Log email error but don't fail the booking confirmation
      logger.error("Failed to send booking confirmation email:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Booking confirmed successfully",
      data: {
        bookingId: booking.id,
        status: finalStatus,
        cleanerId: assignedCleaner,
        isReadyForPayment: finalStatus === 'READY_FOR_PAYMENT'
      }
    });

  } catch (error) {
    logger.error("Error in confirm booking API:", error);
    return NextResponse.json({ 
      success: false, 
      error: "INTERNAL_ERROR",
      message: "Internal server error" 
    }, { status: 500 });
  }
}
