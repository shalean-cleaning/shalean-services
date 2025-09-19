'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface PaymentVerificationResult {
  success: boolean;
  bookingId?: string;
  shortId?: string;
  error?: string;
  details?: string;
}

interface CallbackClientProps {
  reference: string | null;
}

export default function CallbackClient({ reference }: CallbackClientProps) {
  const router = useRouter();
  const [verificationResult, setVerificationResult] = useState<PaymentVerificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference) {
        setError('No payment reference provided');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/payments/verify?reference=${encodeURIComponent(reference)}`);
        const result = await response.json();
        
        setVerificationResult(result);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to verify payment';
        setError(errorMessage);
        setVerificationResult({
          success: false,
          error: errorMessage
        });
      } finally {
        setIsLoading(false);
      }
    };

    verifyPayment();
  }, [reference]);

  const handleViewBooking = () => {
    if (verificationResult?.shortId) {
      router.push(`/order/${verificationResult.shortId}`);
    } else if (verificationResult?.bookingId) {
      router.push(`/booking/${verificationResult.bookingId}`);
    } else {
      router.push('/booking');
    }
  };

  const handleTryAgain = () => {
    router.push('/booking/review');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verifying Payment
            </h1>
            <p className="text-gray-600">
              Please wait while we verify your payment with our payment processor...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (error && !verificationResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 max-w-md w-full mx-4 border-red-200 bg-red-50">
          <div className="text-center">
            <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-800 mb-2">
              Verification Error
            </h1>
            <p className="text-red-700 mb-6">
              {error}
            </p>
            <div className="space-y-3">
              <Button onClick={handleTryAgain} className="w-full">
                Try Again
              </Button>
              <Button variant="outline" onClick={handleGoHome} className="w-full">
                Go Home
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (verificationResult?.success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 max-w-md w-full mx-4 border-green-200 bg-green-50">
          <div className="text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-green-800 mb-2">
              Payment Successful!
            </h1>
            <p className="text-green-700 mb-6">
              Your payment has been processed successfully. Your booking is now confirmed.
            </p>
            <div className="space-y-3">
              <Button onClick={handleViewBooking} className="w-full">
                View Booking Details
              </Button>
              <Button variant="outline" onClick={handleGoHome} className="w-full">
                Go Home
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Payment failed
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="p-8 max-w-md w-full mx-4 border-red-200 bg-red-50">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-800 mb-2">
            Payment Failed
          </h1>
          <p className="text-red-700 mb-4">
            {verificationResult?.error || 'Your payment could not be processed.'}
          </p>
          {verificationResult?.details && (
            <p className="text-sm text-red-600 mb-6">
              {verificationResult.details}
            </p>
          )}
          <div className="space-y-3">
            <Button onClick={handleTryAgain} className="w-full">
              Try Again
            </Button>
            <Button variant="outline" onClick={handleGoHome} className="w-full">
              Go Home
            </Button>
          </div>
          <div className="mt-6 p-3 bg-red-100 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>Need help?</strong> Contact our support team if you continue to experience issues.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
