-- Farmer Retention Mechanisms Tables
-- Run this migration to add comprehensive farmer retention and engagement tracking

-- Farmer Engagement Scores Table - Track overall engagement metrics
CREATE TABLE IF NOT EXISTS farmer_engagement_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    component_scores JSONB NOT NULL DEFAULT '{}', -- Detailed breakdown of score components
    trend TEXT NOT NULL CHECK (trend IN ('improving', 'stable', 'declining')),
    risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    previous_score INTEGER,
    score_change INTEGER DEFAULT 0,
    factors_improved TEXT[] DEFAULT '{}',
    factors_declined TEXT[] DEFAULT '{}',
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    next_calculation TIMESTAMPTZ NOT NULL,
    calculation_method TEXT DEFAULT 'automated',
    metadata JSONB DEFAULT '{}',
    
    UNIQUE(user_id, tenant_id),
    INDEX idx_farmer_engagement_user (user_id),
    INDEX idx_farmer_engagement_tenant (tenant_id),
    INDEX idx_farmer_engagement_score (overall_score),
    INDEX idx_farmer_engagement_risk (risk_level),
    INDEX idx_farmer_engagement_trend (trend),
    INDEX idx_farmer_engagement_next_calc (next_calculation)
);

-- Retention Insights Table - AI-generated insights about farmer behavior
CREATE TABLE IF NOT EXISTS retention_insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    insight_type TEXT NOT NULL CHECK (insight_type IN ('churn_risk', 'engagement_drop', 'feature_adoption', 'value_realization', 'usage_anomaly', 'seasonal_pattern', 'peer_comparison')),
    severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    recommendations TEXT[] NOT NULL DEFAULT '{}',
    data_points JSONB NOT NULL DEFAULT '{}',
    confidence_score NUMERIC(3,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
    detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'addressed', 'dismissed', 'expired')),
    addressed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    addressed_at TIMESTAMPTZ,
    resolution_notes TEXT,
    impact_score INTEGER DEFAULT 0 CHECK (impact_score >= 0 AND impact_score <= 10),
    
    INDEX idx_retention_insights_user (user_id),
    INDEX idx_retention_insights_tenant (tenant_id),
    INDEX idx_retention_insights_type (insight_type),
    INDEX idx_retention_insights_severity (severity),
    INDEX idx_retention_insights_status (status),
    INDEX idx_retention_insights_detected (detected_at),
    INDEX idx_retention_insights_expires (expires_at)
);

-- Retention Campaigns Table - Automated retention campaigns
CREATE TABLE IF NOT EXISTS retention_campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    campaign_type TEXT NOT NULL CHECK (campaign_type IN ('onboarding', 'reactivation', 'upsell', 'feedback', 'education', 'celebration', 'winback', 'nurture')),
    target_audience JSONB NOT NULL, -- Audience criteria and exclusions
    triggers JSONB NOT NULL DEFAULT '[]', -- Array of trigger conditions
    actions JSONB NOT NULL DEFAULT '[]', -- Array of actions to execute
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
    priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    budget_allocated NUMERIC(10,2) DEFAULT 0,
    budget_spent NUMERIC(10,2) DEFAULT 0,
    metrics JSONB NOT NULL DEFAULT '{}', -- Campaign performance metrics
    last_executed TIMESTAMPTZ,
    execution_frequency TEXT DEFAULT 'manual' CHECK (execution_frequency IN ('manual', 'daily', 'weekly', 'monthly')),
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    INDEX idx_retention_campaigns_tenant (tenant_id),
    INDEX idx_retention_campaigns_type (campaign_type),
    INDEX idx_retention_campaigns_status (status),
    INDEX idx_retention_campaigns_start_date (start_date),
    INDEX idx_retention_campaigns_priority (priority),
    INDEX idx_retention_campaigns_created_by (created_by)
);

-- Campaign Executions Table - Track individual campaign executions
CREATE TABLE IF NOT EXISTS campaign_executions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID NOT NULL REFERENCES retention_campaigns(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    execution_batch TEXT NOT NULL, -- Batch identifier for bulk executions
    target_user_ids UUID[] NOT NULL,
    execution_started TIMESTAMPTZ NOT NULL DEFAULT now(),
    execution_completed TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
    users_targeted INTEGER NOT NULL DEFAULT 0,
    users_reached INTEGER DEFAULT 0,
    users_engaged INTEGER DEFAULT 0,
    users_converted INTEGER DEFAULT 0,
    actions_executed JSONB DEFAULT '[]',
    errors JSONB DEFAULT '[]',
    execution_notes TEXT,
    
    INDEX idx_campaign_executions_campaign (campaign_id),
    INDEX idx_campaign_executions_tenant (tenant_id),
    INDEX idx_campaign_executions_batch (execution_batch),
    INDEX idx_campaign_executions_status (status),
    INDEX idx_campaign_executions_started (execution_started)
);

