import { NextAuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { z } from 'zod';

// =============================================================================
// TYPES
// =============================================================================

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  image?: string;
  role: 'ADMIN' | 'MANAGER' | 'USER';
  organizationId: string;
  organizationName: string;
  permissions: string[];
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthSession {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters'),
});

// =============================================================================
// NEXTAUTH CONFIGURATION
// =============================================================================

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const validatedCredentials = loginSchema.parse(credentials);
          
          // Call your backend API to verify credentials
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(validatedCredentials),
          });

          if (!response.ok) {
            return null;
          }

          const data = await response.json();
          
          if (data.user && data.accessToken) {
            return {
              id: data.user.id,
              email: data.user.email,
              name: data.user.name,
              image: data.user.image,
              role: data.user.role,
              organizationId: data.user.organizationId,
              organizationName: data.user.organizationName,
              permissions: data.user.permissions,
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
            };
          }

          return null;
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: Date.now() + 60 * 60 * 1000, // 1 hour
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
            organizationId: user.organizationId,
            organizationName: user.organizationName,
            permissions: user.permissions,
          },
        };
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Access token has expired, try to update it
      return await refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token) {
        session.user = token.user as UserProfile;
        session.accessToken = token.accessToken as string;
        session.error = token.error as string;
      }

      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Refresh access token
 */
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.refreshToken}`,
      },
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.accessToken,
      accessTokenExpires: Date.now() + 60 * 60 * 1000, // 1 hour
      refreshToken: refreshedTokens.refreshToken ?? token.refreshToken,
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);

    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

/**
 * Get current session server-side
 */
export async function getSession() {
  return await getServerSession(authOptions);
}

/**
 * Require authentication (server-side)
 */
export async function requireAuth() {
  const session = await getSession();
  
  if (!session) {
    redirect('/auth/signin');
  }
  
  return session;
}

/**
 * Check if user has permission
 */
export function hasPermission(
  user: UserProfile,
  permission: string
): boolean {
  return user.permissions.includes(permission) || user.role === 'ADMIN';
}

/**
 * Check if user has role
 */
export function hasRole(
  user: UserProfile,
  role: 'ADMIN' | 'MANAGER' | 'USER'
): boolean {
  const roleHierarchy = {
    ADMIN: 3,
    MANAGER: 2,
    USER: 1,
  };
  
  return roleHierarchy[user.role] >= roleHierarchy[role];
}

/**
 * Get user permissions
 */
export function getUserPermissions(user: UserProfile): string[] {
  return user.permissions;
}

/**
 * Check if user is admin
 */
export function isAdmin(user: UserProfile): boolean {
  return user.role === 'ADMIN';
}

/**
 * Check if user is manager
 */
export function isManager(user: UserProfile): boolean {
  return user.role === 'MANAGER' || user.role === 'ADMIN';
}

/**
 * Validate login credentials
 */
export function validateLogin(credentials: unknown) {
  return loginSchema.safeParse(credentials);
}

/**
 * Validate registration data
 */
export function validateRegister(data: unknown) {
  return registerSchema.safeParse(data);
}

/**
 * Get user display name
 */
export function getUserDisplayName(user: UserProfile): string {
  return user.name || user.email;
}

/**
 * Get user initials
 */
export function getUserInitials(user: UserProfile): string {
  const name = getUserDisplayName(user);
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Check if user account is active
 */
export function isUserActive(user: UserProfile): boolean {
  return user.isActive;
}

/**
 * Format last login date
 */
export function formatLastLogin(user: UserProfile): string {
  if (!user.lastLoginAt) {
    return 'Never';
  }
  
  const now = new Date();
  const lastLogin = new Date(user.lastLoginAt);
  const diffInHours = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${diffInHours} hours ago`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  }
}

/**
 * Get role color
 */
export function getRoleColor(role: string): string {
  const colors = {
    ADMIN: 'text-red-600',
    MANAGER: 'text-blue-600',
    USER: 'text-green-600',
  };
  
  return colors[role as keyof typeof colors] || 'text-gray-600';
}

/**
 * Get role badge color
 */
export function getRoleBadgeColor(role: string): string {
  const colors = {
    ADMIN: 'bg-red-100 text-red-800',
    MANAGER: 'bg-blue-100 text-blue-800',
    USER: 'bg-green-100 text-green-800',
  };
  
  return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
}

/**
 * API authentication headers
 */
export function getAuthHeaders(token: string): HeadersInit {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Make authenticated API request
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {},
  token?: string
): Promise<Response> {
  const session = await getSession();
  const accessToken = token || session?.accessToken;
  
  if (!accessToken) {
    throw new Error('No access token available');
  }
  
  return fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(accessToken),
      ...options.headers,
    },
  });
}

/**
 * Handle authentication errors
 */
export function handleAuthError(error: any): void {
  if (error.message === 'RefreshAccessTokenError') {
    // Redirect to login page
    window.location.href = '/auth/signin';
  } else {
    console.error('Authentication error:', error);
  }
}

/**
 * Sign out user
 */
export async function signOutUser(): Promise<void> {
  try {
    // Call API to invalidate token
    const session = await getSession();
    if (session?.accessToken) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders(session.accessToken),
      });
    }
  } catch (error) {
    console.error('Error signing out:', error);
  }
}

/**
 * Get organization context
 */
export function getOrganizationContext(user: UserProfile) {
  return {
    id: user.organizationId,
    name: user.organizationName,
  };
}