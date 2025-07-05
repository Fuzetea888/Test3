import { z } from 'zod';
import {
  User,
  Company,
  Workflow,
  WorkflowExecution,
  ComplianceScore,
  RegulatoryDocument,
  Activity,
  Notification,
  BusinessSectorType,
  UserRoleType,
  ExecutionStatusType,
  PriorityType,
  FrequencyType,
} from './database';

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

// =============================================================================
// AUTHENTICATION API
// =============================================================================

export interface LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresAt: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
  sector: BusinessSectorType;
  size: 'MICRO' | 'SMALL' | 'MEDIUM' | 'LARGE';
}

export interface RegisterResponse {
  user: User;
  company: Company;
  token: string;
  refreshToken: string;
  expiresAt: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  expiresAt: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// =============================================================================
// USER API
// =============================================================================

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role?: UserRoleType;
}

export interface InviteUserRequest {
  email: string;
  role: UserRoleType;
  firstName?: string;
  lastName?: string;
}

export interface UserListResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// =============================================================================
// COMPANY API
// =============================================================================

export interface UpdateCompanyRequest {
  name?: string;
  sector?: BusinessSectorType;
  size?: 'MICRO' | 'SMALL' | 'MEDIUM' | 'LARGE';
  logo?: string;
  website?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

export interface CompanyStatsResponse {
  totalUsers: number;
  activeWorkflows: number;
  completedWorkflows: number;
  overdueWorkflows: number;
  complianceScore: number;
  lastScoreUpdate: string;
  trends: {
    scoreChange: number;
    workflowsCompleted: number;
    period: string;
  };
}

// =============================================================================
// WORKFLOW API
// =============================================================================

export interface CreateWorkflowRequest {
  name: string;
  description?: string;
  sector: BusinessSectorType;
  frequency: FrequencyType;
  priority: PriorityType;
  estimatedTime: number;
  steps: CreateWorkflowStepRequest[];
}

export interface CreateWorkflowStepRequest {
  name: string;
  description?: string;
  type: 'CHECKBOX' | 'TEXT_INPUT' | 'NUMBER_INPUT' | 'DATE_INPUT' | 'FILE_UPLOAD' | 'PHOTO_CAPTURE' | 'SIGNATURE' | 'APPROVAL';
  isRequired?: boolean;
  order: number;
  settings?: Record<string, any>;
}

export interface UpdateWorkflowRequest {
  name?: string;
  description?: string;
  sector?: BusinessSectorType;
  frequency?: FrequencyType;
  priority?: PriorityType;
  estimatedTime?: number;
  isActive?: boolean;
}

export interface WorkflowListResponse {
  workflows: Workflow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface WorkflowTemplateResponse {
  templates: {
    id: string;
    name: string;
    description: string;
    sector: BusinessSectorType;
    steps: number;
    estimatedTime: number;
    isOfficial: boolean;
  }[];
}

// =============================================================================
// WORKFLOW EXECUTION API
// =============================================================================

export interface CreateWorkflowExecutionRequest {
  workflowId: string;
  assigneeId: string;
  dueDate: string;
  notes?: string;
}

export interface UpdateWorkflowExecutionRequest {
  status?: ExecutionStatusType;
  dueDate?: string;
  notes?: string;
  assigneeId?: string;
}

export interface ExecuteWorkflowStepRequest {
  stepId: string;
  value: Record<string, any>;
}

export interface WorkflowExecutionListResponse {
  executions: WorkflowExecution[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface WorkflowExecutionStatsResponse {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
  cancelled: number;
  completionRate: number;
  avgCompletionTime: number;
}

// =============================================================================
// COMPLIANCE SCORE API
// =============================================================================

export interface ComplianceScoreResponse {
  current: ComplianceScore;
  history: ComplianceScore[];
  trends: {
    scoreChange: number;
    period: string;
    improvement: boolean;
  };
  breakdown: {
    critical: {
      completed: number;
      total: number;
      percentage: number;
    };
    medium: {
      completed: number;
      total: number;
      percentage: number;
    };
    low: {
      completed: number;
      total: number;
      percentage: number;
    };
  };
}

export interface RecalculateScoreRequest {
  includeHistory?: boolean;
}

// =============================================================================
// REGULATORY DOCUMENTS API
// =============================================================================

export interface CreateRegulatoryDocumentRequest {
  title: string;
  content: string;
  sourceUrl: string;
  publishedAt: string;
  effectiveDate?: string;
  sector: BusinessSectorType[];
  impactLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  tags?: string[];
}

export interface UpdateRegulatoryDocumentRequest {
  title?: string;
  content?: string;
  summary?: string;
  sourceUrl?: string;
  publishedAt?: string;
  effectiveDate?: string;
  sector?: BusinessSectorType[];
  impactLevel?: 'HIGH' | 'MEDIUM' | 'LOW';
  tags?: string[];
  isActive?: boolean;
}

export interface RegulatoryDocumentListResponse {
  documents: RegulatoryDocument[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    sectors: BusinessSectorType[];
    impactLevels: ('HIGH' | 'MEDIUM' | 'LOW')[];
    tags: string[];
  };
}

export interface RegulatoryDocumentSearchRequest {
  query: string;
  sector?: BusinessSectorType[];
  impactLevel?: ('HIGH' | 'MEDIUM' | 'LOW')[];
  tags?: string[];
  publishedAfter?: string;
  publishedBefore?: string;
}

// =============================================================================
// NOTIFICATIONS API
// =============================================================================

export interface CreateNotificationRequest {
  type: 'DEADLINE_APPROACHING' | 'WORKFLOW_OVERDUE' | 'COMPLIANCE_SCORE_CHANGED' | 'TEAM_INVITATION' | 'AUDIT_REMINDER' | 'REGULATORY_UPDATE' | 'SYSTEM_ALERT';
  title: string;
  message: string;
  userId: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  unreadCount: number;
}

export interface MarkNotificationReadRequest {
  notificationIds: string[];
}

// =============================================================================
// REPORTS API
// =============================================================================

export interface GenerateReportRequest {
  type: 'COMPLIANCE_SUMMARY' | 'AUDIT_PREPARATION' | 'TRAINING_NEEDS' | 'REGULATORY_CHANGES' | 'PERFORMANCE_TRENDS';
  format: 'PDF' | 'EXCEL' | 'WORD' | 'POWERPOINT';
  dateRange: {
    start: string;
    end: string;
  };
  filters?: {
    sectors?: BusinessSectorType[];
    priorities?: PriorityType[];
    users?: string[];
    workflows?: string[];
  };
}

export interface ReportResponse {
  id: string;
  type: string;
  format: string;
  status: 'GENERATING' | 'COMPLETED' | 'FAILED';
  downloadUrl?: string;
  createdAt: string;
  expiresAt: string;
}

export interface ReportListResponse {
  reports: ReportResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// =============================================================================
// ANALYTICS API
// =============================================================================

export interface AnalyticsOverviewResponse {
  compliance: {
    currentScore: number;
    scoreChange: number;
    trend: 'UP' | 'DOWN' | 'STABLE';
  };
  workflows: {
    total: number;
    completed: number;
    overdue: number;
    completionRate: number;
  };
  users: {
    total: number;
    active: number;
    lastLogin: string;
  };
  alerts: {
    critical: number;
    medium: number;
    low: number;
  };
}

export interface AnalyticsTimeSeriesRequest {
  metric: 'COMPLIANCE_SCORE' | 'WORKFLOWS_COMPLETED' | 'USER_ACTIVITY' | 'ALERTS_GENERATED';
  granularity: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  dateRange: {
    start: string;
    end: string;
  };
}

export interface AnalyticsTimeSeriesResponse {
  data: {
    timestamp: string;
    value: number;
  }[];
  summary: {
    total: number;
    average: number;
    min: number;
    max: number;
    trend: 'UP' | 'DOWN' | 'STABLE';
  };
}

// =============================================================================
// INTEGRATION API
// =============================================================================

export interface CreateIntegrationRequest {
  type: 'SLACK' | 'TEAMS' | 'GOOGLE_CALENDAR' | 'OUTLOOK' | 'ZAPIER' | 'WEBHOOK';
  name: string;
  settings: Record<string, any>;
}

export interface UpdateIntegrationRequest {
  name?: string;
  isActive?: boolean;
  settings?: Record<string, any>;
}

export interface IntegrationListResponse {
  integrations: {
    id: string;
    type: string;
    name: string;
    isActive: boolean;
    lastSync: string | null;
    status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  }[];
}

export interface TestIntegrationRequest {
  integrationId: string;
  testType: 'CONNECTION' | 'NOTIFICATION' | 'SYNC';
}

export interface TestIntegrationResponse {
  success: boolean;
  message: string;
  details?: Record<string, any>;
}

// =============================================================================
// AI ASSISTANT API
// =============================================================================

export interface AiAssistantRequest {
  message: string;
  context?: {
    workflowId?: string;
    documentId?: string;
    userId?: string;
    companyId?: string;
  };
  type?: 'QUESTION' | 'DOCUMENT_ANALYSIS' | 'RISK_ASSESSMENT' | 'RECOMMENDATION';
}

export interface AiAssistantResponse {
  response: string;
  suggestions?: string[];
  actions?: {
    type: 'CREATE_WORKFLOW' | 'SCHEDULE_AUDIT' | 'GENERATE_REPORT' | 'CONTACT_EXPERT';
    label: string;
    data: Record<string, any>;
  }[];
  confidence: number;
  sources?: {
    type: 'DOCUMENT' | 'WORKFLOW' | 'REGULATION';
    id: string;
    title: string;
    relevance: number;
  }[];
}

// =============================================================================
// SEARCH API
// =============================================================================

export interface SearchRequest {
  query: string;
  filters?: {
    type?: ('WORKFLOW' | 'DOCUMENT' | 'USER' | 'COMPANY' | 'ACTIVITY')[];
    sector?: BusinessSectorType[];
    dateRange?: {
      start: string;
      end: string;
    };
  };
  pagination?: {
    page: number;
    limit: number;
  };
}

export interface SearchResponse {
  results: {
    type: 'WORKFLOW' | 'DOCUMENT' | 'USER' | 'COMPANY' | 'ACTIVITY';
    id: string;
    title: string;
    description: string;
    score: number;
    highlights: string[];
    metadata: Record<string, any>;
  }[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  aggregations: {
    types: Record<string, number>;
    sectors: Record<string, number>;
  };
}

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
  timestamp: z.string(),
});

export const PaginatedResponseSchema = z.object({
  data: z.array(z.any()),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  message: z.string(),
  details: z.record(z.any()).optional(),
  timestamp: z.string(),
});

// =============================================================================
// EXPORT TYPES
// =============================================================================

// All types are exported as interfaces above