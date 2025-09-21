/**
 * Centralized error handling utilities for consistent error responses
 */

export interface ApiError {
  success: false;
  error: string;
  errorCode?: string;
  details?: any;
}

export interface ApiSuccess<T = any> {
  success: true;
  data?: T;
  message?: string;
}

export type ApiResponse<T = any> = ApiSuccess<T> | ApiError;

/**
 * Creates a standardized error response
 */
export function createErrorResponse(
  error: string,
  errorCode?: string,
  details?: any,
  status: number = 500
): { response: ApiError; status: number } {
  return {
    response: {
      success: false,
      error,
      errorCode,
      details
    },
    status
  };
}

/**
 * Creates a standardized success response
 */
export function createSuccessResponse<T>(
  data?: T,
  message?: string
): ApiSuccess<T> {
  return {
    success: true,
    data,
    message
  };
}

/**
 * Handles common database errors and returns appropriate error responses
 */
export function handleDatabaseError(error: any): { response: ApiError; status: number } {
  if (error.code === 'PGRST116') {
    return createErrorResponse(
      'Resource not found',
      'not_found',
      { originalError: error.message },
      404
    );
  }

  if (error.code === '23505') {
    return createErrorResponse(
      'Duplicate entry',
      'duplicate',
      { originalError: error.message },
      409
    );
  }

  if (error.code === '23503') {
    return createErrorResponse(
      'Foreign key constraint violation',
      'constraint_violation',
      { originalError: error.message },
      400
    );
  }

  // Generic database error
  return createErrorResponse(
    'Database operation failed',
    'database_error',
    { originalError: error.message },
    500
  );
}

/**
 * Handles validation errors and returns appropriate error responses
 */
export function handleValidationError(error: any): { response: ApiError; status: number } {
  if (error.issues && Array.isArray(error.issues)) {
    return createErrorResponse(
      'Validation failed',
      'validation_error',
      {
        issues: error.issues.map((issue: any) => ({
          field: issue.path.join('.'),
          message: issue.message,
          code: issue.code
        }))
      },
      400
    );
  }

  return createErrorResponse(
    'Invalid input data',
    'validation_error',
    { originalError: error.message },
    400
  );
}

/**
 * Wraps async functions with error handling
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context: string = 'operation'
): Promise<{ success: true; data: T } | { success: false; error: string; errorCode: string }> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    console.error(`Error in ${context}:`, error);
    
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
        errorCode: 'operation_failed'
      };
    }

    return {
      success: false,
      error: 'An unexpected error occurred',
      errorCode: 'unknown_error'
    };
  }
}

/**
 * Logs errors with context for debugging
 */
export function logError(error: any, context: string, additionalData?: any): void {
  const errorInfo = {
    context,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
    ...additionalData
  };

  console.error('Application Error:', JSON.stringify(errorInfo, null, 2));
}
