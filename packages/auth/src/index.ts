// =============================================================================
// COMPLIANCEOS AUTH PACKAGE
// Enterprise Authentication & Security Package
// =============================================================================

// Core Services
export { AuthService, authService } from './services/auth.service';

// Configuration
export { supabase, supabaseAdmin, createSupabaseClient, supabaseConfig } from './config/supabase';

// Middleware
export {
  authenticate,
  authorize,
  rateLimitAPI,
  rateLimitAuth,
  rateLimitPasswordReset,
  rateLimitRegistration,
  securityHeaders,
  corsConfig,
  auditLogger,
  AuthenticatedRequest,
  SecurityContext,
  getClientIP,
  getSecurityContext,
  logSecurityEvent,
} from './middleware/auth.middleware';

// Types (re-export for convenience)
export type {
  AuthUser,
  AuthSession,
  AuthToken,
  LoginCredentials,
  RegisterCredentials,
  MFAConfig,
  MFAProvider,
  SecurityEvent,
  AuditLog,
} from '@complianceos/types';

// Service Interfaces
export type {
  AuthServiceConfig,
  LoginResult,
  RegisterResult,
  MFASetupResult,
} from './services/auth.service';

// =============================================================================
// PACKAGE METADATA
// =============================================================================

export const AUTH_PACKAGE_INFO = {
  name: '@complianceos/auth',
  version: '1.0.0',
  description: 'Enterprise authentication package for ComplianceOS',
  features: [
    'JWT Authentication',
    'Multi-Factor Authentication (MFA)',
    'Session Management',
    'Rate Limiting',
    'Security Middleware',
    'Audit Logging',
    'Role-Based Access Control (RBAC)',
    'Password Security',
    'Account Lockout Protection',
    'Security Event Logging',
  ],
  security: {
    encryption: 'AES-256',
    hashing: 'bcrypt',
    tokens: 'JWT with RS256/HS256',
    mfa: 'TOTP (Time-based One-Time Password)',
    sessions: 'Secure session management',
    rateLimit: 'Redis-based rate limiting',
  },
} as const;

// =============================================================================
// INITIALIZATION HELPERS
// =============================================================================

export const initializeAuth = async (config?: {
  jwtSecret?: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  supabaseServiceKey?: string;
  redisUrl?: string;
  rateLimitConfig?: {
    api?: { points: number; duration: number };
    auth?: { points: number; duration: number };
  };
}) => {
  // Validate required environment variables
  const missingVars = [];
  
  if (!config?.supabaseUrl && !process.env.SUPABASE_URL) {
    missingVars.push('SUPABASE_URL');
  }
  
  if (!config?.supabaseAnonKey && !process.env.SUPABASE_ANON_KEY) {
    missingVars.push('SUPABASE_ANON_KEY');
  }
  
  if (!config?.supabaseServiceKey && !process.env.SUPABASE_SERVICE_KEY) {
    missingVars.push('SUPABASE_SERVICE_KEY');
  }
  
  if (!config?.jwtSecret && !process.env.JWT_SECRET) {
    missingVars.push('JWT_SECRET');
  }
  
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables for @complianceos/auth: ${missingVars.join(', ')}`
    );
  }
  
  // Initialize auth service with custom config
  const authInstance = new AuthService(config);
  
  console.log('✅ ComplianceOS Auth initialized successfully');
  console.log('🔐 Security features enabled:', AUTH_PACKAGE_INFO.features.join(', '));
  
  return authInstance;
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export const validateEnvironment = () => {
  const required = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_KEY',
    'JWT_SECRET',
  ];
  
  const missing = required.filter(env => !process.env[env]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }
  
  console.log('✅ All required environment variables are set');
  return true;
};

export const getAuthHealthCheck = async () => {
  try {
    const { checkSupabaseConnection } = await import('./config/supabase');
    const supabaseHealthy = await checkSupabaseConnection();
    
    return {
      healthy: supabaseHealthy,
      timestamp: new Date().toISOString(),
      services: {
        supabase: supabaseHealthy ? 'healthy' : 'unhealthy',
        jwt: 'healthy', // JWT is always available
        bcrypt: 'healthy', // bcrypt is always available
      },
      version: AUTH_PACKAGE_INFO.version,
    };
  } catch (error) {
    return {
      healthy: false,
      timestamp: new Date().toISOString(),
      error: error.message,
      version: AUTH_PACKAGE_INFO.version,
    };
  }
};

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default authService;