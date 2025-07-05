import { z } from 'zod';

// =============================================================================
// ENUMS
// =============================================================================

export const UserRole = z.enum([
  'ADMIN',
  'MANAGER',
  'COMPLIANCE_OFFICER',
  'EMPLOYEE',
  'AUDITOR',
]);

export const BusinessSector = z.enum([
  'DENTAL',
  'RESTAURANT',
  'LABORATORY',
  'CONSTRUCTION',
  'PHARMACY',
  'AUTOMOTIVE',
  'BEAUTY',
  'CHILDCARE',
]);

export const CompanySize = z.enum([
  'MICRO',      // 1-5
  'SMALL',      // 6-25
  'MEDIUM',     // 26-100
  'LARGE',      // 100+
]);

export const Frequency = z.enum([
  'DAILY',
  'WEEKLY',
  'MONTHLY',
  'QUARTERLY',
  'YEARLY',
  'CUSTOM',
]);

export const Priority = z.enum([
  'CRITICAL',
  'MEDIUM',
  'LOW',
]);

export const WorkflowStepType = z.enum([
  'CHECKBOX',
  'TEXT_INPUT',
  'NUMBER_INPUT',
  'DATE_INPUT',
  'FILE_UPLOAD',
  'PHOTO_CAPTURE',
  'SIGNATURE',
  'APPROVAL',
]);

export const ExecutionStatus = z.enum([
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
  'OVERDUE',
  'CANCELLED',
]);

export const ImpactLevel = z.enum([
  'HIGH',
  'MEDIUM',
  'LOW',
]);

export const ActivityType = z.enum([
  'USER_LOGIN',
  'WORKFLOW_COMPLETED',
  'SCORE_CHANGED',
  'DOCUMENT_UPLOADED',
  'TEAM_INVITED',
  'SETTINGS_CHANGED',
  'REPORT_GENERATED',
  'COMPLIANCE_ALERT',
  'AUDIT_SCHEDULED',
  'WORKFLOW_ASSIGNED',
]);

export const NotificationType = z.enum([
  'DEADLINE_APPROACHING',
  'WORKFLOW_OVERDUE',
  'COMPLIANCE_SCORE_CHANGED',
  'TEAM_INVITATION',
  'AUDIT_REMINDER',
  'REGULATORY_UPDATE',
  'SYSTEM_ALERT',
]);

export const IntegrationType = z.enum([
  'SLACK',
  'TEAMS',
  'GOOGLE_CALENDAR',
  'OUTLOOK',
  'ZAPIER',
  'WEBHOOK',
]);

// =============================================================================
// CORE TYPES
// =============================================================================

export type UserRoleType = z.infer<typeof UserRole>;
export type BusinessSectorType = z.infer<typeof BusinessSector>;
export type CompanySizeType = z.infer<typeof CompanySize>;
export type FrequencyType = z.infer<typeof Frequency>;
export type PriorityType = z.infer<typeof Priority>;
export type WorkflowStepTypeType = z.infer<typeof WorkflowStepType>;
export type ExecutionStatusType = z.infer<typeof ExecutionStatus>;
export type ImpactLevelType = z.infer<typeof ImpactLevel>;
export type ActivityTypeType = z.infer<typeof ActivityType>;
export type NotificationTypeType = z.infer<typeof NotificationType>;
export type IntegrationTypeType = z.infer<typeof IntegrationType>;

// =============================================================================
// SUPABASE DATABASE TYPES
// =============================================================================

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: UserInsert;
        Update: UserUpdate;
      };
      companies: {
        Row: Company;
        Insert: CompanyInsert;
        Update: CompanyUpdate;
      };
      workflows: {
        Row: Workflow;
        Insert: WorkflowInsert;
        Update: WorkflowUpdate;
      };
      workflow_steps: {
        Row: WorkflowStep;
        Insert: WorkflowStepInsert;
        Update: WorkflowStepUpdate;
      };
      workflow_executions: {
        Row: WorkflowExecution;
        Insert: WorkflowExecutionInsert;
        Update: WorkflowExecutionUpdate;
      };
      step_executions: {
        Row: StepExecution;
        Insert: StepExecutionInsert;
        Update: StepExecutionUpdate;
      };
      compliance_scores: {
        Row: ComplianceScore;
        Insert: ComplianceScoreInsert;
        Update: ComplianceScoreUpdate;
      };
      regulatory_documents: {
        Row: RegulatoryDocument;
        Insert: RegulatoryDocumentInsert;
        Update: RegulatoryDocumentUpdate;
      };
      activities: {
        Row: Activity;
        Insert: ActivityInsert;
        Update: ActivityUpdate;
      };
      notifications: {
        Row: Notification;
        Insert: NotificationInsert;
        Update: NotificationUpdate;
      };
      integrations: {
        Row: Integration;
        Insert: IntegrationInsert;
        Update: IntegrationUpdate;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: UserRoleType;
      business_sector: BusinessSectorType;
      company_size: CompanySizeType;
      frequency: FrequencyType;
      priority: PriorityType;
      workflow_step_type: WorkflowStepTypeType;
      execution_status: ExecutionStatusType;
      impact_level: ImpactLevelType;
      activity_type: ActivityTypeType;
      notification_type: NotificationTypeType;
      integration_type: IntegrationTypeType;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// =============================================================================
// ENTITY TYPES
// =============================================================================

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string | null;
  role: UserRoleType;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
  company_id: string;
  // Relations
  company?: Company;
  activities?: Activity[];
  assignments?: WorkflowAssignment[];
  notifications?: Notification[];
}

