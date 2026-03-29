export interface LogContext {
  endpoint: string;
  method: string;
  userId?: string;
  timestamp: string;
  [key: string]: any;
}

export function createLogger(context: LogContext) {
  return {
    info: (message: string, meta?: Record<string, any>) => {
      console.log(
        JSON.stringify({
          level: 'info',
          message,
          context,
          meta,
          timestamp: new Date().toISOString(),
        }),
      );
    },
    error: (message: string, error?: Error, meta?: Record<string, any>) => {
      console.error(
        JSON.stringify({
          level: 'error',
          message,
          context,
          error: error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : undefined,
          meta,
          timestamp: new Date().toISOString(),
        }),
      );
    },
    warn: (message: string, meta?: Record<string, any>) => {
      console.warn(
        JSON.stringify({
          level: 'warn',
          message,
          context,
          meta,
          timestamp: new Date().toISOString(),
        }),
      );
    },
  };
}
