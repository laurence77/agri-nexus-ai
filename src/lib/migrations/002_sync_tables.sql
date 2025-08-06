-- Disaster Recovery and Offline Sync Tables
-- Run this migration to add sync tracking and disaster recovery features

-- Sync Log Table - Track all sync operations between client and server
CREATE TABLE IF NOT EXISTS sync_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('create', 'update', 'delete')),
    sync_direction TEXT NOT NULL CHECK (sync_direction IN ('client_to_server', 'server_to_client')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'syncing', 'completed', 'failed', 'conflict')),
    client_timestamp TIMESTAMPTZ NOT NULL,
    server_timestamp TIMESTAMPTZ DEFAULT now(),
    retry_count INTEGER DEFAULT 0,
    error_message TEXT,
    data_hash TEXT, -- For conflict detection
    conflict_resolution TEXT CHECK (conflict_resolution IN ('server_wins', 'client_wins', 'manual', 'merged')),
    resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    INDEX idx_sync_logs_user_tenant (user_id, tenant_id),
    INDEX idx_sync_logs_table_record (table_name, record_id),
    INDEX idx_sync_logs_status (status),
    INDEX idx_sync_logs_timestamps (client_timestamp, server_timestamp),
    INDEX idx_sync_logs_retry (retry_count)
);

-- Conflict Resolution Table - Handle data conflicts during sync
CREATE TABLE IF NOT EXISTS sync_conflicts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sync_log_id UUID NOT NULL REFERENCES sync_logs(id) ON DELETE CASCADE,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    client_version JSONB NOT NULL, -- Client's version of the data
    server_version JSONB NOT NULL, -- Server's version of the data
    conflict_type TEXT NOT NULL CHECK (conflict_type IN ('update_conflict', 'delete_conflict', 'create_conflict')),
    auto_resolution_attempted BOOLEAN DEFAULT false,
    auto_resolution_method TEXT,
    manual_resolution_required BOOLEAN DEFAULT true,
    resolved_version JSONB,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    INDEX idx_conflicts_table_record (table_name, record_id),
    INDEX idx_conflicts_unresolved (manual_resolution_required, resolved_at),
    INDEX idx_conflicts_sync_log (sync_log_id)
);

-- Offline Capability Metadata - Track what data is available offline per user/tenant
CREATE TABLE IF NOT EXISTS offline_capabilities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    table_name TEXT NOT NULL,
    offline_enabled BOOLEAN DEFAULT true,
    last_full_sync TIMESTAMPTZ,
    sync_frequency_minutes INTEGER DEFAULT 30,
    max_offline_days INTEGER DEFAULT 7,
    storage_quota_mb INTEGER DEFAULT 100,
    current_usage_mb NUMERIC(10,2) DEFAULT 0,
    auto_sync_enabled BOOLEAN DEFAULT true,
    sync_on_connection BOOLEAN DEFAULT true,
    priority_level INTEGER DEFAULT 3 CHECK (priority_level >= 1 AND priority_level <= 5), -- 1=highest, 5=lowest
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    UNIQUE(user_id, tenant_id, table_name),
    INDEX idx_offline_caps_user_tenant (user_id, tenant_id),
    INDEX idx_offline_caps_priority (priority_level),
    INDEX idx_offline_caps_sync_time (last_full_sync)
);

