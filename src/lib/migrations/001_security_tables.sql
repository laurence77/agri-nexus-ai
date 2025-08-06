-- Security and Privacy Enhancement Tables
-- Run this migration to add comprehensive security features

-- User Activity Log Table
CREATE TABLE IF NOT EXISTS user_activity_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN NOT NULL DEFAULT true,
    error_message TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Indexes for performance
    INDEX idx_activity_log_user_tenant (user_id, tenant_id),
    INDEX idx_activity_log_timestamp (timestamp),
    INDEX idx_activity_log_action (action),
    INDEX idx_activity_log_resource (resource_type, resource_id),
    INDEX idx_activity_log_success (success)
);

-- Security Settings Table
CREATE TABLE IF NOT EXISTS security_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE UNIQUE,
    max_login_attempts INTEGER NOT NULL DEFAULT 5,
    lockout_duration_minutes INTEGER NOT NULL DEFAULT 30,
    password_min_length INTEGER NOT NULL DEFAULT 8,
    password_require_special_chars BOOLEAN NOT NULL DEFAULT true,
    session_timeout_hours INTEGER NOT NULL DEFAULT 24,
    enable_2fa BOOLEAN NOT NULL DEFAULT false,
    allowed_ip_ranges TEXT[],
    geo_restrictions JSONB DEFAULT '{}',
    data_retention_days INTEGER NOT NULL DEFAULT 2555, -- 7 years
    auto_logout_inactive_hours INTEGER NOT NULL DEFAULT 4,
    encryption_enabled BOOLEAN NOT NULL DEFAULT true,
    audit_log_retention_days INTEGER NOT NULL DEFAULT 2555,
    suspicious_activity_threshold INTEGER NOT NULL DEFAULT 10,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Data Export Requests Table
CREATE TABLE IF NOT EXISTS data_export_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    export_type TEXT NOT NULL CHECK (export_type IN ('full', 'profile', 'financial', 'agricultural')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    file_url TEXT,
    file_size BIGINT,
    expires_at TIMESTAMPTZ,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    
    INDEX idx_export_requests_user (user_id),
    INDEX idx_export_requests_status (status),
    INDEX idx_export_requests_expires (expires_at)
);

-- Backup Schedule Table
CREATE TABLE IF NOT EXISTS backup_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    backup_type TEXT NOT NULL CHECK (backup_type IN ('full', 'incremental', 'differential')),
    frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
    scheduled_time TIME NOT NULL,
    last_backup_at TIMESTAMPTZ,
    next_backup_at TIMESTAMPTZ NOT NULL,
    backup_location TEXT NOT NULL CHECK (backup_location IN ('local', 's3', 'gcs', 'azure')),
    encryption_enabled BOOLEAN NOT NULL DEFAULT true,
    retention_days INTEGER NOT NULL DEFAULT 90,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    INDEX idx_backup_schedules_next (next_backup_at),
    INDEX idx_backup_schedules_active (is_active)
);

-- Security Incidents Table
CREATE TABLE IF NOT EXISTS security_incidents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    incident_type TEXT NOT NULL CHECK (incident_type IN ('brute_force', 'suspicious_activity', 'data_breach', 'unauthorized_access', 'system_compromise')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status TEXT NOT NULL DEFAULT 'detected' CHECK (status IN ('detected', 'investigating', 'contained', 'resolved', 'false_positive')),
    description TEXT NOT NULL,
    detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ,
    affected_resources TEXT[],
    mitigation_steps TEXT[],
    metadata JSONB DEFAULT '{}',
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    INDEX idx_incidents_severity_status (severity, status),
    INDEX idx_incidents_detected (detected_at),
    INDEX idx_incidents_assigned (assigned_to)
);

-- Permission Sets Table
CREATE TABLE IF NOT EXISTS permission_sets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    permissions TEXT[] NOT NULL,
    is_system BOOLEAN NOT NULL DEFAULT false,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    UNIQUE(name, tenant_id),
    INDEX idx_permission_sets_system (is_system),
    INDEX idx_permission_sets_tenant (tenant_id)
);

-- User Roles Table
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    role_name TEXT NOT NULL,
    permission_set_id UUID NOT NULL REFERENCES permission_sets(id) ON DELETE RESTRICT,
    granted_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB DEFAULT '{}',
    
    INDEX idx_user_roles_user_tenant (user_id, tenant_id),
    INDEX idx_user_roles_active (is_active),
    INDEX idx_user_roles_expires (expires_at)
);

-- Access Requests Table
CREATE TABLE IF NOT EXISTS access_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    requested_permission TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    justification TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'expired')),
    requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    review_notes TEXT,
    expires_at TIMESTAMPTZ,
    
    INDEX idx_access_requests_status (status),
    INDEX idx_access_requests_user (user_id),
    INDEX idx_access_requests_reviewer (reviewed_by)
);