-- User Campaign Interactions Table - Track individual user responses to campaigns
CREATE TABLE IF NOT EXISTS user_campaign_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID NOT NULL REFERENCES retention_campaigns(id) ON DELETE CASCADE,
    execution_id UUID NOT NULL REFERENCES campaign_executions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    interaction_type TEXT NOT NULL CHECK (interaction_type IN ('email_sent', 'email_opened', 'email_clicked', 'notification_sent', 'notification_clicked', 'call_made', 'call_answered', 'meeting_scheduled', 'offer_redeemed', 'feature_used')),
    interaction_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    interaction_data JSONB DEFAULT '{}',
    response_value TEXT, -- Response content if applicable
    engagement_score INTEGER DEFAULT 0 CHECK (engagement_score >= 0 AND engagement_score <= 10),
    converted BOOLEAN DEFAULT false,
    conversion_value NUMERIC(10,2) DEFAULT 0,
    
    INDEX idx_user_campaign_interactions_campaign (campaign_id),
    INDEX idx_user_campaign_interactions_execution (execution_id),
    INDEX idx_user_campaign_interactions_user (user_id),
    INDEX idx_user_campaign_interactions_type (interaction_type),
    INDEX idx_user_campaign_interactions_timestamp (interaction_timestamp),
    INDEX idx_user_campaign_interactions_converted (converted)
);

-- Farmer Lifecycle Stages Table - Track farmer journey stages
CREATE TABLE IF NOT EXISTS farmer_lifecycle_stages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    current_stage TEXT NOT NULL CHECK (current_stage IN ('prospect', 'trial', 'onboarding', 'activated', 'engaged', 'power_user', 'at_risk', 'churned', 'win_back')),
    previous_stage TEXT,
    stage_entered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    stage_duration_days INTEGER DEFAULT 0,
    expected_stage_duration_days INTEGER,
    stage_completion_score NUMERIC(3,2) DEFAULT 0 CHECK (stage_completion_score >= 0 AND stage_completion_score <= 1),
    milestone_achievements TEXT[] DEFAULT '{}',
    blockers TEXT[] DEFAULT '{}',
    opportunities TEXT[] DEFAULT '{}',
    next_expected_stages TEXT[] DEFAULT '{}',
    stage_specific_data JSONB DEFAULT '{}',
    last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    UNIQUE(user_id, tenant_id),
    INDEX idx_farmer_lifecycle_user (user_id),
    INDEX idx_farmer_lifecycle_tenant (tenant_id),
    INDEX idx_farmer_lifecycle_stage (current_stage),
    INDEX idx_farmer_lifecycle_entered (stage_entered_at),
    INDEX idx_farmer_lifecycle_completion (stage_completion_score)
);

-- Value Realizations Table - Track concrete value delivered to farmers
CREATE TABLE IF NOT EXISTS value_realizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    value_metric TEXT NOT NULL CHECK (value_metric IN ('cost_savings', 'yield_improvement', 'time_savings', 'efficiency_gains', 'revenue_increase', 'risk_reduction', 'sustainability_improvement')),
    baseline_value NUMERIC(15,2) NOT NULL,
    current_value NUMERIC(15,2) NOT NULL,
    improvement_amount NUMERIC(15,2) NOT NULL,
    improvement_percentage NUMERIC(5,2) NOT NULL,
    measurement_unit TEXT NOT NULL, -- e.g., 'dollars', 'bushels_per_acre', 'hours'
    measurement_period_days INTEGER NOT NULL DEFAULT 365,
    confidence_level TEXT NOT NULL CHECK (confidence_level IN ('low', 'medium', 'high')),
    attribution_to_platform NUMERIC(3,2) NOT NULL CHECK (attribution_to_platform >= 0 AND attribution_to_platform <= 1),
    supporting_data JSONB DEFAULT '{}',
    validation_method TEXT DEFAULT 'calculated', -- 'calculated', 'user_reported', 'third_party_verified'
    last_calculated TIMESTAMPTZ NOT NULL DEFAULT now(),
    verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    
    UNIQUE(user_id, tenant_id, value_metric),
    INDEX idx_value_realizations_user (user_id),
    INDEX idx_value_realizations_tenant (tenant_id),
    INDEX idx_value_realizations_metric (value_metric),
    INDEX idx_value_realizations_improvement (improvement_percentage),
    INDEX idx_value_realizations_calculated (last_calculated)
);