export interface UserInsert {
  id?: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar?: string | null;
  role?: UserRoleType;
  is_active?: boolean;
  last_login?: string | null;
  company_id: string;
}

export interface UserUpdate {
  email?: string;
  first_name?: string;
  last_name?: string;
  avatar?: string | null;
  role?: UserRoleType;
  is_active?: boolean;
  last_login?: string | null;
  updated_at?: string;
  company_id?: string;
}

export interface Company {
  id: string;
  name: string;
  sector: BusinessSectorType;
  size: CompanySizeType;
  logo: string | null;
  website: string | null;
  address: Record<string, any> | null;
  subscription_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  users?: User[];
  workflows?: Workflow[];
  compliance_scores?: ComplianceScore[];
}

export interface CompanyInsert {
  id?: string;
  name: string;
  sector: BusinessSectorType;
  size: CompanySizeType;
  logo?: string | null;
  website?: string | null;
  address?: Record<string, any> | null;
  subscription_id?: string | null;
  is_active?: boolean;
}

export interface CompanyUpdate {
  name?: string;
  sector?: BusinessSectorType;
  size?: CompanySizeType;
  logo?: string | null;
  website?: string | null;
  address?: Record<string, any> | null;
  subscription_id?: string | null;
  is_active?: boolean;
  updated_at?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string | null;
  sector: BusinessSectorType;
  frequency: FrequencyType;
  priority: PriorityType;
  estimated_time: number; // Minutes
  is_template: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  company_id: string;
  // Relations
  company?: Company;
  steps?: WorkflowStep[];
  assignments?: WorkflowAssignment[];
  executions?: WorkflowExecution[];
}

export interface WorkflowInsert {
  id?: string;
  name: string;
  description?: string | null;
  sector: BusinessSectorType;
  frequency: FrequencyType;
  priority: PriorityType;
  estimated_time: number;
  is_template?: boolean;
  is_active?: boolean;
  company_id: string;
}

export interface WorkflowUpdate {
  name?: string;
  description?: string | null;
  sector?: BusinessSectorType;
  frequency?: FrequencyType;
  priority?: PriorityType;
  estimated_time?: number;
  is_template?: boolean;
  is_active?: boolean;
  updated_at?: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  description: string | null;
  type: WorkflowStepTypeType;
  is_required: boolean;
  order: number;
  settings: Record<string, any> | null;
  workflow_id: string;
  // Relations
  workflow?: Workflow;
  executions?: StepExecution[];
}

export interface WorkflowStepInsert {
  id?: string;
  name: string;
  description?: string | null;
  type: WorkflowStepTypeType;
  is_required?: boolean;
  order: number;
  settings?: Record<string, any> | null;
  workflow_id: string;
}

export interface WorkflowStepUpdate {
  name?: string;
  description?: string | null;
  type?: WorkflowStepTypeType;
  is_required?: boolean;
  order?: number;
  settings?: Record<string, any> | null;
}

export interface WorkflowExecution {
  id: string;
  status: ExecutionStatusType;
  due_date: string;
  completed_at: string | null;
  notes: string | null;
  workflow_id: string;
  assignee_id: string;
  // Relations
  workflow?: Workflow;
  assignee?: User;
  steps?: StepExecution[];
}

export interface WorkflowExecutionInsert {
  id?: string;
  status?: ExecutionStatusType;
  due_date: string;
  completed_at?: string | null;
  notes?: string | null;
  workflow_id: string;
  assignee_id: string;
}

