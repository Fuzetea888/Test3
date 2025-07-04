-- =============================================================================
-- COMPLIANCEOS INITIAL SCHEMA
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE user_role AS ENUM (
  'ADMIN',
  'MANAGER', 
  'COMPLIANCE_OFFICER',
  'EMPLOYEE',
  'AUDITOR'
);

CREATE TYPE business_sector AS ENUM (
  'DENTAL',
  'RESTAURANT',
  'LABORATORY',
  'CONSTRUCTION',
  'PHARMACY',
  'AUTOMOTIVE',
  'BEAUTY',
  'CHILDCARE'
);

CREATE TYPE company_size AS ENUM (
  'MICRO',      -- 1-5
  'SMALL',      -- 6-25
  'MEDIUM',     -- 26-100
  'LARGE'       -- 100+
);

CREATE TYPE frequency AS ENUM (
  'DAILY',
  'WEEKLY',
  'MONTHLY',
  'QUARTERLY',
  'YEARLY',
  'CUSTOM'
);

CREATE TYPE priority AS ENUM (
  'CRITICAL',
  'MEDIUM',
  'LOW'
);

CREATE TYPE workflow_step_type AS ENUM (
  'CHECKBOX',
  'TEXT_INPUT',
  'NUMBER_INPUT',
  'DATE_INPUT',
  'FILE_UPLOAD',
  'PHOTO_CAPTURE',
  'SIGNATURE',
  'APPROVAL'
);

CREATE TYPE execution_status AS ENUM (
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
  'OVERDUE',
  'CANCELLED'
);

CREATE TYPE impact_level AS ENUM (
  'HIGH',
  'MEDIUM',
  'LOW'
);

CREATE TYPE activity_type AS ENUM (
  'USER_LOGIN',
  'WORKFLOW_COMPLETED',
  'SCORE_CHANGED',
  'DOCUMENT_UPLOADED',
  'TEAM_INVITED',
  'SETTINGS_CHANGED',
  'REPORT_GENERATED',
  'COMPLIANCE_ALERT',
  'AUDIT_SCHEDULED',
  'WORKFLOW_ASSIGNED'
);

CREATE TYPE notification_type AS ENUM (
  'DEADLINE_APPROACHING',
  'WORKFLOW_OVERDUE',
  'COMPLIANCE_SCORE_CHANGED',
  'TEAM_INVITATION',
  'AUDIT_REMINDER',
  'REGULATORY_UPDATE',
  'SYSTEM_ALERT'
);

CREATE TYPE integration_type AS ENUM (
  'SLACK',
  'TEAMS',
  'GOOGLE_CALENDAR',
  'OUTLOOK',
  'ZAPIER',
  'WEBHOOK'
);

-- =============================================================================
-- COMPANIES TABLE
-- =============================================================================

CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  sector business_sector NOT NULL,
  size company_size NOT NULL,
  logo TEXT,
  website TEXT,
  address JSONB,
  subscription_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Companies indexes
CREATE INDEX idx_companies_sector ON companies(sector);
CREATE INDEX idx_companies_size ON companies(size);
CREATE INDEX idx_companies_is_active ON companies(is_active);
CREATE INDEX idx_companies_created_at ON companies(created_at);

-- =============================================================================
-- USERS TABLE
-- =============================================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  avatar TEXT,
  role user_role NOT NULL DEFAULT 'EMPLOYEE',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE
);

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_last_login ON users(last_login);

-- =============================================================================
-- WORKFLOWS TABLE
-- =============================================================================

CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  sector business_sector NOT NULL,
  frequency frequency NOT NULL,
  priority priority NOT NULL,
  estimated_time INTEGER NOT NULL CHECK (estimated_time > 0), -- Minutes
  is_template BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE
);

-- Workflows indexes
CREATE INDEX idx_workflows_company_id ON workflows(company_id);
CREATE INDEX idx_workflows_sector ON workflows(sector);
CREATE INDEX idx_workflows_frequency ON workflows(frequency);
CREATE INDEX idx_workflows_priority ON workflows(priority);
CREATE INDEX idx_workflows_is_template ON workflows(is_template);
CREATE INDEX idx_workflows_is_active ON workflows(is_active);

-- =============================================================================
-- WORKFLOW STEPS TABLE
-- =============================================================================

CREATE TABLE workflow_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  type workflow_step_type NOT NULL,
  is_required BOOLEAN NOT NULL DEFAULT true,
  "order" INTEGER NOT NULL CHECK ("order" >= 0),
  settings JSONB,
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE
);

