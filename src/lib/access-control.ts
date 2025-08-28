import { supabase } from '@/lib/supabase';

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  resource_type: string;
  actions: string[];
  conditions?: PermissionCondition[];
  is_system: boolean;
}

export interface PermissionCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'contains' | 'greater_than' | 'less_than';
  value: any;
  description: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  is_system: boolean;
  can_delegate: boolean;
  max_users?: number;
  tenant_id?: string;
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
  emergency_access?: boolean;
}

export interface AccessAudit {
  id: string;
  user_id: string;
  tenant_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  permission_used: string;
  access_granted: boolean;
  denial_reason?: string;
  timestamp: string;
  session_id?: string;
  ip_address?: string;
}

export interface PermissionDrift {
  id: string;
  user_id: string;
  tenant_id: string;
  permission_id: string;
  drift_type: 'excessive' | 'stale' | 'conflicting' | 'suspicious';
  detected_at: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  auto_remediated: boolean;
  remediation_action?: string;
}

export const SYSTEM_PERMISSIONS = {
  // Farm Management
  'farms.create': {
    name: 'Create Farms',
    description: 'Create new farm records',
    category: 'Farm Management',
    resource_type: 'farm',
    actions: ['create']
  },
  'farms.read': {
    name: 'View Farms',
    description: 'View farm information and details',
    category: 'Farm Management', 
    resource_type: 'farm',
    actions: ['read']
  },
  'farms.update': {
    name: 'Edit Farms',
    description: 'Modify farm information',
    category: 'Farm Management',
    resource_type: 'farm', 
    actions: ['update']
  },
  'farms.delete': {
    name: 'Delete Farms',
    description: 'Remove farm records (dangerous)',
    category: 'Farm Management',
    resource_type: 'farm',
    actions: ['delete']
  },

  // Crop Management
  'crops.create': {
    name: 'Create Crops',
    description: 'Add new crop records',
    category: 'Crop Management',
    resource_type: 'crop',
    actions: ['create']
  },
  'crops.read': {
    name: 'View Crops',
    description: 'View crop information and yield data',
    category: 'Crop Management',
    resource_type: 'crop',
    actions: ['read']
  },
  'crops.update': {
    name: 'Edit Crops',
    description: 'Modify crop information and yield data',
    category: 'Crop Management',
    resource_type: 'crop',
    actions: ['update']
  },
  'crops.delete': {
    name: 'Delete Crops',
    description: 'Remove crop records',
    category: 'Crop Management',
    resource_type: 'crop',
    actions: ['delete']
  },

  // Livestock Management
  'livestock.create': {
    name: 'Add Livestock',
    description: 'Register new animals',
    category: 'Livestock Management',
    resource_type: 'livestock',
    actions: ['create']
  },
  'livestock.read': {
    name: 'View Livestock',
    description: 'View animal records and health data',
    category: 'Livestock Management',
    resource_type: 'livestock',
    actions: ['read']
  },
  'livestock.update': {
    name: 'Edit Livestock',
    description: 'Modify animal records and health data',
    category: 'Livestock Management',
    resource_type: 'livestock',
    actions: ['update']
  },
  'livestock.delete': {
    name: 'Remove Livestock',
    description: 'Delete animal records',
    category: 'Livestock Management',
    resource_type: 'livestock',
    actions: ['delete']
  },

  // Financial Management
  'financial.read': {
    name: 'View Financial Records',
    description: 'View financial transactions and reports',
    category: 'Financial Management',
    resource_type: 'financial_record',
    actions: ['read']
  },
  'financial.create': {
    name: 'Create Financial Records',
    description: 'Add new financial transactions',
    category: 'Financial Management',
    resource_type: 'financial_record',
    actions: ['create']
  },
  'financial.update': {
    name: 'Edit Financial Records',
    description: 'Modify financial transactions',
    category: 'Financial Management',
    resource_type: 'financial_record',
    actions: ['update']
  },
  'financial.delete': {
    name: 'Delete Financial Records',
    description: 'Remove financial transactions (requires approval)',
    category: 'Financial Management',
    resource_type: 'financial_record',
    actions: ['delete']
  },
  'financial.reconcile': {
    name: 'Reconcile Accounts',
    description: 'Perform account reconciliation',
    category: 'Financial Management',
    resource_type: 'financial_record',
    actions: ['reconcile']
  },

  // User Management
  'users.read': {
    name: 'View Users',
    description: 'View user profiles and information',
    category: 'User Management',
    resource_type: 'user',
    actions: ['read']
  },
  'users.invite': {
    name: 'Invite Users',
    description: 'Send invitations to new users',
    category: 'User Management',
    resource_type: 'user',
    actions: ['invite']
  },
  'users.update': {
    name: 'Edit Users',
    description: 'Modify user profiles and settings',
    category: 'User Management',
    resource_type: 'user',
    actions: ['update']
  },
  'users.deactivate': {
    name: 'Deactivate Users',
    description: 'Disable user accounts',
    category: 'User Management',
    resource_type: 'user',
    actions: ['deactivate']
  },

  // Permission Management
  'permissions.read': {
    name: 'View Permissions',
    description: 'View permission assignments',
    category: 'Permission Management',
    resource_type: 'permission',
    actions: ['read']
  },
  'permissions.assign': {
    name: 'Assign Permissions',
    description: 'Grant permissions to users',
    category: 'Permission Management',
    resource_type: 'permission',
    actions: ['assign']
  },
  'permissions.revoke': {
    name: 'Revoke Permissions',
    description: 'Remove permissions from users',
    category: 'Permission Management',
    resource_type: 'permission',
    actions: ['revoke']
  },
  'permissions.delegate': {
    name: 'Delegate Permissions',
    description: 'Allow users to grant their permissions to others',
    category: 'Permission Management',
    resource_type: 'permission',
    actions: ['delegate']
  },

  // System Administration
  'system.admin': {
    name: 'System Administration',
    description: 'Full system administration access',
    category: 'System Administration',
    resource_type: 'system',
    actions: ['*']
  },
  'system.backup': {
    name: 'System Backup',
    description: 'Create and manage system backups',
    category: 'System Administration',
    resource_type: 'system',
    actions: ['backup', 'restore']
  },
  'system.audit': {
    name: 'Audit Access',
    description: 'View system audit logs and security events',
    category: 'System Administration',
    resource_type: 'audit',
    actions: ['read']
  },

  // Emergency Access
  'emergency.access': {
    name: 'Emergency Access',
    description: 'Break-glass access for emergency situations',
    category: 'Emergency',
    resource_type: '*',
    actions: ['*']
  }
};

