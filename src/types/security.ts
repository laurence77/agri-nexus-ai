export interface UserActivityLog {
  id: string;
  user_id: string;
  tenant_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  success: boolean;
  error_message?: string;
  timestamp: string;
  created_at: string;
}

export interface SecuritySettings {
  id: string;
  tenant_id: string;
  max_login_attempts: number;
  lockout_duration_minutes: number;
  password_min_length: number;
  password_require_special_chars: boolean;
  session_timeout_hours: number;
  enable_2fa: boolean;
  allowed_ip_ranges?: string[];
  geo_restrictions?: {
    allowed_countries: string[];
    allowed_regions: { name: string; bounds: GPSBounds }[];
  };
  data_retention_days: number;
  auto_logout_inactive_hours: number;
  encryption_enabled: boolean;
  audit_log_retention_days: number;
  suspicious_activity_threshold: number;
  created_at: string;
  updated_at: string;
}

export interface GPSBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface EncryptedField {
  encrypted_value: string;
  field_name: string;
  encryption_method: 'AES-256' | 'RSA';
  created_at: string;
}

export interface DataExportRequest {
  id: string;
  user_id: string;
  tenant_id: string;
  export_type: 'full' | 'profile' | 'financial' | 'agricultural';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  file_url?: string;
  file_size?: number;
  expires_at: string;
  requested_at: string;
  completed_at?: string;
  error_message?: string;
}

