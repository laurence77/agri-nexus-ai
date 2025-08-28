/* eslint-disable react-refresh/only-export-components */
import React, { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/multi-tenant-auth';
import type { AgriculturalRole } from '@/types/agricultural';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, AlertTriangle, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: AgriculturalRole[];
  requiredPermissions?: string[];
  fallbackPath?: string;
  showFallback?: boolean;
}

/**
 * Protected Route Component
 * Handles authentication and authorization for routes
 */
export function ProtectedRoute({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  fallbackPath = '/login',
  showFallback = true
}: ProtectedRouteProps) {
  const { 
    user, 
    profile, 
    loading, 
    initializing, 
    hasRole, 
    hasPermission 
  } = useAuth();
  const location = useLocation();

  // Show loading spinner during initialization
  if (initializing || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="glass">
          <CardContent className="flex items-center space-x-4 p-6">
            <Loader2 className="h-6 w-6 animate-spin text-green-600" />
            <span className="text-lg font-medium">Loading...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user || !profile) {
    return (
      <Navigate 
        to={fallbackPath} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Check role-based access
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => hasRole(role));
    if (!hasRequiredRole) {
      if (showFallback) {
        return <AccessDenied requiredRoles={requiredRoles} />;
      }
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Check permission-based access
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requiredPermissions.every(permission => 
      hasPermission(permission)
    );
    if (!hasRequiredPermissions) {
      if (showFallback) {
        return <AccessDenied requiredPermissions={requiredPermissions} />;
      }
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}

interface AccessDeniedProps {
  message: string;
  fallback?: ReactNode;
}

function AccessDenied({ message, fallback }: AccessDeniedProps) {
  const { user, logout } = useAuth();

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full mx-auto text-center space-y-6 p-6">
        <div className="space-y-4">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-10 h-10 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Access Denied
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {message}
            </p>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-sm">
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Current user:</strong> {user?.name} ({user?.email})
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Role:</strong> {user?.role}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => window.history.back()}
            className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Go Back
          </button>
          
          <button
            onClick={() => {
              logout();
              window.location.href = '/';
            }}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

// Higher-order component for easy route protection
export function withAuth<T extends object>(
  Component: React.ComponentType<T>,
  options: Omit<ProtectedRouteProps, 'children'> = {}
) {
  return function AuthenticatedComponent(props: T) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

// Admin-only route wrapper
export function AdminRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requiredRole="admin">
      {children}
    </ProtectedRoute>
  );
}

// Manager+ route wrapper
export function ManagerRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute 
      requiredPermissions={['users.read', 'farms.write']}
    >
      {children}
    </ProtectedRoute>
  );
}