export const SYSTEM_ROLES = {
  'owner': {
    name: 'Farm Owner',
    description: 'Full access to all farm operations and management',
    permissions: Object.keys(SYSTEM_PERMISSIONS),
    is_system: true,
    can_delegate: true
  },
  'manager': {
    name: 'Farm Manager',
    description: 'Manage daily farm operations and staff',
    permissions: [
      'farms.read', 'farms.update',
      'crops.create', 'crops.read', 'crops.update', 'crops.delete',
      'livestock.create', 'livestock.read', 'livestock.update', 'livestock.delete',
      'financial.read', 'financial.create', 'financial.update',
      'users.read', 'users.invite'
    ],
    is_system: true,
    can_delegate: false
  },
  'worker': {
    name: 'Farm Worker',
    description: 'Daily operational tasks and data entry',
    permissions: [
      'farms.read',
      'crops.read', 'crops.update',
      'livestock.read', 'livestock.update',
      'financial.read'
    ],
    is_system: true,
    can_delegate: false
  },
  'viewer': {
    name: 'Read-Only Access',
    description: 'View-only access to farm data',
    permissions: [
      'farms.read',
      'crops.read',
      'livestock.read',
      'financial.read'
    ],
    is_system: true,
    can_delegate: false
  },
  'accountant': {
    name: 'Financial Manager',
    description: 'Financial management and reporting',
    permissions: [
      'farms.read',
      'financial.read', 'financial.create', 'financial.update', 'financial.reconcile'
    ],
    is_system: true,
    can_delegate: false
  },
  'veterinarian': {
    name: 'Veterinarian',
    description: 'Animal health management and records',
    permissions: [
      'farms.read',
      'livestock.read', 'livestock.update'
    ],
    is_system: true,
    can_delegate: false
  }
};

export class AccessControlService {
  private static supabase = supabase;

