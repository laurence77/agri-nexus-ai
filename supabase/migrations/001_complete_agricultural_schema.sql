-- Complete Agricultural Platform Database Schema
-- Multi-tenant SaaS with comprehensive agricultural management features

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "timescaledb";

-- Custom ENUM types for agricultural operations
CREATE TYPE tenant_tier AS ENUM ('free', 'basic', 'professional', 'enterprise');
CREATE TYPE agricultural_role AS ENUM (
  'farm_owner', 'farm_manager', 'field_manager', 'agronomist',
  'field_worker', 'equipment_operator', 'supervisor', 
  'cooperative_admin', 'cooperative_member', 'input_supplier',
  'buyer', 'aggregator', 'system_admin', 'super_admin'
);
CREATE TYPE crop_status AS ENUM ('planned', 'planted', 'growing', 'flowering', 'harvesting', 'harvested', 'failed');
CREATE TYPE activity_type AS ENUM ('planting', 'irrigation', 'fertilization', 'spraying', 'weeding', 'harvesting', 'inspection');
CREATE TYPE transaction_type AS ENUM ('input_purchase', 'equipment_rental', 'labor_payment', 'crop_sale', 'loan_payment', 'insurance_payment');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE listing_status AS ENUM ('active', 'sold', 'expired', 'suspended');

-- 1. TENANT MANAGEMENT (Multi-tenant architecture)
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  subdomain VARCHAR(100) UNIQUE,
  tier tenant_tier DEFAULT 'free',
  country_code VARCHAR(3) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  timezone VARCHAR(50) DEFAULT 'UTC',
  settings JSONB DEFAULT '{}'::jsonb,
  subscription_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USER PROFILES (Multi-role support)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  phone_number VARCHAR(20),
  role agricultural_role NOT NULL,
  language_preference VARCHAR(10) DEFAULT 'en',
  avatar_url TEXT,
  permissions JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tenant_id)
);

-- 3. COOPERATIVES
CREATE TABLE cooperatives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  registration_number VARCHAR(100),
  admin_id UUID REFERENCES profiles(id),
  contact_person VARCHAR(255),
  contact_phone VARCHAR(20),
  address TEXT,
  location POINT,
  member_count INTEGER DEFAULT 0,
  total_area_hectares DECIMAL(12,2),
  founded_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. FARMS
CREATE TABLE farms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  farm_code VARCHAR(20) UNIQUE,
  location POINT,
  address TEXT,
  area_hectares DECIMAL(10,2),
  farm_type VARCHAR(100),
  owner_id UUID REFERENCES profiles(id),
  manager_id UUID REFERENCES profiles(id),
  cooperative_id UUID REFERENCES cooperatives(id),
  established_date DATE,
  certification_types TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. FIELDS
CREATE TABLE fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  field_code VARCHAR(20),
  polygon POLYGON,
  area_hectares DECIMAL(8,2),
  soil_type VARCHAR(100),
  ph_level DECIMAL(3,1),
  slope_percentage DECIMAL(5,2),
  irrigation_type VARCHAR(100),
  field_manager_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CROPS
CREATE TABLE crops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  field_id UUID REFERENCES fields(id) ON DELETE CASCADE,
  crop_type VARCHAR(100) NOT NULL,
  variety VARCHAR(100),
  planting_date DATE,
  expected_harvest_date DATE,
  actual_harvest_date DATE,
  expected_yield_kg DECIMAL(10,2),
  actual_yield_kg DECIMAL(10,2),
  status crop_status DEFAULT 'planned',
  health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ACTIVITIES
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  crop_id UUID REFERENCES crops(id) ON DELETE CASCADE,
  performed_by UUID REFERENCES profiles(id),
  supervised_by UUID REFERENCES profiles(id),
  activity_type activity_type NOT NULL,
  description TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  location POINT,
  inputs_used JSONB,
  measurements JSONB,
  cost DECIMAL(10,2),
  duration_hours DECIMAL(4,1),
  weather_conditions TEXT,
  photos TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SENSOR READINGS
CREATE TABLE sensor_readings (
  id UUID DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  field_id UUID REFERENCES fields(id) ON DELETE CASCADE,
  sensor_id VARCHAR(100) NOT NULL,
  sensor_type VARCHAR(50) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  value DOUBLE PRECISION NOT NULL,
  unit VARCHAR(20),
  location POINT,
  battery_level INTEGER,
  signal_strength INTEGER,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id, timestamp)
);