-- Churn Predictions Table - ML-based churn prediction results
CREATE TABLE IF NOT EXISTS churn_predictions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    churn_probability NUMERIC(3,2) NOT NULL CHECK (churn_probability >= 0 AND churn_probability <= 1),
    churn_risk_category TEXT NOT NULL CHECK (churn_risk_category IN ('low', 'medium', 'high', 'critical')),
    predicted_churn_date DATE,
    prediction_confidence NUMERIC(3,2) NOT NULL CHECK (prediction_confidence >= 0 AND prediction_confidence <= 1),
    contributing_factors JSONB NOT NULL DEFAULT '{}',
    model_version TEXT NOT NULL,
    features_used JSONB NOT NULL DEFAULT '{}',
    prediction_created TIMESTAMPTZ NOT NULL DEFAULT now(),
    prediction_expires TIMESTAMPTZ NOT NULL,
    actual_outcome TEXT CHECK (actual_outcome IN ('churned', 'retained', 'unknown')),
    outcome_recorded_at TIMESTAMPTZ,
    intervention_triggered BOOLEAN DEFAULT false,
    intervention_effective BOOLEAN,
    
    UNIQUE(user_id, tenant_id, prediction_created::date),
    INDEX idx_churn_predictions_user (user_id),
    INDEX idx_churn_predictions_tenant (tenant_id),
    INDEX idx_churn_predictions_probability (churn_probability),
    INDEX idx_churn_predictions_risk (churn_risk_category),
    INDEX idx_churn_predictions_date (predicted_churn_date),
    INDEX idx_churn_predictions_created (prediction_created)
);

-- Retention Goals Table - Set and track retention objectives
CREATE TABLE IF NOT EXISTS retention_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    goal_type TEXT NOT NULL CHECK (goal_type IN ('retention_rate', 'engagement_score', 'churn_reduction', 'activation_rate', 'value_realization')),
    goal_name TEXT NOT NULL,
    target_value NUMERIC(10,2) NOT NULL,
    current_value NUMERIC(10,2) DEFAULT 0,
    baseline_value NUMERIC(10,2),
    measurement_period TEXT NOT NULL CHECK (measurement_period IN ('weekly', 'monthly', 'quarterly', 'annually')),
    target_date DATE NOT NULL,
    responsible_team TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'achieved', 'missed', 'cancelled')),
    progress_percentage NUMERIC(5,2) DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    initiatives TEXT[] DEFAULT '{}', -- Related campaigns/initiatives
    last_measured TIMESTAMPTZ,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    INDEX idx_retention_goals_tenant (tenant_id),
    INDEX idx_retention_goals_type (goal_type),
    INDEX idx_retention_goals_status (status),
    INDEX idx_retention_goals_target_date (target_date),
    INDEX idx_retention_goals_progress (progress_percentage)
);

-- User Feedback Table - Collect and analyze farmer feedback
CREATE TABLE IF NOT EXISTS user_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    feedback_type TEXT NOT NULL CHECK (feedback_type IN ('nps', 'satisfaction', 'feature_request', 'bug_report', 'general', 'churn_feedback', 'onboarding_feedback')),
    rating INTEGER CHECK (rating >= 1 AND rating <= 10),
    feedback_text TEXT,
    category TEXT,
    sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'in_progress', 'resolved', 'dismissed')),
    source TEXT DEFAULT 'app' CHECK (source IN ('app', 'email', 'phone', 'survey', 'support_ticket', 'exit_interview')),
    campaign_id UUID REFERENCES retention_campaigns(id) ON DELETE SET NULL,
    tags TEXT[] DEFAULT '{}',
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ,
    
    INDEX idx_user_feedback_user (user_id),
    INDEX idx_user_feedback_tenant (tenant_id),
    INDEX idx_user_feedback_type (feedback_type),
    INDEX idx_user_feedback_rating (rating),
    INDEX idx_user_feedback_sentiment (sentiment),
    INDEX idx_user_feedback_status (status),
    INDEX idx_user_feedback_submitted (submitted_at)
);