  /**
   * Check if user has specific permission for a resource
   */
  static async checkPermission(
    userId: string,
    tenantId: string,
    permission: string,
    resourceId?: string,
    conditions?: Record<string, any>
  ): Promise<boolean> {
    try {
      // Get user's effective permissions
      const { data: userRoles } = await this.supabase
        .from('user_roles')
        .select(`
          role_name,
          permission_sets (
            permissions
          ),
          expires_at,
          is_active
        `)
        .eq('user_id', userId)
        .eq('tenant_id', tenantId)
        .eq('is_active', true);

      if (!userRoles || userRoles.length === 0) {
        await this.logAccessAttempt(userId, tenantId, permission, 'permission_check', false, 'No active roles');
        return false;
      }

      // Check for expired roles
      const activeRoles = userRoles.filter(role => 
        !role.expires_at || new Date(role.expires_at) > new Date()
      );

      if (activeRoles.length === 0) {
        await this.logAccessAttempt(userId, tenantId, permission, 'permission_check', false, 'All roles expired');
        return false;
      }

      // Collect all permissions from active roles
      const allPermissions = new Set<string>();
      activeRoles.forEach(role => {
        if (role.permission_sets && role.permission_sets.permissions) {
          role.permission_sets.permissions.forEach((perm: string) => allPermissions.add(perm));
        }
      });

      // Check for wildcard permissions
      if (allPermissions.has('*') || allPermissions.has('system.admin')) {
        await this.logAccessAttempt(userId, tenantId, permission, 'permission_check', true, 'Admin access');
        return true;
      }

      // Check for specific permission
      if (allPermissions.has(permission)) {
        // Check conditions if provided
        if (conditions && SYSTEM_PERMISSIONS[permission as keyof typeof SYSTEM_PERMISSIONS]) {
          const permissionDef = SYSTEM_PERMISSIONS[permission as keyof typeof SYSTEM_PERMISSIONS];
          if (permissionDef.conditions) {
            const conditionsMet = await this.evaluateConditions(
              permissionDef.conditions,
              conditions,
              userId,
              tenantId,
              resourceId
            );
            
            if (!conditionsMet) {
              await this.logAccessAttempt(userId, tenantId, permission, 'permission_check', false, 'Conditions not met');
              return false;
            }
          }
        }

        await this.logAccessAttempt(userId, tenantId, permission, 'permission_check', true);
        return true;
      }

      // Check for category-level wildcard (e.g., "farms.*")
      const permissionCategory = permission.split('.')[0];
      if (allPermissions.has(`${permissionCategory}.*`)) {
        await this.logAccessAttempt(userId, tenantId, permission, 'permission_check', true, 'Category wildcard');
        return true;
      }

      await this.logAccessAttempt(userId, tenantId, permission, 'permission_check', false, 'Permission not found');
      return false;

    } catch (error) {
      console.error('Permission check failed:', error);
      await this.logAccessAttempt(userId, tenantId, permission, 'permission_check', false, 'System error');
      return false;
    }
  }

  /**
   * Request temporary access to a resource
   */
  static async requestAccess(
    userId: string,
    tenantId: string,
    permission: string,
    resourceType: string,
    justification: string,
    resourceId?: string,
    emergencyAccess = false
  ): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from('access_requests')
        .insert({
          user_id: userId,
          tenant_id: tenantId,
          requested_permission: permission,
          resource_type: resourceType,
          resource_id: resourceId,
          justification: justification,
          emergency_access: emergencyAccess,
          expires_at: emergencyAccess 
            ? new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString() // 4 hours for emergency
            : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours for normal
        })
        .select()
        .single();

      if (error) throw error;

      // Log the access request
      await this.logAccessAttempt(
        userId, 
        tenantId, 
        permission, 
        'access_request', 
        true,
        `Access requested for ${resourceType}${resourceId ? ` (${resourceId})` : ''}`
      );

      // Send notification to approvers if not emergency
      if (!emergencyAccess) {
        await this.notifyApprovers(tenantId, data.id, permission, resourceType, justification);
      }

