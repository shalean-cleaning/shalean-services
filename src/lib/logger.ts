/**
 * Structured logger utility that provides consistent JSON logging
 * Reduces console noise in production while maintaining detailed logs
 */

interface LogEntry {
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  timestamp: string;
  data?: any;
  requestId?: string;
  userId?: string;
  sessionId?: string;
  endpoint?: string;
  method?: string;
}

class Logger {
  private formatLog(level: LogEntry['level'], message: string, data?: any): string {
    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...data,
    };

    // In production, always output JSON for structured logging
    if (process.env.NODE_ENV === 'production') {
      return JSON.stringify(logEntry);
    }

    // In development, use readable format
    const prefix = `[${logEntry.timestamp}] ${level.toUpperCase()}`;
    if (data) {
      return `${prefix}: ${message}\n${JSON.stringify(data, null, 2)}`;
    }
    return `${prefix}: ${message}`;
  }

  error(message: string, data?: any): void {
    // Always log errors
    console.error(this.formatLog('error', message, data));
  }
  
  warn(message: string, data?: any): void {
    // Log warnings in development, minimal in production
    if (process.env.NODE_ENV === 'development') {
      console.warn(this.formatLog('warn', message, data));
    } else {
      // In production, only log warnings as JSON
      console.warn(this.formatLog('warn', message, data));
    }
  }
  
  info(message: string, data?: any): void {
    // Only log info in development
    if (process.env.NODE_ENV === 'development') {
      console.log(this.formatLog('info', message, data));
    }
  }
  
  debug(message: string, data?: any): void {
    // Only log debug in development
    if (process.env.NODE_ENV === 'development') {
      console.log(this.formatLog('debug', message, data));
    }
  }

  // API-specific logging methods
  apiRequest(endpoint: string, method: string, requestId: string, data?: any): void {
    this.info(`API Request: ${method} ${endpoint}`, {
      requestId,
      endpoint,
      method,
      ...data,
    });
  }

  apiResponse(endpoint: string, method: string, requestId: string, statusCode: number, data?: any): void {
    const level = statusCode >= 400 ? 'warn' : 'info';
    this[level](`API Response: ${method} ${endpoint} - ${statusCode}`, {
      requestId,
      endpoint,
      method,
      statusCode,
      ...data,
    });
  }

  databaseQuery(query: string, requestId?: string, data?: any): void {
    this.debug(`Database Query: ${query}`, {
      requestId,
      query,
      ...data,
    });
  }

  databaseError(error: any, query?: string, requestId?: string): void {
    this.error('Database Error', {
      requestId,
      query,
      error: {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      },
    });
  }
}

export const logger = new Logger();