-- Workflow steps indexes
CREATE INDEX idx_workflow_steps_workflow_id ON workflow_steps(workflow_id);
CREATE INDEX idx_workflow_steps_order ON workflow_steps("order");
CREATE INDEX idx_workflow_steps_type ON workflow_steps(type);
CREATE UNIQUE INDEX idx_workflow_steps_workflow_order ON workflow_steps(workflow_id, "order");

-- =============================================================================
-- WORKFLOW EXECUTIONS TABLE
-- =============================================================================

CREATE TABLE workflow_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  status execution_status NOT NULL DEFAULT 'PENDING',
  due_date TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  assignee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Workflow executions indexes
CREATE INDEX idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX idx_workflow_executions_assignee_id ON workflow_executions(assignee_id);
CREATE INDEX idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX idx_workflow_executions_due_date ON workflow_executions(due_date);
CREATE INDEX idx_workflow_executions_completed_at ON workflow_executions(completed_at);

-- =============================================================================
-- STEP EXECUTIONS TABLE
-- =============================================================================

CREATE TABLE step_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  status execution_status NOT NULL DEFAULT 'PENDING',
  value JSONB, -- Step response data
  completed_at TIMESTAMPTZ,
  step_id UUID NOT NULL REFERENCES workflow_steps(id) ON DELETE CASCADE,
  execution_id UUID NOT NULL REFERENCES workflow_executions(id) ON DELETE CASCADE
);

-- Step executions indexes
CREATE INDEX idx_step_executions_step_id ON step_executions(step_id);
CREATE INDEX idx_step_executions_execution_id ON step_executions(execution_id);
CREATE INDEX idx_step_executions_status ON step_executions(status);
CREATE UNIQUE INDEX idx_step_executions_step_execution ON step_executions(step_id, execution_id);

-- =============================================================================
-- COMPLIANCE SCORES TABLE
-- =============================================================================

CREATE TABLE compliance_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  score DECIMAL(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
  critical_items INTEGER NOT NULL CHECK (critical_items >= 0),
  medium_items INTEGER NOT NULL CHECK (medium_items >= 0),
  low_items INTEGER NOT NULL CHECK (low_items >= 0),
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE
);

-- Compliance scores indexes
CREATE INDEX idx_compliance_scores_company_id ON compliance_scores(company_id);
CREATE INDEX idx_compliance_scores_calculated_at ON compliance_scores(calculated_at);
CREATE INDEX idx_compliance_scores_score ON compliance_scores(score);

-- =============================================================================
-- REGULATORY DOCUMENTS TABLE
-- =============================================================================

CREATE TABLE regulatory_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL, -- Full text content
  summary TEXT, -- AI-generated summary
  source_url TEXT NOT NULL,
  published_at TIMESTAMPTZ NOT NULL,
  effective_date TIMESTAMPTZ,
  sector business_sector[] NOT NULL,
  impact_level impact_level NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Regulatory documents indexes
CREATE INDEX idx_regulatory_documents_sector ON regulatory_documents USING GIN(sector);
CREATE INDEX idx_regulatory_documents_impact_level ON regulatory_documents(impact_level);
CREATE INDEX idx_regulatory_documents_published_at ON regulatory_documents(published_at);
CREATE INDEX idx_regulatory_documents_effective_date ON regulatory_documents(effective_date);
CREATE INDEX idx_regulatory_documents_tags ON regulatory_documents USING GIN(tags);
CREATE INDEX idx_regulatory_documents_is_active ON regulatory_documents(is_active);

-- Full text search index
CREATE INDEX idx_regulatory_documents_content_search ON regulatory_documents USING GIN(to_tsvector('english', title || ' ' || content));

-- =============================================================================
-- ACTIVITIES TABLE
-- =============================================================================

CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type activity_type NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Activities indexes
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_type ON activities(type);
CREATE INDEX idx_activities_created_at ON activities(created_at);

-- =============================================================================
-- NOTIFICATIONS TABLE
-- =============================================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type notification_type NOT NULL,
  title VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- =============================================================================
-- INTEGRATIONS TABLE
-- =============================================================================

CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type integration_type NOT NULL,
  name VARCHAR(100) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE
);

-- Integrations indexes
CREATE INDEX idx_integrations_company_id ON integrations(company_id);
CREATE INDEX idx_integrations_type ON integrations(type);
CREATE INDEX idx_integrations_is_active ON integrations(is_active);

-- =============================================================================
-- WORKFLOW ASSIGNMENTS TABLE (Many-to-Many)
-- =============================================================================

CREATE TABLE workflow_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  assignee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workflow_id, assignee_id)
);

-- Workflow assignments indexes
CREATE INDEX idx_workflow_assignments_workflow_id ON workflow_assignments(workflow_id);
CREATE INDEX idx_workflow_assignments_assignee_id ON workflow_assignments(assignee_id);

