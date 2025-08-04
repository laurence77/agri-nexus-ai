// Complete TypeScript interfaces for Agricultural Management Platform

export type TenantTier = 'free' | 'basic' | 'professional' | 'enterprise';

export type AgriculturalRole = 
  | 'farm_owner' 
  | 'farm_manager' 
  | 'field_manager' 
  | 'agronomist'
  | 'field_worker' 
  | 'equipment_operator' 
  | 'supervisor'
  | 'cooperative_admin' 
  | 'cooperative_member' 
  | 'input_supplier'
  | 'buyer' 
  | 'aggregator' 
  | 'system_admin' 
  | 'super_admin';

export type CropStatus = 'planned' | 'planted' | 'growing' | 'flowering' | 'harvesting' | 'harvested' | 'failed';

export type ActivityType = 'planting' | 'irrigation' | 'fertilization' | 'spraying' | 'weeding' | 'harvesting' | 'inspection';

export type TransactionType = 'input_purchase' | 'equipment_rental' | 'labor_payment' | 'crop_sale' | 'loan_payment' | 'insurance_payment';

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export type ListingStatus = 'active' | 'sold' | 'expired' | 'suspended';

export interface Tenant {
  id: string;
  name: string;
  subdomain?: string;
  tier: TenantTier;
  country_code: string;
  currency: string;
  timezone: string;
  settings: Record<string, any>;
  subscription_ends_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  tenant_id: string;
  email: string;
  full_name?: string;
  phone_number?: string;
  role: AgriculturalRole;
  language_preference: string;
  avatar_url?: string;
  permissions: Record<string, boolean>;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Cooperative {
  id: string;
  tenant_id: string;
  name: string;
  registration_number?: string;
  admin_id?: string;
  contact_person?: string;
  contact_phone?: string;
  address?: string;
  location?: [number, number]; // [longitude, latitude]
  member_count: number;
  total_area_hectares?: number;
  founded_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Farm {
  id: string;
  tenant_id: string;
  name: string;
  farm_code?: string;
  location?: [number, number]; // [longitude, latitude]
  address?: string;
  area_hectares?: number;
  farm_type?: string;
  owner_id?: string;
  manager_id?: string;
  cooperative_id?: string;
  established_date?: string;
  certification_types?: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  // Relations
  owner?: Profile;
  manager?: Profile;
  cooperative?: Cooperative;
  fields?: Field[];
}

export interface Field {
  id: string;
  tenant_id: string;
  farm_id: string;
  name: string;
  field_code?: string;
  polygon?: number[][]; // Array of [longitude, latitude] coordinates
  area_hectares?: number;
  soil_type?: string;
  ph_level?: number;
  slope_percentage?: number;
  irrigation_type?: string;
  field_manager_id?: string;
  created_at: string;
  updated_at: string;
  // Relations
  farm?: Farm;
  field_manager?: Profile;
  crops?: Crop[];
}

export interface Crop {
  id: string;
  tenant_id: string;
  field_id: string;
  crop_type: string;
  variety?: string;
  planting_date?: string;
  expected_harvest_date?: string;
  actual_harvest_date?: string;
  expected_yield_kg?: number;
  actual_yield_kg?: number;
  status: CropStatus;
  health_score?: number; // 0-100
  created_at: string;
  updated_at: string;
  // Relations
  field?: Field;
  activities?: Activity[];
}

export interface Activity {
  id: string;
  tenant_id: string;
  crop_id: string;
  performed_by?: string;
  supervised_by?: string;
  activity_type: ActivityType;
  description?: string;
  timestamp: string;
  location?: [number, number]; // [longitude, latitude]
  inputs_used?: Record<string, any>;
  measurements?: Record<string, any>;
  cost?: number;
  duration_hours?: number;
  weather_conditions?: string;
  photos?: string[];
  notes?: string;
  created_at: string;
  // Relations
  crop?: Crop;
  performer?: Profile;
  supervisor?: Profile;
}

export interface SensorReading {
  id: string;
  tenant_id: string;
  field_id: string;
  sensor_id: string;
  sensor_type: string;
  timestamp: string;
  value: number;
  unit?: string;
  location?: [number, number]; // [longitude, latitude]
  battery_level?: number;
  signal_strength?: number;
  metadata?: Record<string, any>;
  created_at: string;
  // Relations
  field?: Field;
}

export interface InventoryItem {
  id: string;
  tenant_id: string;
  farm_id?: string;
  name: string;
  category: string; // seeds, fertilizers, pesticides, equipment
  subcategory?: string;
  current_quantity?: number;
  unit?: string;
  unit_cost?: number;
  supplier_name?: string;
  batch_number?: string;
  expiry_date?: string;
  minimum_threshold?: number;
  location_in_farm?: string;
  created_at: string;
  updated_at: string;
  // Relations
  farm?: Farm;
}

export interface Equipment {
  id: string;
  tenant_id: string;
  farm_id?: string;
  name: string;
  equipment_type?: string;
  brand?: string;
  model?: string;
  serial_number?: string;
  purchase_date?: string;
  purchase_cost?: number;
  current_value?: number;
  status: string; // operational, maintenance, broken, sold
  last_maintenance_date?: string;
  next_maintenance_date?: string;
  operator_id?: string;
  location?: [number, number]; // [longitude, latitude]
  usage_hours?: number;
  fuel_type?: string;
  created_at: string;
  updated_at: string;
  // Relations
  farm?: Farm;
  operator?: Profile;
}

export interface MarketplaceListing {
  id: string;
  tenant_id: string;
  seller_id?: string;
  farm_id?: string;
  product_type: string;
  product_name: string;
  description?: string;
  quantity?: number;
  unit?: string;
  price_per_unit?: number;
  currency?: string;
  total_value?: number;
  location?: [number, number]; // [longitude, latitude]
  quality_grade?: string;
  certification_type?: string;
  harvest_date?: string;
  availability_date?: string;
  expiry_date?: string;
  photos?: string[];
  status: ListingStatus;
  views_count: number;
  created_at: string;
  updated_at: string;
  // Relations
  seller?: Profile;
  farm?: Farm;
}

export interface Order {
  id: string;
  tenant_id: string;
  listing_id?: string;
  buyer_id?: string;
  seller_id?: string;
  quantity_ordered?: number;
  unit_price?: number;
  total_amount?: number;
  currency?: string;
  delivery_address?: string;
  delivery_date?: string;
  payment_method?: string;
  payment_status: string;
  order_status: string; // pending, confirmed, shipped, delivered, cancelled
  tracking_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Relations
  listing?: MarketplaceListing;
  buyer?: Profile;
  seller?: Profile;
}

export interface Transaction {
  id: string;
  tenant_id: string;
  payer_id?: string;
  payee_id?: string;
  order_id?: string;
  amount: number;
  currency: string;
  transaction_type: TransactionType;
  payment_method?: string; // mpesa, mtn_momo, airtel_money, bank_transfer
  external_transaction_id?: string;
  provider_response?: Record<string, any>;
  status: TransactionStatus;
  processed_at?: string;
  metadata?: Record<string, any>;
  created_at: string;
  // Relations
  payer?: Profile;
  payee?: Profile;
  order?: Order;
}

export interface CreditAccount {
  id: string;
  tenant_id: string;
  farmer_id?: string;
  credit_limit?: number;
  current_balance: number;
  interest_rate?: number;
  payment_due_date?: string;
  status: string;
  created_at: string;
  updated_at: string;
  // Relations
  farmer?: Profile;
}

export interface WeatherData {
  id: string;
  tenant_id: string;
  location: [number, number]; // [longitude, latitude]
  timestamp: string;
  temperature?: number;
  humidity?: number;
  rainfall?: number;
  wind_speed?: number;
  wind_direction?: number;
  pressure?: number;
  uv_index?: number;
  weather_condition?: string;
  forecast_data?: Record<string, any>;
  created_at: string;
}

// Additional interfaces for enhanced functionality
export interface FarmAnalytics {
  tenant_id: string;
  farm_id: string;
  farm_name: string;
  area_hectares?: number;
  field_count: number;
  crop_count: number;
  total_yield_kg?: number;
  avg_health_score?: number;
  harvested_crops: number;
  total_revenue?: number;
}

export interface DashboardMetrics {
  total_farms: number;
  total_fields: number;
  active_crops: number;
  recent_activities: number;
  pending_orders: number;
  total_revenue: number;
  weather_alerts: number;
  equipment_maintenance_due: number;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Mobile money payment interfaces
export interface MobileMoneyRequest {
  phone_number: string;
  amount: number;
  currency: string;
  reference: string;
  description?: string;
  provider: 'mpesa' | 'mtn_momo' | 'airtel_money';
}

export interface MobileMoneyResponse {
  transaction_id: string;
  status: 'pending' | 'completed' | 'failed';
  provider_reference?: string;
  message?: string;
}

// Voice and USSD interfaces
export interface USSDSession {
  session_id: string;
  phone_number: string;
  text: string;
  level: number;
  user_data?: Record<string, any>;
}

export interface VoiceCommand {
  command: string;
  language: 'en' | 'sw' | 'ha' | 'yo' | 'fr';
  confidence: number;
  parameters?: Record<string, any>;
}

// Notification interfaces
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  created_at: string;
  action_url?: string;
  metadata?: Record<string, any>;
}

export interface WeatherAlert {
  id: string;
  location: [number, number];
  alert_type: 'rain' | 'drought' | 'storm' | 'frost' | 'heat';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  start_time: string;
  end_time?: string;
  affected_farms: string[];
}

// Dashboard-specific interfaces
export interface FarmMetrics {
  totalFarms: number;
  totalFields: number;
  totalCrops: number;
  harvestedCrops: number;
  totalYieldKg: number;
  averageHealthScore: number;
  totalRevenue: number;
  activeWorkers: number;
}

export interface CropHealthMetrics {
  cropId: string;
  cropType: string;
  fieldName: string;
  healthScore: number;
  status: CropStatus;
  daysToHarvest?: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export interface WeatherForecast {
  date: string;
  temperature_max: number;
  temperature_min: number;
  humidity: number;
  rainfall_probability: number;
  wind_speed: number;
  weather_condition: string;
  icon: string;
}

export interface MarketPrice {
  commodity: string;
  price: number;
  currency: string;
  unit: string;
  market: string;
  date: string;
  change_percentage: number;
  trend: 'up' | 'down' | 'stable';
}

// Role-based permissions
export const ROLE_PERMISSIONS: Record<AgriculturalRole, string[]> = {
  farm_owner: [
    'farms.read', 'farms.write',
    'fields.read', 'fields.write',
    'crops.read', 'crops.write',
    'activities.read', 'activities.write',
    'equipment.read', 'equipment.write',
    'inventory.read', 'inventory.write',
    'marketplace.read', 'marketplace.write',
    'reports.read'
  ],
  farm_manager: [
    'farms.read', 'farms.write',
    'fields.read', 'fields.write',
    'crops.read', 'crops.write',
    'activities.read', 'activities.write',
    'equipment.read', 'equipment.write',
    'inventory.read', 'inventory.write',
    'workers.read', 'workers.write',
    'marketplace.read', 'marketplace.write',
    'reports.read', 'reports.write'
  ],
  field_manager: [
    'fields.read', 'fields.write',
    'crops.read', 'crops.write',
    'activities.read', 'activities.write',
    'inventory.read',
    'workers.read'
  ],
  agronomist: [
    'fields.read',
    'crops.read', 'crops.write',
    'activities.read', 'activities.write',
    'reports.read', 'reports.write'
  ],
  field_worker: [
    'fields.read',
    'crops.read',
    'activities.read', 'activities.write',
    'equipment.read'
  ],
  equipment_operator: [
    'equipment.read', 'equipment.write',
    'activities.read', 'activities.write'
  ],
  supervisor: [
    'fields.read',
    'crops.read',
    'activities.read', 'activities.write',
    'workers.read',
    'equipment.read'
  ],
  cooperative_admin: [
    'farms.read', 'farms.write',
    'fields.read', 'fields.write',
    'crops.read', 'crops.write',
    'activities.read', 'activities.write',
    'workers.read', 'workers.write',
    'marketplace.read', 'marketplace.write',
    'reports.read', 'reports.write',
    'cooperatives.read', 'cooperatives.write'
  ],
  cooperative_member: [
    'farms.read',
    'fields.read',
    'crops.read',
    'activities.read',
    'marketplace.read',
    'reports.read'
  ],
  input_supplier: [
    'marketplace.read', 'marketplace.write',
    'inventory.read',
    'orders.read', 'orders.write'
  ],
  buyer: [
    'marketplace.read',
    'orders.read', 'orders.write'
  ],
  aggregator: [
    'farms.read',
    'crops.read',
    'marketplace.read', 'marketplace.write',
    'orders.read', 'orders.write',
    'reports.read'
  ],
  system_admin: [
    'farms.read', 'farms.write', 'farms.delete',
    'fields.read', 'fields.write', 'fields.delete',
    'crops.read', 'crops.write', 'crops.delete',
    'activities.read', 'activities.write', 'activities.delete',
    'workers.read', 'workers.write', 'workers.delete',
    'equipment.read', 'equipment.write', 'equipment.delete',
    'inventory.read', 'inventory.write', 'inventory.delete',
    'marketplace.read', 'marketplace.write', 'marketplace.delete',
    'orders.read', 'orders.write', 'orders.delete',
    'transactions.read', 'transactions.write',
    'reports.read', 'reports.write',
    'system.read', 'system.write',
    'audit.read'
  ],
  super_admin: [
    'tenants.read', 'tenants.write', 'tenants.delete',
    'farms.read', 'farms.write', 'farms.delete',
    'fields.read', 'fields.write', 'fields.delete',
    'crops.read', 'crops.write', 'crops.delete',
    'activities.read', 'activities.write', 'activities.delete',
    'workers.read', 'workers.write', 'workers.delete',
    'equipment.read', 'equipment.write', 'equipment.delete',
    'inventory.read', 'inventory.write', 'inventory.delete',
    'marketplace.read', 'marketplace.write', 'marketplace.delete',
    'orders.read', 'orders.write', 'orders.delete',
    'transactions.read', 'transactions.write', 'transactions.delete',
    'reports.read', 'reports.write', 'reports.delete',
    'system.read', 'system.write', 'system.config',
    'audit.read', 'audit.write'
  ]
};

// Helper function to check permissions
export function hasPermission(userRole: AgriculturalRole, permission: string): boolean {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
}

// Dashboard configuration by role
export interface DashboardConfig {
  role: AgriculturalRole;
  defaultRoute: string;
  availableModules: string[];
  restrictions: string[];
}

export const DASHBOARD_CONFIGS: Record<AgriculturalRole, DashboardConfig> = {
  farm_owner: {
    role: 'farm_owner',
    defaultRoute: '/dashboard/overview',
    availableModules: ['overview', 'fields', 'crops', 'equipment', 'inventory', 'marketplace', 'reports', 'weather'],
    restrictions: []
  },
  farm_manager: {
    role: 'farm_manager',
    defaultRoute: '/dashboard/management',
    availableModules: ['management', 'fields', 'crops', 'workers', 'equipment', 'inventory', 'marketplace', 'reports', 'analytics'],
    restrictions: []
  },
  field_worker: {
    role: 'field_worker',
    defaultRoute: '/dashboard/tasks',
    availableModules: ['tasks', 'checkin', 'crops', 'activities', 'weather'],
    restrictions: ['no_delete', 'no_admin_access']
  },
  agronomist: {
    role: 'agronomist',
    defaultRoute: '/dashboard/advisory',
    availableModules: ['advisory', 'crops', 'health', 'recommendations', 'reports'],
    restrictions: ['no_financial_data']
  },
  system_admin: {
    role: 'system_admin',
    defaultRoute: '/admin/overview',
    availableModules: ['overview', 'users', 'farms', 'system', 'reports', 'audit', 'settings'],
    restrictions: []
  },
  super_admin: {
    role: 'super_admin',
    defaultRoute: '/super-admin/tenants',
    availableModules: ['tenants', 'users', 'farms', 'billing', 'analytics', 'system', 'audit'],
    restrictions: []
  },
  // Add remaining roles...
  field_manager: {
    role: 'field_manager',
    defaultRoute: '/dashboard/fields',
    availableModules: ['fields', 'crops', 'activities', 'workers'],
    restrictions: ['no_financial_data']
  },
  equipment_operator: {
    role: 'equipment_operator',
    defaultRoute: '/dashboard/equipment',
    availableModules: ['equipment', 'maintenance', 'activities'],
    restrictions: ['equipment_only']
  },
  supervisor: {
    role: 'supervisor',
    defaultRoute: '/dashboard/supervision',
    availableModules: ['supervision', 'workers', 'activities', 'reports'],
    restrictions: ['no_financial_data']
  },
  cooperative_admin: {
    role: 'cooperative_admin',
    defaultRoute: '/coop/dashboard',
    availableModules: ['dashboard', 'members', 'farms', 'marketplace', 'reports'],
    restrictions: []
  },
  cooperative_member: {
    role: 'cooperative_member',
    defaultRoute: '/coop/member',
    availableModules: ['member', 'marketplace', 'reports'],
    restrictions: ['read_only']
  },
  input_supplier: {
    role: 'input_supplier',
    defaultRoute: '/supplier/inventory',
    availableModules: ['inventory', 'marketplace', 'orders'],
    restrictions: ['supplier_only']
  },
  buyer: {
    role: 'buyer',
    defaultRoute: '/buyer/marketplace',
    availableModules: ['marketplace', 'orders', 'transactions'],
    restrictions: ['buyer_only']
  },
  aggregator: {
    role: 'aggregator',
    defaultRoute: '/aggregator/overview',
    availableModules: ['overview', 'farms', 'marketplace', 'logistics'],
    restrictions: ['aggregator_only']
  }
};