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
