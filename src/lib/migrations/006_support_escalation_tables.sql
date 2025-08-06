-- Human Support Escalation Flow Tables
-- Run this migration to add comprehensive support ticket management and escalation

-- Support Agents Table - Track support team members and their capabilities
CREATE TABLE IF NOT EXISTS support_agents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE, -- NULL for global agents
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('l1_support', 'l2_specialist', 'l3_expert', 'engineer', 'manager', 'escalation_specialist')),
    specializations TEXT[] NOT NULL DEFAULT '{}',
    languages TEXT[] NOT NULL DEFAULT '{"en"}',
    current_capacity INTEGER DEFAULT 0,
    max_capacity INTEGER NOT NULL DEFAULT 8,
    shift_schedule JSONB NOT NULL DEFAULT '{}',
    performance_metrics JSONB DEFAULT '{}',
    is_available BOOLEAN DEFAULT true,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'busy', 'away', 'offline', 'break', 'training')),
    hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
    last_activity TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    INDEX idx_support_agents_role (role),
    INDEX idx_support_agents_status (status),
    INDEX idx_support_agents_available (is_available),
    INDEX idx_support_agents_tenant (tenant_id),
    INDEX idx_support_agents_capacity (current_capacity, max_capacity)
);

-- Support Tickets Table - Core support ticket management
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_number TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('technical_issue', 'feature_request', 'account_access', 'billing_payment', 'data_sync', 'training_help', 'bug_report', 'integration_issue', 'performance', 'security_concern')),
    priority TEXT NOT NULL CHECK (priority IN ('low', 'normal', 'high', 'urgent', 'critical')),
    severity TEXT NOT NULL CHECK (severity IN ('minor', 'moderate', 'major', 'critical', 'blocker')),
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'acknowledged', 'in_progress', 'escalated', 'pending_customer', 'pending_vendor', 'resolved', 'closed', 'reopened')),
    channel TEXT NOT NULL CHECK (channel IN ('web_form', 'email', 'phone', 'chat', 'mobile_app', 'emergency_line')),
    tags TEXT[] DEFAULT '{}',
    
    -- Assignment & Routing
    assigned_to UUID REFERENCES support_agents(id) ON DELETE SET NULL,
    assigned_team TEXT,
    escalation_level INTEGER DEFAULT 0 CHECK (escalation_level >= 0 AND escalation_level <= 3),
    escalation_history JSONB DEFAULT '[]',
    
    -- SLA & Timing
    sla_category TEXT NOT NULL DEFAULT 'standard' CHECK (sla_category IN ('standard', 'premium', 'enterprise', 'critical_infrastructure')),
    response_due TIMESTAMPTZ NOT NULL,
    resolution_due TIMESTAMPTZ NOT NULL,
    first_response_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    
    -- Context & Metadata
    user_context JSONB DEFAULT '{}',
    technical_context JSONB DEFAULT '{}',
    business_impact JSONB DEFAULT '{}',
    affected_systems TEXT[] DEFAULT '{}',
    related_tickets UUID[] DEFAULT '{}',
    
    -- Customer Satisfaction
    customer_satisfaction_score INTEGER CHECK (customer_satisfaction_score >= 1 AND customer_satisfaction_score <= 5),
    satisfaction_feedback TEXT,
    satisfaction_collected_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    INDEX idx_support_tickets_user (user_id),
    INDEX idx_support_tickets_tenant (tenant_id),
    INDEX idx_support_tickets_assigned (assigned_to),
    INDEX idx_support_tickets_status (status),
    INDEX idx_support_tickets_priority (priority),
    INDEX idx_support_tickets_category (category),
    INDEX idx_support_tickets_escalation (escalation_level),
    INDEX idx_support_tickets_response_due (response_due),
    INDEX idx_support_tickets_resolution_due (resolution_due),
    INDEX idx_support_tickets_created (created_at),
    INDEX idx_support_tickets_number (ticket_number),
    INDEX idx_support_tickets_sla_breach (response_due, status) WHERE status NOT IN ('resolved', 'closed')
);

