'use server';

import { z } from 'zod';
import { createSupabaseAdmin } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { env } from '@/env.server';
import { validateStatusTransition } from '@/lib/validation/booking-validation';
import { validateTotalPriceForStatus } from '@/lib/validation/price-calculation';

// Validation schema for payment initiation
const InitiatePaymentSchema = z.object({
  bookingId: z.string().uuid('bookingId must be a valid UUID'),
  customerName: z.string().min(1, 'Customer name is required'),
  customerEmail: z.string().email('Valid email is required'),
  customerPhone: z.string().min(1, 'Phone number is required'),
});

type InitiatePaymentInput = z.infer<typeof InitiatePaymentSchema>;

// Helper function to generate unique reference
function generatePaymentReference(bookingId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `PAY_${bookingId.substring(0, 8)}_${timestamp}_${random}`.toUpperCase();
}

// Helper function to call Paystack initialize API
async function initializePaystackPayment(
  email: string,
  amount: number,
  reference: string,
  callbackUrl: string,
  metadata: Record<string, any>
): Promise<{ authorization_url: string; reference: string }> {
  const paystackUrl = 'https://api.paystack.co/transaction/initialize';
  
  const payload = {
    email,
    amount: amount * 100, // Convert to minor units (cents)
    currency: 'ZAR',
    reference,
    callback_url: callbackUrl,
    metadata
  };

  const response = await fetch(paystackUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Paystack API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
  }

  const data = await response.json();
  
  if (!data.status || !data.data?.authorization_url) {
    throw new Error('Invalid response from Paystack');
  }

  return {
    authorization_url: data.data.authorization_url,
    reference: data.data.reference
  };
}

// Helper function to upsert payment record
async function upsertPaymentRecord(
  supabaseAdmin: ReturnType<typeof createSupabaseAdmin>,
  bookingId: string,
  reference: string,
  amountMinor: number,
  status: 'INITIALIZED' = 'INITIALIZED'
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('payments')
    .upsert({
      booking_id: bookingId,
      reference: reference,
      amount_minor: amountMinor,
      currency: 'ZAR',
      status: status,
      payment_method: 'paystack',
      gateway_payload: {
        reference: reference,
        status: status
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'booking_id,reference'
    });

  if (error) {
    logger.error('Failed to upsert payment record:', error);
    throw new Error('Failed to create payment record');
  }
}

// Helper function to validate booking status (no authentication required for guest bookings)
async function validateBooking(
  supabaseAdmin: ReturnType<typeof createSupabaseAdmin>,
  bookingId: string
): Promise<{ isValid: boolean; booking?: any; error?: string; errorCode?: string }> {
  try {
    // Check if booking exists and get details (no authentication required for guest bookings)
    const { data: booking, error } = await supabaseAdmin
      .from('bookings')
      .select(`
        id,
        total_price,
        status,
        payments (
          id,
          status,
          reference
        )
      `)
      .eq('id', bookingId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { isValid: false, error: 'Booking not found', errorCode: 'booking_not_found' };
      }
      logger.error('Booking fetch error:', error);
      return { isValid: false, error: 'Failed to fetch booking details', errorCode: 'fetch_failed' };
    }

    if (!booking) {
      return { isValid: false, error: 'Booking not found', errorCode: 'booking_not_found' };
    }

    // Check if booking is already paid
    const paidPayment = booking.payments?.find((p: any) => p.status === 'PAID');
    if (paidPayment) {
      return { isValid: false, error: 'Booking is already paid', errorCode: 'already_paid' };
    }

    // Check if booking status allows payment
    if (!['DRAFT', 'PENDING', 'READY_FOR_PAYMENT'].includes(booking.status)) {
      return { isValid: false, error: 'Booking is not in a valid state for payment', errorCode: 'invalid_status' };
    }

    // Validate total_price for payment
    const totalPriceValidation = validateTotalPriceForStatus(booking, 'READY_FOR_PAYMENT');
    if (!totalPriceValidation.isValid) {
      return { isValid: false, error: totalPriceValidation.error || 'Total price is required for payment', errorCode: 'invalid_price' };
    }

    return { isValid: true, booking };
  } catch (error) {
    logger.error('Booking validation error:', error);
    return { isValid: false, error: 'Failed to validate booking', errorCode: 'validation_failed' };
  }
}