-- Session Management Table
CREATE TABLE IF NOT EXISTS session_management (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL UNIQUE,
    ip_address INET NOT NULL,
    user_agent TEXT,
    device_fingerprint TEXT,
    location JSONB,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    INDEX idx_session_user (user_id),
    INDEX idx_session_token (session_token),
    INDEX idx_session_active (is_active),
    INDEX idx_session_expires (expires_at),
    INDEX idx_session_last_activity (last_activity_at)
);

-- Two Factor Auth Table
CREATE TABLE IF NOT EXISTS two_factor_auth (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    method TEXT NOT NULL CHECK (method IN ('sms', 'email', 'totp', 'backup_codes')),
    is_enabled BOOLEAN NOT NULL DEFAULT false,
    phone_number TEXT,
    email TEXT,
    secret_key TEXT, -- Encrypted TOTP secret
    backup_codes TEXT[], -- Encrypted backup codes
    last_used_at TIMESTAMPTZ,
    setup_completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    INDEX idx_2fa_user (user_id),
    INDEX idx_2fa_enabled (is_enabled)
);

-- Compliance Audits Table
CREATE TABLE IF NOT EXISTS compliance_audits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    audit_type TEXT NOT NULL CHECK (audit_type IN ('gdpr', 'data_retention', 'access_review', 'security_assessment')),
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'failed')),
    scheduled_at TIMESTAMPTZ NOT NULL,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    findings JSONB DEFAULT '[]',
    recommendations TEXT[],
    compliance_score INTEGER CHECK (compliance_score >= 0 AND compliance_score <= 100),
    report_url TEXT,
    next_audit_due TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    INDEX idx_audits_tenant (tenant_id),
    INDEX idx_audits_status (status),
    INDEX idx_audits_next_due (next_audit_due)
);

-- Data Classification Table
CREATE TABLE IF NOT EXISTS data_classification (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name TEXT NOT NULL,
    column_name TEXT NOT NULL,
    classification TEXT NOT NULL CHECK (classification IN ('public', 'internal', 'confidential', 'restricted', 'pii')),
    encryption_required BOOLEAN NOT NULL DEFAULT false,
    retention_period_days INTEGER,
    access_restrictions TEXT[],
    data_owner TEXT NOT NULL,
    last_reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    UNIQUE(table_name, column_name),
    INDEX idx_data_classification_table (table_name),
    INDEX idx_data_classification_level (classification),
    INDEX idx_data_classification_encryption (encryption_required)
);

-- Security Metrics Table
CREATE TABLE IF NOT EXISTS security_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_login_attempts INTEGER NOT NULL DEFAULT 0,
    failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    successful_logins INTEGER NOT NULL DEFAULT 0,
    suspicious_activities_detected INTEGER NOT NULL DEFAULT 0,
    incidents_reported INTEGER NOT NULL DEFAULT 0,
    incidents_resolved INTEGER NOT NULL DEFAULT 0,
    data_exports_requested INTEGER NOT NULL DEFAULT 0,
    permissions_granted INTEGER NOT NULL DEFAULT 0,
    permissions_revoked INTEGER NOT NULL DEFAULT 0,
    active_sessions INTEGER NOT NULL DEFAULT 0,
    security_score INTEGER CHECK (security_score >= 0 AND security_score <= 100),
    compliance_percentage NUMERIC(5,2) CHECK (compliance_percentage >= 0 AND compliance_percentage <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    UNIQUE(tenant_id, date),
    INDEX idx_security_metrics_date (date),
    INDEX idx_security_metrics_tenant_date (tenant_id, date)
);

-- Enhanced profiles table with security fields (if not exists)
DO $$
BEGIN
    -- Add security-related columns to existing profiles table
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS login_attempts INTEGER DEFAULT 0;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMPTZ;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS security_questions JSONB DEFAULT '{}';
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS requires_password_change BOOLEAN DEFAULT false;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_security_review TIMESTAMPTZ;
EXCEPTION
    WHEN duplicate_column THEN
        RAISE NOTICE 'Columns already exist in profiles table';
END $$;

-- Row Level Security (RLS) Policies
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_export_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_management ENABLE ROW LEVEL SECURITY;
ALTER TABLE two_factor_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_classification ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_activity_log
CREATE POLICY "Users can view their own activity logs" ON user_activity_log
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'manager')
            AND tenant_id = user_activity_log.tenant_id
        )
    );

CREATE POLICY "System can insert activity logs" ON user_activity_log
    FOR INSERT WITH CHECK (true);

