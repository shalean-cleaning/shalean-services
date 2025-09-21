import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Validates the returnTo parameter to prevent open redirects
 * Only allows internal paths starting with /
 */
export function validateReturnTo(returnTo: string | null): string {
  if (!returnTo) {
    return '/'
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

  return '/'
}

/**
 * Formats a number as currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(amount)
}

/**
 * Booking context interface for preserving user's booking state during auth
 */
export interface BookingContext {
  currentStep?: number;
  serviceSlug?: string;
  bookingId?: string;
  returnPath: string;
  timestamp: number;
}

/**
 * Builds a returnTo URL with proper validation
 */
export function buildReturnToUrl(pathname: string, searchParams?: URLSearchParams): string {
  const url = new URL(pathname, 'http://localhost');
  if (searchParams) {
    searchParams.forEach((value, key) => {
      url.searchParams.set(key, value);
    });
  }
  return url.pathname + url.search;
}

/**
 * Stores booking context in sessionStorage for preservation during auth flow
 */
export function storeBookingContext(context: Omit<BookingContext, 'timestamp'>): void {
  if (typeof window === 'undefined') return;
  
  const contextWithTimestamp: BookingContext = {
    ...context,
    timestamp: Date.now(),
  };
  
  try {
    sessionStorage.setItem('booking-context', JSON.stringify(contextWithTimestamp));
  } catch (error) {
    console.warn('Failed to store booking context:', error);
  }
}

/**
 * Retrieves and clears booking context from sessionStorage
 * Returns null if context is expired (1 hour) or doesn't exist
 */
export function getAndClearBookingContext(): BookingContext | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = sessionStorage.getItem('booking-context');
    if (!stored) return null;
    
    const context: BookingContext = JSON.parse(stored);
    
    // Check if context is expired (1 hour)
    const oneHour = 60 * 60 * 1000;
    if (Date.now() - context.timestamp > oneHour) {
      sessionStorage.removeItem('booking-context');
      return null;
    }
    
    // Clear the context after retrieval
    sessionStorage.removeItem('booking-context');
    return context;
  } catch (error) {
    console.warn('Failed to retrieve booking context:', error);
    sessionStorage.removeItem('booking-context');
    return null;
  }
}

/**
 * Builds a returnTo URL and stores booking context for auth redirects
 */
export function buildBookingReturnToUrl(
  returnPath: string, 
  context: Pick<BookingContext, 'currentStep' | 'serviceSlug' | 'bookingId'>
): string {
  // Store the booking context
  storeBookingContext({
    ...context,
    returnPath,
  });
  
  // Return the returnTo URL
  return returnPath;
}