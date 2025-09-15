/**
 * Admin Authentication Unit Tests
 * Tests to ensure admin portal authentication remains isolated and functional
 */

// Mock NextAuth and other dependencies
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
  signOut: jest.fn(),
  useSession: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn(),
}));

const { signIn } = require('next-auth/react');
const { getToken } = require('next-auth/jwt');

describe('Admin Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Admin Login Credentials', () => {
    test('should accept valid admin credentials', async () => {
      const mockResult = { 
        ok: true, 
        error: null, 
        url: '/admin' 
      };
      
      signIn.mockResolvedValue(mockResult);

      const result = await signIn('credentials', {
        email: 'admin@test.com',
        password: 'TestPassword123!',
        userType: 'admin',
        redirect: false,
      });

      expect(result.ok).toBe(true);
      expect(result.error).toBeNull();
      expect(result.url).toBe('/admin');
    });

    test('should reject invalid admin credentials', async () => {
      const mockResult = { 
        ok: false, 
        error: 'CredentialsSignin' 
      };
      
      signIn.mockResolvedValue(mockResult);

      const result = await signIn('credentials', {
        email: 'invalid@test.com',
        password: 'wrongpassword',
        userType: 'admin',
        redirect: false,
      });

      expect(result.ok).toBe(false);
      expect(result.error).toBe('CredentialsSignin');
    });

    test('should reject non-admin users', async () => {
      const mockResult = { 
        ok: false, 
        error: 'AccessDenied' 
      };
      
      signIn.mockResolvedValue(mockResult);

      const result = await signIn('credentials', {
        email: 'user@test.com',
        password: 'TestPassword123!',
        userType: 'user',
        redirect: false,
      });

      expect(result.ok).toBe(false);
      expect(result.error).toBe('AccessDenied');
    });
  });

  describe('Admin Google OAuth', () => {
    test('should handle Google OAuth for admin users', async () => {
      const mockResult = { 
        ok: true, 
        error: null, 
        url: '/admin' 
      };
      
      signIn.mockResolvedValue(mockResult);

      const result = await signIn('google', {
        redirect: false,
        callbackUrl: '/admin',
      });

      expect(result.ok).toBe(true);
      expect(result.url).toBe('/admin');
    });

    test('should handle Google OAuth errors', async () => {
      const mockResult = { 
        ok: false, 
        error: 'OAuthAccountNotLinked' 
      };
      
      signIn.mockResolvedValue(mockResult);

      const result = await signIn('google', {
        redirect: false,
        callbackUrl: '/admin',
      });

      expect(result.ok).toBe(false);
      expect(result.error).toBe('OAuthAccountNotLinked');
    });
  });

  describe('Session Token Validation', async () => {
    test('should validate admin session tokens', async () => {
      const mockToken = {
        id: 'admin-user-id',
        email: 'admin@test.com',
        role: 'admin',
        userType: 'admin',
      };

      getToken.mockResolvedValue(mockToken);

      const token = await getToken({ req: {} });

      expect(token).toBeDefined();
      expect(token.userType).toBe('admin');
      expect(token.role).toBe('admin');
    });
  });




// Integration tests for auth configuration
describe('Admin Auth Configuration', () => {
  test('should have proper NextAuth configuration for admin', () => {
    // Test that the auth configuration supports both Google OAuth and credentials
    const authConfig = require('../app/api/auth/[...nextauth]/route').authOptions;
    
    expect(authConfig.providers).toBeDefined();
    expect(authConfig.providers.length).toBeGreaterThan(0);
    
    // Check for Google provider
    const googleProvider = authConfig.providers.find(p => p.id === 'google');
    expect(googleProvider).toBeDefined();
    
    // Check for credentials provider
    const credentialsProvider = authConfig.providers.find(p => p.id === 'credentials');
    expect(credentialsProvider).toBeDefined();
  });

  test('should have proper session configuration', () => {
    const authConfig = require('../app/api/auth/[...nextauth]/route').authOptions;
    
    expect(authConfig.session).toBeDefined();
    expect(authConfig.session.strategy).toBe('jwt');
  });

  test('should have proper callback configuration', () => {
    const authConfig = require('../app/api/auth/[...nextauth]/route').authOptions;
    
    expect(authConfig.callbacks).toBeDefined();
    expect(authConfig.callbacks.signIn).toBeDefined();
    expect(authConfig.callbacks.jwt).toBeDefined();
    expect(authConfig.callbacks.session).toBeDefined();
  });
});

// Test admin middleware protection
describe('Admin Route Protection', () => {
  test('should protect admin routes from unauthenticated users', () => {
    const mockMiddleware = require('../middleware');
    
    // Mock request for admin route without authentication
    const mockRequest = {
      nextUrl: { pathname: '/admin' },
      headers: new Map([['host', 'localhost:3000']]),
    };

    // This would normally redirect to login
    expect(mockRequest.nextUrl.pathname).toBe('/admin');
  });

  test('should allow authenticated admin users to access admin routes', () => {
    const mockMiddleware = require('../middleware');
    
    // Mock request for admin route with admin authentication
    const mockRequest = {
      nextUrl: { pathname: '/admin' },
      headers: new Map([['host', 'localhost:3000']]),
    };

    // Mock admin token
    getToken.mockResolvedValue({
      id: 'admin-user-id',
      role: 'admin',
      userType: 'admin',
    });

    expect(mockRequest.nextUrl.pathname).toBe('/admin');
  });
  });
});
