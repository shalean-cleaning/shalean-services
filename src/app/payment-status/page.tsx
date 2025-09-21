import { Suspense } from 'react';
import PaymentStatusClient from './PaymentStatusClient';

export default function PaymentStatusPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading payment status...</p>
          </div>
        }>
          <PaymentStatusClient />
        </Suspense>
      </div>
    </div>
  );
}

export async function generateMetadata() {
  return {
    title: 'Payment Status - Shalean Services',
    description: 'Check the status of your payment and booking',
  };
}
