import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Builds a returnTo URL from pathname and search params
 * Preserves query strings and step context
 */
export function buildReturnToUrl(pathname: string, searchParams?: URLSearchParams | string): string {
  const search = typeof searchParams === 'string' ? searchParams : searchParams?.toString() || ''
  const fullPath = pathname + (search ? `?${search}` : '')
  
  // Validate the path to prevent open redirects
  return validateReturnTo(fullPath)
}

/**
 * Validates the returnTo parameter to prevent open redirects
 * Only allows internal paths starting with /
 */
export function validateReturnTo(returnTo: string | null): string {
  if (!returnTo) {
    return '/booking/review'
  }

  try {
    const url = new URL(returnTo, 'http://localhost')
    // Only allow internal paths starting with /
    if (url.pathname.startsWith('/') && !url.hostname) {
      return url.pathname + url.search
    }
  } catch {
    // Invalid URL, fallback to default
  }

  return '/booking/review'
}

/**
 * Booking context for authentication redirects
 */
export interface BookingContext {
  currentStep?: number;
  serviceSlug?: string;
  bookingId?: string;
  returnPath: string;
  timestamp: number;
}

/**
 * Stores booking context in sessionStorage for authentication redirects
 * This preserves the user's progress through the booking flow
 */
export function storeBookingContext(context: Partial<BookingContext> & { returnPath: string }): void {
  if (typeof window === 'undefined') return;
  
  const fullContext: BookingContext = {
    currentStep: context.currentStep,
    serviceSlug: context.serviceSlug,
    bookingId: context.bookingId,
    returnPath: context.returnPath,
    timestamp: Date.now(),
  };
  
  try {
    sessionStorage.setItem('booking-auth-context', JSON.stringify(fullContext));
  } catch (error) {
    console.warn('Failed to store booking context:', error);
  }
}

/**
 * Retrieves and clears booking context from sessionStorage
 * Returns null if no context exists or if it's expired (> 1 hour)
 */
export function getAndClearBookingContext(): BookingContext | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = sessionStorage.getItem('booking-auth-context');
    if (!stored) return null;
    
    const context: BookingContext = JSON.parse(stored);
    
    // Check if context is expired (1 hour)
    const isExpired = Date.now() - context.timestamp > 60 * 60 * 1000;
    if (isExpired) {
      sessionStorage.removeItem('booking-auth-context');
      return null;
    }
    
    // Clear the context after retrieval
    sessionStorage.removeItem('booking-auth-context');
    return context;
  } catch (error) {
    console.warn('Failed to retrieve booking context:', error);
    sessionStorage.removeItem('booking-auth-context');
    return null;
  }
}

/**
 * Builds a comprehensive returnTo URL that includes booking context
 * Used when redirecting to login during the booking flow
 */
export function buildBookingReturnToUrl(
  currentPath: string, 
  context?: Partial<BookingContext>
): string {
  // Store the booking context
  if (context) {
    storeBookingContext({
      ...context,
      returnPath: currentPath,
    });
  }
  
  // Return the current path as the returnTo URL
  return validateReturnTo(currentPath);
}
