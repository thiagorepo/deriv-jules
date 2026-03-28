import { signIn, signUp, signOut } from './authHelpers';
import * as orgSupabase from '@org/supabase';

// Mock the factory to return our jest mock functions
jest.mock('@org/supabase', () => ({
  createBrowserClient: jest.fn(),
}));

describe('AuthHelpers', () => {
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      auth: {
        signInWithOAuth: jest.fn().mockResolvedValue({ data: { url: '/callback' }, error: null }),
        signInWithPassword: jest.fn().mockResolvedValue({ data: { user: { id: 1 } }, error: null }),
        signUp: jest.fn().mockResolvedValue({ data: { user: { id: 1 } }, error: null }),
        signOut: jest.fn().mockResolvedValue({ error: null }),
      }
    };
    (orgSupabase.createBrowserClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    it('should call signInWithOAuth if provider is supplied', async () => {
      const result = await signIn('test@test.com', 'pw', 'google');
      expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({ provider: 'google' });
      expect(result).toEqual({ data: { url: '/callback' }, error: null });
    });

    it('should call signInWithPassword if no provider is supplied', async () => {
      const result = await signIn('test@test.com', 'pw');
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({ email: 'test@test.com', password: 'pw' });
      expect(result).toEqual({ data: { user: { id: 1 } }, error: null });
    });
  });

  describe('signUp', () => {
    it('should call auth.signUp with credentials', async () => {
      const result = await signUp('test@test.com', 'pw');
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({ email: 'test@test.com', password: 'pw' });
      expect(result).toEqual({ data: { user: { id: 1 } }, error: null });
    });
  });

  describe('signOut', () => {
    it('should call auth.signOut', async () => {
      const result = await signOut();
      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
      expect(result).toEqual({ error: null });
    });
  });
});