-- Ticket Communications Table - All interactions on a ticket
CREATE TABLE IF NOT EXISTS ticket_communications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('customer_message', 'agent_response', 'system_update', 'escalation_note', 'internal_note')),
    from_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    from_agent_id UUID REFERENCES support_agents(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    channel TEXT NOT NULL CHECK (channel IN ('web_form', 'email', 'phone', 'chat', 'mobile_app', 'emergency_line', 'system')),
    is_internal BOOLEAN DEFAULT false,
    attachments TEXT[] DEFAULT '{}',
    read_by_customer BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    sentiment_score NUMERIC(3,2), -- -1 to 1, negative to positive sentiment
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    INDEX idx_ticket_communications_ticket (ticket_id),
    INDEX idx_ticket_communications_type (type),
    INDEX idx_ticket_communications_created (created_at),
    INDEX idx_ticket_communications_from_user (from_user_id),
    INDEX idx_ticket_communications_from_agent (from_agent_id),
    INDEX idx_ticket_communications_read (read_by_customer)
);

-- Ticket Internal Notes Table - Internal team notes and observations
CREATE TABLE IF NOT EXISTS ticket_internal_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    note_type TEXT NOT NULL CHECK (note_type IN ('investigation', 'solution', 'escalation', 'customer_info', 'followup', 'troubleshooting')),
    is_visible_to_customer BOOLEAN DEFAULT false,
    mentioned_agents UUID[] DEFAULT '{}', -- Agents mentioned in the note
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    INDEX idx_ticket_notes_ticket (ticket_id),
    INDEX idx_ticket_notes_author (author_id),
    INDEX idx_ticket_notes_type (note_type),
    INDEX idx_ticket_notes_created (created_at)
);

-- Escalation Rules Table - Define automatic escalation conditions
CREATE TABLE IF NOT EXISTS escalation_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE, -- NULL for global rules
    name TEXT NOT NULL,
    description TEXT,
    conditions JSONB NOT NULL, -- Array of conditions that trigger escalation
    actions JSONB NOT NULL, -- Array of actions to take when escalated
    priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
    is_active BOOLEAN DEFAULT true,
    trigger_count INTEGER DEFAULT 0,
    last_triggered TIMESTAMPTZ,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    INDEX idx_escalation_rules_tenant (tenant_id),
    INDEX idx_escalation_rules_active (is_active),
    INDEX idx_escalation_rules_priority (priority)
);

-- Support Knowledge Base Table - Internal solutions and procedures
CREATE TABLE IF NOT EXISTS support_knowledge_base (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    tags TEXT[] DEFAULT '{}',
    keywords TEXT[] DEFAULT '{}', -- For search optimization
    solution_type TEXT NOT NULL CHECK (solution_type IN ('procedure', 'troubleshooting', 'faq', 'escalation_guide', 'script')),
    access_level TEXT DEFAULT 'l1' CHECK (access_level IN ('l1', 'l2', 'l3', 'engineer', 'all')),
    is_published BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    effectiveness_rating NUMERIC(3,2) DEFAULT 0, -- Average rating from agents
    last_updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    INDEX idx_knowledge_base_category (category, subcategory),
    INDEX idx_knowledge_base_solution_type (solution_type),
    INDEX idx_knowledge_base_access_level (access_level),
    INDEX idx_knowledge_base_published (is_published),
    INDEX idx_knowledge_base_keywords (keywords),
    INDEX idx_knowledge_base_rating (effectiveness_rating)
);

