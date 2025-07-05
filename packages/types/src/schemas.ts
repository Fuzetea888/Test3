import { z } from 'zod';
import {
  UserRole,
  BusinessSector,
  CompanySize,
  Frequency,
  Priority,
  WorkflowStepType,
  ExecutionStatus,
  ImpactLevel,
  ActivityType,
  NotificationType,
  IntegrationType,
} from './database';

// =============================================================================
// USER SCHEMAS
// =============================================================================

export const CreateUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  role: UserRole.optional().default('EMPLOYEE'),
  companyId: z.string().uuid('Invalid company ID'),
});

export const UpdateUserSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  avatar: z.string().url().optional().nullable(),
  role: UserRole.optional(),
  isActive: z.boolean().optional(),
});

export const InviteUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: UserRole,
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
});

// =============================================================================
// AUTHENTICATION SCHEMAS
// =============================================================================

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional().default(false),
});

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  companyName: z.string().min(1, 'Company name is required').max(100),
  sector: BusinessSector,
  size: CompanySize,
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// =============================================================================
// COMPANY SCHEMAS
// =============================================================================

export const CreateCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required').max(100),
  sector: BusinessSector,
  size: CompanySize,
  logo: z.string().url().optional().nullable(),
  website: z.string().url().optional().nullable(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  }).optional().nullable(),
});

export const UpdateCompanySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  sector: BusinessSector.optional(),
  size: CompanySize.optional(),
  logo: z.string().url().optional().nullable(),
  website: z.string().url().optional().nullable(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  }).optional().nullable(),
});

// =============================================================================
// WORKFLOW SCHEMAS
// =============================================================================

export const CreateWorkflowStepSchema = z.object({
  name: z.string().min(1, 'Step name is required').max(100),
  description: z.string().max(500).optional().nullable(),
  type: WorkflowStepType,
  isRequired: z.boolean().optional().default(true),
  order: z.number().int().min(0),
  settings: z.record(z.any()).optional().nullable(),
});

export const CreateWorkflowSchema = z.object({
  name: z.string().min(1, 'Workflow name is required').max(100),
  description: z.string().max(500).optional().nullable(),
  sector: BusinessSector,
  frequency: Frequency,
  priority: Priority,
  estimatedTime: z.number().int().min(1, 'Estimated time must be at least 1 minute'),
  isTemplate: z.boolean().optional().default(false),
  steps: z.array(CreateWorkflowStepSchema).min(1, 'At least one step is required'),
});

export const UpdateWorkflowSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  sector: BusinessSector.optional(),
  frequency: Frequency.optional(),
  priority: Priority.optional(),
  estimatedTime: z.number().int().min(1).optional(),
  isActive: z.boolean().optional(),
});

export const UpdateWorkflowStepSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  type: WorkflowStepType.optional(),
  isRequired: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
  settings: z.record(z.any()).optional().nullable(),
});

// =============================================================================
// WORKFLOW EXECUTION SCHEMAS
// =============================================================================

export const CreateWorkflowExecutionSchema = z.object({
  workflowId: z.string().uuid('Invalid workflow ID'),
  assigneeId: z.string().uuid('Invalid assignee ID'),
  dueDate: z.string().datetime('Invalid due date'),
  notes: z.string().max(1000).optional().nullable(),
});

export const UpdateWorkflowExecutionSchema = z.object({
  status: ExecutionStatus.optional(),
  dueDate: z.string().datetime().optional(),
  notes: z.string().max(1000).optional().nullable(),
  assigneeId: z.string().uuid().optional(),
});

export const ExecuteWorkflowStepSchema = z.object({
  stepId: z.string().uuid('Invalid step ID'),
  value: z.record(z.any()),
});

// =============================================================================
// COMPLIANCE SCORE SCHEMAS
// =============================================================================

export const CreateComplianceScoreSchema = z.object({
  score: z.number().min(0).max(100),
  criticalItems: z.number().int().min(0),
  mediumItems: z.number().int().min(0),
  lowItems: z.number().int().min(0),
  companyId: z.string().uuid('Invalid company ID'),
});