-- Backup Instances Table - Track specific backup instances
CREATE TABLE IF NOT EXISTS backup_instances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    schedule_id UUID REFERENCES backup_schedules(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    backup_type TEXT NOT NULL CHECK (backup_type IN ('full', 'incremental', 'differential')),
    status TEXT NOT NULL DEFAULT 'initiated' CHECK (status IN ('initiated', 'in_progress', 'completed', 'failed', 'verifying', 'verified')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    file_path TEXT,
    file_size_bytes BIGINT,
    compressed_size_bytes BIGINT,
    encryption_key_hash TEXT, -- Hash of encryption key (not the key itself)
    verification_hash TEXT,
    backup_location TEXT NOT NULL CHECK (backup_location IN ('local', 's3', 'gcs', 'azure', 'multi_region')),
    region_locations TEXT[], -- For multi-region backups
    tables_included TEXT[] NOT NULL,
    records_count JSONB DEFAULT '{}', -- Count per table
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    retention_until TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    INDEX idx_backup_instances_schedule (schedule_id),
    INDEX idx_backup_instances_tenant (tenant_id),
    INDEX idx_backup_instances_status (status),
    INDEX idx_backup_instances_retention (retention_until),
    INDEX idx_backup_instances_completed (completed_at)
);

-- Disaster Recovery Plans Table
CREATE TABLE IF NOT EXISTS disaster_recovery_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    plan_name TEXT NOT NULL,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('data_loss', 'system_failure', 'security_breach', 'natural_disaster', 'human_error')),
    priority_level TEXT NOT NULL CHECK (priority_level IN ('critical', 'high', 'medium', 'low')),
    recovery_time_objective_hours INTEGER NOT NULL, -- RTO: How quickly to recover
    recovery_point_objective_hours INTEGER NOT NULL, -- RPO: How much data loss is acceptable
    recovery_steps JSONB NOT NULL, -- Array of recovery steps
    contact_list JSONB NOT NULL, -- Emergency contacts
    required_resources TEXT[], -- What resources are needed
    testing_schedule TEXT NOT NULL, -- How often to test the plan
    last_tested TIMESTAMPTZ,
    last_test_result TEXT CHECK (last_test_result IN ('successful', 'failed', 'partial')),
    test_notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    next_review_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    INDEX idx_dr_plans_tenant (tenant_id),
    INDEX idx_dr_plans_priority (priority_level),
    INDEX idx_dr_plans_testing (last_tested, testing_schedule),
    INDEX idx_dr_plans_review (next_review_date)
);

-- Recovery Executions Table - Track when disaster recovery plans are executed
CREATE TABLE IF NOT EXISTS recovery_executions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_id UUID NOT NULL REFERENCES disaster_recovery_plans(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    incident_description TEXT NOT NULL,
    executed_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed', 'aborted')),
    steps_completed JSONB DEFAULT '[]', -- Track which steps were completed
    recovery_data JSONB DEFAULT '{}', -- Data about what was recovered
    downtime_minutes INTEGER,
    data_loss_hours NUMERIC(10,2), -- How much data was lost
    lessons_learned TEXT,
    post_incident_notes TEXT,
    
    INDEX idx_recovery_executions_plan (plan_id),
    INDEX idx_recovery_executions_tenant (tenant_id),
    INDEX idx_recovery_executions_status (status),
    INDEX idx_recovery_executions_started (started_at)
);

-- Connection Status Table - Track user connection patterns for offline optimization
CREATE TABLE IF NOT EXISTS connection_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    connection_type TEXT CHECK (connection_type IN ('wifi', 'cellular', 'ethernet', 'unknown')),
    connection_quality TEXT CHECK (connection_quality IN ('excellent', 'good', 'fair', 'poor', 'offline')),
    bandwidth_mbps NUMERIC(10,2),
    latency_ms INTEGER,
    location_coordinates POINT, -- GPS coordinates when connection was recorded
    is_online BOOLEAN NOT NULL,
    offline_duration_minutes INTEGER, -- How long they were offline
    last_sync_attempt TIMESTAMPTZ,
    last_successful_sync TIMESTAMPTZ,
    pending_sync_count INTEGER DEFAULT 0,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    INDEX idx_connection_status_user (user_id),
    INDEX idx_connection_status_online (is_online, recorded_at),
    INDEX idx_connection_status_quality (connection_quality),
    INDEX idx_connection_status_location (location_coordinates)
);

-- Row Level Security (RLS) Policies
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE disaster_recovery_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE connection_status ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sync_logs
CREATE POLICY "Users can view their own sync logs" ON sync_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage sync logs" ON sync_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'manager', 'system_admin')
            AND tenant_id = sync_logs.tenant_id
        )
    );

-- RLS Policies for sync_conflicts
CREATE POLICY "Users and managers can view sync conflicts" ON sync_conflicts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM sync_logs sl
            JOIN profiles p ON p.user_id = auth.uid()
            WHERE sl.id = sync_conflicts.sync_log_id
            AND (sl.user_id = auth.uid() OR p.role IN ('owner', 'manager'))
            AND p.tenant_id = (SELECT tenant_id FROM sync_logs WHERE id = sync_conflicts.sync_log_id)
        )
    );

-- RLS Policies for offline_capabilities
CREATE POLICY "Users can manage their own offline capabilities" ON offline_capabilities
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for backup_instances (managers and owners only)
CREATE POLICY "Managers and owners can view backup instances" ON backup_instances
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'manager')
            AND tenant_id = backup_instances.tenant_id
        )
    );

-- RLS Policies for disaster_recovery_plans (managers and owners only)
CREATE POLICY "Managers and owners can manage disaster recovery plans" ON disaster_recovery_plans
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'manager')
            AND tenant_id = disaster_recovery_plans.tenant_id
        )
    );

