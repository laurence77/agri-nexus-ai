// AgriNexus AI Dashboard Components
// 4-tier hierarchical dashboard system for agricultural management

export { CustomerDashboard } from './CustomerDashboard';
export { WorkerDashboard } from './WorkerDashboard';
export { AdminDashboard } from './AdminDashboard';
export { SuperAdminDashboard } from './SuperAdminDashboard';
export { DashboardRouter } from './DashboardRouter';

// Dashboard roles mapping
export const DASHBOARD_ROLES = {
  // Customer/Farmer dashboards
  customer: ['farm_owner', 'cooperative_member'],
  
  // Worker dashboards  
  worker: ['field_worker', 'equipment_operator', 'field_manager'],
  
  // Admin dashboards
  admin: ['farm_manager', 'agronomist', 'cooperative_admin', 'supervisor'],
  
  // Super admin dashboards
  superAdmin: ['system_admin', 'super_admin']
} as const;

// Dashboard access control
export const getDashboardForRole = (role: string): 'customer' | 'worker' | 'admin' | 'superAdmin' | null => {
  for (const [dashboardType, roles] of Object.entries(DASHBOARD_ROLES)) {
    if (roles.includes(role as any)) {
      return dashboardType as 'customer' | 'worker' | 'admin' | 'superAdmin';
    }
  }
  return null;
};

// Dashboard metadata
export const DASHBOARD_METADATA = {
  customer: {
    title: 'Farm Dashboard',
    description: 'Monitor your crops, fields, and farm operations',
    features: [
      'Crop yield tracking',
      'Field health monitoring', 
      'Input usage tracking',
      'Revenue analytics',
      'Weather forecasts',
      'Market prices',
      'Support requests'
    ],
    accessLevel: 'farm_level'
  },
  worker: {
    title: 'Worker Dashboard',
    description: 'Manage your daily tasks and field activities',
    features: [
      'Task assignments',
      'Clock in/out system',
      'Task progress updates',
      'Photo capture',
      'Work schedules',
      'Performance tracking'
    ],
    accessLevel: 'individual_level'
  },
  admin: {
    title: 'Farm Management',
    description: 'Oversee all farm operations and worker management',
    features: [
      'Multi-field monitoring',
      'Worker attendance tracking',
      'Inventory management',
      'Sales and deliveries',
      'Performance analytics',
      'Alert management',
      'Team coordination'
    ],
    accessLevel: 'operational_level'
  },
  superAdmin: {
    title: 'Platform Administration',
    description: 'Manage the entire AgriNexus platform',
    features: [
      'Tenant management',
      'User administration',
      'Revenue tracking',
      'System health monitoring',
      'Audit logs',
      'Platform analytics',
      'Security oversight'
    ],
    accessLevel: 'platform_level'
  }
} as const;

export default {
  CustomerDashboard,
  WorkerDashboard, 
  AdminDashboard,
  SuperAdminDashboard,
  DashboardRouter,
  DASHBOARD_ROLES,
  getDashboardForRole,
  DASHBOARD_METADATA
};