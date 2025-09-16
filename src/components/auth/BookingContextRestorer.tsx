'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAndClearBookingContext } from '@/lib/utils';

interface BookingContextRestorerProps {
  children: React.ReactNode;
}

/**
 * Component that handles booking context restoration after authentication
 * This runs on the client side to check for stored booking context and
 * redirect users to the appropriate step if needed
 */
export function BookingContextRestorer({ children }: BookingContextRestorerProps) {
  const router = useRouter();

  useEffect(() => {
    // Check if we're coming from an auth callback
    const isFromAuthCallback = document.referrer.includes('/auth/callback') || 
                              window.location.search.includes('auth_callback=true');
    
    if (isFromAuthCallback) {
      const bookingContext = getAndClearBookingContext();
      
      if (bookingContext) {
        // If we have booking context, redirect to the appropriate step
        if (bookingContext.currentStep && bookingContext.currentStep < 5) {
          // If user was on an earlier step, redirect back to the booking flow
          const serviceSlug = bookingContext.serviceSlug || 'standard-cleaning';
          router.push(`/booking/service/${serviceSlug}?step=${bookingContext.currentStep}`);
          return;
        } else if (bookingContext.bookingId) {
          // If we have a booking ID, redirect to view-pay page
          router.push(`/booking/view-pay/${bookingContext.bookingId}`);
          return;
        }
        // Otherwise, stay on the review page (current behavior)
      }
    }
  }, [router]);

  return <>{children}</>;
}
