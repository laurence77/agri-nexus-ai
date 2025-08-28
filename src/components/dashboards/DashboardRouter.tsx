import React from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/multi-tenant-auth';
import { CustomerDashboard } from './CustomerDashboard';
import { WorkerDashboard } from './WorkerDashboard';
import { AdminDashboard } from './AdminDashboard';
import { SuperAdminDashboard } from './SuperAdminDashboard';
import { getDashboardForRole, DASHBOARD_METADATA } from './index';
import { GlassCard } from '@/components/glass';
import { AlertTriangle, ShieldX, Users } from 'lucide-react';

interface DashboardRouterProps {
  className?: string;
}

/**
 * Smart Dashboard Router
 * Automatically routes users to the appropriate dashboard based on their role
 * Supports the 4-tier hierarchical dashboard system
 */
export function DashboardRouter({ className }: DashboardRouterProps) {
  const { user, userRole, loading, tenantId } = useAuth();
  
  // Determine which dashboard to show based on user role  
  const dashboardType = user && userRole ? getDashboardForRole(userRole) : null;

  // Log dashboard access for analytics
  React.useEffect(() => {
    if (user && userRole && dashboardType) {
      console.log('Dashboard Access:', {
        userId: user.id,
        userRole,
        dashboardType,
        tenantId,
        timestamp: new Date().toISOString()
      });
    }
  }, [user, userRole, dashboardType, tenantId]);

  // Show loading state
  if (loading) {
    return (
      <div className={cn('dashboard-router', className)}>
        <div className="min-h-screen flex items-center justify-center">
          <GlassCard className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading your dashboard...</p>
            <p className="text-gray-400 text-sm mt-2">Setting up your personalized experience</p>
          </GlassCard>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!user) {
    return (
      <div className={cn('dashboard-router', className)}>
        <div className="min-h-screen flex items-center justify-center">
          <GlassCard className="p-8 text-center max-w-md">
            <ShieldX className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Authentication Required</h2>
            <p className="text-gray-300">Please sign in to access your dashboard.</p>
          </GlassCard>
        </div>
      </div>
    );
  }

  // Check if user has a role assigned
  if (!userRole) {
    return (
      <div className={cn('dashboard-router', className)}>
        <div className="min-h-screen flex items-center justify-center">
          <GlassCard className="p-8 text-center max-w-md">
            <Users className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Role Assignment Pending</h2>
            <p className="text-gray-300 mb-4">
              Your account is being set up. Please contact your administrator to assign your role.
            </p>
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
              <p className="text-yellow-400 text-sm">
                <strong>Current Status:</strong> No role assigned
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  // Check if user has a tenant (except super admins)
  if (!tenantId && !['system_admin', 'super_admin'].includes(userRole)) {
    return (
      <div className={cn('dashboard-router', className)}>
        <div className="min-h-screen flex items-center justify-center">
          <GlassCard className="p-8 text-center max-w-md">
            <AlertTriangle className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Organization Setup Required</h2>
            <p className="text-gray-300 mb-4">
              Your account needs to be associated with an organization. Please contact support.
            </p>
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3">
              <p className="text-blue-400 text-sm">
                <strong>User Role:</strong> {userRole.replace('_', ' ').toUpperCase()}
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  
  if (!dashboardType) {
    return (
      <div className={cn('dashboard-router', className)}>
        <div className="min-h-screen flex items-center justify-center">
          <GlassCard className="p-8 text-center max-w-md">
            <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Invalid Role</h2>
            <p className="text-gray-300 mb-4">
              Your role "{userRole}" is not recognized by the system.
            </p>
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
              <p className="text-red-400 text-sm">
                Please contact your administrator to resolve this issue.
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }


  // Render the appropriate dashboard component
  const renderDashboard = () => {
    const commonProps = { className };

    switch (dashboardType) {
      case 'customer':
        return <CustomerDashboard {...commonProps} />;
      
      case 'worker':
        return <WorkerDashboard {...commonProps} />;
      
      case 'admin':
        return <AdminDashboard {...commonProps} />;
      
      case 'superAdmin':
        return <SuperAdminDashboard {...commonProps} />;
      
      default:
        // This should never happen due to the check above, but TypeScript safety
        return (
          <div className="min-h-screen flex items-center justify-center">
            <GlassCard className="p-8 text-center">
              <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Dashboard Error</h2>
              <p className="text-gray-300">Unable to determine the appropriate dashboard.</p>
            </GlassCard>
          </div>
        );
    }
  };

  return (
    <div className={cn('dashboard-router', className)}>
      {/* Optional: Dashboard Header with Role Indicator */}
      <div className="hidden">
        <div className="bg-white/5 border-b border-white/10 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-gray-300 text-sm">
                {DASHBOARD_METADATA[dashboardType].title}
              </span>
            </div>
            <div className="flex items-center space-x-3 text-xs text-gray-400">
              <span>Role: {userRole.replace('_', ' ').toUpperCase()}</span>
              {tenantId && <span>Org: {tenantId.slice(0, 8)}...</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900/20 to-gray-900">
        {renderDashboard()}
      </main>
    </div>
  );
}

export default DashboardRouter;