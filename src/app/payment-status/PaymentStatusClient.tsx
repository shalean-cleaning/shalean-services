'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, CreditCard, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PaymentStatus {
  isMockMode: boolean;
  lastPayment?: {
    reference: string;
    status: string;
    amount: number;
    currency: string;
    createdAt: string;
  };
}

export default function PaymentStatusClient() {
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        // Check if we're in mock mode
        const isMockMode = process.env.NODE_ENV === 'development' || 
                          process.env.NEXT_PUBLIC_USE_MOCK_PAYSTACK === 'true';

        // In a real implementation, you would fetch actual payment status
        // For now, we'll just show the mock mode status
        setPaymentStatus({
          isMockMode,
          lastPayment: isMockMode ? {
            reference: 'MOCK_PAYMENT_REF',
            status: 'success',
            amount: 50000, // 500.00 ZAR in cents
            currency: 'ZAR',
            createdAt: new Date().toISOString()
          } : undefined
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to check payment status';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    checkPaymentStatus();
  }, []);

  const handleTestPayment = () => {
    router.push('/booking/review');
  };

  const handleViewBookings = () => {
    router.push('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Checking Payment Status
        </h1>
        <p className="text-gray-600">
          Please wait while we check your payment status...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-red-800 mb-2">
          Error Checking Payment Status
        </h1>
        <p className="text-red-700 mb-6">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Payment Status
        </h1>
        <p className="text-gray-600">
          Check the status of your payments and bookings
        </p>
      </div>

      {/* Mock Mode Indicator */}
      {paymentStatus?.isMockMode && (
        <Card className="p-4 border-yellow-200 bg-yellow-50">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
            <div>
              <h3 className="font-semibold text-yellow-800">Development Mode</h3>
              <p className="text-sm text-yellow-700">
                Paystack integration is running in mock mode. No real payments will be processed.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Payment Status */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
          Payment Information
        </h2>
        
        {paymentStatus?.lastPayment ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Status:</span>
              <Badge 
                variant={paymentStatus.lastPayment.status === 'success' ? 'default' : 'destructive'}
                className="flex items-center"
              >
                {paymentStatus.lastPayment.status === 'success' ? (
                  <CheckCircle className="w-3 h-3 mr-1" />
                ) : (
                  <XCircle className="w-3 h-3 mr-1" />
                )}
                {paymentStatus.lastPayment.status.toUpperCase()}
              </Badge>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Reference:</span>
              <span className="font-mono text-sm">{paymentStatus.lastPayment.reference}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-semibold">
                {paymentStatus.lastPayment.currency} {(paymentStatus.lastPayment.amount / 100).toFixed(2)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span>{new Date(paymentStatus.lastPayment.createdAt).toLocaleString()}</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Recent Payments
            </h3>
            <p className="text-gray-600 mb-6">
              You haven't made any payments recently.
            </p>
            <Button onClick={handleTestPayment}>
              Test Payment Flow
            </Button>
          </div>
        )}
      </Card>

      {/* Actions */}
      <div className="flex gap-4 justify-center">
        <Button variant="outline" onClick={handleTestPayment}>
          Test Payment
        </Button>
        <Button variant="outline" onClick={handleViewBookings}>
          View Bookings
        </Button>
        <Button variant="outline" onClick={() => router.push('/')}>
          Go Home
        </Button>
      </div>

      {/* Development Info */}
      {paymentStatus?.isMockMode && (
        <Card className="p-4 border-blue-200 bg-blue-50">
          <h3 className="font-semibold text-blue-800 mb-2">Development Information</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• Mock Paystack is enabled for development</p>
            <p>• Payments will always succeed in mock mode</p>
            <p>• No real money will be charged</p>
            <p>• Set <code className="bg-blue-100 px-1 rounded">PAYSTACK_SECRET_KEY</code> to use real Paystack</p>
          </div>
        </Card>
      )}
    </div>
  );
}
