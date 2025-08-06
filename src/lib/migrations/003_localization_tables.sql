-- Multi-Region & Language Localization Tables
-- Run this migration to add comprehensive localization support

-- Locales Table - Supported languages and regional configurations
CREATE TABLE IF NOT EXISTS locales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT NOT NULL UNIQUE, -- e.g., 'en-US', 'es-ES', 'pt-BR'
    name TEXT NOT NULL, -- e.g., 'English (United States)'
    native_name TEXT NOT NULL, -- e.g., 'English', 'Español'
    region TEXT NOT NULL, -- e.g., 'North America', 'Europe'
    currency TEXT NOT NULL, -- e.g., 'USD', 'EUR', 'BRL'
    date_format TEXT NOT NULL, -- e.g., 'MM/dd/yyyy', 'dd/MM/yyyy'
    time_format TEXT NOT NULL CHECK (time_format IN ('12h', '24h')),
    number_format JSONB NOT NULL DEFAULT '{"decimal": ".", "thousands": ",", "precision": 2}',
    units JSONB NOT NULL DEFAULT '{"area": "hectares", "weight": "kg", "temperature": "celsius", "distance": "km", "volume": "liters"}',
    is_rtl BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    flag_emoji TEXT, -- Unicode flag emoji for UI
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    INDEX idx_locales_code (code),
    INDEX idx_locales_region (region),
    INDEX idx_locales_active (is_active)
);

-- Translations Table - Store all UI text translations
CREATE TABLE IF NOT EXISTS translations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    locale_code TEXT NOT NULL REFERENCES locales(code) ON DELETE CASCADE,
    namespace TEXT NOT NULL DEFAULT 'common', -- e.g., 'common', 'agriculture', 'financial'
    key TEXT NOT NULL, -- Translation key e.g., 'dashboard.title'
    value TEXT NOT NULL, -- Translated text
    description TEXT, -- Context for translators
    is_pluralized BOOLEAN DEFAULT false,
    plural_forms JSONB, -- For languages with complex pluralization
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    UNIQUE(locale_code, namespace, key),
    INDEX idx_translations_locale_ns (locale_code, namespace),
    INDEX idx_translations_key (key)
);

-- Regional Settings Table - Agriculture-specific regional data
CREATE TABLE IF NOT EXISTS regional_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    locale_code TEXT NOT NULL REFERENCES locales(code) ON DELETE CASCADE,
    growing_seasons JSONB NOT NULL DEFAULT '[]', -- Array of growing season names
    common_crops JSONB NOT NULL DEFAULT '[]', -- Most common crops in region
    weather_patterns JSONB NOT NULL DEFAULT '[]', -- Typical weather events
    regulations JSONB NOT NULL DEFAULT '[]', -- Regional farming regulations
    soil_types JSONB NOT NULL DEFAULT '[]', -- Common soil types
    pest_diseases JSONB NOT NULL DEFAULT '[]', -- Common regional pests/diseases
    market_calendar JSONB NOT NULL DEFAULT '{}', -- Seasonal market patterns
    cultural_practices JSONB NOT NULL DEFAULT '{}', -- Traditional farming practices
    timezone TEXT NOT NULL DEFAULT 'UTC', -- Primary timezone for region
    coordinates JSONB NOT NULL DEFAULT '{"lat": 0, "lng": 0}', -- Region center point
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    UNIQUE(locale_code),
    INDEX idx_regional_settings_locale (locale_code)
);

-- User Localization Preferences
CREATE TABLE IF NOT EXISTS user_localization_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    preferred_locale TEXT NOT NULL REFERENCES locales(code) ON DELETE RESTRICT,
    timezone TEXT NOT NULL DEFAULT 'UTC',
    currency_override TEXT, -- Override default currency for this user
    unit_preferences JSONB NOT NULL DEFAULT '{}', -- Override default units
    date_format_override TEXT, -- User-specific date format preference
    number_format_override JSONB, -- User-specific number formatting
    auto_translate BOOLEAN DEFAULT true, -- Automatically translate content
    fallback_locale TEXT REFERENCES locales(code) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    UNIQUE(user_id, tenant_id),
    INDEX idx_user_locale_prefs_user (user_id),
    INDEX idx_user_locale_prefs_tenant (tenant_id),
    INDEX idx_user_locale_prefs_locale (preferred_locale)
);

