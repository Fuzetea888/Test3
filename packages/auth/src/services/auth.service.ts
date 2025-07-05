import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import UAParser from 'ua-parser-js';
import { supabaseAdmin, createSupabaseClient } from '../config/supabase';
import type {
  User,
  Company,
  AuthUser,
  AuthSession,
  AuthToken,
  LoginCredentials,
  RegisterCredentials,
  MFAConfig,
  MFAProvider,
  SecurityEvent,
  AuditLog,
  Database,
} from '@complianceos/types';

// =============================================================================
// CONSTANTS
// =============================================================================

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'complianceos-super-secret-key-change-in-production'
);

const TOKEN_EXPIRY = '15m'; // Access token expiry
const REFRESH_TOKEN_EXPIRY = '7d'; // Refresh token expiry
const PASSWORD_SALT_ROUNDS = 12;

// =============================================================================
// INTERFACES
// =============================================================================

export interface AuthServiceConfig {
  jwtSecret: string;
  accessTokenExpiry: string;
  refreshTokenExpiry: string;
  passwordSaltRounds: number;
  maxLoginAttempts: number;
  lockoutDuration: number; // minutes
}

export interface LoginResult {
  success: boolean;
  user?: AuthUser;
  session?: AuthSession;
  mfaRequired?: boolean;
  challengeId?: string;
  error?: string;
  lockoutUntil?: Date;
}

export interface RegisterResult {
  success: boolean;
  user?: User;
  company?: Company;
  session?: AuthSession;
  error?: string;
}

export interface MFASetupResult {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface SecurityContext {
  ipAddress: string;
  userAgent: string;
  location?: {
    country?: string;
    city?: string;
  };
}

// =============================================================================
// AUTH SERVICE CLASS
// =============================================================================

export class AuthService {
  private config: AuthServiceConfig;

  constructor(config?: Partial<AuthServiceConfig>) {
    this.config = {
      jwtSecret: process.env.JWT_SECRET || 'default-secret',
      accessTokenExpiry: TOKEN_EXPIRY,
      refreshTokenExpiry: REFRESH_TOKEN_EXPIRY,
      passwordSaltRounds: PASSWORD_SALT_ROUNDS,
      maxLoginAttempts: 5,
      lockoutDuration: 30,
      ...config,
    };
  }

  // =============================================================================
  // AUTHENTICATION METHODS
  // =============================================================================

