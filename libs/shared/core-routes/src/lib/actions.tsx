'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@org/supabase';

/**
 * Server action to authenticate a user using Supabase SSR integration.
 * It also determines user role (Admin/User) and sets HTTP-only cookies
 * for Role-Based Access Control (RBAC) consumed by Edge Middleware.
 *
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @param {string} redirectPath - Default post-login URL (e.g., tenant's specific dashboard URL).
 * @returns {Promise<{error?: string}>} Object containing an error string if authentication fails. Otherwise redirects.
 */
export async function authenticateUser(
  email: string,
  password: string,
  redirectPath: string
) {
  if (!email || password.length < 6) {
    return {
      error:
        'Invalid email or password (password must be at least 6 characters)',
    };
  }

  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return { error: 'Supabase credentials not configured.' };
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, cookieStore);

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: (error as any).message };
  }

  // Determine Role based on email
  const is_admin = email.endsWith('@admin.com');
  const role = is_admin ? 'admin' : 'user';

  // Store user role securely for middleware access
  cookieStore.set('user_role', role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });

  console.log(`[Server Auth] User ${email} authenticated as ${role}`);

  // Redirect on the server side
  if (is_admin) {
    redirect('/admin');
  } else {
    redirect(redirectPath || '/user');
  }
}

/**
 * Server action to log out a user.
 * It destroys the current Supabase session and clears the RBAC 'user_role' cookie,
 * then redirects the user back to the login route.
 */
export async function logoutUser() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    const supabase = createServerClient(supabaseUrl, supabaseKey, cookieStore);
    await supabase.auth.signOut();
  }

  cookieStore.delete('user_role');
  redirect('/login');
}
