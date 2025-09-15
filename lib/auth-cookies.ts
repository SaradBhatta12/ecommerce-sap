import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export interface AuthCookieData {
  userId: string;
  email: string;
  role: string;
  userType: 'admin' | 'user';
}

const JWT_SECRET = process.env.JWT_SECRET!;

// Client-side cookie utilities
export const cookieUtils = {
  // Get cookie value by name
  getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  },

  // Set cookie with options
  setCookie(name: string, value: string, options: {
    expires?: Date;
    maxAge?: number;
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  } = {}) {
    if (typeof document === 'undefined') return;
    
    let cookieString = `${name}=${value}`;
    
    if (options.expires) {
      cookieString += `; expires=${options.expires.toUTCString()}`;
    }
    
    if (options.maxAge) {
      cookieString += `; max-age=${options.maxAge}`;
    }
    
    if (options.path) {
      cookieString += `; path=${options.path}`;
    }
    
    if (options.domain) {
      cookieString += `; domain=${options.domain}`;
    }
    
    if (options.secure) {
      cookieString += `; secure`;
    }
    
    if (options.sameSite) {
      cookieString += `; samesite=${options.sameSite}`;
    }
    
    document.cookie = cookieString;
  },

  // Remove cookie
  removeCookie(name: string, options: { path?: string; domain?: string } = {}) {
    this.setCookie(name, '', {
      ...options,
      expires: new Date(0)
    });
  },

  // Get auth token from cookies
  getAuthToken(): string | null {
    return this.getCookie('token');
  },

  // Clear all auth cookies
  clearAuthCookies() {
    this.removeCookie('token');
  }
};

// Server-side cookie utilities
export const serverCookieUtils = {
  // Get cookie value by name
  async getCookie(name: string): Promise<string | null> {
    const cookieStore = cookies();
    const cookie = (await cookieStore).get(name);
    return cookie?.value || null;
  },

  // Get auth token from server-side cookies
  async getAuthToken(): Promise<string | null> {
    return await this.getCookie('token');
  },

  // Verify JWT token
  async verifyToken(token: string): Promise<AuthCookieData | null> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthCookieData;
      return decoded;
    } catch {
      return null;
    }
  },

  // Get authenticated user from cookies
  async getAuthenticatedUser(): Promise<AuthCookieData | null> {
    const token = await this.getAuthToken();
    
    if (!token) return null;
    
    return await this.verifyToken(token);
  }
};

// Authentication helper functions
export const authHelpers = {
  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = cookieUtils.getAuthToken();
    return !!token;
  },

  // Check if user is admin
  isAdmin(): boolean {
    const token = cookieUtils.getAuthToken();
    if (!token) return false;
    
    try {
      const decoded = jwt.decode(token) as AuthCookieData;
      return decoded.userType === 'admin';
    } catch {
      return false;
    }
  },

  // Get current user data
  getCurrentUser(): AuthCookieData | null {
    const token = cookieUtils.getAuthToken();
    if (!token) return null;
    
    try {
      return jwt.decode(token) as AuthCookieData;
    } catch {
      return null;
    }
  },

  // Logout user
  logout() {
    cookieUtils.clearAuthCookies();
    
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  }
};

export default {
  cookieUtils,
  serverCookieUtils,
  authHelpers
};
