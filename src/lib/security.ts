import { createClient } from '@supabase/supabase-js';
import CryptoJS from 'crypto-js';

// Enhanced security service with field-level encryption and audit trails
export class SecurityService {
  private static encryptionKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'default-key-change-in-prod';
  
  /**
   * Encrypt sensitive field data before storing in database
   */
  static encryptField(data: string): string {
    try {
      return CryptoJS.AES.encrypt(data, this.encryptionKey).toString();
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt sensitive data');
    }
  }

  /**
   * Decrypt sensitive field data when retrieving from database
   */
  static decryptField(encryptedData: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt sensitive data');
    }
  }

  /**
   * Log all user activities for audit trail
   */
  static async logUserActivity(params: {
    userId: string;
    tenantId: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    success: boolean;
    errorMessage?: string;
  }) {
    const { supabase } = await import('@/lib/supabase');
    
    try {
      const { error } = await supabase
        .from('user_activity_log')
        .insert({
          user_id: params.userId,
          tenant_id: params.tenantId,
          action: params.action,
          resource_type: params.resourceType,
          resource_id: params.resourceId,
          metadata: params.metadata,
          ip_address: params.ipAddress,
          user_agent: params.userAgent,
          success: params.success,
          error_message: params.errorMessage,
          timestamp: new Date().toISOString()
        });

      if (error) {
        console.error('Failed to log user activity:', error);
      }
    } catch (error) {
      console.error('Activity logging error:', error);
    }
  }

  /**
   * Validate GPS coordinates and ensure they're within expected farming regions
   */
  static validateGPSCoordinates(
    coordinates: [number, number], 
    allowedRegions: { name: string; bounds: { north: number; south: number; east: number; west: number } }[]
  ): boolean {
    const [lat, lng] = coordinates;
    
    // Basic coordinate validation
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return false;
    }

    // Check if coordinates fall within allowed farming regions
    for (const region of allowedRegions) {
      if (
        lat >= region.bounds.south &&
        lat <= region.bounds.north &&
        lng >= region.bounds.west &&
        lng <= region.bounds.east
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Generate audit report for a specific user or time period
   */
  static async generateAuditReport(params: {
    userId?: string;
    tenantId: string;
    startDate: Date;
    endDate: Date;
    actions?: string[];
  }) {
    const { supabase } = await import('@/lib/supabase');
    
    let query = supabase
      .from('user_activity_log')
      .select('*')
      .eq('tenant_id', params.tenantId)
      .gte('timestamp', params.startDate.toISOString())
      .lte('timestamp', params.endDate.toISOString())
      .order('timestamp', { ascending: false });

    if (params.userId) {
      query = query.eq('user_id', params.userId);
    }

    if (params.actions && params.actions.length > 0) {
      query = query.in('action', params.actions);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to generate audit report: ${error.message}`);
    }

    return {
      reportGenerated: new Date(),
      totalActivities: data?.length || 0,
      activities: data || [],
      summary: this.generateAuditSummary(data || [])
    };
  }

  /**
   * Generate summary statistics from audit log data
   */
  private static generateAuditSummary(activities: any[]) {
    const summary = {
      actionBreakdown: {} as Record<string, number>,
      successRate: 0,
      mostActiveHours: {} as Record<string, number>,
      resourceTypeBreakdown: {} as Record<string, number>,
      failedActions: [] as any[]
    };

    activities.forEach(activity => {
      // Action breakdown
      summary.actionBreakdown[activity.action] = (summary.actionBreakdown[activity.action] || 0) + 1;
      
      // Resource type breakdown
      summary.resourceTypeBreakdown[activity.resource_type] = (summary.resourceTypeBreakdown[activity.resource_type] || 0) + 1;
      
      // Activity by hour
      const hour = new Date(activity.timestamp).getHours();
      summary.mostActiveHours[hour] = (summary.mostActiveHours[hour] || 0) + 1;
      
      // Failed actions
      if (!activity.success) {
        summary.failedActions.push(activity);
      }
    });

    // Calculate success rate
    const totalActivities = activities.length;
    const successfulActivities = activities.filter(a => a.success).length;
    summary.successRate = totalActivities > 0 ? (successfulActivities / totalActivities) * 100 : 0;

    return summary;
  }

  /**
   * Check for suspicious activity patterns
   */
  static async detectSuspiciousActivity(userId: string, tenantId: string): Promise<{
    isSuspicious: boolean;
    reasons: string[];
    riskLevel: 'low' | 'medium' | 'high';
  }> {
    const { supabase } = await import('@/lib/supabase');
    
    // Get recent activity (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const { data: recentActivity } = await supabase
      .from('user_activity_log')
      .select('*')
      .eq('user_id', userId)
      .eq('tenant_id', tenantId)
      .gte('timestamp', oneDayAgo.toISOString());

    const reasons: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    if (!recentActivity || recentActivity.length === 0) {
      return { isSuspicious: false, reasons: [], riskLevel: 'low' };
    }

    // Check for unusual activity volume
    if (recentActivity.length > 500) {
      reasons.push('Unusually high activity volume in 24 hours');
      riskLevel = 'high';
    }

    // Check for multiple failed authentication attempts
    const failedLogins = recentActivity.filter(a => 
      a.action === 'login_attempt' && !a.success
    ).length;
    
    if (failedLogins > 10) {
      reasons.push('Multiple failed login attempts');
      riskLevel = riskLevel === 'high' ? 'high' : 'medium';
    }

    // Check for access from multiple IP addresses
    const uniqueIPs = new Set(recentActivity.map(a => a.ip_address).filter(Boolean));
    if (uniqueIPs.size > 5) {
      reasons.push('Access from multiple IP addresses');
      riskLevel = riskLevel === 'high' ? 'high' : 'medium';
    }

    // Check for unusual time patterns (activity during unusual hours for the region)
    const nightActivity = recentActivity.filter(a => {
      const hour = new Date(a.timestamp).getHours();
      return hour >= 2 && hour <= 5; // 2 AM to 5 AM
    });
    
    if (nightActivity.length > recentActivity.length * 0.3) {
      reasons.push('Unusual activity hours detected');
      riskLevel = riskLevel === 'high' ? 'high' : 'medium';
    }

    // Check for rapid sequential actions (potential automation/bot behavior)
    const rapidActions = recentActivity.filter((activity, index) => {
      if (index === 0) return false;
      const prevActivity = recentActivity[index - 1];
      const timeDiff = new Date(activity.timestamp).getTime() - new Date(prevActivity.timestamp).getTime();
      return timeDiff < 1000; // Less than 1 second between actions
    });

    if (rapidActions.length > 20) {
      reasons.push('Potential automated/bot behavior detected');
      riskLevel = 'high';
    }

    return {
      isSuspicious: reasons.length > 0,
      reasons,
      riskLevel
    };
  }

  /**
   * Secure field validation with sanitization
   */
  static sanitizeInput(input: string, type: 'text' | 'email' | 'phone' | 'numeric' = 'text'): string {
    if (!input) return '';
    
    // Remove potentially harmful characters
    let sanitized = input.trim();
    
    // Remove HTML tags
    sanitized = sanitized.replace(/<[^>]*>/g, '');
    
    // Remove script tags and javascript
    sanitized = sanitized.replace(/javascript:/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=/gi, '');
    
    switch (type) {
      case 'email':
        // Keep only valid email characters
        sanitized = sanitized.replace(/[^a-zA-Z0-9@._-]/g, '');
        break;
      case 'phone':
        // Keep only numeric characters and common phone symbols
        sanitized = sanitized.replace(/[^0-9+()-\s]/g, '');
        break;
      case 'numeric':
        // Keep only numbers and decimal point
        sanitized = sanitized.replace(/[^0-9.-]/g, '');
        break;
      default:
        // For text, remove dangerous special characters but keep basic punctuation
        sanitized = sanitized.replace(/[<>{}[\]\\]/g, '');
    }
    
    return sanitized;
  }

  /**
   * Generate data export for user data portability (GDPR compliance)
   */
  static async exportUserData(userId: string, tenantId: string): Promise<{
    exportId: string;
    data: Record<string, any>;
    generatedAt: Date;
  }> {
    const { supabase } = await import('@/lib/supabase');
    
    const exportId = `export_${userId}_${Date.now()}`;
    const userData: Record<string, any> = {};

    // Collect user profile data
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .eq('tenant_id', tenantId)
      .single();

    userData.profile = profile;

    // Collect farm data
    const { data: farms } = await supabase
      .from('farms')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('manager_id', userId);

    userData.farms = farms;

    // Collect crops data
    if (farms && farms.length > 0) {
      const farmIds = farms.map(f => f.id);
      const { data: crops } = await supabase
        .from('crops')
        .select('*')
        .eq('tenant_id', tenantId)
        .in('farm_id', farmIds);

      userData.crops = crops;
    }

    // Collect livestock data
    if (farms && farms.length > 0) {
      const farmIds = farms.map(f => f.id);
      const { data: livestock } = await supabase
        .from('livestock')
        .select('*')
        .eq('tenant_id', tenantId)
        .in('farm_id', farmIds);

      userData.livestock = livestock;
    }

    // Collect financial records
    const { data: financialRecords } = await supabase
      .from('financial_records')
      .select('*')
      .eq('tenant_id', tenantId);

    userData.financialRecords = financialRecords;

    // Collect activity logs (last 1 year only for privacy)
    const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const { data: activityLogs } = await supabase
      .from('user_activity_log')
      .select('*')
      .eq('user_id', userId)
      .eq('tenant_id', tenantId)
      .gte('timestamp', oneYearAgo.toISOString());

    userData.activityLogs = activityLogs;

    // Log the export activity
    await this.logUserActivity({
      userId,
      tenantId,
      action: 'data_export_generated',
      resourceType: 'user_data',
      resourceId: exportId,
      success: true,
      metadata: {
        exportId,
        tablesExported: Object.keys(userData),
        recordCounts: Object.fromEntries(
          Object.entries(userData).map(([key, value]) => [key, Array.isArray(value) ? value.length : 1])
        )
      }
    });

    return {
      exportId,
      data: userData,
      generatedAt: new Date()
    };
  }

  /**
   * Validate user permissions for specific actions
   */
  static async validatePermission(
    userId: string, 
    tenantId: string, 
    action: string, 
    resourceType: string, 
    resourceId?: string
  ): Promise<boolean> {
    const { supabase } = await import('@/lib/supabase');
    
    try {
      // Get user profile with role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, permissions')
        .eq('user_id', userId)
        .eq('tenant_id', tenantId)
        .single();

      if (!profile) {
        return false;
      }

      // Check role-based permissions
      const { ROLE_PERMISSIONS } = await import('@/types/agricultural');
      const rolePermissions = ROLE_PERMISSIONS[profile.role as keyof typeof ROLE_PERMISSIONS] || [];
      
      // Check if action is allowed for this role
      if (rolePermissions.includes(action)) {
        return true;
      }

      // Check user-specific permissions
      if (profile.permissions && profile.permissions[action]) {
        return true;
      }

      // Check resource-specific permissions if applicable
      if (resourceId && resourceType) {
        // This would be extended based on specific resource permission logic
        // For now, return false for resource-specific checks
        return false;
      }

      return false;
    } catch (error) {
      console.error('Permission validation error:', error);
      return false;
    }
  }
}

// Middleware wrapper for API routes to add automatic logging
export function withSecurityLogging<T extends (...args: any[]) => any>(
  handler: T,
  action: string,
  resourceType: string
): T {
  return (async (...args: any[]) => {
    const startTime = Date.now();
    let success = false;
    let errorMessage: string | undefined;
    let userId: string | undefined;
    let tenantId: string | undefined;

    try {
      // Extract user context from request (implementation depends on your auth setup)
      const context = args[0]; // Assuming first argument contains user context
      userId = context?.user?.id;
      tenantId = context?.user?.tenant_id;

      const result = await handler(...args);
      success = true;
      return result;
    } catch (error) {
      success = false;
      errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    } finally {
      if (userId && tenantId) {
        // Log the activity
        SecurityService.logUserActivity({
          userId,
          tenantId,
          action,
          resourceType,
          success,
          errorMessage,
          metadata: {
            executionTime: Date.now() - startTime,
            timestamp: new Date().toISOString()
          }
        });
      }
    }
  }) as T;
}

export default SecurityService;