export interface BackupSchedule {
  id: string;
  tenant_id: string;
  backup_type: 'full' | 'incremental' | 'differential';
  frequency: 'daily' | 'weekly' | 'monthly';
  scheduled_time: string; // HH:MM format
  last_backup_at?: string;
  next_backup_at: string;
  backup_location: 'local' | 's3' | 'gcs' | 'azure';
  encryption_enabled: boolean;
  retention_days: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SecurityIncident {
  id: string;
  tenant_id: string;
  user_id?: string;
  incident_type: 'brute_force' | 'suspicious_activity' | 'data_breach' | 'unauthorized_access' | 'system_compromise';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'detected' | 'investigating' | 'contained' | 'resolved' | 'false_positive';
  description: string;
  detected_at: string;
  resolved_at?: string;
  affected_resources: string[];
  mitigation_steps: string[];
  metadata: Record<string, any>;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

export interface PermissionSet {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  is_system: boolean; // Cannot be deleted if true
  tenant_id?: string; // null for system-wide permission sets
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  tenant_id: string;
  role_name: string;
  permission_set_id: string;
  granted_by: string;
  granted_at: string;
  expires_at?: string;
  is_active: boolean;
  metadata?: Record<string, any>;
}

export interface AccessRequest {
  id: string;
  user_id: string;
  tenant_id: string;
  requested_permission: string;
  resource_type: string;
  resource_id?: string;
  justification: string;
  status: 'pending' | 'approved' | 'denied' | 'expired';
  requested_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  review_notes?: string;
  expires_at?: string;
}

export interface SessionManagement {
  id: string;
  user_id: string;
  tenant_id: string;
  session_token: string;
  ip_address: string;
  user_agent: string;
  device_fingerprint?: string;
  location?: {
    country: string;
    city: string;
    coordinates: [number, number];
  };
  is_active: boolean;
  last_activity_at: string;
  expires_at: string;
  created_at: string;
}

export interface TwoFactorAuth {
  id: string;
  user_id: string;
  tenant_id: string;
  method: 'sms' | 'email' | 'totp' | 'backup_codes';
  is_enabled: boolean;
  phone_number?: string;
  email?: string;
  secret_key?: string; // For TOTP
  backup_codes?: string[]; // Encrypted
  last_used_at?: string;
  setup_completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ComplianceAudit {
  id: string;
  tenant_id: string;
  audit_type: 'gdpr' | 'data_retention' | 'access_review' | 'security_assessment';
  status: 'scheduled' | 'in_progress' | 'completed' | 'failed';
  scheduled_at: string;
  started_at?: string;
  completed_at?: string;
  findings: AuditFinding[];
  recommendations: string[];
  compliance_score: number; // 0-100
  report_url?: string;
  next_audit_due?: string;
  created_at: string;
  updated_at: string;
}

export interface AuditFinding {
  category: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  affected_resources: string[];
  remediation_steps: string[];
  status: 'open' | 'in_progress' | 'resolved' | 'accepted_risk';
}

export interface DataClassification {
  id: string;
  table_name: string;
  column_name: string;
  classification: 'public' | 'internal' | 'confidential' | 'restricted' | 'pii';
  encryption_required: boolean;
  retention_period_days?: number;
  access_restrictions: string[];
  data_owner: string;
  last_reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SecurityMetrics {
  tenant_id: string;
  date: string;
  total_login_attempts: number;
  failed_login_attempts: number;
  successful_logins: number;
  suspicious_activities_detected: number;
  incidents_reported: number;
  incidents_resolved: number;
  data_exports_requested: number;
  permissions_granted: number;
  permissions_revoked: number;
  active_sessions: number;
  security_score: number; // 0-100
  compliance_percentage: number;
  created_at: string;
}

// Type guards for security objects
export function isUserActivityLog(obj: any): obj is UserActivityLog {
  return obj && typeof obj.id === 'string' && typeof obj.user_id === 'string' && typeof obj.action === 'string';
}

export function isSecurityIncident(obj: any): obj is SecurityIncident {
  return obj && typeof obj.id === 'string' && typeof obj.incident_type === 'string' && typeof obj.severity === 'string';
}

// Security action constants
export const SECURITY_ACTIONS = {
  // Authentication
  LOGIN_ATTEMPT: 'login_attempt',
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILURE: 'login_failure',
  LOGOUT: 'logout',
  PASSWORD_CHANGE: 'password_change',
  PASSWORD_RESET: 'password_reset',
  
  // Data Operations
  DATA_CREATE: 'data_create',
  DATA_READ: 'data_read',
  DATA_UPDATE: 'data_update',
  DATA_DELETE: 'data_delete',
  DATA_EXPORT: 'data_export',
  DATA_IMPORT: 'data_import',
  
  // Permission Changes
  PERMISSION_GRANTED: 'permission_granted',
  PERMISSION_REVOKED: 'permission_revoked',
  ROLE_ASSIGNED: 'role_assigned',
  ROLE_REMOVED: 'role_removed',
  
  // System Events
  BACKUP_CREATED: 'backup_created',
  BACKUP_RESTORED: 'backup_restored',
  SYSTEM_ACCESS: 'system_access',
  CONFIG_CHANGE: 'config_change',
  
  // Security Events
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
  SECURITY_INCIDENT: 'security_incident',
  FAILED_PERMISSION_CHECK: 'failed_permission_check',
  UNAUTHORIZED_ACCESS_ATTEMPT: 'unauthorized_access_attempt',
  
  // Agricultural Specific
  CROP_DATA_MODIFIED: 'crop_data_modified',
  LIVESTOCK_DATA_MODIFIED: 'livestock_data_modified',
  FINANCIAL_RECORD_ACCESSED: 'financial_record_accessed',
  FARM_DATA_SHARED: 'farm_data_shared',
  YIELD_DATA_REPORTED: 'yield_data_reported',
  GPS_LOCATION_RECORDED: 'gps_location_recorded',
  
  // Carbon Credit Specific
  CARBON_MEASUREMENT_RECORDED: 'carbon_measurement_recorded',
  CARBON_CREDIT_TRADED: 'carbon_credit_traded',
  VERIFICATION_SUBMITTED: 'verification_submitted'
} as const;

export type SecurityAction = typeof SECURITY_ACTIONS[keyof typeof SECURITY_ACTIONS];

// Resource types for permission system
export const RESOURCE_TYPES = {
  FARM: 'farm',
  CROP: 'crop',
  LIVESTOCK: 'livestock',
  FINANCIAL_RECORD: 'financial_record',
  USER_PROFILE: 'user_profile',
  INVENTORY: 'inventory',
  BREEDING_RECORD: 'breeding_record',
  HEALTH_RECORD: 'health_record',
  WEATHER_DATA: 'weather_data',
  CARBON_PROJECT: 'carbon_project',
  MARKETPLACE_LISTING: 'marketplace_listing',
  WALLET_TRANSACTION: 'wallet_transaction',
  SOCIAL_POST: 'social_post',
  SYSTEM_CONFIG: 'system_config'
} as const;

export type ResourceType = typeof RESOURCE_TYPES[keyof typeof RESOURCE_TYPES];