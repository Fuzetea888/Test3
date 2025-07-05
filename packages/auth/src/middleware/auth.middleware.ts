import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import UAParser from 'ua-parser-js';
import { authService } from '../services/auth.service';
import { supabaseAdmin } from '../config/supabase';
import type { AuthUser, SecurityEvent } from '@complianceos/types';

// =============================================================================
// TYPES
// =============================================================================

interface AuthenticatedRequest extends Request {
  user?: AuthUser;
  session?: {
    id: string;
    userId: string;
    ipAddress: string;
    userAgent: string;
    expiresAt: string;
  };
  permissions?: string[];
}

interface SecurityContext {
  ipAddress: string;
  userAgent: string;
  fingerprint?: string;
}

// =============================================================================
// RATE LIMITER CONFIGURATION
// =============================================================================

const createRateLimiters = () => {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  
  return {
    // General API rate limiter
    api: new RateLimiterRedis({
      storeClient: redisUrl,
      keyPrefix: 'api_rl',
      points: 100, // requests
      duration: 60, // per 60 seconds
    }),
    
    // Authentication rate limiter
    auth: new RateLimiterRedis({
      storeClient: redisUrl,
      keyPrefix: 'auth_rl',
      points: 5, // login attempts
      duration: 900, // per 15 minutes
      blockDuration: 900, // block for 15 minutes
    }),
    
    // Password reset rate limiter
    passwordReset: new RateLimiterRedis({
      storeClient: redisUrl,
      keyPrefix: 'pwd_reset_rl',
      points: 3, // requests
      duration: 3600, // per hour
    }),
    
    // Registration rate limiter
    registration: new RateLimiterRedis({
      storeClient: redisUrl,
      keyPrefix: 'reg_rl',
      points: 3, // registrations
      duration: 3600, // per hour
    }),
  };
};

const rateLimiters = createRateLimiters();

// =============================================================================
// SECURITY UTILITIES
// =============================================================================

const getClientFingerprint = (req: Request): string => {
  const userAgent = req.get('User-Agent') || '';
  const acceptLanguage = req.get('Accept-Language') || '';
  const acceptEncoding = req.get('Accept-Encoding') || '';
  const connection = req.get('Connection') || '';
  
  const fingerprint = `${userAgent}|${acceptLanguage}|${acceptEncoding}|${connection}`;
  return Buffer.from(fingerprint).toString('base64');
};

const getClientIP = (req: Request): string => {
  const forwarded = req.get('X-Forwarded-For');
  const realIp = req.get('X-Real-IP');
  const cfConnectingIp = req.get('CF-Connecting-IP');
  
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || req.ip || req.connection.remoteAddress || '';
  }
  
  return realIp || cfConnectingIp || req.ip || req.connection.remoteAddress || '';
};

const getSecurityContext = (req: Request): SecurityContext => ({
  ipAddress: getClientIP(req),
  userAgent: req.get('User-Agent') || '',
  fingerprint: getClientFingerprint(req),
});

