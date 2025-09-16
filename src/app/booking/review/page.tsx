import { redirect } from 'next/navigation';
import { createSupabaseServer } from '@/lib/supabase/server';
import { BookingReviewStep } from '@/components/booking/steps/booking-review-step';

export default async function BookingReviewPage() {
  const supabase = createSupabaseServer();
  
  // Check authentication
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session?.user) {
    // Redirect to login with returnTo parameter
    redirect('/auth/login?returnTo=/booking/review');
  }

  // Ensure profile exists
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, first_name, last_name, role')
    .eq('id', session.user.id)
    .single();

  if (!profile) {
    // Profile doesn't exist, redirect to login
    redirect('/auth/login?returnTo=/booking/review');
  }

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
