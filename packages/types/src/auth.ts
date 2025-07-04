import { z } from 'zod';
import { UserRoleType } from './database';

// =============================================================================
// NEXTAUTH TYPES
// =============================================================================

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  role: UserRoleType;
  companyId: string;
  companyName: string;
  companySector: string;
  isActive: boolean;
  lastLogin: string | null;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
  expiresAt: string;
  refreshToken: string;
  permissions: string[];
}

export interface AuthToken {
  sub: string; // user id
  email: string;
  role: UserRoleType;
  companyId: string;
  permissions: string[];
  iat: number;
  exp: number;
}

export interface RefreshToken {
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
  isRevoked: boolean;
}

// =============================================================================
// AUTHENTICATION STATE
// =============================================================================

export interface AuthState {
  user: AuthUser | null;
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  permissions: string[];
  error: string | null;
}

export interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<AuthSession>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<AuthSession>;
  updateUser: (updates: Partial<AuthUser>) => Promise<AuthUser>;
  checkPermission: (permission: string) => boolean;
  hasRole: (role: UserRoleType) => boolean;
  hasAnyRole: (roles: UserRoleType[]) => boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
  sector: string;
  size: string;
}

// =============================================================================
// OAUTH PROVIDERS
// =============================================================================

export interface OAuthProvider {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
  clientId: string;
  clientSecret: string;
  scope: string[];
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
}

export interface OAuthProviderConfig {
  google: OAuthProvider;
  microsoft: OAuthProvider;
  linkedin: OAuthProvider;
}

export interface OAuthUserInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  provider: string;
  providerId: string;
}

// =============================================================================
// PERMISSIONS & ROLES
// =============================================================================

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  scope: 'GLOBAL' | 'COMPANY' | 'TEAM' | 'USER';
}

export interface Role {
  id: string;
  name: UserRoleType;
  description: string;
  permissions: Permission[];
  isDefault: boolean;
  isSystem: boolean;
}

export interface UserPermissions {
  userId: string;
  permissions: string[];
  roles: UserRoleType[];
  inheritedPermissions: string[];
  explicitPermissions: string[];
}

// =============================================================================
// SECURITY TYPES
// =============================================================================

export interface SecurityPolicy {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
    preventCommonPasswords: boolean;
    preventUserInfo: boolean;
    passwordHistory: number;
    maxAge: number; // days
  };
  sessionPolicy: {
    maxAge: number; // minutes
    refreshTokenMaxAge: number; // days
    requireMFA: boolean;
    allowConcurrentSessions: boolean;
    maxConcurrentSessions: number;
  };
  accountLockout: {
    enabled: boolean;
    maxFailedAttempts: number;
    lockoutDuration: number; // minutes
    resetAfterSuccess: boolean;
  };
}

export interface SecurityEvent {
  id: string;
  userId: string;
  type: SecurityEventType;
  description: string;
  ipAddress: string;
  userAgent: string;
  metadata: Record<string, any>;
  createdAt: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export const SecurityEventType = z.enum([
  'LOGIN_SUCCESS',
  'LOGIN_FAILURE',
  'LOGOUT',
  'PASSWORD_CHANGE',
  'PASSWORD_RESET',
  'MFA_ENABLED',
  'MFA_DISABLED',
  'ACCOUNT_LOCKED',
  'ACCOUNT_UNLOCKED',
  'PERMISSION_GRANTED',
  'PERMISSION_REVOKED',
  'SUSPICIOUS_ACTIVITY',
  'UNAUTHORIZED_ACCESS',
  'TOKEN_REFRESH',
  'SESSION_EXPIRED',
]);

export type SecurityEventType = z.infer<typeof SecurityEventType>;

// =============================================================================
// MULTI-FACTOR AUTHENTICATION
// =============================================================================

export interface MFAConfig {
  enabled: boolean;
  required: boolean;
  providers: MFAProvider[];
  backupCodes: string[];
  recoveryEmail: string;
}

export interface MFAProvider {
  id: string;
  type: 'TOTP' | 'SMS' | 'EMAIL' | 'BACKUP_CODES';
  name: string;
  enabled: boolean;
  verified: boolean;
  secret?: string;
  phoneNumber?: string;
  email?: string;
  createdAt: string;
  lastUsed: string | null;
}

export interface MFAChallenge {
  id: string;
  type: 'TOTP' | 'SMS' | 'EMAIL';
  expiresAt: string;
  attempts: number;
  maxAttempts: number;
}

export interface MFAVerification {
  challengeId: string;
  code: string;
  provider: string;
}

// =============================================================================
// PASSWORD RESET
// =============================================================================

export interface PasswordResetRequest {
  email: string;
  token: string;
  expiresAt: string;
  used: boolean;
  createdAt: string;
}

export interface PasswordResetVerification {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// =============================================================================
// ACCOUNT VERIFICATION
// =============================================================================

export interface EmailVerification {
  id: string;
  userId: string;
  email: string;
  token: string;
  expiresAt: string;
  verified: boolean;
  createdAt: string;
  verifiedAt: string | null;
}

export interface EmailVerificationRequest {
  email: string;
}

export interface EmailVerificationConfirmation {
  token: string;
}

// =============================================================================
// AUDIT TRAIL
// =============================================================================

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  oldValues: Record<string, any> | null;
  newValues: Record<string, any> | null;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  success: boolean;
  error: string | null;
}

export interface AuditLogQuery {
  userId?: string;
  action?: string;
  resource?: string;
  resourceId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  pagination?: {
    page: number;
    limit: number;
  };
}

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

export const LoginCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  remember: z.boolean().optional(),
});