const logSecurityEvent = async (
  event: Omit<SecurityEvent, 'id' | 'createdAt'>,
  req: Request
): Promise<void> => {
  const context = getSecurityContext(req);
  
  try {
    await supabaseAdmin.from('security_events').insert({
      user_id: event.userId,
      type: event.type,
      description: event.description,
      ip_address: context.ipAddress,
      user_agent: context.userAgent,
      metadata: {
        ...event.metadata,
        fingerprint: context.fingerprint,
        url: req.originalUrl,
        method: req.method,
      },
      severity: event.severity,
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};

// =============================================================================
// AUTHENTICATION MIDDLEWARE
// =============================================================================

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'No valid authorization token provided',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify token
    const payload = await authService.verifyToken(token);
    
    if (!payload || payload.type !== 'access') {
      await logSecurityEvent({
        type: 'UNAUTHORIZED_ACCESS',
        description: 'Invalid or expired token',
        severity: 'MEDIUM',
        metadata: { tokenPrefix: token.substring(0, 20) },
      }, req);
      
      res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Invalid or expired token',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Get user from database
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select(`
        *,
        company:companies(*)
      `)
      .eq('id', payload.sub)
      .eq('is_active', true)
      .single();

    if (userError || !user) {
      await logSecurityEvent({
        type: 'UNAUTHORIZED_ACCESS',
        description: 'User not found or inactive',
        userId: payload.sub,
        severity: 'HIGH',
        metadata: { tokenPayload: payload },
      }, req);
      
      res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'User not found or inactive',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Check session validity
    const context = getSecurityContext(req);
    const sessionValid = await validateSession(token, user.id, context);
    
    if (!sessionValid) {
      await logSecurityEvent({
        type: 'SESSION_INVALID',
        description: 'Session validation failed',
        userId: user.id,
        severity: 'HIGH',
        metadata: { reason: 'session_mismatch' },
      }, req);
      
      res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Session invalid',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Get user permissions
    const permissions = await getUserPermissions(user.id, user.role);
    
    // Attach user and session to request
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      avatar: user.avatar,
      role: user.role,
      companyId: user.company_id,
      companyName: user.company?.name || '',
      companySector: user.company?.sector || '',
      isActive: user.is_active,
      lastLogin: user.last_login,
    };
    
    req.permissions = permissions;
    
    // Update last activity
    await updateLastActivity(user.id);
    
    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    
    await logSecurityEvent({
      type: 'AUTHENTICATION_ERROR',
      description: 'Authentication middleware error',
      severity: 'HIGH',
      metadata: { error: error.message },
    }, req);
    
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Authentication service error',
      timestamp: new Date().toISOString(),
    });
  }
};

// =============================================================================
// AUTHORIZATION MIDDLEWARE
// =============================================================================

export const authorize = (permissions: string[] | string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !req.permissions) {
      res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Authentication required',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
    const userPermissions = req.permissions;
    
    // Check if user has admin permissions (*)
    if (userPermissions.includes('*')) {
      next();
      return;
    }
    
    // Check specific permissions
    const hasPermission = requiredPermissions.some(permission =>
      userPermissions.includes(permission) || 
      userPermissions.some(userPerm => {
        // Handle wildcard permissions like "workflows:*"
        const [resource, action] = userPerm.split(':');
        const [reqResource, reqAction] = permission.split(':');
        return resource === reqResource && (action === '*' || action === reqAction);
      })
    );
    
    if (!hasPermission) {
      logSecurityEvent({
        type: 'PERMISSION_DENIED',
        description: `Access denied for permission: ${requiredPermissions.join(', ')}`,
        userId: req.user.id,
        severity: 'MEDIUM',
        metadata: { 
          requiredPermissions,
          userPermissions,
          resource: req.originalUrl,
        },
      }, req);
      
      res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Insufficient permissions',
        timestamp: new Date().toISOString(),
      });
      return;
    }
    
    next();
  };
};

// =============================================================================
// RATE LIMITING MIDDLEWARE
// =============================================================================

export const rateLimitAPI = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const key = getClientIP(req);
    await rateLimiters.api.consume(key);
    next();
  } catch (rateLimiterRes) {
    const secs = Math.round(rateLimiterRes.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(secs));
    res.status(429).json({
      success: false,
      error: 'TOO_MANY_REQUESTS',
      message: 'Rate limit exceeded',
      retryAfter: secs,
      timestamp: new Date().toISOString(),
    });
  }
};

export const rateLimitAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const key = `${getClientIP(req)}_${req.body?.email || 'unknown'}`;
    await rateLimiters.auth.consume(key);
    next();
  } catch (rateLimiterRes) {
    const secs = Math.round(rateLimiterRes.msBeforeNext / 1000) || 1;
    
    await logSecurityEvent({
      type: 'RATE_LIMIT_EXCEEDED',
      description: 'Authentication rate limit exceeded',
      severity: 'HIGH',
      metadata: { 
        email: req.body?.email,
        retryAfter: secs,
      },
    }, req);
    
    res.set('Retry-After', String(secs));
    res.status(429).json({
      success: false,
      error: 'TOO_MANY_REQUESTS',
      message: 'Too many authentication attempts',
      retryAfter: secs,
      timestamp: new Date().toISOString(),
    });
  }
};