      return data.id;

    } catch (error) {
      console.error('Access request failed:', error);
      throw error;
    }
  }

  /**
   * Approve or deny an access request
   */
  static async reviewAccessRequest(
    requestId: string,
    reviewerId: string,
    approved: boolean,
    notes?: string
  ): Promise<void> {
    try {
      const { data: request, error: fetchError } = await this.supabase
        .from('access_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (fetchError) throw fetchError;
      if (!request) throw new Error('Access request not found');

      // Check if reviewer has permission to approve this request
      const canApprove = await this.checkPermission(
        reviewerId,
        request.tenant_id,
        'permissions.assign'
      );

      if (!canApprove) {
        throw new Error('Insufficient permissions to review access requests');
      }

      const { error: updateError } = await this.supabase
        .from('access_requests')
        .update({
          status: approved ? 'approved' : 'denied',
          reviewed_by: reviewerId,
          reviewed_at: new Date().toISOString(),
          review_notes: notes
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // If approved, grant temporary permission
      if (approved) {
        await this.grantTemporaryPermission(
          request.user_id,
          request.tenant_id,
          request.requested_permission,
          request.expires_at,
          `Approved request: ${requestId}`
        );
      }

      // Log the review
      await this.logAccessAttempt(
        reviewerId,
        request.tenant_id,
        'permissions.assign',
        'access_review',
        true,
        `${approved ? 'Approved' : 'Denied'} access request ${requestId}`
      );

    } catch (error) {
      console.error('Access request review failed:', error);
      throw error;
    }
  }

  /**
   * Grant temporary permission to a user
   */
  static async grantTemporaryPermission(
    userId: string,
    tenantId: string,
    permission: string,
    expiresAt: string,
    reason: string
  ): Promise<void> {
    try {
      // Create a temporary permission set
      const { data: permissionSet, error: permError } = await this.supabase
        .from('permission_sets')
        .insert({
          name: `Temporary Access - ${permission}`,
          description: `Temporary access granted: ${reason}`,
          permissions: [permission],
          is_system: false,
          tenant_id: tenantId
        })
        .select()
        .single();

      if (permError) throw permError;

      // Grant the temporary role
      const { error: roleError } = await this.supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          tenant_id: tenantId,
          role_name: 'temporary_access',
          permission_set_id: permissionSet.id,
          granted_by: 'system',
          expires_at: expiresAt,
          metadata: { reason, permission, granted_at: new Date().toISOString() }
        });

      if (roleError) throw roleError;

      // Log the permission grant
      await this.logAccessAttempt(
        userId,
        tenantId,
        permission,
        'permission_granted',
        true,
        reason
      );

    } catch (error) {
      console.error('Temporary permission grant failed:', error);
      throw error;
    }
  }

  /**
   * Detect permission drift and anomalies
   */
  static async detectPermissionDrift(tenantId: string): Promise<PermissionDrift[]> {
    try {
      const driftDetections: PermissionDrift[] = [];

      // Get all active user roles
      const { data: userRoles } = await this.supabase
        .from('user_roles')
        .select(`
          *,
          permission_sets (*),
          profiles (full_name, role, last_login)
        `)
        .eq('tenant_id', tenantId)
        .eq('is_active', true);

      if (!userRoles) return [];

      // Detect stale permissions (users who haven't logged in for 90+ days)
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      
      for (const userRole of userRoles) {
        if (userRole.profiles?.last_login) {
          const lastLogin = new Date(userRole.profiles.last_login);
          if (lastLogin < ninetyDaysAgo) {
            driftDetections.push({
              id: `stale_${userRole.id}`,
              user_id: userRole.user_id,
              tenant_id: tenantId,
              permission_id: userRole.permission_set_id,
              drift_type: 'stale',
              detected_at: new Date().toISOString(),
              severity: 'medium',
              description: `User has not logged in for ${Math.floor((Date.now() - lastLogin.getTime()) / (24 * 60 * 60 * 1000))} days`,
              auto_remediated: false
            });
          }
        }

        // Detect excessive permissions (users with more permissions than their role typically has)
        if (userRole.permission_sets?.permissions) {
          const permCount = userRole.permission_sets.permissions.length;
          const expectedPermCount = this.getExpectedPermissionCount(userRole.profiles?.role || 'worker');
          
          if (permCount > expectedPermCount * 1.5) {
            driftDetections.push({
              id: `excessive_${userRole.id}`,
              user_id: userRole.user_id,
              tenant_id: tenantId,
              permission_id: userRole.permission_set_id,
              drift_type: 'excessive',
              detected_at: new Date().toISOString(),
              severity: 'high',
              description: `User has ${permCount} permissions, expected ~${expectedPermCount} for ${userRole.profiles?.role} role`,
              auto_remediated: false
            });
          }
        }

        // Detect expired roles that are still active
        if (userRole.expires_at && new Date(userRole.expires_at) < new Date()) {
          driftDetections.push({
            id: `expired_${userRole.id}`,
            user_id: userRole.user_id,
            tenant_id: tenantId,
            permission_id: userRole.permission_set_id,
            drift_type: 'stale',
            detected_at: new Date().toISOString(),
            severity: 'critical',
            description: `Role expired on ${userRole.expires_at} but is still active`,
            auto_remediated: false
          });
        }
      }

      return driftDetections;

    } catch (error) {
      console.error('Permission drift detection failed:', error);
      return [];
    }
  }

  /**
   * Auto-remediate permission drift
   */
  static async remediatePermissionDrift(driftId: string): Promise<boolean> {
    try {
      // This would implement automatic remediation based on drift type
      // For now, we'll just mark as reviewed
      console.log(`Would remediate permission drift: ${driftId}`);
      return true;
    } catch (error) {
      console.error('Permission drift remediation failed:', error);
      return false;
    }
  }

  /**
   * Get access analytics for a tenant
   */
  static async getAccessAnalytics(tenantId: string, days: number = 30): Promise<{
    totalRequests: number;
    approvedRequests: number;
    deniedRequests: number;
    emergencyAccesses: number;
    topRequestedPermissions: Array<{ permission: string; count: number }>;
    accessByUser: Array<{ user_id: string; full_name: string; access_count: number }>;
    riskScore: number;
  }> {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      // Get access requests
      const { data: requests } = await this.supabase
        .from('access_requests')
        .select('*, profiles (full_name)')
        .eq('tenant_id', tenantId)
        .gte('requested_at', startDate.toISOString());

      // Get access attempts
      const { data: attempts } = await this.supabase
        .from('user_activity_log')
        .select('*, profiles (full_name)')
        .eq('tenant_id', tenantId)
        .gte('timestamp', startDate.toISOString())
        .ilike('action', '%access%');

      const totalRequests = requests?.length || 0;
      const approvedRequests = requests?.filter(r => r.status === 'approved').length || 0;
      const deniedRequests = requests?.filter(r => r.status === 'denied').length || 0;
      const emergencyAccesses = requests?.filter(r => r.emergency_access).length || 0;

      // Top requested permissions
      const permissionCounts = requests?.reduce((acc, req) => {
        acc[req.requested_permission] = (acc[req.requested_permission] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const topRequestedPermissions = Object.entries(permissionCounts)
        .map(([permission, count]) => ({ permission, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Access by user
      const userCounts = attempts?.reduce((acc, attempt) => {
        if (!acc[attempt.user_id]) {
          acc[attempt.user_id] = {
            user_id: attempt.user_id,
            full_name: attempt.profiles?.full_name || 'Unknown User',
            access_count: 0
          };
        }
        acc[attempt.user_id].access_count++;
        return acc;
      }, {} as Record<string, { user_id: string; full_name: string; access_count: number }>) || {};

      const accessByUser = Object.values(userCounts)
        .sort((a, b) => b.access_count - a.access_count)
        .slice(0, 10);

      // Calculate risk score (0-100)
      let riskScore = 0;
      if (totalRequests > 0) {
        const denialRate = (deniedRequests / totalRequests) * 100;
        const emergencyRate = (emergencyAccesses / totalRequests) * 100;
        riskScore = Math.min(100, denialRate * 0.5 + emergencyRate * 2);
      }

      return {
        totalRequests,
        approvedRequests,
        deniedRequests,
        emergencyAccesses,
        topRequestedPermissions,
        accessByUser,
        riskScore: Math.round(riskScore)
      };

    } catch (error) {
      console.error('Access analytics failed:', error);
      return {
        totalRequests: 0,
        approvedRequests: 0,
        deniedRequests: 0,
        emergencyAccesses: 0,
        topRequestedPermissions: [],
        accessByUser: [],
        riskScore: 0
      };
    }
  }

  // Private helper methods

  private static async evaluateConditions(
    conditions: PermissionCondition[],
    context: Record<string, any>,
    userId: string,
    tenantId: string,
    resourceId?: string
  ): Promise<boolean> {
    // Implementation would evaluate permission conditions
    // For now, return true (conditions met)
    return true;
  }

  private static async logAccessAttempt(
    userId: string,
    tenantId: string,
    permission: string,
    action: string,
    success: boolean,
    details?: string
  ): Promise<void> {
    try {
      const { SecurityService } = await import('@/lib/security');
      
      await SecurityService.logUserActivity({
        userId,
        tenantId,
        action: action,
        resourceType: 'permission',
        resourceId: permission,
        success,
        errorMessage: success ? undefined : details,
        metadata: {
          permission,
          access_granted: success,
          details
        }
      });
    } catch (error) {
      console.error('Failed to log access attempt:', error);
    }
  }

  private static async notifyApprovers(
    tenantId: string,
    requestId: string,
    permission: string,
    resourceType: string,
    justification: string
  ): Promise<void> {
    // Implementation would send notifications to users with permissions.assign permission
    console.log(`Would notify approvers for access request ${requestId}`);
  }

  private static getExpectedPermissionCount(role: string): number {
    const rolePermCounts: Record<string, number> = {
      'owner': 25,
      'manager': 15,
      'worker': 8,
      'viewer': 4,
      'accountant': 6,
      'veterinarian': 4
    };
    
    return rolePermCounts[role] || 8;
  }
}

export default AccessControlService;