-- RLS Policies for security_settings (only owners/managers can access)
CREATE POLICY "Owners and managers can manage security settings" ON security_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'manager')
            AND tenant_id = security_settings.tenant_id
        )
    );

-- RLS Policies for data_export_requests
CREATE POLICY "Users can manage their own export requests" ON data_export_requests
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for security_incidents (managers and owners only)
CREATE POLICY "Managers and owners can view security incidents" ON security_incidents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'manager')
            AND tenant_id = security_incidents.tenant_id
        )
    );

-- RLS Policies for session_management (users can view their own sessions)
CREATE POLICY "Users can view their own sessions" ON session_management
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON session_management
    FOR UPDATE USING (auth.uid() = user_id);

-- Functions for automated security tasks

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM session_management 
    WHERE expires_at < now() OR last_activity_at < now() - interval '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    INSERT INTO user_activity_log (
        user_id, tenant_id, action, resource_type, 
        success, metadata, timestamp
    )
    SELECT 
        'system'::uuid, 'system'::uuid, 'session_cleanup', 'session',
        true, jsonb_build_object('deleted_sessions', deleted_count), now();
    
    RETURN deleted_count;
END;
$$;

-- Function to detect suspicious activity
CREATE OR REPLACE FUNCTION detect_suspicious_activity()
RETURNS TABLE(user_id uuid, tenant_id uuid, risk_level text, reasons text[])
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH user_activity_summary AS (
        SELECT 
            ual.user_id,
            ual.tenant_id,
            COUNT(*) as total_activities,
            COUNT(*) FILTER (WHERE success = false) as failed_activities,
            COUNT(DISTINCT ip_address) as unique_ips,
            COUNT(*) FILTER (WHERE timestamp::time BETWEEN '02:00' AND '05:00') as night_activities
        FROM user_activity_log ual
        WHERE timestamp >= now() - interval '24 hours'
        GROUP BY ual.user_id, ual.tenant_id
    ),
    suspicious_users AS (
        SELECT 
            uas.user_id,
            uas.tenant_id,
            CASE 
                WHEN total_activities > 1000 OR failed_activities > 50 OR unique_ips > 10 THEN 'high'
                WHEN total_activities > 500 OR failed_activities > 20 OR unique_ips > 5 THEN 'medium'
                ELSE 'low'
            END as risk_level,
            ARRAY_REMOVE(ARRAY[
                CASE WHEN total_activities > 500 THEN 'High activity volume' END,
                CASE WHEN failed_activities > 10 THEN 'Multiple failed operations' END,
                CASE WHEN unique_ips > 3 THEN 'Multiple IP addresses' END,
                CASE WHEN night_activities > total_activities * 0.3 THEN 'Unusual activity hours' END
            ], NULL) as reasons
        FROM user_activity_summary uas
        WHERE total_activities > 100 -- Only check active users
    )
    SELECT su.user_id, su.tenant_id, su.risk_level, su.reasons
    FROM suspicious_users su
    WHERE array_length(su.reasons, 1) > 0;
END;
$$;

-- Function to generate security metrics
CREATE OR REPLACE FUNCTION generate_daily_security_metrics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    metric_date DATE := CURRENT_DATE - 1; -- Previous day
    tenant_record RECORD;
BEGIN
    -- Generate metrics for each tenant
    FOR tenant_record IN SELECT id FROM tenants LOOP
        INSERT INTO security_metrics (
            tenant_id, date, total_login_attempts, failed_login_attempts,
            successful_logins, suspicious_activities_detected, incidents_reported,
            incidents_resolved, data_exports_requested, active_sessions
        )
        SELECT 
            tenant_record.id,
            metric_date,
            COALESCE(login_stats.total_attempts, 0),
            COALESCE(login_stats.failed_attempts, 0),
            COALESCE(login_stats.successful_logins, 0),
            COALESCE(suspicious_stats.suspicious_count, 0),
            COALESCE(incident_stats.reported_count, 0),
            COALESCE(incident_stats.resolved_count, 0),
            COALESCE(export_stats.export_count, 0),
            COALESCE(session_stats.active_count, 0)
        FROM (
            -- Login statistics
            SELECT 
                COUNT(*) FILTER (WHERE action LIKE '%login%') as total_attempts,
                COUNT(*) FILTER (WHERE action LIKE '%login%' AND success = false) as failed_attempts,
                COUNT(*) FILTER (WHERE action = 'login_success') as successful_logins
            FROM user_activity_log 
            WHERE tenant_id = tenant_record.id 
            AND timestamp::date = metric_date
        ) login_stats
        CROSS JOIN (
            -- Suspicious activity statistics
            SELECT COUNT(*) as suspicious_count
            FROM user_activity_log
            WHERE tenant_id = tenant_record.id
            AND action = 'suspicious_activity'
            AND timestamp::date = metric_date
        ) suspicious_stats
        CROSS JOIN (
            -- Incident statistics
            SELECT 
                COUNT(*) FILTER (WHERE detected_at::date = metric_date) as reported_count,
                COUNT(*) FILTER (WHERE resolved_at::date = metric_date) as resolved_count
            FROM security_incidents
            WHERE tenant_id = tenant_record.id
        ) incident_stats
        CROSS JOIN (
            -- Export statistics
            SELECT COUNT(*) as export_count
            FROM data_export_requests
            WHERE tenant_id = tenant_record.id
            AND requested_at::date = metric_date
        ) export_stats
        CROSS JOIN (
            -- Active session statistics
            SELECT COUNT(*) as active_count
            FROM session_management
            WHERE tenant_id = tenant_record.id
            AND is_active = true
            AND last_activity_at::date = metric_date
        ) session_stats
        ON CONFLICT (tenant_id, date) DO NOTHING;
    END LOOP;
