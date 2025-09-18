import { Suspense } from 'react';
import CallbackClient from './CallbackClient';

interface PaymentCallbackPageProps {
  searchParams: { reference?: string };
}

export default function PaymentCallbackPage({ searchParams }: PaymentCallbackPageProps) {
  const reference = searchParams.reference || null;

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <CallbackClient reference={reference} />
    </Suspense>
  );
}

export async function generateMetadata() {
  return {
    title: 'Payment Callback - Shalean Services',
    description: 'Payment verification in progress',
  };
}