-- =============================================================================
-- AUDIT TRAIL TABLE
-- =============================================================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  success BOOLEAN NOT NULL DEFAULT true,
  error TEXT
);

-- Audit logs indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource);
CREATE INDEX idx_audit_logs_resource_id ON audit_logs(resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- =============================================================================
-- UPDATED_AT TRIGGERS
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON workflows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflow_executions_updated_at BEFORE UPDATE ON workflow_executions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_regulatory_documents_updated_at BEFORE UPDATE ON regulatory_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE regulatory_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS POLICIES
-- =============================================================================

-- Companies: Users can only see their own company
CREATE POLICY "Users can view their own company" ON companies
  FOR SELECT USING (id = (SELECT company_id FROM users WHERE users.id = auth.uid()));

CREATE POLICY "Admins can update their company" ON companies
  FOR UPDATE USING (
    id = (SELECT company_id FROM users WHERE users.id = auth.uid() AND users.role = 'ADMIN')
  );

-- Users: Users can see users from their company
CREATE POLICY "Users can view company users" ON users
  FOR SELECT USING (company_id = (SELECT company_id FROM users WHERE users.id = auth.uid()));

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins can manage company users" ON users
  FOR ALL USING (
    company_id = (SELECT company_id FROM users WHERE users.id = auth.uid() AND users.role IN ('ADMIN', 'MANAGER'))
  );

-- Workflows: Users can see workflows from their company
CREATE POLICY "Users can view company workflows" ON workflows
  FOR SELECT USING (company_id = (SELECT company_id FROM users WHERE users.id = auth.uid()));

CREATE POLICY "Managers can manage workflows" ON workflows
  FOR ALL USING (
    company_id = (SELECT company_id FROM users WHERE users.id = auth.uid() AND users.role IN ('ADMIN', 'MANAGER', 'COMPLIANCE_OFFICER'))
  );

-- Workflow Steps: Users can see steps from their company workflows
CREATE POLICY "Users can view workflow steps" ON workflow_steps
  FOR SELECT USING (
    workflow_id IN (
      SELECT w.id FROM workflows w 
      JOIN users u ON w.company_id = u.company_id 
      WHERE u.id = auth.uid()
    )
  );

-- Workflow Executions: Users can see executions from their company
CREATE POLICY "Users can view company workflow executions" ON workflow_executions
  FOR SELECT USING (
    workflow_id IN (
      SELECT w.id FROM workflows w 
      JOIN users u ON w.company_id = u.company_id 
      WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "Users can update their assigned executions" ON workflow_executions
  FOR UPDATE USING (assignee_id = auth.uid());

-- Step Executions: Users can manage their step executions
CREATE POLICY "Users can view step executions" ON step_executions
  FOR SELECT USING (
    execution_id IN (
      SELECT we.id FROM workflow_executions we
      JOIN workflows w ON we.workflow_id = w.id
      JOIN users u ON w.company_id = u.company_id
      WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "Users can update their step executions" ON step_executions
  FOR ALL USING (
    execution_id IN (
      SELECT we.id FROM workflow_executions we
      WHERE we.assignee_id = auth.uid()
    )
  );

-- Compliance Scores: Users can see their company scores
CREATE POLICY "Users can view company compliance scores" ON compliance_scores
  FOR SELECT USING (company_id = (SELECT company_id FROM users WHERE users.id = auth.uid()));

-- Regulatory Documents: All authenticated users can read
CREATE POLICY "Authenticated users can view regulatory documents" ON regulatory_documents
  FOR SELECT USING (auth.role() = 'authenticated');

-- Activities: Users can see their own activities and company activities
CREATE POLICY "Users can view activities" ON activities
  FOR SELECT USING (
    user_id = auth.uid() OR 
    user_id IN (
      SELECT u.id FROM users u 
      WHERE u.company_id = (SELECT company_id FROM users WHERE users.id = auth.uid())
    )
  );

CREATE POLICY "Users can create their own activities" ON activities
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Notifications: Users can see their own notifications
CREATE POLICY "Users can view their notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Integrations: Users can see their company integrations
CREATE POLICY "Users can view company integrations" ON integrations
  FOR SELECT USING (company_id = (SELECT company_id FROM users WHERE users.id = auth.uid()));

CREATE POLICY "Admins can manage integrations" ON integrations
  FOR ALL USING (
    company_id = (SELECT company_id FROM users WHERE users.id = auth.uid() AND users.role IN ('ADMIN', 'MANAGER'))
  );

-- Workflow Assignments: Users can see company assignments
CREATE POLICY "Users can view workflow assignments" ON workflow_assignments
  FOR SELECT USING (
    workflow_id IN (
      SELECT w.id FROM workflows w 
      JOIN users u ON w.company_id = u.company_id 
      WHERE u.id = auth.uid()
    )
  );

-- Audit Logs: Admins can see company audit logs
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT USING (
    user_id IN (
      SELECT u.id FROM users u 
      WHERE u.company_id = (
        SELECT company_id FROM users 
        WHERE users.id = auth.uid() AND users.role IN ('ADMIN', 'MANAGER')
      )
    )
  );

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Function to calculate compliance score
CREATE OR REPLACE FUNCTION calculate_compliance_score(company_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
  critical_completed INTEGER;
  critical_total INTEGER;
  medium_completed INTEGER;
  medium_total INTEGER;
  low_completed INTEGER;
  low_total INTEGER;
  total_score DECIMAL;
BEGIN
  -- Get critical items
  SELECT 
    COUNT(CASE WHEN we.status = 'COMPLETED' THEN 1 END),
    COUNT(*)
  INTO critical_completed, critical_total
  FROM workflow_executions we
  JOIN workflows w ON we.workflow_id = w.id
  WHERE w.company_id = company_uuid AND w.priority = 'CRITICAL';
  
  -- Get medium items
  SELECT 
    COUNT(CASE WHEN we.status = 'COMPLETED' THEN 1 END),
    COUNT(*)
  INTO medium_completed, medium_total
  FROM workflow_executions we
  JOIN workflows w ON we.workflow_id = w.id
  WHERE w.company_id = company_uuid AND w.priority = 'MEDIUM';
  
  -- Get low items
  SELECT 
    COUNT(CASE WHEN we.status = 'COMPLETED' THEN 1 END),
    COUNT(*)
  INTO low_completed, low_total
  FROM workflow_executions we
  JOIN workflows w ON we.workflow_id = w.id
  WHERE w.company_id = company_uuid AND w.priority = 'LOW';
  
  -- Calculate weighted score (Critical: 60%, Medium: 30%, Low: 10%)
  total_score := 0;
  
  IF critical_total > 0 THEN
    total_score := total_score + (critical_completed::DECIMAL / critical_total * 0.6 * 100);
  END IF;
  
  IF medium_total > 0 THEN
    total_score := total_score + (medium_completed::DECIMAL / medium_total * 0.3 * 100);
  END IF;
  
  IF low_total > 0 THEN
    total_score := total_score + (low_completed::DECIMAL / low_total * 0.1 * 100);
  END IF;
  
  RETURN ROUND(total_score, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to create compliance score record
CREATE OR REPLACE FUNCTION update_compliance_score(company_uuid UUID)
RETURNS UUID AS $$
DECLARE
  new_score DECIMAL;
  critical_count INTEGER;
  medium_count INTEGER;
  low_count INTEGER;
  score_id UUID;
BEGIN
  -- Calculate new score
  SELECT calculate_compliance_score(company_uuid) INTO new_score;
  
  -- Get item counts
  SELECT COUNT(*) INTO critical_count
  FROM workflow_executions we
  JOIN workflows w ON we.workflow_id = w.id
  WHERE w.company_id = company_uuid AND w.priority = 'CRITICAL';
  
  SELECT COUNT(*) INTO medium_count
  FROM workflow_executions we
  JOIN workflows w ON we.workflow_id = w.id
  WHERE w.company_id = company_uuid AND w.priority = 'MEDIUM';
  
  SELECT COUNT(*) INTO low_count
  FROM workflow_executions we
  JOIN workflows w ON we.workflow_id = w.id
  WHERE w.company_id = company_uuid AND w.priority = 'LOW';
  
  -- Insert new score record
  INSERT INTO compliance_scores (score, critical_items, medium_items, low_items, company_id)
  VALUES (new_score, critical_count, medium_count, low_count, company_uuid)
  RETURNING id INTO score_id;
  
  RETURN score_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE companies IS 'Companies using the compliance platform';
COMMENT ON TABLE users IS 'Users within companies';
COMMENT ON TABLE workflows IS 'Compliance workflows and templates';
COMMENT ON TABLE workflow_steps IS 'Individual steps within workflows';
COMMENT ON TABLE workflow_executions IS 'Instances of workflow execution';
COMMENT ON TABLE step_executions IS 'Execution of individual workflow steps';
COMMENT ON TABLE compliance_scores IS 'Historical compliance scores for companies';
COMMENT ON TABLE regulatory_documents IS 'Regulatory documents and updates';
COMMENT ON TABLE activities IS 'User activity log';
COMMENT ON TABLE notifications IS 'User notifications';
COMMENT ON TABLE integrations IS 'Third-party integrations';
COMMENT ON TABLE workflow_assignments IS 'Workflow assignments to users';
COMMENT ON TABLE audit_logs IS 'Audit trail for all system actions';