-- Content Translations Table - For user-generated content
CREATE TABLE IF NOT EXISTS content_translations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_type TEXT NOT NULL, -- e.g., 'farm_name', 'crop_variety', 'note'
    content_id UUID NOT NULL, -- ID of the content being translated
    locale_code TEXT NOT NULL REFERENCES locales(code) ON DELETE CASCADE,
    field_name TEXT NOT NULL, -- Which field is being translated
    translated_text TEXT NOT NULL,
    is_auto_translated BOOLEAN DEFAULT false,
    translation_quality NUMERIC(3,2), -- 0-1 confidence score for auto-translations
    translator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    translation_source TEXT DEFAULT 'manual' CHECK (translation_source IN ('manual', 'google', 'azure', 'aws', 'deepl')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    UNIQUE(content_type, content_id, locale_code, field_name),
    INDEX idx_content_translations_content (content_type, content_id),
    INDEX idx_content_translations_locale (locale_code),
    INDEX idx_content_translations_auto (is_auto_translated)
);

-- Multi-Region Data Sync Table - Track data synchronization across regions
CREATE TABLE IF NOT EXISTS multi_region_sync (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    source_region TEXT NOT NULL,
    target_region TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    sync_type TEXT NOT NULL CHECK (sync_type IN ('create', 'update', 'delete')),
    sync_status TEXT NOT NULL DEFAULT 'pending' CHECK (sync_status IN ('pending', 'syncing', 'completed', 'failed')),
    data_payload JSONB,
    conflict_resolution TEXT CHECK (conflict_resolution IN ('source_wins', 'target_wins', 'merge', 'manual')),
    retry_count INTEGER DEFAULT 0,
    last_sync_attempt TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    INDEX idx_multi_region_sync_source (source_region),
    INDEX idx_multi_region_sync_target (target_region),
    INDEX idx_multi_region_sync_status (sync_status),
    INDEX idx_multi_region_sync_table_record (table_name, record_id)
);

-- Currency Exchange Rates Table - For multi-currency support
CREATE TABLE IF NOT EXISTS currency_exchange_rates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    from_currency TEXT NOT NULL,
    to_currency TEXT NOT NULL,
    exchange_rate NUMERIC(15,6) NOT NULL,
    rate_date DATE NOT NULL,
    source TEXT NOT NULL DEFAULT 'manual', -- e.g., 'ecb', 'fed', 'manual'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    UNIQUE(from_currency, to_currency, rate_date),
    INDEX idx_exchange_rates_from_to (from_currency, to_currency),
    INDEX idx_exchange_rates_date (rate_date),
    INDEX idx_exchange_rates_active (is_active)
);

-- Row Level Security (RLS) Policies
ALTER TABLE locales ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE regional_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_localization_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE multi_region_sync ENABLE ROW LEVEL SECURITY;
ALTER TABLE currency_exchange_rates ENABLE ROW LEVEL SECURITY;

-- Public read access for locales and translations (system data)
CREATE POLICY "Public read access to locales" ON locales
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public read access to translations" ON translations
    FOR SELECT USING (true);

CREATE POLICY "Public read access to regional settings" ON regional_settings
    FOR SELECT USING (true);

-- Admin-only write access for system localization data
CREATE POLICY "Admin can manage locales" ON locales
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role = 'system_admin'
        )
    );

CREATE POLICY "Admin can manage translations" ON translations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('system_admin', 'translator')
        )
    );

-- Users can manage their own localization preferences
CREATE POLICY "Users can manage their localization preferences" ON user_localization_preferences
    FOR ALL USING (auth.uid() = user_id);

-- Content translations access based on content ownership
CREATE POLICY "Users can manage translations for their content" ON content_translations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.user_id = auth.uid()
            AND (
                p.role IN ('owner', 'manager') 
                OR translator_id = auth.uid()
            )
        )
    );

