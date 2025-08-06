-- End-to-End Payment Reconciliation Tables
-- Run this migration to add comprehensive payment reconciliation capabilities

-- Payment Providers Table - External payment systems integration
CREATE TABLE IF NOT EXISTS payment_providers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    provider_type TEXT NOT NULL CHECK (provider_type IN ('bank', 'payment_processor', 'marketplace', 'government', 'insurance', 'carbon_exchange')),
    api_endpoint TEXT,
    credentials_encrypted TEXT NOT NULL, -- Encrypted API keys/credentials
    last_sync_at TIMESTAMPTZ,
    sync_frequency_hours INTEGER DEFAULT 24,
    is_active BOOLEAN DEFAULT true,
    supported_transaction_types TEXT[] DEFAULT '{}',
    sync_settings JSONB DEFAULT '{}',
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    UNIQUE(tenant_id, name),
    INDEX idx_payment_providers_tenant (tenant_id),
    INDEX idx_payment_providers_type (provider_type),
    INDEX idx_payment_providers_active (is_active),
    INDEX idx_payment_providers_sync (last_sync_at, sync_frequency_hours)
);

-- External Transactions Table - Transactions from external systems
CREATE TABLE IF NOT EXISTS external_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    provider_id UUID NOT NULL REFERENCES payment_providers(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    external_id TEXT NOT NULL, -- ID from external system
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense', 'transfer')),
    amount NUMERIC(15,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    description TEXT NOT NULL,
    reference_number TEXT,
    transaction_date TIMESTAMPTZ NOT NULL,
    processed_date TIMESTAMPTZ,
    account_identifier TEXT, -- Bank account, card ending, etc.
    account_name TEXT,
    counterparty_name TEXT,
    counterparty_account TEXT,
    category TEXT,
    status TEXT DEFAULT 'completed',
    metadata JSONB DEFAULT '{}',
    raw_data JSONB, -- Original data from external system
    imported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    UNIQUE(provider_id, external_id),
    INDEX idx_external_txns_provider (provider_id),
    INDEX idx_external_txns_tenant (tenant_id),
    INDEX idx_external_txns_date (transaction_date),
    INDEX idx_external_txns_amount (amount),
    INDEX idx_external_txns_reference (reference_number),
    INDEX idx_external_txns_account (account_identifier)
);

-- Enhanced Payment Transactions Table (extending existing financial_records)
DO $$
BEGIN
    -- Add reconciliation-specific columns to existing payment tables
    ALTER TABLE financial_records ADD COLUMN IF NOT EXISTS payment_method JSONB DEFAULT '{}';
    ALTER TABLE financial_records ADD COLUMN IF NOT EXISTS external_id TEXT;
    ALTER TABLE financial_records ADD COLUMN IF NOT EXISTS reference_number TEXT;
    ALTER TABLE financial_records ADD COLUMN IF NOT EXISTS reconciliation_id UUID;
    ALTER TABLE financial_records ADD COLUMN IF NOT EXISTS reconciliation_status TEXT DEFAULT 'unreconciled' CHECK (reconciliation_status IN ('unreconciled', 'matched', 'disputed', 'adjusted'));
    ALTER TABLE financial_records ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    ALTER TABLE financial_records ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
    ALTER TABLE financial_records ADD COLUMN IF NOT EXISTS attachments TEXT[] DEFAULT '{}';
    
    -- Add indexes for reconciliation
    CREATE INDEX IF NOT EXISTS idx_financial_records_reconciliation ON financial_records (reconciliation_status);
    CREATE INDEX IF NOT EXISTS idx_financial_records_reference ON financial_records (reference_number);
    CREATE INDEX IF NOT EXISTS idx_financial_records_external_id ON financial_records (external_id);
    CREATE INDEX IF NOT EXISTS idx_financial_records_date_amount ON financial_records (date, amount);
    
EXCEPTION
    WHEN duplicate_column THEN
        RAISE NOTICE 'Reconciliation columns already exist in financial_records table';
END $$;

-- Reconciliation Sessions Table - Track reconciliation processes
CREATE TABLE IF NOT EXISTS reconciliation_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    account_ids TEXT[] NOT NULL,
    provider_ids UUID[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'cancelled', 'review_required')),
    total_transactions INTEGER DEFAULT 0,
    matched_transactions INTEGER DEFAULT 0,
    unmatched_transactions INTEGER DEFAULT 0,
    discrepancies INTEGER DEFAULT 0,
    total_amount_processed NUMERIC(15,2) DEFAULT 0,
    total_amount_matched NUMERIC(15,2) DEFAULT 0,
    reconciliation_rate NUMERIC(5,2) DEFAULT 0,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    auto_match_enabled BOOLEAN DEFAULT true,
    tolerance_amount NUMERIC(10,2) DEFAULT 0.01, -- Tolerance for amount differences
    tolerance_days INTEGER DEFAULT 3, -- Tolerance for date differences
    notes TEXT,
    
    INDEX idx_reconciliation_sessions_tenant (tenant_id),
    INDEX idx_reconciliation_sessions_status (status),
    INDEX idx_reconciliation_sessions_period (period_start, period_end),
    INDEX idx_reconciliation_sessions_created_by (created_by)
);

