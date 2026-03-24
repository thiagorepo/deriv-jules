// Placeholders for @supabase/ssr library functionality

/**
 * @typedef {Object} SupabaseQueryBuilder
 * @property {function(string, string): SupabaseQueryBuilder} eq
 * @property {function(): SupabaseQueryBuilder} single
 * @property {function(function, function): void} then
 */

// 1. Used in Next.js Server Components, Actions, Route Handlers (Requires Cookies)
export function createServerClient(
  supabaseUrl: string,
  _supabaseKey: string,
  _cookieStore: any
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
      signInWithPassword: async (credentials: any) => {
        console.log('[Supabase SSR Auth] Attempting sign in with password...');
        return { data: { user: { email: credentials.email } }, error: null };
      },
      signOut: async () => {
        console.log('[Supabase SSR Auth] Signing out...');
        return { error: null };
      },
    },
    from: (table: string) => {
      return {
        /**
         * @param {string} [query='*']
         * @returns {SupabaseQueryBuilder}
         */
        select: (query = '*') => {
          console.log(`[Supabase SSR DB] Selecting ${query} from ${table}...`);
          // Chainable builder for mock Supabase client
          const builder: any = {
            _domainFilter: null,
            eq: function (column: string, value: string) {
              if (column === 'domain') {
                this._domainFilter = value;
              }
              return this;
            },
            single: function () {
              return this; // Keep chaining
            },
            then: function (resolve: Function, _reject: Function) {
              // Execute query when awaited
              if (table === 'tenants') {
                const mockTenants = [
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

                let result = mockTenants;
                if (this._domainFilter) {
                  result = mockTenants.filter(
                    (t) => t.domain === this._domainFilter
                  );
                }

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
      signInWithOAuth: async ({ provider }: any) => {
        console.log(
          `[Supabase CSR Auth] Attempting sign in with ${provider}...`
        );
        return { data: { url: '/mock-auth-callback' }, error: null };
      },
      signInWithPassword: async (credentials: any) => {
        console.log('[Supabase CSR Auth] Attempting sign in with password...');
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