-- Support Metrics Table - Track performance metrics over time
CREATE TABLE IF NOT EXISTS support_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE, -- NULL for global metrics
    agent_id UUID REFERENCES support_agents(id) ON DELETE CASCADE, -- NULL for team metrics
    metric_date DATE NOT NULL,
    metric_type TEXT NOT NULL CHECK (metric_type IN ('daily', 'weekly', 'monthly')),
    
    -- Volume metrics
    tickets_created INTEGER DEFAULT 0,
    tickets_resolved INTEGER DEFAULT 0,
    tickets_escalated INTEGER DEFAULT 0,
    tickets_reopened INTEGER DEFAULT 0,
    
    -- Time metrics (in hours)
    avg_first_response_time NUMERIC(8,2) DEFAULT 0,
    avg_resolution_time NUMERIC(8,2) DEFAULT 0,
    avg_escalation_time NUMERIC(8,2) DEFAULT 0,
    
    -- Quality metrics
    customer_satisfaction_avg NUMERIC(3,2) DEFAULT 0,
    sla_compliance_rate NUMERIC(5,2) DEFAULT 0,
    first_contact_resolution_rate NUMERIC(5,2) DEFAULT 0,
    
    -- Agent metrics
    agent_utilization_rate NUMERIC(5,2) DEFAULT 0,
    agent_availability_hours NUMERIC(8,2) DEFAULT 0,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    UNIQUE(tenant_id, agent_id, metric_date, metric_type),
    INDEX idx_support_metrics_tenant (tenant_id),
    INDEX idx_support_metrics_agent (agent_id),
    INDEX idx_support_metrics_date (metric_date),
    INDEX idx_support_metrics_type (metric_type)
);

-- Support Callbacks Table - Schedule follow-up calls or actions
CREATE TABLE IF NOT EXISTS support_callbacks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES support_agents(id) ON DELETE CASCADE,
    callback_type TEXT NOT NULL CHECK (callback_type IN ('follow_up', 'solution_verification', 'satisfaction_check', 'escalation_review')),
    scheduled_for TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 15,
    phone_number TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
    completed_at TIMESTAMPTZ,
    outcome_notes TEXT,
    reschedule_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    INDEX idx_support_callbacks_ticket (ticket_id),
    INDEX idx_support_callbacks_agent (agent_id),
    INDEX idx_support_callbacks_scheduled (scheduled_for),
    INDEX idx_support_callbacks_status (status)
);

-- Emergency Escalation Table - Handle critical after-hours escalations
CREATE TABLE IF NOT EXISTS emergency_escalations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    escalation_chain JSONB NOT NULL, -- Ordered list of contacts to try
    current_step INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    current_attempts INTEGER DEFAULT 0,
    last_attempt_at TIMESTAMPTZ,
    acknowledged_by UUID REFERENCES support_agents(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'failed')),
    failure_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    INDEX idx_emergency_escalations_ticket (ticket_id),
    INDEX idx_emergency_escalations_status (status),
    INDEX idx_emergency_escalations_created (created_at)
);

-- Row Level Security (RLS) Policies
ALTER TABLE support_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_internal_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_callbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_escalations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for support agents (agents can see themselves, managers can see team)
CREATE POLICY "Agents can view their own profile" ON support_agents
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM support_agents sa
            WHERE sa.user_id = auth.uid()
            AND sa.role IN ('manager', 'escalation_specialist')
            AND (sa.tenant_id = support_agents.tenant_id OR sa.tenant_id IS NULL)
        )
    );

-- RLS Policies for support tickets (users can see their tickets, agents can see assigned/team tickets)
CREATE POLICY "Users can view their own tickets" ON support_tickets
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM support_agents sa
            WHERE sa.user_id = auth.uid()
            AND (sa.id = support_tickets.assigned_to OR sa.role IN ('manager', 'escalation_specialist'))
            AND (sa.tenant_id = support_tickets.tenant_id OR sa.tenant_id IS NULL)
        )
    );

CREATE POLICY "Users can create their own tickets" ON support_tickets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Support agents can update tickets" ON support_tickets
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM support_agents sa
            WHERE sa.user_id = auth.uid()
            AND (sa.id = support_tickets.assigned_to OR sa.role IN ('manager', 'escalation_specialist'))
            AND (sa.tenant_id = support_tickets.tenant_id OR sa.tenant_id IS NULL)
        )
    );

