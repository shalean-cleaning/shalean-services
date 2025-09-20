import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { createSupabaseServer } from '@/lib/supabase/server';
import OrderConfirmationClient from './OrderConfirmationClient';

interface OrderConfirmationPageProps {
  params: Promise<{ shortId: string }>;
}

async function getBookingByShortId(shortId: string) {
  const supabase = await createSupabaseServer();
  
  // Get the authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return null;
  }

  // Fetch the booking with items - RLS will ensure user can only access their own bookings
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select(`
      *,
      booking_items (
        id,
        service_item_id,
        item_type,
        qty,
        unit_price,
        subtotal
      ),
      services (
        id,
        name,
        description,
        base_fee
      ),
      suburbs (
        id,
        name
      ),
      cleaners (
        id,
        name,
        rating,
        total_ratings
      )
    `)
    .eq('short_id', shortId)
    .single();

  if (fetchError || !booking) {
    return null;
  }

  // Additional security check - ensure user owns this booking or is admin
  if (booking.customer_id !== user.id) {
    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'ADMIN') {
      return null;
    }
  }

  return booking;
}

export default async function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const { shortId } = await params;
  
  const booking = await getBookingByShortId(shortId);
  
  if (!booking) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading booking details...</p>
          </div>
        }>
          <OrderConfirmationClient booking={booking} />
        </Suspense>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: OrderConfirmationPageProps) {
  const { shortId } = await params;
  
  return {
    title: `Booking Confirmation - Order ${shortId} | Shalean Services`,
    description: 'Your booking has been confirmed. Thank you for choosing Shalean Services.',
    robots: 'noindex, nofollow', // Don't index confirmation pages
    alternates: {
      canonical: `/order/${shortId}`,
    },
  };
}
