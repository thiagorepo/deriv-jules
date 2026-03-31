import { createBrowserClient } from '@org/supabase';

// Assuming these are called from client components
const getSupabase = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

export const signIn = async (
  email: string,
  password?: string,
  provider?: string,
) => {
  const supabase = getSupabase();
  if (provider) {
    return supabase.auth.signInWithOAuth({ provider });
  }
  return supabase.auth.signInWithPassword({ email, password: password || '' });
};

export const signUp = async (email: string, password?: string) => {
  const supabase = getSupabase();
  return supabase.auth.signUp({ email, password: password || '' });
};

export const signOut = async () => {
  const supabase = getSupabase();
  return supabase.auth.signOut();
};
