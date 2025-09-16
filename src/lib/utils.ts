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
