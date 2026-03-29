/**
 * Create Supabase server client
 * Server-side only - uses service role key
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@org/shared-types';

export function createServerClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase server environment variables');
  }

  return createClient<Database>(url, key);
}
