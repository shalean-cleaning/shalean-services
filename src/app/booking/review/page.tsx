import { BookingReviewStep } from '@/components/booking/steps/booking-review-step';

export default async function BookingReviewPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BookingReviewStep />
      </div>
    </div>
  );
}

export async function generateMetadata() {
  return {
    title: 'Review & Payment - Shalean Services',
    description: 'Review your booking details and complete payment',
  };
}