-- Row Level Security (RLS) Policies
ALTER TABLE farmer_engagement_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE retention_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE retention_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_campaign_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmer_lifecycle_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE value_realizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE churn_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE retention_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for engagement scores (users can see their own, managers can see all)
CREATE POLICY "Users can view their own engagement scores" ON farmer_engagement_scores
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'manager')
            AND tenant_id = farmer_engagement_scores.tenant_id
        )
    );

-- RLS Policies for retention insights (managers and owners only)
CREATE POLICY "Managers and owners can manage retention insights" ON retention_insights
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'manager')
            AND tenant_id = retention_insights.tenant_id
        )
    );

-- RLS Policies for campaigns (managers and owners only)
CREATE POLICY "Managers and owners can manage retention campaigns" ON retention_campaigns
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'manager')
            AND tenant_id = retention_campaigns.tenant_id
        )
    );

-- RLS Policies for user feedback (users can create/view their own, managers can view all)
CREATE POLICY "Users can manage their own feedback" ON user_feedback
    FOR ALL USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'manager')
            AND tenant_id = user_feedback.tenant_id
        )
    );

-- Functions for retention calculations and automation

-- Function to calculate engagement score for a user
CREATE OR REPLACE FUNCTION calculate_engagement_score(p_user_id uuid, p_tenant_id uuid)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    login_score INTEGER := 0;
    feature_score INTEGER := 0;
    data_score INTEGER := 0;
    support_score INTEGER := 0;
    revenue_score INTEGER := 0;
    social_score INTEGER := 0;
    total_score INTEGER := 0;
    start_date TIMESTAMPTZ := now() - interval '90 days';
BEGIN
    -- Login frequency (0-20 points)
    SELECT LEAST(20, COUNT(DISTINCT date_trunc('day', timestamp)) * 20 / 30) INTO login_score
    FROM user_activity_log 
    WHERE user_id = p_user_id 
    AND tenant_id = p_tenant_id 
    AND action = 'login_success'
    AND timestamp >= start_date;
    
    -- Feature usage diversity (0-25 points)
    SELECT LEAST(25, COUNT(DISTINCT action) * 25 / 15) INTO feature_score
    FROM user_activity_log 
    WHERE user_id = p_user_id 
    AND tenant_id = p_tenant_id 
    AND action != 'login_success'
    AND timestamp >= start_date;
    
    -- Data quality/completeness (0-20 points)
    SELECT CASE 
        WHEN full_name IS NOT NULL AND phone_number IS NOT NULL AND location IS NOT NULL 
             AND farm_size IS NOT NULL AND primary_crops IS NOT NULL THEN 20
        WHEN full_name IS NOT NULL AND phone_number IS NOT NULL AND location IS NOT NULL THEN 15
        WHEN full_name IS NOT NULL AND phone_number IS NOT NULL THEN 10
        WHEN full_name IS NOT NULL THEN 5
        ELSE 0 
    END INTO data_score
    FROM profiles 
    WHERE user_id = p_user_id AND tenant_id = p_tenant_id;
    
    -- Support interaction (0-15 points)
    SELECT LEAST(15, COUNT(*) * 3) INTO support_score
    FROM user_activity_log 
    WHERE user_id = p_user_id 
    AND tenant_id = p_tenant_id 
    AND action IN ('support_ticket_created', 'help_article_viewed', 'feedback_submitted')
    AND timestamp >= start_date;
    
    -- Revenue contribution (0-15 points) - simplified calculation
    SELECT LEAST(15, COALESCE(SUM(amount), 0) / 10000 * 15) INTO revenue_score
    FROM financial_records 
    WHERE tenant_id = p_tenant_id 
    AND transaction_type = 'income'
    AND date >= start_date::date;
    
    -- Social engagement (0-5 points)
    SELECT LEAST(5, COUNT(*) / 2) INTO social_score
    FROM user_activity_log 
    WHERE user_id = p_user_id 
    AND tenant_id = p_tenant_id 
    AND action LIKE '%social%'
    AND timestamp >= start_date;
    
    total_score := COALESCE(login_score, 0) + COALESCE(feature_score, 0) + COALESCE(data_score, 0) + 
                   COALESCE(support_score, 0) + COALESCE(revenue_score, 0) + COALESCE(social_score, 0);
    
    -- Update or insert engagement score
    INSERT INTO farmer_engagement_scores (
        user_id, tenant_id, overall_score, component_scores, 
        risk_level, trend, calculated_at, next_calculation
    ) VALUES (
        p_user_id, p_tenant_id, total_score,
        jsonb_build_object(
            'login_frequency', login_score,
            'feature_usage', feature_score,
            'data_quality', data_score,
            'support_interaction', support_score,
            'revenue_contribution', revenue_score,
            'social_engagement', social_score
        ),
        CASE 
            WHEN total_score >= 80 THEN 'low'
            WHEN total_score >= 60 THEN 'medium'
            WHEN total_score >= 40 THEN 'high'
            ELSE 'critical'
        END,
        'stable', -- Would be calculated based on trend
        now(),
        now() + interval '7 days'
    ) ON CONFLICT (user_id, tenant_id) 
    DO UPDATE SET 
        overall_score = EXCLUDED.overall_score,
        component_scores = EXCLUDED.component_scores,
        risk_level = EXCLUDED.risk_level,
        calculated_at = EXCLUDED.calculated_at,
        next_calculation = EXCLUDED.next_calculation;
    
    RETURN total_score;