export interface WorkflowExecutionUpdate {
  status?: ExecutionStatusType;
  due_date?: string;
  completed_at?: string | null;
  notes?: string | null;
  assignee_id?: string;
}

export interface StepExecution {
  id: string;
  status: ExecutionStatusType;
  value: Record<string, any> | null;
  completed_at: string | null;
  step_id: string;
  execution_id: string;
  // Relations
  step?: WorkflowStep;
  execution?: WorkflowExecution;
}

export interface StepExecutionInsert {
  id?: string;
  status?: ExecutionStatusType;
  value?: Record<string, any> | null;
  completed_at?: string | null;
  step_id: string;
  execution_id: string;
}

export interface StepExecutionUpdate {
  status?: ExecutionStatusType;
  value?: Record<string, any> | null;
  completed_at?: string | null;
}

export interface ComplianceScore {
  id: string;
  score: number; // 0-100
  critical_items: number;
  medium_items: number;
  low_items: number;
  calculated_at: string;
  company_id: string;
  // Relations
  company?: Company;
}

export interface ComplianceScoreInsert {
  id?: string;
  score: number;
  critical_items: number;
  medium_items: number;
  low_items: number;
  calculated_at?: string;
  company_id: string;
}

export interface ComplianceScoreUpdate {
  score?: number;
  critical_items?: number;
  medium_items?: number;
  low_items?: number;
  calculated_at?: string;
}

export interface RegulatoryDocument {
  id: string;
  title: string;
  content: string; // Full text content
  summary: string | null; // AI-generated summary
  source_url: string;
  published_at: string;
  effective_date: string | null;
  sector: BusinessSectorType[];
  impact_level: ImpactLevelType;
  tags: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RegulatoryDocumentInsert {
  id?: string;
  title: string;
  content: string;
  summary?: string | null;
  source_url: string;
  published_at: string;
  effective_date?: string | null;
  sector: BusinessSectorType[];
  impact_level: ImpactLevelType;
  tags?: string[];
  is_active?: boolean;
}

export interface RegulatoryDocumentUpdate {
  title?: string;
  content?: string;
  summary?: string | null;
  source_url?: string;
  published_at?: string;
  effective_date?: string | null;
  sector?: BusinessSectorType[];
  impact_level?: ImpactLevelType;
  tags?: string[];
  is_active?: boolean;
  updated_at?: string;
}

export interface Activity {
  id: string;
  type: ActivityTypeType;
  description: string;
  metadata: Record<string, any> | null;
  created_at: string;
  user_id: string;
  // Relations
  user?: User;
}

export interface ActivityInsert {
  id?: string;
  type: ActivityTypeType;
  description: string;
  metadata?: Record<string, any> | null;
  user_id: string;
}

export interface ActivityUpdate {
  type?: ActivityTypeType;
  description?: string;
  metadata?: Record<string, any> | null;
}

export interface Notification {
  id: string;
  type: NotificationTypeType;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
  user_id: string;
  // Relations
  user?: User;
}

export interface NotificationInsert {
  id?: string;
  type: NotificationTypeType;
  title: string;
  message: string;
  is_read?: boolean;
  read_at?: string | null;
  user_id: string;
}

export interface NotificationUpdate {
  type?: NotificationTypeType;
  title?: string;
  message?: string;
  is_read?: boolean;
  read_at?: string | null;
}

export interface Integration {
  id: string;
  type: IntegrationTypeType;
  name: string;
  is_active: boolean;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
  company_id: string;
  // Relations
  company?: Company;
}

export interface IntegrationInsert {
  id?: string;
  type: IntegrationTypeType;
  name: string;
  is_active?: boolean;
  settings: Record<string, any>;
  company_id: string;
}

export interface IntegrationUpdate {
  type?: IntegrationTypeType;
  name?: string;
  is_active?: boolean;
  settings?: Record<string, any>;
  updated_at?: string;
}

// =============================================================================
// ADDITIONAL TYPES
// =============================================================================

export interface WorkflowAssignment {
  id: string;
  workflow_id: string;
  assignee_id: string;
  created_at: string;
  // Relations
  workflow?: Workflow;
  assignee?: User;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  sector: BusinessSectorType;
  steps: WorkflowTemplateStep[];
  is_official: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkflowTemplateStep {
  id: string;
  name: string;
  description: string;
  type: WorkflowStepTypeType;
  is_required: boolean;
  order: number;
  settings: Record<string, any>;
}

// =============================================================================
// EXPORT ALL
// =============================================================================

export type {
  Database,
};