-- RLS Policies for communications (users can see their ticket comms, agents can see assigned ticket comms)
CREATE POLICY "Users and agents can view ticket communications" ON ticket_communications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM support_tickets st
            WHERE st.id = ticket_communications.ticket_id
            AND (
                auth.uid() = st.user_id OR
                EXISTS (
                    SELECT 1 FROM support_agents sa
                    WHERE sa.user_id = auth.uid()
                    AND (sa.id = st.assigned_to OR sa.role IN ('manager', 'escalation_specialist'))
                    AND (sa.tenant_id = st.tenant_id OR sa.tenant_id IS NULL)
                )
            )
        )
    );

-- Functions for support automation and escalation

-- Function to auto-assign tickets to best available agent
CREATE OR REPLACE FUNCTION auto_assign_ticket(p_ticket_id uuid)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    ticket_record RECORD;
    best_agent_id UUID;
    agent_record RECORD;
BEGIN
    -- Get ticket details
    SELECT * INTO ticket_record FROM support_tickets WHERE id = p_ticket_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Ticket not found';
    END IF;
    
    -- Find best available agent for this category and tenant
    SELECT sa.id INTO best_agent_id
    FROM support_agents sa
    WHERE sa.is_available = true
    AND sa.status = 'available'
    AND sa.current_capacity < sa.max_capacity
    AND (sa.tenant_id = ticket_record.tenant_id OR sa.tenant_id IS NULL)
    AND ticket_record.category = ANY(sa.specializations)
    ORDER BY 
        (sa.max_capacity - sa.current_capacity) DESC, -- Prefer agents with more capacity
        sa.performance_metrics->>'customer_satisfaction_average' DESC -- Prefer higher rated agents
    LIMIT 1;
    
    -- If no specialized agent found, find any available agent
    IF best_agent_id IS NULL THEN
        SELECT sa.id INTO best_agent_id
        FROM support_agents sa
        WHERE sa.is_available = true
        AND sa.status = 'available'
        AND sa.current_capacity < sa.max_capacity
        AND (sa.tenant_id = ticket_record.tenant_id OR sa.tenant_id IS NULL)
        ORDER BY (sa.max_capacity - sa.current_capacity) DESC
        LIMIT 1;
    END IF;
    
    -- Assign ticket if agent found
    IF best_agent_id IS NOT NULL THEN
        UPDATE support_tickets
        SET assigned_to = best_agent_id,
            assigned_team = 'L1_Support',
            status = 'acknowledged',
            updated_at = now()
        WHERE id = p_ticket_id;
        
        -- Update agent capacity
        UPDATE support_agents
        SET current_capacity = current_capacity + 1
        WHERE id = best_agent_id;
    END IF;
    
    RETURN best_agent_id;
END;
$$;

-- Function to check for SLA breaches and auto-escalate
CREATE OR REPLACE FUNCTION check_sla_breaches()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    breach_count INTEGER := 0;
    ticket_record RECORD;
BEGIN
    -- Find tickets with breached response SLA
    FOR ticket_record IN
        SELECT * FROM support_tickets
        WHERE status IN ('new', 'acknowledged')
        AND response_due < now()
        AND first_response_at IS NULL
    LOOP
        -- Auto-escalate
        UPDATE support_tickets
        SET escalation_level = escalation_level + 1,
            status = 'escalated',
            updated_at = now(),
            escalation_history = escalation_history || jsonb_build_object(
                'escalated_at', now(),
                'reason', 'sla_breach',
                'escalated_by', 'system',
                'from_level', escalation_level,
                'to_level', escalation_level + 1
            )
        WHERE id = ticket_record.id;
        
        breach_count := breach_count + 1;
    END LOOP;
    
    -- Find tickets with breached resolution SLA
    FOR ticket_record IN
        SELECT * FROM support_tickets
        WHERE status IN ('acknowledged', 'in_progress')
        AND resolution_due < now()
        AND resolved_at IS NULL
    LOOP
        -- Escalate if not already at max level
        IF ticket_record.escalation_level < 3 THEN
            UPDATE support_tickets
            SET escalation_level = escalation_level + 1,
                status = 'escalated',
                updated_at = now(),
                escalation_history = escalation_history || jsonb_build_object(
                    'escalated_at', now(),
                    'reason', 'sla_breach',
                    'escalated_by', 'system',
                    'from_level', escalation_level,
                    'to_level', escalation_level + 1
                )
            WHERE id = ticket_record.id;
            
            breach_count := breach_count + 1;
        END IF;
    END LOOP;
    
    RETURN breach_count;
