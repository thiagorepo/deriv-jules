'use server'

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function authenticateUser(email, password, redirectPath) {
  // Simulate network latency for mock auth
  await new Promise((resolve) => setTimeout(resolve, 800));

  if (!email || password.length < 6) {
    return { error: 'Invalid email or password (password must be at least 6 characters)' };
  }

  // Mock Authentication Logic
  const is_admin = email.endsWith('@admin.com');
  const role = is_admin ? 'admin' : 'user';

  // Securely set HttpOnly cookies instead of localStorage
  const cookieStore = await cookies();
  cookieStore.set('access_token', `mock_${role}_token_12345`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7 // 1 week
  });
  
  cookieStore.set('user_email', email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  });

  cookieStore.set('user_role', role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  });

  console.log(`[Server Auth] User ${email} authenticated as ${role}`);

  // Redirect on the server side
  if (is_admin) {
    redirect('/admin');
  } else {
    redirect(redirectPath || '/user');
  }
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete('access_token');
  cookieStore.delete('user_email');
  cookieStore.delete('user_role');
  
  redirect('/login');
}
