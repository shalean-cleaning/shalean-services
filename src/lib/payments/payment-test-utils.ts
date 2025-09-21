/**
 * Payment testing utilities for development and testing
 */

import { createSupabaseAdmin } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export interface TestPaymentResult {
  success: boolean;
  bookingId?: string;
  paymentId?: string;
  reference?: string;
  error?: string;
}

/**
 * Create a test booking for payment testing
 */
export async function createTestBooking(
  customerEmail: string = 'test@example.com',
  customerName: string = 'Test Customer',
  customerPhone: string = '+27123456789'
): Promise<TestPaymentResult> {
  try {
    const supabaseAdmin = createSupabaseAdmin();
    
    // Create a test booking
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert({
        customer_email: customerEmail,
        customer_name: customerName,
        customer_phone: customerPhone,
        total_price: 500.00,
        status: 'READY_FOR_PAYMENT',
        service_id: 1, // Assuming service ID 1 exists
        bedroom_count: 2,
        bathroom_count: 1,
        selected_date: new Date().toISOString().split('T')[0],
        selected_time: '10:00',
        address: '123 Test Street, Test City',
        postcode: '1234',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (bookingError || !booking) {
      logger.error('Failed to create test booking:', bookingError);
      return {
        success: false,
        error: 'Failed to create test booking'
      };
    }

    logger.info(`Test booking created: ${booking.id}`);
    
    return {
      success: true,
      bookingId: booking.id
    };
  } catch (error) {
    logger.error('Error creating test booking:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Create a test payment record
 */
export async function createTestPayment(
  bookingId: string,
  reference: string = `TEST_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
): Promise<TestPaymentResult> {
  try {
    const supabaseAdmin = createSupabaseAdmin();
    
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        booking_id: bookingId,
        reference: reference,
        amount: 500.00,
        amount_minor: 50000,
        currency: 'ZAR',
        status: 'INITIALIZED',
        payment_method: 'paystack',
        gateway_payload: {
          reference: reference,
          status: 'INITIALIZED',
          mock: true
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (paymentError || !payment) {
      logger.error('Failed to create test payment:', paymentError);
      return {
        success: false,
        error: 'Failed to create test payment'
      };
    }

    logger.info(`Test payment created: ${payment.id}`);
    
    return {
      success: true,
      paymentId: payment.id,
      reference: reference
    };
  } catch (error) {
    logger.error('Error creating test payment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Simulate a successful payment
 */
export async function simulateSuccessfulPayment(
  bookingId: string,
  paymentId: string,
  reference: string
): Promise<TestPaymentResult> {
  try {
    const supabaseAdmin = createSupabaseAdmin();
    
    // Update payment status to PAID
    const { error: paymentUpdateError } = await supabaseAdmin
      .from('payments')
      .update({
        status: 'PAID',
        transaction_id: `mock_txn_${Date.now()}`,
        gateway_payload: {
          reference: reference,
          status: 'success',
          gateway_response: 'Successful',
          paid_at: new Date().toISOString(),
          mock: true
        },
        processed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentId);

    if (paymentUpdateError) {
      logger.error('Failed to update payment status:', paymentUpdateError);
      return {
        success: false,
        error: 'Failed to update payment status'
      };
    }

    // Update booking status to PAID
    const { error: bookingUpdateError } = await supabaseAdmin
      .from('bookings')
      .update({
        status: 'PAID',
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId);

    if (bookingUpdateError) {
      logger.error('Failed to update booking status:', bookingUpdateError);
      return {
        success: false,
        error: 'Failed to update booking status'
      };
    }

    logger.info(`Payment simulation completed for booking ${bookingId}`);
    
    return {
      success: true,
      bookingId: bookingId,
      paymentId: paymentId,
      reference: reference
    };
  } catch (error) {
    logger.error('Error simulating payment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Clean up test data
 */
export async function cleanupTestData(bookingId: string): Promise<TestPaymentResult> {
  try {
    const supabaseAdmin = createSupabaseAdmin();
    
    // Delete payment records
    await supabaseAdmin
      .from('payments')
      .delete()
      .eq('booking_id', bookingId);

    // Delete booking
    const { error: bookingDeleteError } = await supabaseAdmin
      .from('bookings')
      .delete()
      .eq('id', bookingId);

    if (bookingDeleteError) {
      logger.error('Failed to delete test booking:', bookingDeleteError);
      return {
        success: false,
        error: 'Failed to delete test booking'
      };
    }

    logger.info(`Test data cleaned up for booking ${bookingId}`);
    
    return {
      success: true
    };
  } catch (error) {
    logger.error('Error cleaning up test data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
