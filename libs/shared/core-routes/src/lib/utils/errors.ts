export function logCatchError(error: unknown, context?: Record<string, any>) {
  console.error('[Error]', error, context);
  // In a real app, send to Sentry/Datadog
}

export function createErrorResponse(message: string, status: number = 500, details?: any): Response {
  return new Response(JSON.stringify({ error: message, details }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