-- 9. INVENTORY
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  farm_id UUID REFERENCES farms(id),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL, -- seeds, fertilizers, pesticides, equipment
  subcategory VARCHAR(100),
  current_quantity DECIMAL(10,2),
  unit VARCHAR(20),
  unit_cost DECIMAL(10,2),
  supplier_name VARCHAR(255),
  batch_number VARCHAR(100),
  expiry_date DATE,
  minimum_threshold DECIMAL(10,2),
  location_in_farm TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. EQUIPMENT
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  farm_id UUID REFERENCES farms(id),
  name VARCHAR(255) NOT NULL,
  equipment_type VARCHAR(100),
  brand VARCHAR(100),
  model VARCHAR(100),
  serial_number VARCHAR(100),
  purchase_date DATE,
  purchase_cost DECIMAL(12,2),
  current_value DECIMAL(12,2),
  status VARCHAR(50) DEFAULT 'operational', -- operational, maintenance, broken, sold
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  operator_id UUID REFERENCES profiles(id),
  location POINT,
  usage_hours DECIMAL(8,1),
  fuel_type VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. MARKETPLACE
CREATE TABLE marketplace_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES profiles(id),
  farm_id UUID REFERENCES farms(id),
  product_type VARCHAR(100) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  description TEXT,
  quantity DECIMAL(10,2),
  unit VARCHAR(20),
  price_per_unit DECIMAL(10,2),
  currency VARCHAR(3),
  total_value DECIMAL(12,2),
  location POINT,
  quality_grade VARCHAR(20),
  certification_type VARCHAR(100),
  harvest_date DATE,
  availability_date DATE,
  expiry_date DATE,
  photos TEXT[],
  status listing_status DEFAULT 'active',
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. ORDERS
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES marketplace_listings(id),
  buyer_id UUID REFERENCES profiles(id),
  seller_id UUID REFERENCES profiles(id),
  quantity_ordered DECIMAL(10,2),
  unit_price DECIMAL(10,2),
  total_amount DECIMAL(12,2),
  currency VARCHAR(3),
  delivery_address TEXT,
  delivery_date DATE,
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'pending',
  order_status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, shipped, delivered, cancelled
  tracking_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. TRANSACTIONS
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  payer_id UUID REFERENCES profiles(id),
  payee_id UUID REFERENCES profiles(id),
  order_id UUID REFERENCES orders(id),
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  transaction_type transaction_type NOT NULL,
  payment_method VARCHAR(50), -- mpesa, mtn_momo, airtel_money, bank_transfer
  external_transaction_id VARCHAR(100),
  provider_response JSONB,
  status transaction_status DEFAULT 'pending',
  processed_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. CREDIT MANAGEMENT
CREATE TABLE credit_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  farmer_id UUID REFERENCES profiles(id),
  credit_limit DECIMAL(12,2),
  current_balance DECIMAL(12,2) DEFAULT 0,
  interest_rate DECIMAL(5,2),
  payment_due_date DATE,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. WEATHER DATA
CREATE TABLE weather_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  location POINT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  temperature DECIMAL(4,1),
  humidity DECIMAL(4,1),
  rainfall DECIMAL(6,2),
  wind_speed DECIMAL(5,2),
  wind_direction INTEGER,
  pressure DECIMAL(6,2),
  uv_index DECIMAL(3,1),
  weather_condition VARCHAR(100),
  forecast_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX idx_profiles_tenant_role ON profiles(tenant_id, role);
CREATE INDEX idx_farms_tenant_owner ON farms(tenant_id, owner_id);
CREATE INDEX idx_fields_farm ON fields(farm_id);
CREATE INDEX idx_crops_field_status ON crops(field_id, status);
CREATE INDEX idx_activities_crop_timestamp ON activities(crop_id, timestamp DESC);
CREATE INDEX idx_sensor_readings_field_timestamp ON sensor_readings(field_id, timestamp DESC);
CREATE INDEX idx_transactions_tenant_status ON transactions(tenant_id, status);
CREATE INDEX idx_marketplace_location ON marketplace_listings USING GIST(location);

-- Helper functions for RLS
CREATE OR REPLACE FUNCTION auth.get_tenant_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN (
    SELECT tenant_id 
    FROM profiles 
    WHERE user_id = auth.uid()
    LIMIT 1
  );
END;
$$;

CREATE OR REPLACE FUNCTION auth.get_user_role()
RETURNS agricultural_role
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN (
    SELECT role
    FROM profiles 
    WHERE user_id = auth.uid() AND tenant_id = auth.get_tenant_id()
    LIMIT 1
  );
END;
$$;

-- Enable Row Level Security
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_data ENABLE ROW LEVEL SECURITY;

-- Core RLS Policies for tenant isolation
CREATE POLICY "Tenant isolation" ON farms
FOR ALL TO authenticated 
USING (tenant_id = auth.get_tenant_id())
WITH CHECK (tenant_id = auth.get_tenant_id());

CREATE POLICY "Field access" ON fields
FOR ALL TO authenticated 
USING (tenant_id = auth.get_tenant_id())
WITH CHECK (tenant_id = auth.get_tenant_id());

CREATE POLICY "Crop access" ON crops
FOR ALL TO authenticated 
USING (tenant_id = auth.get_tenant_id())
WITH CHECK (tenant_id = auth.get_tenant_id());

