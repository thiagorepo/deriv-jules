import { createServerClient, createBrowserClient, stripe } from './supabase';

describe('createServerClient', () => {
  const client = createServerClient('https://test.supabase.co', 'anon-key', {});

  it('returns an object with auth and from', () => {
    expect(client).toHaveProperty('auth');
    expect(client).toHaveProperty('from');
  });

  describe('auth.getUser', () => {
    it('returns unauthenticated user by default', async () => {
      const result = await client.auth.getUser();
      expect(result.data.user).toBeNull();
      expect(result.error).toBeTruthy();
    });
  });

  describe('auth.signInWithPassword', () => {
    it('returns the provided email in user data', async () => {
      const result = await client.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'secret',
      });
      expect(result.error).toBeNull();
      expect(result.data.user.email).toBe('test@example.com');
    });
  });

  describe('auth.signUp', () => {
    it('returns the provided email in user data', async () => {
      const result = await client.auth.signUp({
        email: 'new@example.com',
        password: 'pass',
      });
      expect(result.error).toBeNull();
      expect(result.data.user.email).toBe('new@example.com');
    });
  });

  describe('auth.signOut', () => {
    it('returns no error', async () => {
      const result = await client.auth.signOut();
      expect(result.error).toBeNull();
    });
  });

  describe('from (tenant query)', () => {
    it('resolves with tenant data when filtering by domain', async () => {
      const result = await client
        .from('tenants')
        .select('*')
        .eq('domain', 'localhost:3000');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('error');
    });

    it('resolves with empty data for unknown tables', async () => {
      const result = await client.from('unknown_table').select('*');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(0);
    });
  });
});

describe('createBrowserClient', () => {
  const client = createBrowserClient('https://test.supabase.co', 'anon-key');

  it('returns an object with auth and from', () => {
    expect(client).toHaveProperty('auth');
    expect(client).toHaveProperty('from');
  });

  describe('auth.signInWithOAuth', () => {
    it('returns a mock redirect URL', async () => {
      const result = await client.auth.signInWithOAuth({ provider: 'google' });
      expect(result.error).toBeNull();
      expect(result.data.url).toBeTruthy();
    });
  });

  describe('auth.signInWithPassword', () => {
    it('returns the provided email', async () => {
      const result = await client.auth.signInWithPassword({
        email: 'browser@example.com',
        password: 'pass',
      });
      expect(result.data.user.email).toBe('browser@example.com');
    });
  });

  describe('auth.getSession', () => {
    it('returns null session', async () => {
      const result = await client.auth.getSession();
      expect(result.data.session).toBeNull();
      expect(result.error).toBeNull();
    });
  });

  describe('auth.signOut', () => {
    it('returns no error', async () => {
      const result = await client.auth.signOut();
      expect(result.error).toBeNull();
    });
  });

  describe('from', () => {
    it('returns empty data array', async () => {
      const result = await client.from('any_table').select();
      expect(Array.isArray(result.data)).toBe(true);
    });
  });
});

describe('stripe mock', () => {
  it('has webhooks.constructEvent method', () => {
    expect(typeof stripe.webhooks.constructEvent).toBe('function');
  });

  it('constructEvent returns an object with type and data', () => {
    const event = stripe.webhooks.constructEvent('body', 'sig', 'secret');
    expect(event).toHaveProperty('type');
    expect(event).toHaveProperty('data');
    expect(event.data).toHaveProperty('object');
  });

  it('returns mock event type', () => {
    const event = stripe.webhooks.constructEvent('body', 'sig', 'secret');
    expect(typeof event.type).toBe('string');
  });
});