END;
$$;

-- Function to calculate support metrics
CREATE OR REPLACE FUNCTION calculate_support_metrics(p_date date DEFAULT CURRENT_DATE)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    tenant_record RECORD;
    agent_record RECORD;
    metric_data RECORD;
BEGIN
    -- Calculate metrics for each tenant
    FOR tenant_record IN SELECT id FROM tenants LOOP
        -- Calculate tenant-level metrics
        SELECT
            COUNT(*) FILTER (WHERE DATE(created_at) = p_date) as tickets_created,
            COUNT(*) FILTER (WHERE DATE(resolved_at) = p_date) as tickets_resolved,
            COUNT(*) FILTER (WHERE escalation_level > 0 AND DATE(updated_at) = p_date) as tickets_escalated,
            COUNT(*) FILTER (WHERE status = 'reopened' AND DATE(updated_at) = p_date) as tickets_reopened,
            AVG(EXTRACT(EPOCH FROM (first_response_at - created_at))/3600) FILTER (WHERE DATE(first_response_at) = p_date) as avg_first_response_time,
            AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600) FILTER (WHERE DATE(resolved_at) = p_date) as avg_resolution_time,
            AVG(customer_satisfaction_score) FILTER (WHERE DATE(satisfaction_collected_at) = p_date) as avg_satisfaction
        INTO metric_data
        FROM support_tickets
        WHERE tenant_id = tenant_record.id
        AND created_at >= p_date - interval '30 days'; -- Look back 30 days for averages
        
        -- Insert/update tenant metrics
        INSERT INTO support_metrics (
            tenant_id, metric_date, metric_type,
            tickets_created, tickets_resolved, tickets_escalated, tickets_reopened,
            avg_first_response_time, avg_resolution_time, customer_satisfaction_avg
        ) VALUES (
            tenant_record.id, p_date, 'daily',
            COALESCE(metric_data.tickets_created, 0),
            COALESCE(metric_data.tickets_resolved, 0),
            COALESCE(metric_data.tickets_escalated, 0),
            COALESCE(metric_data.tickets_reopened, 0),
            COALESCE(metric_data.avg_first_response_time, 0),
            COALESCE(metric_data.avg_resolution_time, 0),
            COALESCE(metric_data.avg_satisfaction, 0)
        ) ON CONFLICT (tenant_id, agent_id, metric_date, metric_type)
        DO UPDATE SET
            tickets_created = EXCLUDED.tickets_created,
            tickets_resolved = EXCLUDED.tickets_resolved,
            tickets_escalated = EXCLUDED.tickets_escalated,
            tickets_reopened = EXCLUDED.tickets_reopened,
            avg_first_response_time = EXCLUDED.avg_first_response_time,
            avg_resolution_time = EXCLUDED.avg_resolution_time,
            customer_satisfaction_avg = EXCLUDED.customer_satisfaction_avg;
    END LOOP;
    
    -- Calculate agent-level metrics
    FOR agent_record IN SELECT id FROM support_agents LOOP
        SELECT
            COUNT(*) FILTER (WHERE DATE(created_at) = p_date) as tickets_created,
            COUNT(*) FILTER (WHERE DATE(resolved_at) = p_date) as tickets_resolved,
            AVG(EXTRACT(EPOCH FROM (first_response_at - created_at))/3600) FILTER (WHERE DATE(first_response_at) = p_date) as avg_first_response_time,
            AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600) FILTER (WHERE DATE(resolved_at) = p_date) as avg_resolution_time,
            AVG(customer_satisfaction_score) FILTER (WHERE DATE(satisfaction_collected_at) = p_date) as avg_satisfaction
        INTO metric_data
        FROM support_tickets
        WHERE assigned_to = agent_record.id
        AND created_at >= p_date - interval '30 days';
        
        -- Insert/update agent metrics
        INSERT INTO support_metrics (
            agent_id, metric_date, metric_type,
            tickets_created, tickets_resolved,
            avg_first_response_time, avg_resolution_time, customer_satisfaction_avg
        ) VALUES (
            agent_record.id, p_date, 'daily',
            COALESCE(metric_data.tickets_created, 0),
            COALESCE(metric_data.tickets_resolved, 0),
            COALESCE(metric_data.avg_first_response_time, 0),
            COALESCE(metric_data.avg_resolution_time, 0),
            COALESCE(metric_data.avg_satisfaction, 0)
        ) ON CONFLICT (tenant_id, agent_id, metric_date, metric_type)
        DO UPDATE SET
            tickets_created = EXCLUDED.tickets_created,
            tickets_resolved = EXCLUDED.tickets_resolved,
            avg_first_response_time = EXCLUDED.avg_first_response_time,
            avg_resolution_time = EXCLUDED.avg_resolution_time,
            customer_satisfaction_avg = EXCLUDED.customer_satisfaction_avg;
    END LOOP;
