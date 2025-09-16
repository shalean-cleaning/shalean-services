/**
 * Simple logger utility that reduces console noise in production
 */
export const logger = {
  error: (message: string, ...args: unknown[]) => {
    // Always log errors
    console.error(message, ...args);
  },
  
  warn: (message: string, ...args: unknown[]) => {
    // Log warnings in development, minimal in production
    if (process.env.NODE_ENV === 'development') {
      console.warn(message, ...args);
    }
  },
  
  info: (message: string, ...args: unknown[]) => {
    // Only log info in development
    if (process.env.NODE_ENV === 'development') {
      console.log(message, ...args);
    }
  },
  
  debug: (message: string, ...args: unknown[]) => {
    // Only log debug in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }
};
