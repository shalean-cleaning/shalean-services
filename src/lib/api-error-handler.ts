/**
 * Centralized API Error Handler
 * 
 * Provides consistent error handling and structured logging for all API routes.
 * Ensures all errors are properly logged with context and return consistent JSON responses.
 */

import { NextResponse } from 'next/server';
import { logger } from './logger';

export interface ApiError {
  message: string;
  code?: string;
  statusCode: number;
  details?: any;
  stack?: string;
}

export interface ApiErrorResponse {
  error: {
    message: string;
    code?: string;
    details?: any;
  };
  requestId?: string;
  timestamp: string;
}

export class ApiErrorHandler {
  private static generateRequestId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private static logError(error: ApiError, context: any, requestId: string): void {
    const logData = {
      requestId,
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        stack: error.stack,
      },
      context: {
        endpoint: context.endpoint,
        method: context.method,
        userId: context.userId,
        sessionId: context.sessionId,
        userAgent: context.userAgent,
        ip: context.ip,
      },
      request: {
        body: context.body ? JSON.stringify(context.body).substring(0, 1000) : undefined,
        query: context.query,
        headers: context.headers ? Object.fromEntries(
          Object.entries(context.headers).filter(([key]) => 
            !['authorization', 'cookie'].includes(key.toLowerCase())
          )
        ) : undefined,
      }
    };

    if (error.statusCode >= 500) {
      logger.error('API Server Error', logData);
    } else if (error.statusCode >= 400) {
      logger.warn('API Client Error', logData);
    } else {
      logger.info('API Error', logData);
    }
  }

  static handle(error: unknown, context: any = {}): NextResponse<ApiErrorResponse> {
    const requestId = this.generateRequestId();
    const timestamp = new Date().toISOString();

    let apiError: ApiError;

    // Handle different types of errors
    if (error instanceof ApiError) {
      apiError = error;
    } else if (error instanceof Error) {
      // Determine status code based on error type
      let statusCode = 500;
      let code = 'INTERNAL_ERROR';

      if (error.name === 'ValidationError') {
        statusCode = 400;
        code = 'VALIDATION_ERROR';
      } else if (error.name === 'UnauthorizedError') {
        statusCode = 401;
        code = 'UNAUTHORIZED';
      } else if (error.name === 'ForbiddenError') {
        statusCode = 403;
        code = 'FORBIDDEN';
      } else if (error.name === 'NotFoundError') {
        statusCode = 404;
        code = 'NOT_FOUND';
      } else if (error.name === 'ConflictError') {
        statusCode = 409;
        code = 'CONFLICT';
      } else if (error.message.includes('database') || error.message.includes('supabase')) {
        statusCode = 503;
        code = 'DATABASE_ERROR';
      }

      apiError = {
        message: error.message,
        code,
        statusCode,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      };
    } else {
      // Unknown error type
      apiError = {
        message: 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
        statusCode: 500,
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      };
    }

    // Log the error with context
    this.logError(apiError, context, requestId);

    // Return consistent error response
    const response: ApiErrorResponse = {
      error: {
        message: apiError.message,
        code: apiError.code,
        details: apiError.details,
      },
      requestId,
      timestamp,
    };

    return NextResponse.json(response, { status: apiError.statusCode });
  }

  // Convenience methods for common error types
  static validationError(message: string, details?: any): ApiError {
    return {
      message,
      code: 'VALIDATION_ERROR',
      statusCode: 400,
      details,
    };
  }

  static unauthorizedError(message: string = 'Authentication required'): ApiError {
    return {
      message,
      code: 'UNAUTHORIZED',
      statusCode: 401,
    };
  }

  static forbiddenError(message: string = 'Access denied'): ApiError {
    return {
      message,
      code: 'FORBIDDEN',
      statusCode: 403,
    };
  }

  static notFoundError(message: string = 'Resource not found'): ApiError {
    return {
      message,
      code: 'NOT_FOUND',
      statusCode: 404,
    };
  }

  static conflictError(message: string, details?: any): ApiError {
    return {
      message,
      code: 'CONFLICT',
      statusCode: 409,
      details,
    };
  }

  static databaseError(message: string = 'Database operation failed', details?: any): ApiError {
    return {
      message,
      code: 'DATABASE_ERROR',
      statusCode: 503,
      details,
    };
  }

  static internalError(message: string = 'Internal server error', details?: any): ApiError {
    return {
      message,
      code: 'INTERNAL_ERROR',
      statusCode: 500,
      details,
    };
  }
}

/**
 * Higher-order function to wrap API route handlers with error handling
 */
export function withErrorHandler<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>,
  endpoint: string
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      // Extract context from the request
      const request = args[0] as Request;
      const context = {
        endpoint,
        method: request.method,
        userAgent: request.headers.get('user-agent'),
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        headers: Object.fromEntries(request.headers.entries()),
      };

      return ApiErrorHandler.handle(error, context);
    }
  };
}

/**
 * Utility function to create standardized success responses
 */
export function createSuccessResponse<T>(data: T, message?: string): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  });
}
