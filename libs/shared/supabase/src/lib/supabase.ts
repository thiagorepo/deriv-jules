// Placeholders for @supabase/ssr library functionality

interface Credentials {
  email: string;
  password: string;
}

interface OAuthParams {
  provider: string;
}

interface MockTenant {
  domain: string;
  theme: string;
  primaryColor: string;
  tenantName: string;
}

interface QueryResult<T> {
  data: T;
  error: { message: string } | null;
}

// 1. Used in Next.js Server Components, Actions, Route Handlers (Requires Cookies)
export function createServerClient(
  supabaseUrl: string,
  _supabaseKey: string,
  _cookieStore: unknown
) {
  console.log(`[Supabase SSR] Initializing SSR client for URL: ${supabaseUrl}`);

  return {
    auth: {
      getUser: async () => {
        console.log('[Supabase SSR Auth] Checking cookies for user session...');
        // Mocking a missing cookie/unauthenticated state by default on SSR
        return {
          data: { user: null },
          error: { message: 'Not authenticated' },
        };
      },
      signInWithPassword: async (credentials: Credentials) => {
        console.log('[Supabase SSR Auth] Attempting sign in with password...');
        return { data: { user: { email: credentials.email } }, error: null };
      },
      signUp: async (credentials: Credentials) => {
          console.log('[Supabase SSR Auth] Attempting sign up...');
          return { data: { user: { email: credentials.email } }, error: null };
      },
      signOut: async () => {
        console.log('[Supabase SSR Auth] Signing out...');
        return { error: null };
      },
    },
    from: (table: string) => {
      return {
        select: (query = '*') => {
          console.log(`[Supabase SSR DB] Selecting ${query} from ${table}...`);

          let domainFilter: string | null = null;

          const builder = {
            eq: function (column: string, value: string) {
              if (column === 'domain') {
                domainFilter = value;
              }
              return this;
            },
            single: function () {
              return this;
            },
            then: function (
              resolve: (value: QueryResult<MockTenant[] | unknown[]>) => void,
              _reject: (reason?: unknown) => void
            ) {
              if (table === 'tenants') {
                const mockTenants: MockTenant[] = [
                  {
                    domain: 'localhost:3000',
                    theme: 'dark',
                    primaryColor: '#10b981',
                    tenantName: 'Local Broker',
                  },
                  {
                    domain: 'crypto-bros.com',
                    theme: 'dark',
                    primaryColor: '#f59e0b',
                    tenantName: 'Crypto Bros',
                  },
                  {
                    domain: 'forex-masters.net',
                    theme: 'light',
                    primaryColor: '#3b82f6',
                    tenantName: 'Forex Masters',
                  },
                ];

                const result = domainFilter
                  ? mockTenants.filter((t) => t.domain === domainFilter)
                  : mockTenants;

                resolve({ data: result, error: null });
              } else {
                resolve({ data: [], error: null });
              }
            },
          };
          return builder;
        },
      };
    },
  };
}

// 2. Used in Next.js Client Components (Uses localStorage/Client Cookies)
export function createBrowserClient(supabaseUrl: string, _supabaseKey: string) {
  console.log(
    `[Supabase CSR] Initializing Browser client for URL: ${supabaseUrl}`
  );

  return {
    auth: {
      signInWithOAuth: async ({ provider }: OAuthParams) => {
        console.log(
          `[Supabase CSR Auth] Attempting sign in with ${provider}...`
        );
        return { data: { url: '/mock-auth-callback' }, error: null };
      },
      signInWithPassword: async (credentials: Credentials) => {
        console.log('[Supabase CSR Auth] Attempting sign in with password...');
        return { data: { user: { email: credentials.email } }, error: null };
      },
      signUp: async (credentials: Credentials) => {
          console.log('[Supabase CSR Auth] Attempting sign up...');
          return { data: { user: { email: credentials.email } }, error: null };
      },
      signOut: async () => {
        console.log('[Supabase CSR Auth] Signing out...');
        return { error: null };
      },
      getSession: async () => {
        console.log('[Supabase CSR Auth] Getting session...');
        return { data: { session: null }, error: null };
      },
    },
    from: (table: string) => {
      console.log(`[Supabase CSR DB] Accessing table: ${table}`);
      return {
        select: async (query = '*') => {
          console.log(`[Supabase CSR DB] Selecting ${query} from ${table}...`);
          return { data: [], error: null };
        },
      };
    },
  };
}

// Mock Stripe client for development.
// Replace with `import Stripe from 'stripe'; export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)`
// once the real Stripe SDK is added as a dependency.
export const stripe = {
  webhooks: {
    constructEvent: (
      _body: string,
      _signature: string,
      _secret: string
    ): { type: string; data: { object: Record<string, unknown> } } => {
      console.log('[Stripe Mock] constructEvent called — returning no-op event');
      return { type: 'mock.event', data: { object: {} } };
    },
  },
};
