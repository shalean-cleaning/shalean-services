import { NextResponse } from "next/server";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { 
  createTestBooking, 
  createTestPayment, 
  simulateSuccessfulPayment,
  cleanupTestData 
} from "@/lib/payments/payment-test-utils";

export const runtime = "nodejs";

const TestPaymentSchema = z.object({
  action: z.enum(['create', 'simulate', 'cleanup']),
  bookingId: z.string().uuid().optional(),
  paymentId: z.string().uuid().optional(),
  reference: z.string().optional(),
  customerEmail: z.string().email().optional(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    // Only allow in development mode
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({
        success: false,
        error: "Payment testing is only available in development mode"
      }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    
    // Validate input
    const validationResult = TestPaymentSchema.safeParse(body);
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

    const { action, bookingId, paymentId, reference, customerEmail, customerName, customerPhone } = validationResult.data;

    switch (action) {
      case 'create': {
        const result = await createTestBooking(
          customerEmail || 'test@example.com',
          customerName || 'Test Customer',
          customerPhone || '+27123456789'
        );
        
        if (!result.success) {
          return NextResponse.json({
            success: false,
            error: result.error
          }, { status: 500 });
        }

        // Create a test payment for the booking
        const paymentResult = await createTestPayment(result.bookingId!);
        
        if (!paymentResult.success) {
          return NextResponse.json({
            success: false,
            error: paymentResult.error
          }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          bookingId: result.bookingId,
          paymentId: paymentResult.paymentId,
          reference: paymentResult.reference,
          message: "Test booking and payment created successfully"
        });
      }

      case 'simulate': {
        if (!bookingId || !paymentId || !reference) {
          return NextResponse.json({
            success: false,
            error: "bookingId, paymentId, and reference are required for simulation"
          }, { status: 400 });
        }

        const result = await simulateSuccessfulPayment(bookingId, paymentId, reference);
        
        if (!result.success) {
          return NextResponse.json({
            success: false,
            error: result.error
          }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          message: "Payment simulation completed successfully"
        });
      }

      case 'cleanup': {
        if (!bookingId) {
          return NextResponse.json({
            success: false,
            error: "bookingId is required for cleanup"
          }, { status: 400 });
        }

        const result = await cleanupTestData(bookingId);
        
        if (!result.success) {
          return NextResponse.json({
            success: false,
            error: result.error
          }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          message: "Test data cleaned up successfully"
        });
      }

      default:
        return NextResponse.json({
          success: false,
          error: "Invalid action"
        }, { status: 400 });
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error("Payment test API error:", error);
    
    return NextResponse.json({
      success: false,
      error: "Payment test failed",
      details: errorMessage
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Payment testing API is available",
    availableActions: ['create', 'simulate', 'cleanup'],
    environment: process.env.NODE_ENV
  });
}