END;
$$;

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_support_agents_updated_at BEFORE UPDATE ON support_agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_escalation_rules_updated_at BEFORE UPDATE ON escalation_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_knowledge_base_updated_at BEFORE UPDATE ON support_knowledge_base
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample support agents
INSERT INTO support_agents (user_id, name, email, role, specializations, languages, max_capacity, shift_schedule)
SELECT 
    u.id,
    agent_data.name,
    agent_data.email,
    agent_data.role,
    agent_data.specializations::text[],
    agent_data.languages::text[],
    agent_data.max_capacity,
    agent_data.shift_schedule::jsonb
FROM (VALUES
    ('Sarah Johnson', 'sarah.johnson@agrinexus.ai', 'l1_support', 
     '{"technical_issue", "data_sync", "training_help"}', '{"en", "es"}', 8,
     '{"timezone": "America/Chicago", "working_hours": {"monday": ["09:00", "17:00"], "tuesday": ["09:00", "17:00"], "wednesday": ["09:00", "17:00"], "thursday": ["09:00", "17:00"], "friday": ["09:00", "17:00"]}}'),
    ('Mike Rodriguez', 'mike.rodriguez@agrinexus.ai', 'l2_specialist',
     '{"technical_issue", "integration_issue", "performance"}', '{"en", "es"}', 6,
     '{"timezone": "America/Denver", "working_hours": {"monday": ["08:00", "16:00"], "tuesday": ["08:00", "16:00"], "wednesday": ["08:00", "16:00"], "thursday": ["08:00", "16:00"], "friday": ["08:00", "16:00"]}}'),
    ('Emily Chen', 'emily.chen@agrinexus.ai', 'l3_expert',
     '{"bug_report", "security_concern", "integration_issue"}', '{"en", "zh"}', 4,
     '{"timezone": "America/Los_Angeles", "working_hours": {"monday": ["10:00", "18:00"], "tuesday": ["10:00", "18:00"], "wednesday": ["10:00", "18:00"], "thursday": ["10:00", "18:00"], "friday": ["10:00", "18:00"]}}')
) AS agent_data(name, email, role, specializations, languages, max_capacity, shift_schedule)
CROSS JOIN auth.users u
WHERE u.email = 'admin@example.com' -- Placeholder - would use actual user IDs
LIMIT 1; -- Only create one set of agents

-- Insert default escalation rules
INSERT INTO escalation_rules (name, description, conditions, actions, priority, created_by)
SELECT 
    rule_data.name,
    rule_data.description,
    rule_data.conditions::jsonb,
    rule_data.actions::jsonb,
    rule_data.priority,
    u.id