export const RegisterCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  companyName: z.string().min(1),
  sector: z.string().min(1),
  size: z.string().min(1),
});

export const PasswordResetSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8),
  confirmPassword: z.string().min(8),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
  confirmPassword: z.string().min(8),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const MFAVerificationSchema = z.object({
  challengeId: z.string(),
  code: z.string().length(6),
  provider: z.string(),
});

export const EmailVerificationSchema = z.object({
  token: z.string(),
});

// =============================================================================
// HOOKS TYPES
// =============================================================================

export interface UseAuthReturn {
  user: AuthUser | null;
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  permissions: string[];
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<AuthSession>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<AuthSession>;
  updateUser: (updates: Partial<AuthUser>) => Promise<AuthUser>;
  checkPermission: (permission: string) => boolean;
  hasRole: (role: UserRoleType) => boolean;
  hasAnyRole: (roles: UserRoleType[]) => boolean;
}

export interface UsePermissionsReturn {
  permissions: string[];
  roles: UserRoleType[];
  checkPermission: (permission: string) => boolean;
  hasRole: (role: UserRoleType) => boolean;
  hasAnyRole: (roles: UserRoleType[]) => boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
}

export interface UseSecurityReturn {
  securityEvents: SecurityEvent[];
  auditLogs: AuditLog[];
  isLoading: boolean;
  error: string | null;
  loadSecurityEvents: (userId: string) => Promise<void>;
  loadAuditLogs: (query: AuditLogQuery) => Promise<void>;
  logSecurityEvent: (event: Omit<SecurityEvent, 'id' | 'createdAt'>) => Promise<void>;
}

export interface UseMFAReturn {
  config: MFAConfig | null;
  isLoading: boolean;
  error: string | null;
  enableMFA: (provider: string) => Promise<void>;
  disableMFA: (provider: string) => Promise<void>;
  verifyMFA: (verification: MFAVerification) => Promise<boolean>;
  generateBackupCodes: () => Promise<string[]>;
  setupTOTP: () => Promise<{ secret: string; qrCode: string }>;
}

// =============================================================================
// CONTEXT TYPES
// =============================================================================

export interface AuthContextType {
  state: AuthState;
  actions: AuthActions;
}

export interface PermissionContextType {
  permissions: string[];
  roles: UserRoleType[];
  checkPermission: (permission: string) => boolean;
  hasRole: (role: UserRoleType) => boolean;
  hasAnyRole: (roles: UserRoleType[]) => boolean;
}

export interface SecurityContextType {
  policy: SecurityPolicy;
  events: SecurityEvent[];
  auditLogs: AuditLog[];
  logEvent: (event: Omit<SecurityEvent, 'id' | 'createdAt'>) => void;
}

// =============================================================================
// PROVIDER TYPES
// =============================================================================

export interface AuthProviderProps {
  children: React.ReactNode;
  config?: {
    apiUrl: string;
    storageKey: string;
    refreshInterval: number;
    retryAttempts: number;
  };
}

export interface PermissionProviderProps {
  children: React.ReactNode;
  permissions: string[];
  roles: UserRoleType[];
}

export interface SecurityProviderProps {
  children: React.ReactNode;
  policy: SecurityPolicy;
}