-- Reconciliation Matches Table - Track matched transactions
CREATE TABLE IF NOT EXISTS reconciliation_matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES reconciliation_sessions(id) ON DELETE CASCADE,
    internal_transaction_id UUID NOT NULL REFERENCES financial_records(id) ON DELETE CASCADE,
    external_transaction_id UUID REFERENCES external_transactions(id) ON DELETE SET NULL,
    match_type TEXT NOT NULL CHECK (match_type IN ('exact', 'partial', 'manual', 'rule_based', 'ai_suggested')),
    match_confidence NUMERIC(3,2) NOT NULL DEFAULT 1.0 CHECK (match_confidence >= 0 AND match_confidence <= 1),
    amount_difference NUMERIC(15,2) DEFAULT 0,
    date_difference_days INTEGER DEFAULT 0,
    matching_criteria JSONB DEFAULT '{}', -- What criteria were used for matching
    matched_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    matched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    review_status TEXT DEFAULT 'pending' CHECK (review_status IN ('pending', 'approved', 'rejected')),
    notes TEXT,
    
    UNIQUE(session_id, internal_transaction_id),
    INDEX idx_reconciliation_matches_session (session_id),
    INDEX idx_reconciliation_matches_internal (internal_transaction_id),
    INDEX idx_reconciliation_matches_external (external_transaction_id),
    INDEX idx_reconciliation_matches_type (match_type),
    INDEX idx_reconciliation_matches_confidence (match_confidence)
);

-- Reconciliation Rules Table - Automated matching rules
CREATE TABLE IF NOT EXISTS reconciliation_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    rule_type TEXT NOT NULL CHECK (rule_type IN ('exact_match', 'fuzzy_match', 'pattern_match', 'amount_range', 'date_range')),
    conditions JSONB NOT NULL, -- Array of conditions to match
    actions JSONB NOT NULL, -- Array of actions to take when matched
    priority INTEGER NOT NULL DEFAULT 5 CHECK (priority >= 1 AND priority <= 10), -- 1 = highest priority
    is_active BOOLEAN DEFAULT true,
    auto_apply BOOLEAN DEFAULT true,
    require_approval BOOLEAN DEFAULT false,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    last_applied_at TIMESTAMPTZ,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    INDEX idx_reconciliation_rules_tenant (tenant_id),
    INDEX idx_reconciliation_rules_active (is_active),
    INDEX idx_reconciliation_rules_priority (priority),
    INDEX idx_reconciliation_rules_type (rule_type)
);

