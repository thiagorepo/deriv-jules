import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_TENANT_ID: z.string().min(1, 'Tenant ID is required'),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase Anon Key is required'),
  // Optional theming vars
  NEXT_PUBLIC_THEME: z.string().optional(),
  NEXT_PUBLIC_PRIMARY_COLOR: z.string().optional(),
  NEXT_PUBLIC_TENANT_NAME: z.string().optional(),
});

export function validateEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('Environment validation failed:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment configuration');
  }
  return parsed.data;
}