END;
$$;

-- Function to generate retention insights
CREATE OR REPLACE FUNCTION generate_retention_insights()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    insight_count INTEGER := 0;
    user_record RECORD;
    tenant_record RECORD;
BEGIN
    -- Loop through all tenants
    FOR tenant_record IN SELECT id FROM tenants LOOP
        -- Find users with high churn risk
        FOR user_record IN 
            SELECT user_id, overall_score, risk_level
            FROM farmer_engagement_scores 
            WHERE tenant_id = tenant_record.id 
            AND risk_level IN ('high', 'critical')
            AND calculated_at >= now() - interval '1 day'
        LOOP
            -- Create churn risk insight
            INSERT INTO retention_insights (
                user_id, tenant_id, insight_type, severity, title, description,
                recommendations, confidence_score, detected_at
            ) VALUES (
                user_record.user_id, tenant_record.id, 'churn_risk', 
                CASE WHEN user_record.risk_level = 'critical' THEN 'critical' ELSE 'warning' END,
                'High Churn Risk Detected',
                'Farmer engagement score is ' || user_record.overall_score || '/100 indicating high churn risk',
                ARRAY['Schedule personal check-in call', 'Review feature adoption', 'Assess value realization'],
                0.85, now()
            ) ON CONFLICT (user_id, tenant_id, insight_type) 
            DO UPDATE SET 
                severity = EXCLUDED.severity,
                description = EXCLUDED.description,
                detected_at = EXCLUDED.detected_at;
            
            insight_count := insight_count + 1;
        END LOOP;
    END LOOP;
    
    RETURN insight_count;
END;
$$;

-- Function to execute retention campaigns
CREATE OR REPLACE FUNCTION execute_retention_campaigns()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    campaign_count INTEGER := 0;
    campaign_record RECORD;
    execution_batch TEXT;
    target_users UUID[];
BEGIN
    -- Find active campaigns that need execution
    FOR campaign_record IN 
        SELECT * FROM retention_campaigns 
        WHERE status = 'active'
        AND (last_executed IS NULL OR last_executed <= now() - interval '1 day')
        AND start_date <= now()
        AND (end_date IS NULL OR end_date >= now())
    LOOP
        execution_batch := 'batch_' || campaign_record.id || '_' || extract(epoch from now());
        
        -- Find target users (simplified - would be more complex in reality)
        SELECT ARRAY_AGG(user_id) INTO target_users
        FROM farmer_engagement_scores 
        WHERE tenant_id = campaign_record.tenant_id
        AND risk_level = ANY(string_to_array(campaign_record.target_audience->>'risk_levels', ','));
        
        -- Create execution record
        INSERT INTO campaign_executions (
            campaign_id, tenant_id, execution_batch, target_user_ids,
            users_targeted, status
        ) VALUES (
            campaign_record.id, campaign_record.tenant_id, execution_batch, 
            target_users, array_length(target_users, 1), 'running'
        );
        
        -- Update campaign last_executed
        UPDATE retention_campaigns 
        SET last_executed = now()
        WHERE id = campaign_record.id;
        
        campaign_count := campaign_count + 1;
    END LOOP;
    
    RETURN campaign_count;
END;
$$;

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_retention_campaigns_updated_at BEFORE UPDATE ON retention_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_retention_goals_updated_at BEFORE UPDATE ON retention_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default retention goals for existing tenants
INSERT INTO retention_goals (tenant_id, goal_type, goal_name, target_value, measurement_period, target_date, created_by)
SELECT 
    t.id,
    'retention_rate',
    'Annual Farmer Retention Rate',
    95.0, -- Target 95% retention
    'annually',
    CURRENT_DATE + interval '1 year',
    (SELECT user_id FROM profiles WHERE tenant_id = t.id AND role = 'owner' LIMIT 1)