  async login(
    credentials: LoginCredentials,
    context: SecurityContext
  ): Promise<LoginResult> {
    try {
      // Rate limiting check
      const isRateLimited = await this.checkRateLimit(
        credentials.email,
        context.ipAddress
      );
      if (isRateLimited) {
        await this.logSecurityEvent({
          type: 'LOGIN_FAILURE',
          description: 'Rate limit exceeded',
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          severity: 'HIGH',
          metadata: { email: credentials.email, reason: 'rate_limit' },
        });
        return { success: false, error: 'Too many login attempts. Please try again later.' };
      }

      // Find user by email
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select(`
          *,
          company:companies(*)
        `)
        .eq('email', credentials.email)
        .eq('is_active', true)
        .single();

      if (userError || !user) {
        await this.logSecurityEvent({
          type: 'LOGIN_FAILURE',
          description: 'User not found',
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          severity: 'MEDIUM',
          metadata: { email: credentials.email, reason: 'user_not_found' },
        });
        return { success: false, error: 'Invalid email or password' };
      }

      // Check account lockout
      const lockoutUntil = await this.checkAccountLockout(user.id);
      if (lockoutUntil && lockoutUntil > new Date()) {
        await this.logSecurityEvent({
          type: 'LOGIN_FAILURE',
          description: 'Account locked',
          userId: user.id,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          severity: 'HIGH',
          metadata: { email: credentials.email, reason: 'account_locked', lockoutUntil },
        });
        return { 
          success: false, 
          error: 'Account is temporarily locked due to multiple failed login attempts',
          lockoutUntil 
        };
      }

      // Verify password
      const isValidPassword = await this.verifyPassword(
        credentials.password,
        user.password_hash
      );

      if (!isValidPassword) {
        await this.incrementFailedLoginAttempts(user.id);
        await this.logSecurityEvent({
          type: 'LOGIN_FAILURE',
          description: 'Invalid password',
          userId: user.id,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          severity: 'MEDIUM',
          metadata: { email: credentials.email, reason: 'invalid_password' },
        });
        return { success: false, error: 'Invalid email or password' };
      }

      // Reset failed login attempts on successful password verification
      await this.resetFailedLoginAttempts(user.id);

      // Check if MFA is required
      const mfaConfig = await this.getMFAConfig(user.id);
      if (mfaConfig?.enabled && mfaConfig.providers.length > 0) {
        const challengeId = await this.createMFAChallenge(user.id, 'TOTP');
        return {
          success: false,
          mfaRequired: true,
          challengeId,
        };
      }

      // Create session
      const session = await this.createSession(user, context);

      // Log successful login
      await this.logSecurityEvent({
        type: 'LOGIN_SUCCESS',
        description: 'User logged in successfully',
        userId: user.id,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        severity: 'LOW',
        metadata: { 
          email: credentials.email,
          mfaUsed: false,
          remember: credentials.remember 
        },
      });

      // Update last login
      await this.updateLastLogin(user.id, context);

      return {
        success: true,
        user: this.transformToAuthUser(user),
        session,
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred during login' };
    }
  }

  async register(
    credentials: RegisterCredentials,
    context: SecurityContext
  ): Promise<RegisterResult> {
    try {
      // Check if user already exists
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', credentials.email)
        .single();

      if (existingUser) {
        return { success: false, error: 'User with this email already exists' };
      }

      // Start transaction by creating company first
      const { data: company, error: companyError } = await supabaseAdmin
        .from('companies')
        .insert({
          name: credentials.companyName,
          sector: credentials.sector as any,
          size: credentials.size as any,
        })
        .select()
        .single();

      if (companyError || !company) {
        throw new Error('Failed to create company');
      }

      // Hash password
      const passwordHash = await this.hashPassword(credentials.password);

      // Create user
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .insert({
          email: credentials.email,
          first_name: credentials.firstName,
          last_name: credentials.lastName,
          role: 'ADMIN', // First user is admin
          company_id: company.id,
          password_hash: passwordHash,
        })
        .select(`
          *,
          company:companies(*)
        `)
        .single();

      if (userError || !user) {
        // Cleanup: delete company if user creation failed
        await supabaseAdmin.from('companies').delete().eq('id', company.id);
        throw new Error('Failed to create user');
      }

      // Create session
      const session = await this.createSession(user, context);

      // Log registration
      await this.logSecurityEvent({
        type: 'USER_REGISTRATION',
        description: 'New user registered',
        userId: user.id,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        severity: 'LOW',
        metadata: { 
          email: credentials.email,
          companyName: credentials.companyName,
          sector: credentials.sector 
        },
      });

      return {
        success: true,
        user,
        company,
        session,
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'An unexpected error occurred during registration' };
    }
  }

  async logout(userId: string, context: SecurityContext): Promise<void> {
    try {
      // Invalidate all user sessions
      await this.invalidateUserSessions(userId);

      // Log logout
      await this.logSecurityEvent({
        type: 'LOGOUT',
        description: 'User logged out',
        userId,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        severity: 'LOW',
        metadata: {},
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthSession | null> {
    try {
      // Verify refresh token
      const { payload } = await jwtVerify(refreshToken, JWT_SECRET);
      
      if (payload.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      // Get user
      const { data: user } = await supabaseAdmin
        .from('users')
        .select(`
          *,
          company:companies(*)
        `)
        .eq('id', payload.sub as string)
        .eq('is_active', true)
        .single();

      if (!user) {
        throw new Error('User not found');
      }

      // Create new session
      const context: SecurityContext = {
        ipAddress: 'refresh',
        userAgent: 'token-refresh',
      };

      return await this.createSession(user, context);
    } catch (error) {
      console.error('Token refresh error:', error);
      return null;
    }
  }

  // =============================================================================
  // PASSWORD METHODS
  // =============================================================================

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.config.passwordSaltRounds);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    context: SecurityContext
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get user
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('password_hash')
        .eq('id', userId)
        .single();

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Verify current password
      const isValid = await this.verifyPassword(currentPassword, user.password_hash);
      if (!isValid) {
        await this.logSecurityEvent({
          type: 'PASSWORD_CHANGE_FAILED',
          description: 'Invalid current password',
          userId,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          severity: 'MEDIUM',
          metadata: {},
        });
        return { success: false, error: 'Current password is incorrect' };
      }

      // Hash new password
      const newPasswordHash = await this.hashPassword(newPassword);

      // Update password
      const { error } = await supabaseAdmin
        .from('users')
        .update({ password_hash: newPasswordHash })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      // Invalidate all sessions (force re-login)
      await this.invalidateUserSessions(userId);

      // Log password change
      await this.logSecurityEvent({
        type: 'PASSWORD_CHANGE',
        description: 'Password changed successfully',
        userId,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        severity: 'LOW',
        metadata: {},
      });

      return { success: true };
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, error: 'Failed to change password' };
    }
  }

  // =============================================================================
  // MFA METHODS
  // =============================================================================

  async setupMFA(userId: string): Promise<MFASetupResult> {
    const secret = speakeasy.generateSecret({
      name: `ComplianceOS (${userId})`,
      issuer: 'ComplianceOS',
      length: 32,
    });

    const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () =>
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );

    // Store MFA configuration
    await supabaseAdmin.from('mfa_configs').upsert({
      user_id: userId,
      secret: secret.base32,
      backup_codes: backupCodes,
      enabled: false, // Will be enabled after verification
    });

    return {
      secret: secret.base32!,
      qrCode,
      backupCodes,
    };
  }

  async verifyMFA(
    userId: string,
    token: string,
    challengeId?: string
  ): Promise<boolean> {
    try {
      // Get MFA config
      const { data: config } = await supabaseAdmin
        .from('mfa_configs')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!config) {
        return false;
      }

      // Verify TOTP token
      const isValid = speakeasy.totp.verify({
        secret: config.secret,
        encoding: 'base32',
        token,
        window: 2, // Allow 2 time steps before/after
      });

      if (isValid && challengeId) {
        // Mark challenge as completed
        await this.completeMFAChallenge(challengeId);
      }

      return isValid;
    } catch (error) {
      console.error('MFA verification error:', error);
      return false;
    }
  }