export const UpdateComplianceScoreSchema = z.object({
  score: z.number().min(0).max(100).optional(),
  criticalItems: z.number().int().min(0).optional(),
  mediumItems: z.number().int().min(0).optional(),
  lowItems: z.number().int().min(0).optional(),
});

// =============================================================================
// REGULATORY DOCUMENT SCHEMAS
// =============================================================================

export const CreateRegulatoryDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required'),
  summary: z.string().max(1000).optional().nullable(),
  sourceUrl: z.string().url('Invalid source URL'),
  publishedAt: z.string().datetime('Invalid published date'),
  effectiveDate: z.string().datetime().optional().nullable(),
  sector: z.array(BusinessSector).min(1, 'At least one sector is required'),
  impactLevel: ImpactLevel,
  tags: z.array(z.string()).optional().default([]),
});

export const UpdateRegulatoryDocumentSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  summary: z.string().max(1000).optional().nullable(),
  sourceUrl: z.string().url().optional(),
  publishedAt: z.string().datetime().optional(),
  effectiveDate: z.string().datetime().optional().nullable(),
  sector: z.array(BusinessSector).min(1).optional(),
  impactLevel: ImpactLevel.optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export const SearchRegulatoryDocumentsSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  sector: z.array(BusinessSector).optional(),
  impactLevel: z.array(ImpactLevel).optional(),
  tags: z.array(z.string()).optional(),
  publishedAfter: z.string().datetime().optional(),
  publishedBefore: z.string().datetime().optional(),
});

// =============================================================================
// NOTIFICATION SCHEMAS
// =============================================================================

export const CreateNotificationSchema = z.object({
  type: NotificationType,
  title: z.string().min(1, 'Title is required').max(100),
  message: z.string().min(1, 'Message is required').max(500),
  userId: z.string().uuid('Invalid user ID'),
});

export const UpdateNotificationSchema = z.object({
  isRead: z.boolean().optional(),
  readAt: z.string().datetime().optional().nullable(),
});

export const MarkNotificationsReadSchema = z.object({
  notificationIds: z.array(z.string().uuid()).min(1, 'At least one notification ID is required'),
});

// =============================================================================
// ACTIVITY SCHEMAS
// =============================================================================

export const CreateActivitySchema = z.object({
  type: ActivityType,
  description: z.string().min(1, 'Description is required').max(500),
  metadata: z.record(z.any()).optional().nullable(),
  userId: z.string().uuid('Invalid user ID'),
});

// =============================================================================
// INTEGRATION SCHEMAS
// =============================================================================

export const CreateIntegrationSchema = z.object({
  type: IntegrationType,
  name: z.string().min(1, 'Integration name is required').max(100),
  settings: z.record(z.any()),
  companyId: z.string().uuid('Invalid company ID'),
});

export const UpdateIntegrationSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  isActive: z.boolean().optional(),
  settings: z.record(z.any()).optional(),
});

export const TestIntegrationSchema = z.object({
  integrationId: z.string().uuid('Invalid integration ID'),
  testType: z.enum(['CONNECTION', 'NOTIFICATION', 'SYNC']),
});

// =============================================================================
// REPORT SCHEMAS
// =============================================================================

export const GenerateReportSchema = z.object({
  type: z.enum(['COMPLIANCE_SUMMARY', 'AUDIT_PREPARATION', 'TRAINING_NEEDS', 'REGULATORY_CHANGES', 'PERFORMANCE_TRENDS']),
  format: z.enum(['PDF', 'EXCEL', 'WORD', 'POWERPOINT']),
  dateRange: z.object({
    start: z.string().datetime('Invalid start date'),
    end: z.string().datetime('Invalid end date'),
  }),
  filters: z.object({
    sectors: z.array(BusinessSector).optional(),
    priorities: z.array(Priority).optional(),
    users: z.array(z.string().uuid()).optional(),
    workflows: z.array(z.string().uuid()).optional(),
  }).optional(),
}).refine((data) => new Date(data.dateRange.start) < new Date(data.dateRange.end), {
  message: 'Start date must be before end date',
  path: ['dateRange', 'end'],
});