-- Payment Discrepancies Table - Track reconciliation issues
CREATE TABLE IF NOT EXISTS payment_discrepancies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES reconciliation_sessions(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    discrepancy_type TEXT NOT NULL CHECK (discrepancy_type IN ('missing_internal', 'missing_external', 'amount_mismatch', 'date_mismatch', 'duplicate', 'category_mismatch')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    internal_transaction_id UUID REFERENCES financial_records(id) ON DELETE SET NULL,
    external_transaction_id UUID REFERENCES external_transactions(id) ON DELETE SET NULL,
    expected_amount NUMERIC(15,2),
    actual_amount NUMERIC(15,2),
    amount_difference NUMERIC(15,2),
    expected_date DATE,
    actual_date DATE,
    date_difference_days INTEGER,
    resolution_status TEXT NOT NULL DEFAULT 'open' CHECK (resolution_status IN ('open', 'investigating', 'resolved', 'accepted', 'escalated')),
    resolution_type TEXT CHECK (resolution_type IN ('manual_match', 'adjustment_entry', 'write_off', 'provider_correction', 'data_correction')),
    resolution_notes TEXT,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    escalated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    INDEX idx_payment_discrepancies_session (session_id),
    INDEX idx_payment_discrepancies_tenant (tenant_id),
    INDEX idx_payment_discrepancies_type (discrepancy_type),
    INDEX idx_payment_discrepancies_severity (severity),
    INDEX idx_payment_discrepancies_status (resolution_status),
    INDEX idx_payment_discrepancies_assigned (assigned_to),
    INDEX idx_payment_discrepancies_internal (internal_transaction_id),
    INDEX idx_payment_discrepancies_external (external_transaction_id)
);

-- Adjustment Entries Table - Track manual adjustments
CREATE TABLE IF NOT EXISTS adjustment_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    session_id UUID REFERENCES reconciliation_sessions(id) ON DELETE SET NULL,
    discrepancy_id UUID REFERENCES payment_discrepancies(id) ON DELETE SET NULL,
    adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('reconciliation', 'correction', 'write_off', 'accrual', 'reclassification')),
    amount NUMERIC(15,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    description TEXT NOT NULL,
    reason TEXT NOT NULL,
    supporting_documents TEXT[], -- File paths/URLs to supporting documents
    original_transaction_id UUID REFERENCES financial_records(id) ON DELETE SET NULL,
    reversal_of UUID REFERENCES adjustment_entries(id) ON DELETE SET NULL, -- If this reverses another adjustment
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'applied')),
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    applied_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    INDEX idx_adjustment_entries_tenant (tenant_id),
    INDEX idx_adjustment_entries_session (session_id),
    INDEX idx_adjustment_entries_discrepancy (discrepancy_id),
    INDEX idx_adjustment_entries_type (adjustment_type),
    INDEX idx_adjustment_entries_status (status),
    INDEX idx_adjustment_entries_created_by (created_by),
    INDEX idx_adjustment_entries_amount (amount)
);

-- Payment Categories Table - Enhanced categorization for reconciliation
CREATE TABLE IF NOT EXISTS payment_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    parent_id UUID REFERENCES payment_categories(id) ON DELETE SET NULL,
    category_type TEXT NOT NULL CHECK (category_type IN ('income', 'expense', 'asset', 'liability')),
    description TEXT,
    account_code TEXT, -- For integration with accounting systems
    tax_category TEXT,
    auto_match_keywords TEXT[], -- Keywords for automatic categorization
    requires_approval BOOLEAN DEFAULT false,
    is_system BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    UNIQUE(tenant_id, name),
    INDEX idx_payment_categories_tenant (tenant_id),
    INDEX idx_payment_categories_parent (parent_id),
    INDEX idx_payment_categories_type (category_type),
    INDEX idx_payment_categories_active (is_active)
);

-- Reconciliation Reports Table - Store generated reports
CREATE TABLE IF NOT EXISTS reconciliation_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES reconciliation_sessions(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    report_type TEXT NOT NULL CHECK (report_type IN ('summary', 'detailed', 'discrepancy', 'audit', 'variance')),
    report_data JSONB NOT NULL, -- The actual report content
    file_path TEXT, -- Path to generated file (PDF/Excel)
    generated_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ, -- When to auto-delete the report
    download_count INTEGER DEFAULT 0,
    
    INDEX idx_reconciliation_reports_session (session_id),
    INDEX idx_reconciliation_reports_tenant (tenant_id),
    INDEX idx_reconciliation_reports_type (report_type),
    INDEX idx_reconciliation_reports_generated (generated_at)
);

-- Row Level Security (RLS) Policies
ALTER TABLE payment_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reconciliation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reconciliation_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE reconciliation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_discrepancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE adjustment_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE reconciliation_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_providers (owners and managers only)
CREATE POLICY "Owners and managers can manage payment providers" ON payment_providers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'manager')
            AND tenant_id = payment_providers.tenant_id
        )
    );

-- RLS Policies for reconciliation data (financial staff access)
CREATE POLICY "Financial staff can access reconciliation sessions" ON reconciliation_sessions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'manager', 'accountant')
            AND tenant_id = reconciliation_sessions.tenant_id
        )
    );

CREATE POLICY "Financial staff can access reconciliation matches" ON reconciliation_matches
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM reconciliation_sessions rs
            JOIN profiles p ON p.user_id = auth.uid()
            WHERE rs.id = reconciliation_matches.session_id
            AND p.role IN ('owner', 'manager', 'accountant')
            AND p.tenant_id = rs.tenant_id
        )
    );