  async enableMFA(userId: string): Promise<void> {
    await supabaseAdmin
      .from('mfa_configs')
      .update({ enabled: true })
      .eq('user_id', userId);
  }

  async disableMFA(userId: string): Promise<void> {
    await supabaseAdmin
      .from('mfa_configs')
      .update({ enabled: false })
      .eq('user_id', userId);
  }

  async getMFAConfig(userId: string): Promise<MFAConfig | null> {
    const { data } = await supabaseAdmin
      .from('mfa_configs')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!data) {
      return null;
    }

    return {
      enabled: data.enabled,
      required: false, // Can be configured per company
      providers: [
        {
          id: 'totp',
          type: 'TOTP',
          name: 'Authenticator App',
          enabled: data.enabled,
          verified: data.enabled,
          createdAt: data.created_at,
          lastUsed: data.last_used,
        },
      ],
      backupCodes: data.backup_codes || [],
      recoveryEmail: '', // Can be user's email
    };
  }

  // =============================================================================
  // SESSION METHODS
  // =============================================================================

  async createSession(user: any, context: SecurityContext): Promise<AuthSession> {
    const authUser = this.transformToAuthUser(user);
    
    // Create access token
    const accessToken = await this.createAccessToken(authUser);
    
    // Create refresh token
    const refreshToken = await this.createRefreshToken(user.id);

    // Get user permissions
    const permissions = await this.getUserPermissions(user.id, user.role);

    const session: AuthSession = {
      user: authUser,
      token: accessToken,
      refreshToken,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
      permissions,
    };

    // Store session in database
    await this.storeSession(session, context);

    return session;
  }