CREATE POLICY "Activity access" ON activities
FOR ALL TO authenticated 
USING (tenant_id = auth.get_tenant_id())
WITH CHECK (tenant_id = auth.get_tenant_id());

CREATE POLICY "Sensor data access" ON sensor_readings
FOR ALL TO authenticated 
USING (tenant_id = auth.get_tenant_id())
WITH CHECK (tenant_id = auth.get_tenant_id());

CREATE POLICY "Inventory access" ON inventory_items
FOR ALL TO authenticated 
USING (tenant_id = auth.get_tenant_id())
WITH CHECK (tenant_id = auth.get_tenant_id());

CREATE POLICY "Equipment access" ON equipment
FOR ALL TO authenticated 
USING (tenant_id = auth.get_tenant_id())
WITH CHECK (tenant_id = auth.get_tenant_id());

CREATE POLICY "Marketplace access" ON marketplace_listings
FOR ALL TO authenticated 
USING (tenant_id = auth.get_tenant_id())
WITH CHECK (tenant_id = auth.get_tenant_id());

CREATE POLICY "Order access" ON orders
FOR ALL TO authenticated 
USING (tenant_id = auth.get_tenant_id())
WITH CHECK (tenant_id = auth.get_tenant_id());

CREATE POLICY "Weather data access" ON weather_data
FOR ALL TO authenticated 
USING (tenant_id = auth.get_tenant_id())
WITH CHECK (tenant_id = auth.get_tenant_id());

-- Role-based access for sensitive data
CREATE POLICY "Admin transaction access" ON transactions
FOR ALL TO authenticated 
USING (
  tenant_id = auth.get_tenant_id() AND
  (auth.get_user_role() IN ('system_admin', 'farm_manager', 'cooperative_admin'))
)
WITH CHECK (
  tenant_id = auth.get_tenant_id() AND
  (auth.get_user_role() IN ('system_admin', 'farm_manager', 'cooperative_admin'))
);

CREATE POLICY "Credit account access" ON credit_accounts
FOR ALL TO authenticated 
USING (
  tenant_id = auth.get_tenant_id() AND
  (auth.get_user_role() IN ('system_admin', 'farm_manager', 'cooperative_admin') OR farmer_id = (SELECT id FROM profiles WHERE user_id = auth.uid()))
)
WITH CHECK (
  tenant_id = auth.get_tenant_id() AND
  (auth.get_user_role() IN ('system_admin', 'farm_manager', 'cooperative_admin'))
);

-- Profile access policies
CREATE POLICY "Profile access" ON profiles
FOR ALL TO authenticated 
USING (
  tenant_id = auth.get_tenant_id() AND
  (user_id = auth.uid() OR auth.get_user_role() IN ('system_admin', 'farm_manager', 'cooperative_admin'))
)
WITH CHECK (
  tenant_id = auth.get_tenant_id() AND
  (user_id = auth.uid() OR auth.get_user_role() IN ('system_admin', 'farm_manager', 'cooperative_admin'))
);

-- Tenant access (only super admins can see all tenants)
CREATE POLICY "Tenant access" ON tenants
FOR ALL TO authenticated 
USING (
  id = auth.get_tenant_id() OR 
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'super_admin')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'super_admin')
);

-- 16. ANALYTICS VIEWS
CREATE MATERIALIZED VIEW farm_analytics AS
SELECT 
  f.tenant_id,
  f.id as farm_id,
  f.name as farm_name,
  f.area_hectares,
  COUNT(DISTINCT fi.id) as field_count,
  COUNT(DISTINCT c.id) as crop_count,
  SUM(c.actual_yield_kg) as total_yield_kg,
  AVG(c.health_score) as avg_health_score,
  COUNT(DISTINCT CASE WHEN c.status = 'harvested' THEN c.id END) as harvested_crops,
  SUM(CASE WHEN t.transaction_type = 'crop_sale' THEN t.amount ELSE 0 END) as total_revenue
FROM farms f
LEFT JOIN fields fi ON f.id = fi.farm_id
LEFT JOIN crops c ON fi.id = c.field_id
LEFT JOIN orders o ON o.seller_id IN (SELECT id FROM profiles WHERE tenant_id = f.tenant_id)
LEFT JOIN transactions t ON o.id = t.order_id
GROUP BY f.tenant_id, f.id, f.name, f.area_hectares;

-- Create TimescaleDB hypertable for sensor data
SELECT create_hypertable('sensor_readings', 'timestamp', if_not_exists => TRUE);

-- Insert demo tenants and users
INSERT INTO tenants (name, subdomain, country_code, currency, timezone) VALUES
('AgriTech Kenya', 'agritech-ke', 'KEN', 'KES', 'Africa/Nairobi'),
('SmartFarm Uganda', 'smartfarm-ug', 'UGA', 'UGX', 'Africa/Kampala'),
('GreenField Ghana', 'greenfield-gh', 'GHA', 'GHS', 'Africa/Accra');