// =============================================================================
// AI ASSISTANT SCHEMAS
// =============================================================================

export const AiAssistantRequestSchema = z.object({
  message: z.string().min(1, 'Message is required').max(2000),
  context: z.object({
    workflowId: z.string().uuid().optional(),
    documentId: z.string().uuid().optional(),
    userId: z.string().uuid().optional(),
    companyId: z.string().uuid().optional(),
  }).optional(),
  type: z.enum(['QUESTION', 'DOCUMENT_ANALYSIS', 'RISK_ASSESSMENT', 'RECOMMENDATION']).optional(),
});

// =============================================================================
// SEARCH SCHEMAS
// =============================================================================

export const SearchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(200),
  filters: z.object({
    type: z.array(z.enum(['WORKFLOW', 'DOCUMENT', 'USER', 'COMPANY', 'ACTIVITY'])).optional(),
    sector: z.array(BusinessSector).optional(),
    dateRange: z.object({
      start: z.string().datetime(),
      end: z.string().datetime(),
    }).optional(),
  }).optional(),
  pagination: z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20),
  }).optional(),
});

// =============================================================================
// ANALYTICS SCHEMAS
// =============================================================================

export const AnalyticsTimeSeriesSchema = z.object({
  metric: z.enum(['COMPLIANCE_SCORE', 'WORKFLOWS_COMPLETED', 'USER_ACTIVITY', 'ALERTS_GENERATED']),
  granularity: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
  dateRange: z.object({
    start: z.string().datetime('Invalid start date'),
    end: z.string().datetime('Invalid end date'),
  }),
}).refine((data) => new Date(data.dateRange.start) < new Date(data.dateRange.end), {
  message: 'Start date must be before end date',
  path: ['dateRange', 'end'],
});

// =============================================================================
// PAGINATION SCHEMAS
// =============================================================================

export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

// =============================================================================
// FILTER SCHEMAS
// =============================================================================

export const DateRangeSchema = z.object({
  start: z.string().datetime('Invalid start date'),
  end: z.string().datetime('Invalid end date'),
}).refine((data) => new Date(data.start) < new Date(data.end), {
  message: 'Start date must be before end date',
  path: ['end'],
});

export const CompanyFilterSchema = z.object({
  sector: z.array(BusinessSector).optional(),
  size: z.array(CompanySize).optional(),
  isActive: z.boolean().optional(),
});

export const WorkflowFilterSchema = z.object({
  sector: z.array(BusinessSector).optional(),
  frequency: z.array(Frequency).optional(),
  priority: z.array(Priority).optional(),
  status: z.array(ExecutionStatus).optional(),
  isTemplate: z.boolean().optional(),
  isActive: z.boolean().optional(),
  assigneeId: z.string().uuid().optional(),
  dueDate: DateRangeSchema.optional(),
});

export const UserFilterSchema = z.object({
  role: z.array(UserRole).optional(),
  isActive: z.boolean().optional(),
  companyId: z.string().uuid().optional(),
  lastLogin: DateRangeSchema.optional(),
});

// =============================================================================
// VALIDATION UTILITIES
// =============================================================================

export const validateUUID = (value: string, fieldName = 'ID') => {
  return z.string().uuid(`Invalid ${fieldName}`).parse(value);
};

export const validateEmail = (value: string) => {
  return z.string().email('Invalid email address').parse(value);
};

export const validateDate = (value: string, fieldName = 'date') => {
  return z.string().datetime(`Invalid ${fieldName}`).parse(value);
};

export const validatePassword = (value: string) => {
  return z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
    .parse(value);
};

// =============================================================================
// ALL SCHEMAS EXPORTED ABOVE
// =============================================================================