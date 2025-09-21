'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function PaymentCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    const handlePaymentCallback = async () => {
      const reference = searchParams.get('reference');
      const trxref = searchParams.get('trxref');
      
      if (!reference && !trxref) {
        setStatus('error');
        setMessage('No payment reference found');
        return;
      }

      const paymentRef = reference || trxref;

      try {
        // Verify payment with backend
        const response = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reference: paymentRef,
          }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          setStatus('success');
          setMessage('Payment successful! Your booking has been confirmed.');
          setBookingId(result.bookingId);
          
          // Redirect to confirmation page after 3 seconds
          setTimeout(() => {
            if (result.bookingId) {
              router.push(`/booking/confirmation?bookingId=${result.bookingId}`);
            } else {
              router.push('/dashboard');
            }
          }, 3000);
        } else {
          setStatus('error');
          setMessage(result.error || 'Payment verification failed');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Failed to verify payment. Please contact support.');
        console.error('Payment verification error:', error);
      }
    };

    handlePaymentCallback();
  }, [searchParams, router]);

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  const handleGoToConfirmation = () => {
    if (bookingId) {
      router.push(`/booking/confirmation?bookingId=${bookingId}`);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              {status === 'loading' && (
                <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
              )}
              {status === 'success' && (
                <CheckCircle className="w-16 h-16 text-green-600" />
              )}
              {status === 'error' && (
                <XCircle className="w-16 h-16 text-red-600" />
              )}
            </div>
            <CardTitle className="text-xl">
              {status === 'loading' && 'Processing Payment...'}
              {status === 'success' && 'Payment Successful!'}
              {status === 'error' && 'Payment Failed'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              {status === 'loading' && 'Please wait while we verify your payment...'}
              {status === 'success' && message}
              {status === 'error' && message}
            </p>

            {status === 'success' && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  Redirecting to confirmation page...
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={handleGoToConfirmation}>
                    View Booking
                  </Button>
                  <Button variant="outline" onClick={handleGoToDashboard}>
                    Dashboard
                  </Button>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-2">
                <Button onClick={handleGoToDashboard}>
                  Go to Dashboard
                </Button>
                <p className="text-sm text-gray-500">
                  If you believe this is an error, please contact our support team.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  );
}