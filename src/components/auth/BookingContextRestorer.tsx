'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { getAndClearBookingContext } from '@/lib/utils'

interface BookingContextRestorerProps {
  children: React.ReactNode
}

/**
 * Component that handles booking context restoration after authentication
 * Detects if user is coming from auth callback and redirects appropriately
 */
export function BookingContextRestorer({ children }: BookingContextRestorerProps) {
  const router = useRouter()

  useEffect(() => {
    // Check if we have a booking context to restore
    const bookingContext = getAndClearBookingContext()
    
    if (bookingContext) {
      // Determine the appropriate redirect based on context
      let redirectPath = bookingContext.returnPath
      
      // If user was on an earlier step (1-4), redirect back to that step
      if (bookingContext.currentStep && bookingContext.currentStep < 5 && bookingContext.serviceSlug) {
        redirectPath = `/booking/service/${bookingContext.serviceSlug}?step=${bookingContext.currentStep}`
      }
      // If user has a booking ID, redirect to view-pay
      else if (bookingContext.bookingId) {
        redirectPath = `/booking/view-pay/${bookingContext.bookingId}`
      }
      // Otherwise, use the stored return path
      
      // Only redirect if we're not already on the target path
      if (window.location.pathname !== redirectPath) {
        router.push(redirectPath)
      }
    }
  }, [router])

  return <>{children}</>
}
