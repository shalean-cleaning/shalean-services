import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseAdmin, createSupabaseServer } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { env } from '@/env.server';
import { 
  shouldUseMockPaystack, 
  mockVerifyPayment 
} from '@/lib/payments/mock-paystack';
import { sendBookingConfirmation } from '@/app/actions/send-booking-confirmation';

export const runtime = 'nodejs';

const VerifyPaymentSchema = z.object({
  reference: z.string().min(1, 'Payment reference is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validationResult = VerifyPaymentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: validationResult.error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, { status: 400 });
    }

    const { reference } = validationResult.data;
    const supabaseAdmin = createSupabaseAdmin();
    const supabaseServer = await createSupabaseServer();

    // Get customer from session
    const { data: { session }, error: sessionError } = await supabaseServer.auth.getSession();
    
    if (sessionError || !session?.user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    const customerId = session.user.id;

    // Find payment record with booking details
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .select(`
        *,
        bookings (
          *,
          services (
            id,
            name,
            description
          ),
          cleaners (
            id,
            name
          )
        )
      `)
      .eq('reference', reference)
      .eq('customer_id', customerId)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json({
        success: false,
        error: 'Payment not found'
      }, { status: 404 });
    }

    // Verify payment with Paystack
    let verificationResult;
    
    if (shouldUseMockPaystack()) {
      // Use mock verification for development
      verificationResult = await mockVerifyPayment(reference);
    } else {
      // Use real Paystack verification
      const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          'Authorization': `Bearer ${env.PAYSTACK_SECRET_KEY}`,
        },
      });

      if (!paystackResponse.ok) {
        throw new Error('Paystack verification failed');
      }

      verificationResult = await paystackResponse.json();
    }

    // Check if payment was successful
    if (verificationResult.status !== 'success' || verificationResult.data.status !== 'success') {
      return NextResponse.json({
        success: false,
        error: 'Payment verification failed',
        details: verificationResult.message || 'Payment was not successful'
      }, { status: 400 });
    }

    // Update payment record
    const { error: updateError } = await supabaseAdmin
      .from('payments')
      .update({
        status: 'SUCCESS',
        gateway_reference: verificationResult.data.reference,
        gateway_response: verificationResult,
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.id);

    if (updateError) {
      logger.error('Failed to update payment record:', updateError);
    }

    // Update booking status
    const { error: bookingUpdateError } = await supabaseAdmin
      .from('bookings')
      .update({
        status: 'CONFIRMED',
        paystack_ref: reference,
        paystack_status: 'success',
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.booking_id);

    if (bookingUpdateError) {
      logger.error('Failed to update booking status:', bookingUpdateError);
    }

    // Send confirmation email
    try {
      const booking = payment.bookings;
      if (booking) {
        await sendBookingConfirmation({
          customerName: session.user.user_metadata?.full_name || session.user.email || 'Customer',
          customerEmail: session.user.email || '',
          bookingId: booking.id,
          serviceName: booking.services?.name || 'Cleaning Service',
          bookingDate: booking.booking_date || '',
          bookingTime: booking.start_time || '',
          address: booking.address || '',
          postcode: booking.postcode || '',
          bedrooms: booking.bedrooms || 1,
          bathrooms: booking.bathrooms || 1,
          totalPrice: booking.total_price || 0,
          cleanerName: booking.cleaners?.name,
          specialInstructions: booking.special_instructions,
        });
        
        logger.info(`Confirmation email sent for booking ${booking.id}`);
      }
    } catch (emailError) {
      logger.error('Failed to send confirmation email:', emailError);
      // Don't fail the payment verification if email fails
    }

    logger.info(`Payment verified successfully for booking ${payment.booking_id}`);

    return NextResponse.json({
      success: true,
      bookingId: payment.booking_id,
      message: 'Payment verified successfully'
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Payment verification failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Payment verification failed',
      details: errorMessage
    }, { status: 500 });
  }
}