FROM tenants t
WHERE NOT EXISTS (
    SELECT 1 FROM retention_goals rg 
    WHERE rg.tenant_id = t.id AND rg.goal_type = 'retention_rate'
);

-- Insert sample retention campaign templates
INSERT INTO retention_campaigns (
    tenant_id, name, description, campaign_type, target_audience, triggers, actions,
    status, start_date, created_by
)
SELECT 
    t.id,
    campaign_template.name,
    campaign_template.description,
    campaign_template.campaign_type,
    campaign_template.target_audience::jsonb,
    campaign_template.triggers::jsonb,
    campaign_template.actions::jsonb,
    'draft',
    CURRENT_DATE,
    (SELECT user_id FROM profiles WHERE tenant_id = t.id AND role = 'owner' LIMIT 1)
FROM tenants t
CROSS JOIN (VALUES
    ('At-Risk Farmer Outreach', 'Proactive outreach to farmers showing churn risk indicators', 'reactivation',
     '{"criteria": {"risk_levels": ["high", "critical"]}, "exclusions": {"recently_contacted_days": 14}}',
     '[{"type": "score_change", "conditions": {"risk_level": "high"}, "frequency": "daily"}]',
     '[{"type": "email", "template_id": "churn_risk_email"}, {"type": "phone_call", "delay_hours": 24}]'),
    ('New Farmer Onboarding', 'Welcome sequence for newly registered farmers', 'onboarding',
     '{"criteria": {"tenure_days_range": [0, 30]}}',
     '[{"type": "time_based", "conditions": {"days_after_signup": 1}, "frequency": "immediate"}]',
     '[{"type": "email", "template_id": "welcome_series"}, {"type": "training_session", "delay_hours": 72}]'),
    ('Feature Adoption Nudges', 'Encourage adoption of underutilized features', 'education',
     '{"criteria": {"engagement_score_range": [40, 70]}}',
     '[{"type": "feature_usage", "conditions": {"features_not_used": ["crop_planning"]}, "frequency": "weekly"}]',
     '[{"type": "in_app_notification"}, {"type": "email", "template_id": "feature_highlight"}]')
) AS campaign_template(name, description, campaign_type, target_audience, triggers, actions)
WHERE NOT EXISTS (
    SELECT 1 FROM retention_campaigns rc 
    WHERE rc.tenant_id = t.id AND rc.name = campaign_template.name
);

-- Create indexes for performance optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_farmer_engagement_tenant_risk_score 
ON farmer_engagement_scores (tenant_id, risk_level, overall_score DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_retention_insights_tenant_active 
ON retention_insights (tenant_id, status) WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_campaign_executions_status_started 
ON campaign_executions (status, execution_started) WHERE status = 'running';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_feedback_tenant_rating_submitted 
ON user_feedback (tenant_id, rating, submitted_at DESC);

-- Comments for documentation
COMMENT ON TABLE farmer_engagement_scores IS 'Comprehensive engagement scoring for farmer retention tracking';
COMMENT ON TABLE retention_insights IS 'AI-generated insights about farmer behavior and churn risk';
COMMENT ON TABLE retention_campaigns IS 'Automated campaigns for farmer engagement and retention';
COMMENT ON TABLE campaign_executions IS 'Individual execution instances of retention campaigns';
COMMENT ON TABLE user_campaign_interactions IS 'User responses and interactions with retention campaigns';
COMMENT ON TABLE farmer_lifecycle_stages IS 'Track farmer journey stages and progression';
COMMENT ON TABLE value_realizations IS 'Concrete value delivered to farmers through platform usage';
COMMENT ON TABLE churn_predictions IS 'ML-based predictions of farmer churn probability';
COMMENT ON TABLE retention_goals IS 'Tenant-specific retention objectives and tracking';
COMMENT ON TABLE user_feedback IS 'Farmer feedback collection and sentiment analysis';

-- Schedule automated functions (requires pg_cron extension)
-- SELECT cron.schedule('calculate-engagement-scores', '0 6 * * *', 'SELECT calculate_engagement_score(user_id, tenant_id) FROM farmer_engagement_scores WHERE next_calculation <= now();');
-- SELECT cron.schedule('generate-retention-insights', '0 7 * * *', 'SELECT generate_retention_insights();');
-- SELECT cron.schedule('execute-retention-campaigns', '0 9 * * *', 'SELECT execute_retention_campaigns();');

COMMIT;