-- Multi-region sync access for system admins only
CREATE POLICY "System admin can access multi-region sync" ON multi_region_sync
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role = 'system_admin'
        )
    );

-- Public read access to currency exchange rates
CREATE POLICY "Public read access to exchange rates" ON currency_exchange_rates
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admin can manage exchange rates" ON currency_exchange_rates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role = 'system_admin'
        )
    );

-- Functions for localization management

-- Function to get user's effective locale (with fallbacks)
CREATE OR REPLACE FUNCTION get_user_effective_locale(p_user_id uuid, p_tenant_id uuid)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_locale TEXT;
    tenant_default TEXT;
    system_default TEXT := 'en-US';
BEGIN
    -- Try user preference first
    SELECT preferred_locale INTO user_locale
    FROM user_localization_preferences
    WHERE user_id = p_user_id AND tenant_id = p_tenant_id;
    
    IF user_locale IS NOT NULL THEN
        RETURN user_locale;
    END IF;
    
    -- Try tenant default
    SELECT default_locale INTO tenant_default
    FROM tenants
    WHERE id = p_tenant_id;
    
    IF tenant_default IS NOT NULL THEN
        RETURN tenant_default;
    END IF;
    
    -- Return system default
    RETURN system_default;
END;
$$;

-- Function to auto-translate content
CREATE OR REPLACE FUNCTION auto_translate_content(
    p_content_type TEXT,
    p_content_id UUID,
    p_field_name TEXT,
    p_source_text TEXT,
    p_source_locale TEXT,
    p_target_locale TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    translation_id UUID;
    existing_translation TEXT;
BEGIN
    -- Check if translation already exists
    SELECT translated_text INTO existing_translation
    FROM content_translations
    WHERE content_type = p_content_type
    AND content_id = p_content_id
    AND field_name = p_field_name
    AND locale_code = p_target_locale;
    
    IF existing_translation IS NOT NULL THEN
        RETURN NULL; -- Translation already exists
    END IF;
    
    -- In a real implementation, this would call an external translation service
    -- For now, we'll just store the original text with a flag
    INSERT INTO content_translations (
        content_type, content_id, locale_code, field_name,
        translated_text, is_auto_translated, translation_quality,
        translation_source
    ) VALUES (
        p_content_type, p_content_id, p_target_locale, p_field_name,
        '[AUTO] ' || p_source_text, true, 0.7,
        'manual'
    ) RETURNING id INTO translation_id;
    
    RETURN translation_id;
END;
$$;

-- Function to convert currency
CREATE OR REPLACE FUNCTION convert_currency(
    p_amount NUMERIC,
    p_from_currency TEXT,
    p_to_currency TEXT,
    p_rate_date DATE DEFAULT CURRENT_DATE
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    exchange_rate NUMERIC;
    converted_amount NUMERIC;
BEGIN
    -- If currencies are the same, return original amount
    IF p_from_currency = p_to_currency THEN
        RETURN p_amount;
    END IF;
    
    -- Get exchange rate for the specified date (or most recent)
    SELECT er.exchange_rate INTO exchange_rate
    FROM currency_exchange_rates er
    WHERE er.from_currency = p_from_currency
    AND er.to_currency = p_to_currency
    AND er.rate_date <= p_rate_date
    AND er.is_active = true
    ORDER BY er.rate_date DESC
    LIMIT 1;
    
    -- If no direct rate found, try reverse rate
    IF exchange_rate IS NULL THEN
        SELECT 1.0 / er.exchange_rate INTO exchange_rate
        FROM currency_exchange_rates er
        WHERE er.from_currency = p_to_currency
        AND er.to_currency = p_from_currency
        AND er.rate_date <= p_rate_date
        AND er.is_active = true
        ORDER BY er.rate_date DESC
        LIMIT 1;
    END IF;
    
    -- If still no rate found, return original amount (or raise error in production)
    IF exchange_rate IS NULL THEN
        RETURN p_amount;
    END IF;
    
    converted_amount := p_amount * exchange_rate;
    RETURN ROUND(converted_amount, 2);
END;
$$;

-- Function to sync multi-region data
CREATE OR REPLACE FUNCTION process_multi_region_sync()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    processed_count INTEGER := 0;
    sync_record RECORD;
BEGIN
    -- Process pending sync records
    FOR sync_record IN 
        SELECT * FROM multi_region_sync 
        WHERE sync_status = 'pending'
        ORDER BY created_at ASC
        LIMIT 100 -- Process in batches
    LOOP
        -- Update status to syncing
        UPDATE multi_region_sync
        SET sync_status = 'syncing', last_sync_attempt = now()
        WHERE id = sync_record.id;
        
        -- In a real implementation, this would sync data to the target region
        -- For now, we'll just mark as completed after a delay simulation
        BEGIN
            -- Simulate sync operation
            -- This is where you would implement actual cross-region data synchronization
            
            -- Mark as completed
            UPDATE multi_region_sync
            SET sync_status = 'completed', completed_at = now()
            WHERE id = sync_record.id;
            
            processed_count := processed_count + 1;
            
        EXCEPTION WHEN OTHERS THEN
            -- Mark as failed and increment retry count
            UPDATE multi_region_sync
            SET 
                sync_status = CASE 
                    WHEN retry_count >= 5 THEN 'failed'
                    ELSE 'pending'
                END,
                retry_count = retry_count + 1,
                error_message = SQLERRM
            WHERE id = sync_record.id;
        END;
    END LOOP;
    
    RETURN processed_count;
END;
$$;

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_locales_updated_at BEFORE UPDATE ON locales
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_translations_updated_at BEFORE UPDATE ON translations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_regional_settings_updated_at BEFORE UPDATE ON regional_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_localization_preferences_updated_at BEFORE UPDATE ON user_localization_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_translations_updated_at BEFORE UPDATE ON content_translations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert supported locales
INSERT INTO locales (code, name, native_name, region, currency, date_format, time_format, number_format, units, is_rtl, flag_emoji) VALUES
('en-US', 'English (United States)', 'English', 'North America', 'USD', 'MM/dd/yyyy', '12h', 
 '{"decimal": ".", "thousands": ",", "precision": 2}',
 '{"area": "acres", "weight": "lbs", "temperature": "fahrenheit", "distance": "miles", "volume": "gallons"}',
 false, '🇺🇸'),
('en-GB', 'English (United Kingdom)', 'English', 'Europe', 'GBP', 'dd/MM/yyyy', '24h',
 '{"decimal": ".", "thousands": ",", "precision": 2}',
 '{"area": "hectares", "weight": "kg", "temperature": "celsius", "distance": "km", "volume": "liters"}',
 false, '🇬🇧'),
('es-ES', 'Spanish (Spain)', 'Español', 'Europe', 'EUR', 'dd/MM/yyyy', '24h',
 '{"decimal": ",", "thousands": ".", "precision": 2}',
 '{"area": "hectares", "weight": "kg", "temperature": "celsius", "distance": "km", "volume": "liters"}',
 false, '🇪🇸'),
('es-MX', 'Spanish (Mexico)', 'Español', 'North America', 'MXN', 'dd/MM/yyyy', '24h',
 '{"decimal": ".", "thousands": ",", "precision": 2}',
 '{"area": "hectares", "weight": "kg", "temperature": "celsius", "distance": "km", "volume": "liters"}',
 false, '🇲🇽'),
('pt-BR', 'Portuguese (Brazil)', 'Português', 'South America', 'BRL', 'dd/MM/yyyy', '24h',
 '{"decimal": ",", "thousands": ".", "precision": 2}',
 '{"area": "hectares", "weight": "kg", "temperature": "celsius", "distance": "km", "volume": "liters"}',
 false, '🇧🇷'),
('fr-FR', 'French (France)', 'Français', 'Europe', 'EUR', 'dd/MM/yyyy', '24h',
 '{"decimal": ",", "thousands": " ", "precision": 2}',
 '{"area": "hectares", "weight": "kg", "temperature": "celsius", "distance": "km", "volume": "liters"}',
 false, '🇫🇷'),
('de-DE', 'German (Germany)', 'Deutsch', 'Europe', 'EUR', 'dd.MM.yyyy', '24h',
 '{"decimal": ",", "thousands": ".", "precision": 2}',
 '{"area": "hectares", "weight": "kg", "temperature": "celsius", "distance": "km", "volume": "liters"}',
 false, '🇩🇪'),
('zh-CN', 'Chinese (Simplified)', '简体中文', 'Asia', 'CNY', 'yyyy/MM/dd', '24h',
 '{"decimal": ".", "thousands": ",", "precision": 2}',
 '{"area": "hectares", "weight": "kg", "temperature": "celsius", "distance": "km", "volume": "liters"}',
 false, '🇨🇳'),
('hi-IN', 'Hindi (India)', 'हिन्दी', 'Asia', 'INR', 'dd/MM/yyyy', '12h',
 '{"decimal": ".", "thousands": ",", "precision": 2}',
 '{"area": "hectares", "weight": "kg", "temperature": "celsius", "distance": "km", "volume": "liters"}',
 false, '🇮🇳'),
('ar-SA', 'Arabic (Saudi Arabia)', 'العربية', 'Middle East', 'SAR', 'dd/MM/yyyy', '12h',
 '{"decimal": ".", "thousands": ",", "precision": 2}',
 '{"area": "hectares", "weight": "kg", "temperature": "celsius", "distance": "km", "volume": "liters"}',
 true, '🇸🇦'),
('ja-JP', 'Japanese (Japan)', '日本語', 'Asia', 'JPY', 'yyyy/MM/dd', '24h',
 '{"decimal": ".", "thousands": ",", "precision": 0}',
 '{"area": "hectares", "weight": "kg", "temperature": "celsius", "distance": "km", "volume": "liters"}',
 false, '🇯🇵'),
('ko-KR', 'Korean (South Korea)', '한국어', 'Asia', 'KRW', 'yyyy. MM. dd.', '24h',
 '{"decimal": ".", "thousands": ",", "precision": 0}',
 '{"area": "hectares", "weight": "kg", "temperature": "celsius", "distance": "km", "volume": "liters"}',
 false, '🇰🇷')
ON CONFLICT (code) DO NOTHING;

-- Insert regional settings for major agricultural regions
INSERT INTO regional_settings (locale_code, growing_seasons, common_crops, weather_patterns, regulations, timezone, coordinates) VALUES
('en-US', 
 '["Spring", "Summer", "Fall"]',
 '["Corn", "Soybeans", "Wheat", "Cotton", "Rice"]',
 '["Tornado Season", "Hurricane Season", "Winter Freeze", "Drought"]',
 '["USDA Organic", "EPA Pesticide Regulations", "FDA Food Safety", "FSMA"]',
 'America/New_York',
 '{"lat": 39.8283, "lng": -98.5795}'),
('pt-BR',
 '["Verão", "Inverno", "Safra", "Safrinha"]',
 '["Soja", "Milho", "Café", "Cana-de-açúcar", "Algodão"]',
 '["Estação Seca", "Estação Chuvosa", "El Niño", "La Niña"]',
 '["MAPA Organic", "ANVISA Pesticides", "INCRA Land Use", "Forest Code"]',
 'America/Sao_Paulo',
 '{"lat": -14.2350, "lng": -51.9253}'),
('es-ES',
 '["Primavera", "Verano", "Otoño", "Invierno"]',
 '["Olivos", "Trigo", "Cebada", "Girasol", "Maíz"]',
 '["Sequía", "Lluvias Torrenciales", "Olas de Calor", "Granizo"]',
 '["EU Organic", "PAC Subsidies", "Nitrates Directive", "Water Framework Directive"]',
 'Europe/Madrid',
 '{"lat": 40.4637, "lng": -3.7492}')
ON CONFLICT (locale_code) DO NOTHING;

-- Add default locale column to tenants table if it doesn't exist
DO $$
BEGIN
    ALTER TABLE tenants ADD COLUMN IF NOT EXISTS default_locale TEXT DEFAULT 'en-US' REFERENCES locales(code);
EXCEPTION
    WHEN duplicate_column THEN
        RAISE NOTICE 'Column default_locale already exists in tenants table';
END $$;

-- Insert basic translations for common UI elements
INSERT INTO translations (locale_code, namespace, key, value) VALUES
-- Spanish translations
('es-ES', 'common', 'dashboard', 'Panel de Control'),
('es-ES', 'common', 'farm', 'Granja'),
('es-ES', 'common', 'crops', 'Cultivos'),
('es-ES', 'common', 'livestock', 'Ganado'),
('es-ES', 'common', 'financial_records', 'Registros Financieros'),
('es-ES', 'common', 'weather', 'Clima'),
('es-ES', 'common', 'save', 'Guardar'),
('es-ES', 'common', 'cancel', 'Cancelar'),
('es-ES', 'common', 'delete', 'Eliminar'),
('es-ES', 'common', 'edit', 'Editar'),
('es-ES', 'common', 'settings', 'Configuración'),
-- Portuguese translations
('pt-BR', 'common', 'dashboard', 'Painel de Controle'),
('pt-BR', 'common', 'farm', 'Fazenda'),
('pt-BR', 'common', 'crops', 'Culturas'),
('pt-BR', 'common', 'livestock', 'Gado'),
('pt-BR', 'common', 'financial_records', 'Registros Financeiros'),
('pt-BR', 'common', 'weather', 'Clima'),
('pt-BR', 'common', 'save', 'Salvar'),
('pt-BR', 'common', 'cancel', 'Cancelar'),
('pt-BR', 'common', 'delete', 'Excluir'),
('pt-BR', 'common', 'edit', 'Editar'),
('pt-BR', 'common', 'settings', 'Configurações')
ON CONFLICT (locale_code, namespace, key) DO NOTHING;

-- Insert sample currency exchange rates (in production, these would be updated regularly)
INSERT INTO currency_exchange_rates (from_currency, to_currency, exchange_rate, rate_date) VALUES
('USD', 'EUR', 0.85, CURRENT_DATE),
('USD', 'GBP', 0.75, CURRENT_DATE),
('USD', 'BRL', 5.2, CURRENT_DATE),
('USD', 'MXN', 18.5, CURRENT_DATE),
('USD', 'CNY', 7.2, CURRENT_DATE),
('USD', 'INR', 83.0, CURRENT_DATE),
('USD', 'JPY', 150.0, CURRENT_DATE),
('USD', 'KRW', 1320.0, CURRENT_DATE),
('USD', 'SAR', 3.75, CURRENT_DATE),
('EUR', 'USD', 1.18, CURRENT_DATE),
('GBP', 'USD', 1.33, CURRENT_DATE),
('BRL', 'USD', 0.19, CURRENT_DATE)
ON CONFLICT (from_currency, to_currency, rate_date) DO NOTHING;

-- Create indexes for performance optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_translations_locale_key 
ON translations (locale_code, key) WHERE key IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_content_translations_content_locale 
ON content_translations (content_type, content_id, locale_code);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_locale_prefs_user_tenant 
ON user_localization_preferences (user_id, tenant_id);

-- Comments for documentation
COMMENT ON TABLE locales IS 'Supported languages and regional configurations';
COMMENT ON TABLE translations IS 'UI text translations for all supported languages';
COMMENT ON TABLE regional_settings IS 'Agriculture-specific regional data and preferences';
COMMENT ON TABLE user_localization_preferences IS 'Per-user language and formatting preferences';
COMMENT ON TABLE content_translations IS 'Translations of user-generated content';
COMMENT ON TABLE multi_region_sync IS 'Cross-region data synchronization tracking';
COMMENT ON TABLE currency_exchange_rates IS 'Currency exchange rates for multi-currency support';

-- Schedule automated functions (requires pg_cron extension)
-- SELECT cron.schedule('process-multi-region-sync', '*/5 * * * *', 'SELECT process_multi_region_sync();');
-- SELECT cron.schedule('update-exchange-rates', '0 6 * * *', 'SELECT update_exchange_rates();'); -- Would need to implement this function

COMMIT;