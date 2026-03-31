/**
 * Environment variable validation using Zod.
 * Import and call validateEnv() at app startup to fail fast on missing/invalid config.
 */
import { z } from 'zod';

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  NEXT_PUBLIC_TENANT_ID: z
    .string()
    .min(1, 'NEXT_PUBLIC_TENANT_ID is required')
    .optional(),
  NEXT_PUBLIC_TENANT_NAME: z
    .string()
    .min(1, 'NEXT_PUBLIC_TENANT_NAME is required')
    .optional(),
  NEXT_PUBLIC_THEME: z.enum(['light', 'dark']).default('dark'),
  NEXT_PUBLIC_PRIMARY_COLOR: z
    .string()
    .regex(
      /^#[0-9A-Fa-f]{6}$/,
      'NEXT_PUBLIC_PRIMARY_COLOR must be a valid hex color',
    )
    .optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, 'SUPABASE_SERVICE_ROLE_KEY is required')
    .optional(),
  DERIV_APP_ID: z.string().optional(),
  DERIV_ENDPOINT: z.string().url().optional(),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

/**
 * Validates client-side environment variables.
 * Safe to call in browser and server contexts.
 */
export function validateClientEnv(): ClientEnv {
  const result = clientEnvSchema.safeParse(process.env);
  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`❌ Invalid client environment variables:\n${errors}`);
  }
  return result.data;
}

/**
 * Validates server-side environment variables.
 * Only call in server contexts (API routes, server components).
 */
export function validateServerEnv(): ServerEnv {
  const result = serverEnvSchema.safeParse(process.env);
  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`❌ Invalid server environment variables:\n${errors}`);
  }
  return result.data;
}

/**
 * Validates all environment variables (client + server).
 * Call this in instrumentation.ts or layout.tsx on startup.
 */
export function validateEnv(): { client: ClientEnv; server: ServerEnv } {
  return {
    client: validateClientEnv(),
    server: validateServerEnv(),
  };
}