  private async createAccessToken(user: AuthUser): Promise<string> {
    return new SignJWT({
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      type: 'access',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(this.config.accessTokenExpiry)
      .sign(JWT_SECRET);
  }

  private async createRefreshToken(userId: string): Promise<string> {
    return new SignJWT({
      sub: userId,
      type: 'refresh',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(this.config.refreshTokenExpiry)
      .sign(JWT_SECRET);
  }

  async verifyToken(token: string): Promise<AuthToken | null> {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      return payload as AuthToken;
    } catch (error) {
      return null;
    }
  }

  private async storeSession(session: AuthSession, context: SecurityContext): Promise<void> {
    const userAgent = new UAParser(context.userAgent);
    
    await supabaseAdmin.from('user_sessions').insert({
      user_id: session.user.id,
      token_hash: await this.hashToken(session.token),
      ip_address: context.ipAddress,
      user_agent: context.userAgent,
      device_info: {
        browser: userAgent.getBrowser(),
        os: userAgent.getOS(),
        device: userAgent.getDevice(),
      },
      expires_at: session.expiresAt,
    });
  }

  private async invalidateUserSessions(userId: string): Promise<void> {
    await supabaseAdmin
      .from('user_sessions')
      .delete()
      .eq('user_id', userId);
  }

  // =============================================================================
  // SECURITY METHODS
  // =============================================================================

  private async checkRateLimit(email: string, ipAddress: string): Promise<boolean> {
    // Implementation would use Redis or in-memory store
    // For now, return false (not rate limited)
    return false;
  }

  private async checkAccountLockout(userId: string): Promise<Date | null> {
    const { data } = await supabaseAdmin
      .from('account_lockouts')
      .select('locked_until')
      .eq('user_id', userId)
      .single();

    return data?.locked_until ? new Date(data.locked_until) : null;
  }

  private async incrementFailedLoginAttempts(userId: string): Promise<void> {
    const { data: attempts } = await supabaseAdmin
      .from('failed_login_attempts')
      .select('count')
      .eq('user_id', userId)
      .single();

    const count = (attempts?.count || 0) + 1;

    if (count >= this.config.maxLoginAttempts) {
      // Lock account
      const lockoutUntil = new Date(Date.now() + this.config.lockoutDuration * 60 * 1000);
      await supabaseAdmin.from('account_lockouts').upsert({
        user_id: userId,
        locked_until: lockoutUntil.toISOString(),
      });
    }

    await supabaseAdmin.from('failed_login_attempts').upsert({
      user_id: userId,
      count,
      last_attempt: new Date().toISOString(),
    });
  }

  private async resetFailedLoginAttempts(userId: string): Promise<void> {
    await supabaseAdmin
      .from('failed_login_attempts')
      .delete()
      .eq('user_id', userId);
    
    await supabaseAdmin
      .from('account_lockouts')
      .delete()
      .eq('user_id', userId);
  }

  private async logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'createdAt'>): Promise<void> {
    await supabaseAdmin.from('security_events').insert({
      user_id: event.userId,
      type: event.type,
      description: event.description,
      ip_address: event.ipAddress,
      user_agent: event.userAgent,
      metadata: event.metadata,
      severity: event.severity,
    });
  }

  private async createMFAChallenge(userId: string, type: 'TOTP' | 'SMS' | 'EMAIL'): Promise<string> {
    const challengeId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await supabaseAdmin.from('mfa_challenges').insert({
      id: challengeId,
      user_id: userId,
      type,
      expires_at: expiresAt.toISOString(),
      attempts: 0,
      max_attempts: 3,
    });

    return challengeId;
  }

  private async completeMFAChallenge(challengeId: string): Promise<void> {
    await supabaseAdmin
      .from('mfa_challenges')
      .update({ completed: true })
      .eq('id', challengeId);
  }

  private async updateLastLogin(userId: string, context: SecurityContext): Promise<void> {
    await supabaseAdmin
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userId);
  }

  private async getUserPermissions(userId: string, role: string): Promise<string[]> {
    // Base permissions by role
    const rolePermissions: Record<string, string[]> = {
      ADMIN: ['*'], // All permissions
      MANAGER: ['users:read', 'workflows:*', 'reports:*', 'integrations:*'],
      COMPLIANCE_OFFICER: ['workflows:*', 'documents:*', 'reports:read'],
      EMPLOYEE: ['workflows:read', 'workflows:execute', 'documents:read'],
      AUDITOR: ['workflows:read', 'reports:read', 'audit:read'],
    };

    return rolePermissions[role] || ['workflows:read'];
  }

  private transformToAuthUser(user: any): AuthUser {
    return {
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
  }

  private async hashToken(token: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const authService = new AuthService();
export default authService;