export const rateLimitPasswordReset = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const key = `${getClientIP(req)}_${req.body?.email || 'unknown'}`;
    await rateLimiters.passwordReset.consume(key);
    next();
  } catch (rateLimiterRes) {
    const secs = Math.round(rateLimiterRes.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(secs));
    res.status(429).json({
      success: false,
      error: 'TOO_MANY_REQUESTS',
      message: 'Too many password reset attempts',
      retryAfter: secs,
      timestamp: new Date().toISOString(),
    });
  }
};

export const rateLimitRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const key = getClientIP(req);
    await rateLimiters.registration.consume(key);
    next();
  } catch (rateLimiterRes) {
    const secs = Math.round(rateLimiterRes.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(secs));
    res.status(429).json({
      success: false,
      error: 'TOO_MANY_REQUESTS',
      message: 'Too many registration attempts',
      retryAfter: secs,
      timestamp: new Date().toISOString(),
    });
  }
};

// =============================================================================
// SECURITY HEADERS MIDDLEWARE
// =============================================================================

export const securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  // Content Security Policy
  res.set('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://api.stripe.com https://*.supabase.co wss://*.supabase.co; " +
    "frame-src https://js.stripe.com; " +
    "object-src 'none'; " +
    "base-uri 'self';"
  );
  
  // Other security headers
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'DENY');
  res.set('X-XSS-Protection', '1; mode=block');
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // Remove sensitive headers
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
  
  next();
};

// =============================================================================
// CORS MIDDLEWARE
// =============================================================================

export const corsConfig = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',');
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Authorization',
    'Accept',
    'Cache-Control',
    'X-API-Key'
  ],
  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
    'Retry-After'
  ],
  maxAge: 86400, // 24 hours
};

// =============================================================================
// AUDIT MIDDLEWARE
// =============================================================================

export const auditLogger = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Log the request/response for audit purposes
    if (req.user) {
      const auditLog = {
        user_id: req.user.id,
        action: `${req.method} ${req.originalUrl}`,
        resource: req.originalUrl.split('/')[1] || 'unknown',
        resource_id: req.params.id || null,
        ip_address: getClientIP(req),
        user_agent: req.get('User-Agent') || '',
        success: res.statusCode < 400,
        error: res.statusCode >= 400 ? `HTTP ${res.statusCode}` : null,
        metadata: {
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
          userAgent: req.get('User-Agent'),
          query: req.query,
          params: req.params,
        },
      };
      
      // Fire and forget audit log
      supabaseAdmin.from('audit_logs').insert(auditLog).catch(console.error);
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const validateSession = async (
  token: string,
  userId: string,
  context: SecurityContext
): Promise<boolean> => {
  try {
    // Hash the token to match stored hash
    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const tokenHash = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const { data: session } = await supabaseAdmin
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('token_hash', tokenHash)
      .eq('ip_address', context.ipAddress)
      .gte('expires_at', new Date().toISOString())
      .single();

    return !!session;
  } catch (error) {
    console.error('Session validation error:', error);
    return false;
  }
};

const getUserPermissions = async (userId: string, role: string): Promise<string[]> => {
  // Base permissions by role
  const rolePermissions: Record<string, string[]> = {
    ADMIN: ['*'], // All permissions
    MANAGER: ['users:read', 'workflows:*', 'reports:*', 'integrations:*'],
    COMPLIANCE_OFFICER: ['workflows:*', 'documents:*', 'reports:read'],
    EMPLOYEE: ['workflows:read', 'workflows:execute', 'documents:read'],
    AUDITOR: ['workflows:read', 'reports:read', 'audit:read'],
  };

  // Get additional custom permissions from database if needed
  const basePermissions = rolePermissions[role] || ['workflows:read'];
  
  return basePermissions;
};

const updateLastActivity = async (userId: string): Promise<void> => {
  try {
    await supabaseAdmin
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userId);
  } catch (error) {
    console.error('Failed to update last activity:', error);
  }
};

// =============================================================================
// EXPORT ALL MIDDLEWARE
// =============================================================================

export {
  AuthenticatedRequest,
  SecurityContext,
  getClientIP,
  getSecurityContext,
  logSecurityEvent,
};