-- RLS Policies for connection_status
CREATE POLICY "Users can view their own connection status" ON connection_status
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert connection status" ON connection_status
    FOR INSERT WITH CHECK (true);

-- Functions for automated sync and recovery tasks

-- Function to detect and create sync conflicts
CREATE OR REPLACE FUNCTION detect_sync_conflicts()
RETURNS TABLE(conflict_id uuid, table_name text, record_id text, conflict_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH potential_conflicts AS (
        SELECT 
            sl.id as sync_log_id,
            sl.table_name,
            sl.record_id,
            COUNT(*) as concurrent_updates
        FROM sync_logs sl
        WHERE sl.status = 'pending'
        AND sl.operation IN ('update', 'delete')
        GROUP BY sl.table_name, sl.record_id, sl.client_timestamp::date
        HAVING COUNT(*) > 1
    )
    SELECT 
        pc.sync_log_id,
        pc.table_name::text,
        pc.record_id::text,
        pc.concurrent_updates
    FROM potential_conflicts pc;
END;
$$;

-- Function to cleanup old sync logs
CREATE OR REPLACE FUNCTION cleanup_old_sync_logs()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
    retention_days INTEGER := 90; -- Keep 3 months of sync logs
BEGIN
    -- Delete completed sync logs older than retention period
    DELETE FROM sync_logs 
    WHERE status = 'completed' 
    AND server_timestamp < now() - interval '90 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log the cleanup activity
    INSERT INTO user_activity_log (
        user_id, tenant_id, action, resource_type, 
        success, metadata, timestamp
    )
    SELECT 
        'system'::uuid, 'system'::uuid, 'sync_log_cleanup', 'sync_logs',
        true, jsonb_build_object('deleted_logs', deleted_count), now();
    
    RETURN deleted_count;
END;
$$;

-- Function to get sync statistics
CREATE OR REPLACE FUNCTION get_sync_statistics(p_tenant_id uuid, p_days integer DEFAULT 7)
RETURNS TABLE(
    total_syncs bigint,
    successful_syncs bigint,
    failed_syncs bigint,
    pending_syncs bigint,
    avg_retry_count numeric,
    most_synced_table text,
    success_rate numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH sync_stats AS (
        SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE status = 'completed') as successful,
            COUNT(*) FILTER (WHERE status = 'failed') as failed,
            COUNT(*) FILTER (WHERE status = 'pending') as pending,
            AVG(retry_count) as avg_retries,
            table_name
        FROM sync_logs 
        WHERE tenant_id = p_tenant_id
        AND created_at >= now() - interval '1 day' * p_days
        GROUP BY table_name
    ),
    overall_stats AS (
        SELECT 
            SUM(total) as total_syncs,
            SUM(successful) as successful_syncs,
            SUM(failed) as failed_syncs,
            SUM(pending) as pending_syncs,
            AVG(avg_retries) as avg_retry_count
        FROM sync_stats
    ),
    top_table AS (
        SELECT table_name as most_synced_table
        FROM sync_stats
        ORDER BY total DESC
        LIMIT 1
    )
    SELECT 
        os.total_syncs,
        os.successful_syncs,
        os.failed_syncs,
        os.pending_syncs,
        ROUND(os.avg_retry_count, 2) as avg_retry_count,
        tt.most_synced_table,
        CASE 
            WHEN os.total_syncs > 0 THEN ROUND((os.successful_syncs::numeric / os.total_syncs::numeric) * 100, 2)
            ELSE 0
        END as success_rate
    FROM overall_stats os
    CROSS JOIN top_table tt;
END;
$$;

-- Function to automatically resolve simple conflicts
CREATE OR REPLACE FUNCTION auto_resolve_conflicts()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    resolved_count INTEGER := 0;
    conflict_record RECORD;
BEGIN
    -- Auto-resolve conflicts where client and server data are identical
    FOR conflict_record IN 
        SELECT id, client_version, server_version
        FROM sync_conflicts 
        WHERE manual_resolution_required = true
        AND auto_resolution_attempted = false
    LOOP
        -- Simple resolution: if versions are identical, mark as resolved
        IF conflict_record.client_version = conflict_record.server_version THEN
            UPDATE sync_conflicts 
            SET 
                auto_resolution_attempted = true,
                manual_resolution_required = false,
                resolved_version = conflict_record.client_version,
                resolved_at = now(),
                auto_resolution_method = 'identical_versions'
            WHERE id = conflict_record.id;
            
            resolved_count := resolved_count + 1;
        ELSE
            -- Mark as attempted but still requiring manual resolution
            UPDATE sync_conflicts 
            SET auto_resolution_attempted = true
            WHERE id = conflict_record.id;
        END IF;
    END LOOP;
    
    RETURN resolved_count;
END;
$$;

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_sync_logs_updated_at BEFORE UPDATE ON sync_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_offline_capabilities_updated_at BEFORE UPDATE ON offline_capabilities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disaster_recovery_plans_updated_at BEFORE UPDATE ON disaster_recovery_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default offline capabilities for existing users
INSERT INTO offline_capabilities (user_id, tenant_id, table_name, offline_enabled, priority_level)
SELECT DISTINCT 
    p.user_id,
    p.tenant_id,
    t.table_name,
    CASE t.table_name 
        WHEN 'farms' THEN true
        WHEN 'crops' THEN true
        WHEN 'livestock' THEN true
        WHEN 'weather_data' THEN true
        ELSE false
    END as offline_enabled,
    CASE t.table_name
        WHEN 'farms' THEN 1        -- Highest priority
        WHEN 'crops' THEN 2
        WHEN 'livestock' THEN 2
        WHEN 'weather_data' THEN 3
        WHEN 'financial_records' THEN 4
        ELSE 5                     -- Lowest priority
    END as priority_level
FROM profiles p
CROSS JOIN (
    VALUES 
    ('farms'),
    ('crops'), 
    ('livestock'),
    ('financial_records'),
    ('weather_data')
) AS t(table_name)
ON CONFLICT (user_id, tenant_id, table_name) DO NOTHING;

-- Create default disaster recovery plans for tenants
INSERT INTO disaster_recovery_plans (
    tenant_id, plan_name, plan_type, priority_level,
    recovery_time_objective_hours, recovery_point_objective_hours,
    recovery_steps, contact_list, required_resources, testing_schedule, created_by
)
SELECT 
    t.id as tenant_id,
    'Data Loss Recovery Plan' as plan_name,
    'data_loss' as plan_type,
    'critical' as priority_level,
    4 as recovery_time_objective_hours,   -- 4 hours RTO
    1 as recovery_point_objective_hours,  -- 1 hour RPO
    jsonb_build_array(
        'Assess extent of data loss',
        'Identify latest backup',
        'Verify backup integrity',
        'Restore from backup',
        'Validate restored data',
        'Notify affected users',
        'Update documentation'
    ) as recovery_steps,
    jsonb_build_object(
        'primary_contact', 'system_admin',
        'backup_contact', 'owner',
        'external_support', 'support@agrinexus.ai'
    ) as contact_list,
    ARRAY['backup_system', 'admin_access', 'communication_channel'] as required_resources,
    'monthly' as testing_schedule,
    (SELECT user_id FROM profiles WHERE tenant_id = t.id AND role = 'owner' LIMIT 1) as created_by
FROM tenants t
WHERE NOT EXISTS (
    SELECT 1 FROM disaster_recovery_plans drp 
    WHERE drp.tenant_id = t.id 
    AND drp.plan_type = 'data_loss'
);

-- Create indexes for performance optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sync_logs_tenant_status_timestamp 
ON sync_logs (tenant_id, status, server_timestamp DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_backup_instances_tenant_status_started 
ON backup_instances (tenant_id, status, started_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_connection_status_user_recorded 
ON connection_status (user_id, recorded_at DESC);

-- Comments for documentation
COMMENT ON TABLE sync_logs IS 'Comprehensive tracking of all sync operations between client and server';
COMMENT ON TABLE sync_conflicts IS 'Data conflict resolution during offline sync operations';
COMMENT ON TABLE offline_capabilities IS 'Per-user configuration of offline data access and sync settings';
COMMENT ON TABLE backup_instances IS 'Individual backup execution tracking with verification';
COMMENT ON TABLE disaster_recovery_plans IS 'Formal disaster recovery procedures and testing schedules';
COMMENT ON TABLE recovery_executions IS 'Historical record of disaster recovery plan executions';
COMMENT ON TABLE connection_status IS 'User connectivity patterns for offline optimization';

-- Schedule automated functions (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-sync-logs', '0 4 * * *', 'SELECT cleanup_old_sync_logs();');
-- SELECT cron.schedule('auto-resolve-conflicts', '*/15 * * * *', 'SELECT auto_resolve_conflicts();');

COMMIT;