CREATE POLICY "Financial staff can access payment discrepancies" ON payment_discrepancies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'manager', 'accountant')
            AND tenant_id = payment_discrepancies.tenant_id
        )
    );

-- Functions for automated reconciliation processes

-- Function to auto-match transactions based on rules
CREATE OR REPLACE FUNCTION auto_match_transactions(p_session_id uuid)
RETURNS TABLE(matches_created integer, confidence_score numeric)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    session_record RECORD;
    rule_record RECORD;
    total_matches INTEGER := 0;
    avg_confidence NUMERIC := 0;
BEGIN
    -- Get session details
    SELECT * INTO session_record FROM reconciliation_sessions WHERE id = p_session_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Reconciliation session not found';
    END IF;
    
    -- Apply active rules in priority order
    FOR rule_record IN 
        SELECT * FROM reconciliation_rules 
        WHERE tenant_id = session_record.tenant_id
        AND is_active = true
        AND auto_apply = true
        ORDER BY priority DESC
    LOOP
        -- Apply rule logic here (simplified for example)
        -- In real implementation, this would evaluate conditions and create matches
        
        UPDATE reconciliation_rules 
        SET last_applied_at = now(),
            success_count = success_count + 1
        WHERE id = rule_record.id;
        
        total_matches := total_matches + 1;
    END LOOP;
    
    -- Calculate average confidence (simplified)
    SELECT COALESCE(AVG(match_confidence), 0) INTO avg_confidence
    FROM reconciliation_matches 
    WHERE session_id = p_session_id;
    
    -- Update session statistics
    UPDATE reconciliation_sessions
    SET matched_transactions = (
        SELECT COUNT(*) FROM reconciliation_matches WHERE session_id = p_session_id
    ),
    reconciliation_rate = (
        CASE WHEN total_transactions > 0 
        THEN (matched_transactions::numeric / total_transactions::numeric) * 100
        ELSE 0 END
    )
    WHERE id = p_session_id;
    
    RETURN QUERY SELECT total_matches, avg_confidence;
END;
$$;

-- Function to detect discrepancies
CREATE OR REPLACE FUNCTION detect_discrepancies(p_session_id uuid)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    session_record RECORD;
    discrepancy_count INTEGER := 0;
    internal_txn RECORD;
    external_txn RECORD;
BEGIN
    -- Get session details
    SELECT * INTO session_record FROM reconciliation_sessions WHERE id = p_session_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Reconciliation session not found';
    END IF;
    
    -- Find unmatched internal transactions
    FOR internal_txn IN
        SELECT fr.* FROM financial_records fr
        WHERE fr.tenant_id = session_record.tenant_id
        AND fr.date >= session_record.period_start
        AND fr.date <= session_record.period_end
        AND fr.reconciliation_status = 'unreconciled'
    LOOP
        INSERT INTO payment_discrepancies (
            session_id, tenant_id, discrepancy_type, severity, title, description,
            internal_transaction_id, expected_amount
        ) VALUES (
            p_session_id, session_record.tenant_id, 'missing_external', 'medium',
            'Missing External Transaction',
            'Internal transaction ' || COALESCE(internal_txn.reference_number, internal_txn.id::text) || ' not found in external records',
            internal_txn.id, internal_txn.amount
        );
        
        discrepancy_count := discrepancy_count + 1;
    END LOOP;
    
    -- Find unmatched external transactions
    FOR external_txn IN
        SELECT et.* FROM external_transactions et
        WHERE et.tenant_id = session_record.tenant_id
        AND et.transaction_date::date >= session_record.period_start
        AND et.transaction_date::date <= session_record.period_end
        AND NOT EXISTS (
            SELECT 1 FROM reconciliation_matches rm 
            WHERE rm.external_transaction_id = et.id
        )
    LOOP
        INSERT INTO payment_discrepancies (
            session_id, tenant_id, discrepancy_type, severity, title, description,
            external_transaction_id, actual_amount
        ) VALUES (
            p_session_id, session_record.tenant_id, 'missing_internal', 'medium',
            'Missing Internal Transaction',
            'External transaction ' || COALESCE(external_txn.reference_number, external_txn.external_id) || ' not found in internal records',
            external_txn.id, external_txn.amount
        );
        
        discrepancy_count := discrepancy_count + 1;
    END LOOP;
    
    -- Update session discrepancy count
    UPDATE reconciliation_sessions
    SET discrepancies = discrepancy_count
    WHERE id = p_session_id;
    
    RETURN discrepancy_count;
