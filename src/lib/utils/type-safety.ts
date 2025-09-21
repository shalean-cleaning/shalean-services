/**
 * Type safety utilities for runtime validation and type guards
 */

/**
 * Type guard to check if a value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Type guard to check if a value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Type guard to check if a value is a boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Type guard to check if a value is an object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Type guard to check if a value is an array
 */
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/**
 * Type guard to check if a value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return isString(value) && value.trim().length > 0;
}

/**
 * Type guard to check if a value is a valid email
 */
export function isValidEmail(value: unknown): value is string {
  if (!isString(value)) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

/**
 * Type guard to check if a value is a valid UUID
 */
export function isValidUUID(value: unknown): value is string {
  if (!isString(value)) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Type guard to check if a value is a valid date string
 */
export function isValidDateString(value: unknown): value is string {
  if (!isString(value)) return false;
  const date = new Date(value);
  return !isNaN(date.getTime());
}

/**
 * Type guard to check if a value is a valid time string (HH:mm format)
 */
export function isValidTimeString(value: unknown): value is string {
  if (!isString(value)) return false;
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(value);
}

/**
 * Type guard to check if a value is a positive number
 */
export function isPositiveNumber(value: unknown): value is number {
  return isNumber(value) && value > 0;
}

/**
 * Type guard to check if a value is a non-negative number
 */
export function isNonNegativeNumber(value: unknown): value is number {
  return isNumber(value) && value >= 0;
}

/**
 * Type guard to check if a value is within a range
 */
export function isInRange(value: unknown, min: number, max: number): value is number {
  return isNumber(value) && value >= min && value <= max;
}

/**
 * Type guard to check if a value has required properties
 */
export function hasRequiredProperties<T extends Record<string, unknown>>(
  value: unknown,
  requiredKeys: (keyof T)[]
): value is T {
  if (!isObject(value)) return false;
  
  return requiredKeys.every(key => key in value);
}

/**
 * Type guard to check if a value is a valid booking status
 */
export function isValidBookingStatus(value: unknown): value is 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DRAFT' {
  if (!isString(value)) return false;
  const validStatuses = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DRAFT'];
  return validStatuses.includes(value);
}

/**
 * Type guard to check if a value is a valid user role
 */
export function isValidUserRole(value: unknown): value is 'CUSTOMER' | 'CLEANER' | 'ADMIN' {
  if (!isString(value)) return false;
  const validRoles = ['CUSTOMER', 'CLEANER', 'ADMIN'];
  return validRoles.includes(value);
}

/**
 * Type guard to check if a value is a valid payment status
 */
export function isValidPaymentStatus(value: unknown): value is 'PENDING' | 'INITIALIZED' | 'SUCCESS' | 'FAILED' | 'CANCELLED' {
  if (!isString(value)) return false;
  const validStatuses = ['PENDING', 'INITIALIZED', 'SUCCESS', 'FAILED', 'CANCELLED'];
  return validStatuses.includes(value);
}

/**
 * Safe type assertion with runtime validation
 */
export function safeAssert<T>(
  value: unknown,
  typeGuard: (value: unknown) => value is T,
  errorMessage: string = 'Type assertion failed'
): T {
  if (!typeGuard(value)) {
    throw new Error(errorMessage);
  }
  return value;
}

/**
 * Safe property access with type checking
 */
export function safeGet<T>(
  obj: unknown,
  path: string,
  typeGuard: (value: unknown) => value is T
): T | undefined {
  if (!isObject(obj)) return undefined;
  
  const keys = path.split('.');
  let current: unknown = obj;
  
  for (const key of keys) {
    if (!isObject(current) || !(key in current)) {
      return undefined;
    }
    current = current[key];
  }
  
  return typeGuard(current) ? current : undefined;
}

/**
 * Type-safe object property access
 */
export function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] | undefined {
  return obj?.[key];
}

/**
 * Type-safe array access
 */
export function getArrayItem<T>(arr: T[], index: number): T | undefined {
  return arr?.[index];
}

/**
 * Type-safe string conversion
 */
export function safeString(value: unknown): string {
  if (isString(value)) return value;
  if (isNumber(value)) return value.toString();
  if (isBoolean(value)) return value.toString();
  return String(value);
}

/**
 * Type-safe number conversion
 */
export function safeNumber(value: unknown): number | undefined {
  if (isNumber(value)) return value;
  if (isString(value)) {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
}

/**
 * Type-safe boolean conversion
 */
export function safeBoolean(value: unknown): boolean {
  if (isBoolean(value)) return value;
  if (isString(value)) {
    const lower = value.toLowerCase();
    return lower === 'true' || lower === '1' || lower === 'yes';
  }
  if (isNumber(value)) return value !== 0;
  return Boolean(value);
}
