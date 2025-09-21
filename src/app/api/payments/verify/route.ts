import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { env } from "@/env.server";
import { generateShortId } from "@/lib/utils/short-id";
import { 
  shouldUseMockPaystack, 
  getMockConfig, 
  mockVerifyPayment 
} from "@/lib/payments/mock-paystack";

export const runtime = "nodejs";

type UpdateResult = {
  success: boolean;
  bookingId?: string;
  shortId?: string;
  error?: string;
};

const VerifyPaymentSchema = z.object({
  reference: z.string().min(1, "Reference is required"),
});

// type VerifyPaymentInput = z.infer<typeof VerifyPaymentSchema>;

// Helper function to verify payment with Paystack (with mock support)
async function verifyPaystackPayment(reference: string): Promise<{
  status: string;
  amount: number;
  currency: string;
  gateway_response: string;
  paid_at: string;
  transaction_id: string;
  customer: any;
  metadata: any;
}> {
  // Use mock Paystack in development or when configured
  if (shouldUseMockPaystack()) {
    logger.info('Using mock Paystack for payment verification');
    const mockConfig = getMockConfig();
    const mockResponse = await mockVerifyPayment(reference, mockConfig);
    
    return {
      status: mockResponse.data.status,
      amount: mockResponse.data.amount,
      currency: mockResponse.data.currency,
      gateway_response: mockResponse.data.gateway_response,
      paid_at: mockResponse.data.paid_at,
      transaction_id: mockResponse.data.id.toString(),
      customer: mockResponse.data.customer,
      metadata: mockResponse.data.metadata
    };
  }

  // Real Paystack API call
  const paystackUrl = `https://api.paystack.co/transaction/verify/${reference}`;
  
  const response = await fetch(paystackUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Paystack API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
  }

  const data = await response.json();
  
  if (!data.status) {
    throw new Error('Invalid response from Paystack');
  }

  return {
    status: data.data.status,
    amount: data.data.amount,
    currency: data.data.currency,
    gateway_response: data.data.gateway_response,
    paid_at: data.data.paid_at,
    transaction_id: data.data.id.toString(),
    customer: data.data.customer,
    metadata: data.data.metadata
  };
}

// Helper function to update payment and booking status
async function updatePaymentAndBooking(
  supabaseAdmin: ReturnType<typeof createSupabaseAdmin>,
  reference: string,
  paystackData: any
): Promise<UpdateResult> {
  try {
    // Get the payment record
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .select(`
        id,
        booking_id,
        amount_minor,
        status
      `)
      .eq('reference', reference)
      .single();

    if (paymentError || !payment) {
      return { success: false, error: 'Payment record not found' };
    }

    // Validate amount matches
    if (paystackData.amount !== payment.amount_minor) {
      logger.warn(`Amount mismatch for reference ${reference}: stored=${payment.amount_minor}, paystack=${paystackData.amount}`);
      return { success: false, error: 'Payment amount mismatch' };
    }

    // Validate currency
    if (paystackData.currency !== 'ZAR') {
      return { success: false, error: 'Invalid currency' };
    }

    // Update payment record
    const { error: updatePaymentError } = await supabaseAdmin
      .from('payments')
      .update({
        status: 'PAID',
        transaction_id: paystackData.transaction_id,
        payment_method: 'paystack',
        gateway_payload: {
          gateway_response: paystackData.gateway_response,
          paid_at: paystackData.paid_at,
          customer: paystackData.customer,
          metadata: paystackData.metadata
        },
        processed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.id);

    if (updatePaymentError) {
      logger.error('Failed to update payment record:', updatePaymentError);
      return { success: false, error: 'Failed to update payment record' };
    }

    // Generate short ID for the booking
    const shortId = generateShortId();

    // Update booking status to PAID and add short_id
    const { error: updateBookingError } = await supabaseAdmin
      .from('bookings')
      .update({
        status: 'PAID',
        short_id: shortId,
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.booking_id);

    if (updateBookingError) {
      logger.error('Failed to update booking status:', updateBookingError);
      // Don't fail the whole operation, just log the error
    }

    logger.info(`Payment verified and updated for booking ${payment.booking_id} with reference ${reference} and short_id ${shortId}`);

    return { success: true, bookingId: payment.booking_id, shortId };

  } catch (error) {
    logger.error('Error updating payment and booking:', error);
    return { success: false, error: 'Failed to update payment and booking' };
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get('reference');

    // Validate input
    const validationResult = VerifyPaymentSchema.safeParse({ reference });
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: "Validation failed",
        details: validationResult.error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, { status: 400 });
    }

    const { reference: validReference } = validationResult.data;
    const supabaseAdmin = createSupabaseAdmin();

    // Verify payment with Paystack
    const paystackData = await verifyPaystackPayment(validReference);

    // Check if payment was successful
    if (paystackData.status !== 'success') {
      // Update payment status to failed
      await supabaseAdmin
        .from('payments')
        .update({
          status: 'FAILED',
          gateway_payload: {
            gateway_response: paystackData.gateway_response,
            status: paystackData.status
          },
          updated_at: new Date().toISOString()
        })
        .eq('reference', validReference);

      return NextResponse.json({
        success: false,
        error: "Payment was not successful",
        details: paystackData.gateway_response
      }, { status: 400 });
    }

    // Update payment and booking status
    const updateResult = await updatePaymentAndBooking(supabaseAdmin, validReference, paystackData);
    
    if (!updateResult.success) {
      return NextResponse.json({
        success: false,
        error: updateResult.error
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      bookingId: updateResult.bookingId,
      shortId: updateResult.shortId,
      message: "Payment verified successfully"
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error("Payment verification failed:", error);
    
    return NextResponse.json({
      success: false,
      error: "Payment verification failed",
      details: errorMessage
    }, { status: 500 });
  }
}
