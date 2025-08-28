import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { AuthService, DatabaseService, supabase } from '@/lib/supabase';
import type { Profile, AgriculturalRole, Tenant } from '@/types/agricultural';

// Authentication context interface
interface AuthContextType {
  // User state
  user: User | null;
  profile: Profile | null;
  tenant: Tenant | null;
  session: Session | null;
  // Derived conveniences
  tenantId: string | null;
  userRole: AgriculturalRole | null;
  
  // Loading states
  loading: boolean;
  initializing: boolean;
  
  // Authentication methods
  signUp: (email: string, password: string, userData: SignUpData) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  
  // Profile methods
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  
  // Permission methods
  hasPermission: (permission: string) => boolean;
  hasRole: (role: AgriculturalRole) => boolean;
  canAccess: (resource: string, action: string) => boolean;
  
  // Tenant methods
  switchTenant: (tenantId: string) => Promise<void>;
  
  // Error state
  error: string | null;
  clearError: () => void;
}

interface SignUpData {
  full_name: string;
  phone_number?: string;
  role: AgriculturalRole;
  tenant_id: string;
  language_preference?: string;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // State management
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Error handling
  const clearError = () => setError(null);
  
  const handleError = (err: any, context: string) => {
    console.error(`${context} error:`, err);
    setError(err.message || `An error occurred during ${context}`);
    setLoading(false);
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await loadUserProfile(session.user.id);
          }
        }
      } catch (err) {
        if (mounted) {
          handleError(err, 'initialization');
        }
      } finally {
        if (mounted) {
          setInitializing(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state changed:', event);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setProfile(null);
          setTenant(null);
        }
        
        setInitializing(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Load user profile and tenant data
  const loadUserProfile = async (userId: string) => {
    try {
      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          tenant_id,
          email,
          full_name,
          phone_number,
          role,
          language_preference,
          avatar_url,
          permissions,
          is_active,
          last_login_at,
          created_at,
          updated_at
        `)
        .eq('user_id', userId)
        .single();

      if (profileError) {
        throw profileError;
      }

      setProfile(profileData);

      // Get tenant data
      if (profileData?.tenant_id) {
        const { data: tenantData, error: tenantError } = await supabase
          .from('tenants')
          .select('*')
          .eq('id', profileData.tenant_id)
          .single();

        if (tenantError) {
          console.warn('Could not load tenant data:', tenantError);
        } else {
          setTenant(tenantData);
        }
      }
    } catch (err) {
      handleError(err, 'profile loading');
    }
  };

  // Authentication methods
  const signUp = async (email: string, password: string, userData: SignUpData) => {
    setLoading(true);
    clearError();
    
    try {
      await AuthService.signUp(email, password, userData);
      // Profile will be loaded automatically via auth state change
    } catch (err) {
      handleError(err, 'sign up');
      throw err;
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    clearError();
    
    try {
      await AuthService.signIn(email, password);
      // Profile will be loaded automatically via auth state change
    } catch (err) {
      handleError(err, 'sign in');
      throw err;
    }
  };

  const signOut = async () => {
    setLoading(true);
    clearError();
    
    try {
      await AuthService.signOut();
      // State will be cleared automatically via auth state change
    } catch (err) {
      handleError(err, 'sign out');
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    clearError();
    
    try {
      await AuthService.resetPassword(email);
    } catch (err) {
      handleError(err, 'password reset');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (newPassword: string) => {
    setLoading(true);
    clearError();
    
    try {
      await AuthService.updatePassword(newPassword);
    } catch (err) {
      handleError(err, 'password update');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Profile methods
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) {
      throw new Error('No profile to update');
    }
    
    setLoading(true);
    clearError();
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id);

      if (error) {
        throw error;
      }

      // Refresh profile data
      await loadUserProfile(profile.user_id);
    } catch (err) {
      handleError(err, 'profile update');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await loadUserProfile(user.id);
    } catch (err) {
      handleError(err, 'profile refresh');
    } finally {
      setLoading(false);
    }
  };

  // Permission methods
  const hasPermission = (permission: string): boolean => {
    if (!profile) return false;
    
    // Check explicit permissions first
    if (profile.permissions && profile.permissions[permission]) {
      return true;
    }
    
    // Check role-based permissions
    try {
      const { ROLE_PERMISSIONS } = require('@/types/agricultural');
      const rolePermissions = ROLE_PERMISSIONS[profile.role];
      return rolePermissions?.includes(permission) || false;
    } catch {
      return false;
    }
  };

  const hasRole = (role: AgriculturalRole): boolean => {
    return profile?.role === role;
  };

  const canAccess = (resource: string, action: string): boolean => {
    const permission = `${resource}.${action}`;
    return hasPermission(permission);
  };

  // Tenant methods
  const switchTenant = async (tenantId: string) => {
    if (!user || !profile) {
      throw new Error('User must be authenticated to switch tenants');
    }
    
    setLoading(true);
    clearError();
    
    try {
      // Check if user has access to this tenant
      const { data: tenantProfile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .eq('tenant_id', tenantId)
        .single();

      if (error || !tenantProfile) {
        throw new Error('You do not have access to this tenant');
      }

      // Update current profile
      setProfile(tenantProfile);
      
      // Load tenant data
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', tenantId)
        .single();

      if (tenantError) {
        throw tenantError;
      }

      setTenant(tenantData);
    } catch (err) {
      handleError(err, 'tenant switch');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value: AuthContextType = {
    // User state
    user,
    profile,
    tenant,
    session,
    // Derived conveniences
    tenantId: profile?.tenant_id ?? tenant?.id ?? null,
    userRole: profile?.role ?? null,
    
    // Loading states
    loading,
    initializing,
    
    // Authentication methods
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    
    // Profile methods
    updateProfile,
    refreshProfile,
    
    // Permission methods
    hasPermission,
    hasRole,
    canAccess,
    
    // Tenant methods
    switchTenant,
    
    // Error state
    error,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Higher-order component for role-based access
interface WithRoleProps {
  allowedRoles: AgriculturalRole[];
  fallback?: ReactNode;
}

export function withRole<P extends object>(
  Component: React.ComponentType<P>,
  { allowedRoles, fallback }: WithRoleProps
) {
  return function WithRoleComponent(props: P) {
    const { profile, hasRole } = useAuth();
    
    if (!profile) {
      return fallback || <div>Access denied: Not authenticated</div>;
    }
    
    const hasAccess = allowedRoles.some(role => hasRole(role));
    
    if (!hasAccess) {
      return fallback || <div>Access denied: Insufficient permissions</div>;
    }
    
    return <Component {...props} />;
  };
}

// Hook for role-based rendering
export function useRoleAccess(allowedRoles: AgriculturalRole[]): boolean {
  const { profile, hasRole } = useAuth();
  
  if (!profile) return false;
  
  return allowedRoles.some(role => hasRole(role));
}

// Hook for permission-based rendering
export function usePermissionAccess(permission: string): boolean {
  const { hasPermission } = useAuth();
  return hasPermission(permission);
}

export default AuthProvider;
