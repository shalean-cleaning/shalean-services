/**
 * Utility functions for API calls
 */

/**
 * Get the base URL for API calls
 * Handles different environments (development, production, etc.)
 */
export function getApiBaseUrl(): string {
  // In production, use the configured base URL
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  
  // In development or when NEXT_PUBLIC_BASE_URL is not set
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3002';
  }
  
  // Fallback for other environments
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
}

/**
 * Construct a full API URL
 * @param endpoint - The API endpoint (e.g., '/api/services')
 * @returns The full URL for the API call
 */
export function getApiUrl(endpoint: string): string {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
}

/**
 * Make a server-side API call with proper error handling
 * @param endpoint - The API endpoint
 * @param options - Fetch options
 * @returns The response data
 */
export async function apiCall<T = any>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = getApiUrl(endpoint);
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`API call failed: ${response.status} ${response.statusText} ${errorText}`);
  }
  
  return response.json();
}