END;
$$;

-- Function to calculate reconciliation statistics
CREATE OR REPLACE FUNCTION calculate_reconciliation_stats(p_session_id uuid)
RETURNS TABLE(
    total_amount numeric,
    matched_amount numeric,
    unmatched_amount numeric,
    discrepancy_amount numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    session_record RECORD;
BEGIN
    SELECT * INTO session_record FROM reconciliation_sessions WHERE id = p_session_id;
    
    RETURN QUERY
    WITH session_transactions AS (
        SELECT fr.amount, fr.reconciliation_status
        FROM financial_records fr
        WHERE fr.tenant_id = session_record.tenant_id
        AND fr.date >= session_record.period_start
        AND fr.date <= session_record.period_end
    ),
    stats AS (
        SELECT 
            SUM(ABS(amount)) as total_amt,
            SUM(CASE WHEN reconciliation_status = 'matched' THEN ABS(amount) ELSE 0 END) as matched_amt,
            SUM(CASE WHEN reconciliation_status = 'unreconciled' THEN ABS(amount) ELSE 0 END) as unmatched_amt
        FROM session_transactions
    ),
    discrepancy_stats AS (
        SELECT COALESCE(SUM(ABS(COALESCE(amount_difference, 0))), 0) as discrepancy_amt
        FROM payment_discrepancies
        WHERE session_id = p_session_id
    )
    SELECT 
        COALESCE(s.total_amt, 0),
        COALESCE(s.matched_amt, 0),
        COALESCE(s.unmatched_amt, 0),
        COALESCE(ds.discrepancy_amt, 0)
    FROM stats s
    CROSS JOIN discrepancy_stats ds;
END;
$$;

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_payment_providers_updated_at BEFORE UPDATE ON payment_providers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reconciliation_rules_updated_at BEFORE UPDATE ON reconciliation_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_discrepancies_updated_at BEFORE UPDATE ON payment_discrepancies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default payment categories
INSERT INTO payment_categories (tenant_id, name, category_type, description, auto_match_keywords) 
SELECT 
    t.id,
    category_data.name,
    category_data.category_type,
    category_data.description,
    category_data.keywords
FROM tenants t
CROSS JOIN (VALUES
    ('Crop Sales', 'income', 'Revenue from crop sales and harvests', ARRAY['harvest', 'crop', 'grain', 'wheat', 'corn', 'soybean']),
    ('Livestock Sales', 'income', 'Revenue from livestock and animal products', ARRAY['livestock', 'cattle', 'dairy', 'milk', 'beef', 'pork']),
    ('Government Subsidies', 'income', 'Agricultural subsidies and support payments', ARRAY['subsidy', 'usda', 'government', 'support', 'cif', 'conservation']),
    ('Insurance Payments', 'income', 'Crop and livestock insurance payouts', ARRAY['insurance', 'claim', 'payout', 'coverage', 'loss']),
    ('Carbon Credits', 'income', 'Carbon credit and environmental credit sales', ARRAY['carbon', 'credit', 'environmental', 'offset', 'sustainability']),
    ('Equipment Purchase', 'expense', 'Farm equipment and machinery purchases', ARRAY['equipment', 'tractor', 'machinery', 'implement', 'john deere']),
    ('Seed and Supplies', 'expense', 'Seeds, fertilizer, and farming supplies', ARRAY['seed', 'fertilizer', 'pesticide', 'herbicide', 'supplies']),
    ('Feed and Nutrition', 'expense', 'Animal feed and nutrition supplements', ARRAY['feed', 'nutrition', 'supplement', 'hay', 'grain feed']),
    ('Fuel and Energy', 'expense', 'Fuel, electricity, and energy costs', ARRAY['fuel', 'diesel', 'gasoline', 'electricity', 'energy', 'propane']),
    ('Labor and Wages', 'expense', 'Employee wages and contract labor', ARRAY['wages', 'salary', 'labor', 'payroll', 'contractor']),
    ('Maintenance and Repairs', 'expense', 'Equipment and infrastructure maintenance', ARRAY['maintenance', 'repair', 'service', 'parts', 'fix']),
    ('Land and Buildings', 'asset', 'Real estate and property investments', ARRAY['land', 'property', 'building', 'real estate', 'acreage']),
    ('Equipment and Machinery', 'asset', 'Farm equipment and machinery assets', ARRAY['equipment', 'machinery', 'tractor', 'asset', 'depreciation']),
    ('Loans and Financing', 'liability', 'Agricultural loans and financing', ARRAY['loan', 'financing', 'mortgage', 'credit', 'debt', 'interest'])
) AS category_data(name, category_type, description, keywords)
WHERE NOT EXISTS (
    SELECT 1 FROM payment_categories pc 
    WHERE pc.tenant_id = t.id AND pc.name = category_data.name
);

-- Insert default reconciliation rules
INSERT INTO reconciliation_rules (tenant_id, name, description, rule_type, conditions, actions, priority)
SELECT 
    t.id,
    rule_data.name,
    rule_data.description,
    rule_data.rule_type,
    rule_data.conditions::jsonb,
    rule_data.actions::jsonb,
    rule_data.priority
FROM tenants t
CROSS JOIN (VALUES
    ('Exact Amount and Date Match', 'Match transactions with identical amount and date', 'exact_match',
     '[{"field": "amount", "operator": "equals"}, {"field": "transaction_date", "operator": "date_match", "tolerance_days": 0}]',
     '[{"type": "auto_match", "confidence": 1.0}]', 10),
    ('Amount Match with 3-Day Tolerance', 'Match transactions with same amount within 3 days', 'fuzzy_match',
     '[{"field": "amount", "operator": "equals"}, {"field": "transaction_date", "operator": "date_match", "tolerance_days": 3}]',
     '[{"type": "auto_match", "confidence": 0.9}]', 8),
    ('Reference Number Match', 'Match by reference or invoice number', 'pattern_match',
     '[{"field": "reference_number", "operator": "equals"}, {"field": "amount", "operator": "amount_range", "tolerance_percent": 5}]',
     '[{"type": "auto_match", "confidence": 0.95}]', 9),
    ('Description Keyword Match', 'Match by keywords in description', 'pattern_match',
     '[{"field": "description", "operator": "contains_keywords"}, {"field": "amount", "operator": "amount_range", "tolerance_percent": 10}]',
     '[{"type": "suggest_match", "confidence": 0.7}]', 5)
) AS rule_data(name, description, rule_type, conditions, actions, priority)
WHERE NOT EXISTS (
    SELECT 1 FROM reconciliation_rules rr 
    WHERE rr.tenant_id = t.id AND rr.name = rule_data.name
);

-- Create indexes for performance optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_external_txns_tenant_date_amount 
ON external_transactions (tenant_id, transaction_date, amount);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_financial_records_tenant_date_amount 
ON financial_records (tenant_id, date, amount) WHERE reconciliation_status = 'unreconciled';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reconciliation_matches_session_confidence 
ON reconciliation_matches (session_id, match_confidence DESC);

-- Comments for documentation
COMMENT ON TABLE payment_providers IS 'External payment system integrations for automated transaction import';
COMMENT ON TABLE external_transactions IS 'Transactions imported from external payment systems and banks';
COMMENT ON TABLE reconciliation_sessions IS 'Reconciliation process sessions with period and account scope';
COMMENT ON TABLE reconciliation_matches IS 'Matches between internal and external transactions';
COMMENT ON TABLE reconciliation_rules IS 'Automated rules for transaction matching and categorization';
COMMENT ON TABLE payment_discrepancies IS 'Identified discrepancies requiring investigation or resolution';
COMMENT ON TABLE adjustment_entries IS 'Manual adjustments made during reconciliation process';
COMMENT ON TABLE payment_categories IS 'Enhanced categorization system for financial transactions';
COMMENT ON TABLE reconciliation_reports IS 'Generated reconciliation reports and summaries';

-- Schedule automated functions (requires pg_cron extension)
-- SELECT cron.schedule('sync-payment-providers', '0 */6 * * *', 'SELECT sync_payment_providers();');
-- SELECT cron.schedule('auto-reconciliation', '0 9 * * *', 'SELECT run_daily_auto_reconciliation();');
-- SELECT cron.schedule('cleanup-old-reports', '0 2 * * 0', 'DELETE FROM reconciliation_reports WHERE expires_at < now();');

COMMIT;