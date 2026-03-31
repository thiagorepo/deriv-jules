export function logCatchError(
  error: unknown,
  context?: Record<string, unknown>,
) {
  console.error('[Error]', error, context);
  // In a real app, send to Sentry/Datadog
}

export function createErrorResponse(
  message: string,
  status = 500,
  details?: unknown,
): Response {
  return new Response(JSON.stringify({ error: message, details }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