FROM (VALUES
    ('SLA Breach Auto-Escalation', 'Automatically escalate tickets that breach response SLA',
     '[{"type": "sla_breach", "threshold": 0}]',
     '[{"type": "increase_priority"}, {"type": "assign_to_team", "parameters": {"team": "L2_Specialist"}}]',
     10),
    ('Critical Priority Fast Track', 'Fast-track critical priority tickets to L3',
     '[{"type": "severity_level", "value": "critical"}]',
     '[{"type": "assign_to_team", "parameters": {"team": "L3_Expert"}}, {"type": "send_notification", "parameters": {"type": "sms"}}]',
     9),
    ('Security Issue Escalation', 'Escalate all security concerns to specialists',
     '[{"type": "category_match", "value": "security_concern"}]',
     '[{"type": "assign_to_team", "parameters": {"team": "L3_Expert"}}, {"type": "create_incident"}]',
     8)
) AS rule_data(name, description, conditions, actions, priority)
CROSS JOIN auth.users u
WHERE u.email = 'admin@example.com' -- Placeholder
LIMIT 1;

-- Insert sample knowledge base articles
INSERT INTO support_knowledge_base (title, content, category, solution_type, access_level, created_by)
SELECT 
    kb_data.title,
    kb_data.content,
    kb_data.category,
    kb_data.solution_type,
    kb_data.access_level,
    u.id
FROM (VALUES
    ('Data Sync Troubleshooting', 'Step-by-step guide to resolve common data sync issues between mobile app and web platform...', 'technical_issue', 'troubleshooting', 'l1'),
    ('Billing Payment Escalation Process', 'When and how to escalate billing and payment issues to the finance team...', 'billing_payment', 'escalation_guide', 'l2'),
    ('Security Incident Response', 'Immediate steps to take when a security concern is reported by a customer...', 'security_concern', 'procedure', 'l3')
) AS kb_data(title, content, category, solution_type, access_level)
CROSS JOIN auth.users u
WHERE u.email = 'admin@example.com' -- Placeholder
LIMIT 1;

-- Create indexes for performance optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_support_tickets_tenant_status_priority 
ON support_tickets (tenant_id, status, priority) WHERE status NOT IN ('closed', 'resolved');

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ticket_communications_ticket_created 
ON ticket_communications (ticket_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_support_agents_available_capacity 
ON support_agents (is_available, current_capacity, max_capacity) WHERE is_available = true;

-- Comments for documentation
COMMENT ON TABLE support_agents IS 'Support team members with their capabilities, schedules, and performance metrics';
COMMENT ON TABLE support_tickets IS 'Core support ticket management with escalation and SLA tracking';
COMMENT ON TABLE ticket_communications IS 'All customer and agent interactions on support tickets';
COMMENT ON TABLE ticket_internal_notes IS 'Internal team notes and observations not visible to customers';
COMMENT ON TABLE escalation_rules IS 'Automated rules for ticket escalation based on conditions';
COMMENT ON TABLE support_knowledge_base IS 'Internal knowledge base for support agents with solutions and procedures';
COMMENT ON TABLE support_metrics IS 'Performance metrics tracking for agents and teams over time';
COMMENT ON TABLE support_callbacks IS 'Scheduled follow-up calls and actions for customer service';
COMMENT ON TABLE emergency_escalations IS 'Critical after-hours escalation chains for urgent issues';

-- Schedule automated functions (requires pg_cron extension)
-- SELECT cron.schedule('check-sla-breaches', '*/15 * * * *', 'SELECT check_sla_breaches();');
-- SELECT cron.schedule('calculate-support-metrics', '0 1 * * *', 'SELECT calculate_support_metrics();');
-- SELECT cron.schedule('auto-assign-tickets', '*/5 * * * *', 'SELECT auto_assign_ticket(id) FROM support_tickets WHERE assigned_to IS NULL AND status = ''new'';');

COMMIT;