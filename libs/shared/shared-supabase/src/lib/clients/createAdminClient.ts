/**
 * Create Supabase admin client
 * Admin operations - uses service role key with elevated permissions
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@org/shared-types';

export function createAdminClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase admin environment variables');
  }

  // Admin client with elevated permissions
  return createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
