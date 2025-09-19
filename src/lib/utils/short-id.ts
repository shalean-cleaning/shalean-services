/**
 * Generate a short, URL-safe ID for bookings
 * Format: 8-character alphanumeric string
 */
export function generateShortId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Validate that a short ID is in the correct format
 */
export function isValidShortId(shortId: string): boolean {
  return /^[A-Z0-9]{8}$/.test(shortId);
}