/**
 * Server action to initiate Paystack payment
 */
export async function initiatePaymentAction(input: InitiatePaymentInput) {
  try {
    // Validate input
    const validationResult = InitiatePaymentSchema.safeParse(input);
    if (!validationResult.success) {
      return {
        success: false,
        error: "Validation failed",
        details: validationResult.error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      };
    }

    const { bookingId, customerName, customerEmail, customerPhone } = validationResult.data;
    const supabaseAdmin = createSupabaseAdmin();

    // Validate booking status (no authentication required for guest bookings)
    const bookingValidation = await validateBooking(supabaseAdmin, bookingId);
    if (!bookingValidation.isValid) {
      return {
        success: false,
        error: bookingValidation.error,
        errorCode: bookingValidation.errorCode
      };
    }

    const booking = bookingValidation.booking!;
    const amountMinor = Math.round(booking.total_price * 100); // Convert to cents

    // Update booking with contact information
    const { error: updateError } = await supabaseAdmin
      .from('bookings')
      .update({
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        status: 'READY_FOR_PAYMENT',
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId);

    if (updateError) {
      logger.error('Failed to update booking with contact info:', updateError);
      return {
        success: false,
        error: "Failed to update booking with contact information"
      };
    }

    // Generate unique reference
    const reference = generatePaymentReference(bookingId);

    // Prepare callback URL
    const callbackUrl = `${env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/booking/payment/callback`;

    // Prepare metadata (no customer_id for guest bookings)
    const metadata = {
      booking_id: bookingId,
      customer_email: customerEmail,
      customer_name: customerName,
      customer_phone: customerPhone
    };

    // Initialize payment with Paystack
    const paystackResponse = await initializePaystackPayment(
      customerEmail,
      booking.total_price,
      reference,
      callbackUrl,
      metadata
    );

    // Upsert payment record in database
    await upsertPaymentRecord(
      supabaseAdmin,
      bookingId,
      reference,
      amountMinor
    );

    logger.info(`Payment initiated for booking ${bookingId} with reference ${reference}`);

    return {
      success: true,
      authorization_url: paystackResponse.authorization_url,
      reference: paystackResponse.reference
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error("Payment initiation failed:", error);
    
    // Check if it's a Paystack API error
    if (errorMessage.includes('Paystack API error')) {
      return {
        success: false,
        error: "Payment service temporarily unavailable",
        errorCode: "init_failed",
        details: "Please try again in a few moments"
      };
    }
    
    return {
      success: false,
      error: "Payment initiation failed",
      errorCode: "init_failed",
      details: errorMessage
    };
  }
}

/**
 * Server action to confirm payment and update booking status to CONFIRMED
 */
export async function confirmPaymentAction(
  bookingId: string,
  paystackReference: string,
  paystackStatus: string
) {
  try {
    const supabaseAdmin = createSupabaseAdmin();
    
    // Validate input
    if (!bookingId || !paystackReference) {
      return {
        success: false,
        error: 'Booking ID and payment reference are required'
      };
    }

    // Get the booking
    const { data: booking, error: fetchError } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (fetchError || !booking) {
      return {
        success: false,
        error: 'Booking not found'
      };
    }

    // Validate status transition
    const validationResult = validateStatusTransition(booking, booking.status, 'CONFIRMED');
    if (!validationResult.isValid) {
      return {
        success: false,
        error: 'Invalid status transition',
        details: validationResult.errors
      };
    }

    // Update booking with payment details and status
    const { error: updateError } = await supabaseAdmin
      .from('bookings')
      .update({
        status: 'CONFIRMED',
        paystack_ref: paystackReference,
        paystack_status: paystackStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId);

    if (updateError) {
      logger.error('Failed to update booking status:', updateError);
      return {
        success: false,
        error: 'Failed to update booking status'
      };
    }

    logger.info('Payment confirmed and booking status updated', {
      bookingId,
      paystackReference,
      paystackStatus
    });

    return {
      success: true,
      message: 'Payment confirmed and booking status updated'
    };

  } catch (error) {
    logger.error('Payment confirmation error:', error);
    return {
      success: false,
      error: 'Failed to confirm payment',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