END;
$$;

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_security_settings_updated_at BEFORE UPDATE ON security_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_security_incidents_updated_at BEFORE UPDATE ON security_incidents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_permission_sets_updated_at BEFORE UPDATE ON permission_sets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_two_factor_auth_updated_at BEFORE UPDATE ON two_factor_auth
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_audits_updated_at BEFORE UPDATE ON compliance_audits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_data_classification_updated_at BEFORE UPDATE ON data_classification
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default security settings for existing tenants
INSERT INTO security_settings (tenant_id)
SELECT id FROM tenants
WHERE id NOT IN (SELECT tenant_id FROM security_settings)
ON CONFLICT (tenant_id) DO NOTHING;

-- Insert default data classifications for sensitive fields
INSERT INTO data_classification (table_name, column_name, classification, encryption_required, data_owner) VALUES
('profiles', 'email', 'pii', true, 'system'),
('profiles', 'phone_number', 'pii', true, 'system'),
('profiles', 'full_name', 'pii', true, 'system'),
('financial_records', 'amount', 'confidential', true, 'finance'),
('livestock', 'animal_id', 'internal', false, 'agriculture'),
('crops', 'yield_data', 'internal', false, 'agriculture'),
('user_activity_log', 'ip_address', 'confidential', true, 'security'),
('session_management', 'session_token', 'restricted', true, 'security'),
('two_factor_auth', 'secret_key', 'restricted', true, 'security'),
('two_factor_auth', 'backup_codes', 'restricted', true, 'security')
ON CONFLICT (table_name, column_name) DO NOTHING;

-- Create indexes for performance optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_log_tenant_action_time 
ON user_activity_log (tenant_id, action, timestamp DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_incidents_tenant_severity_status 
ON security_incidents (tenant_id, severity, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_session_management_user_active_expires 
ON session_management (user_id, is_active, expires_at);

-- Comments for documentation
COMMENT ON TABLE user_activity_log IS 'Comprehensive audit trail of all user activities';
COMMENT ON TABLE security_settings IS 'Tenant-specific security configuration';
COMMENT ON TABLE data_export_requests IS 'GDPR-compliant data export requests';
COMMENT ON TABLE backup_schedules IS 'Automated backup scheduling and tracking';
COMMENT ON TABLE security_incidents IS 'Security incident management and tracking';
COMMENT ON TABLE permission_sets IS 'Role-based permission definitions';
COMMENT ON TABLE user_roles IS 'User role assignments with expiration';
COMMENT ON TABLE access_requests IS 'Access request workflow management';
COMMENT ON TABLE session_management IS 'Enhanced session tracking and management';
COMMENT ON TABLE two_factor_auth IS 'Two-factor authentication settings';
COMMENT ON TABLE compliance_audits IS 'Automated compliance audit tracking';
COMMENT ON TABLE data_classification IS 'Data sensitivity classification system';
COMMENT ON TABLE security_metrics IS 'Daily security metrics and KPIs';

-- Schedule cleanup functions (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-expired-sessions', '0 2 * * *', 'SELECT cleanup_expired_sessions();');
-- SELECT cron.schedule('generate-security-metrics', '0 3 * * *', 'SELECT generate_daily_security_metrics();');
-- SELECT cron.schedule('detect-suspicious-activity', '*/30 * * * *', 'INSERT INTO security_incidents (tenant_id, user_id, incident_type, severity, description, metadata) SELECT tenant_id, user_id, ''suspicious_activity'', risk_level::text, ''Automated detection of suspicious activity'', jsonb_build_object(''reasons'', reasons, ''detected_by'', ''system'') FROM detect_suspicious_activity();');

COMMIT;