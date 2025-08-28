import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Supabase configuration (Vite exposes VITE_* at build time)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

// Create Supabase client with TypeScript support
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Multi-tenant authentication helpers
export class AuthService {
  
  /**
   * Get current user's tenant ID
   */
  static async getTenantId(): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('user_id', user.id)
        .single();

      return profile?.tenant_id || null;
    } catch (error) {
      console.error('Error getting tenant ID:', error);
      return null;
    }
  }

  /**
   * Get current user's profile with role and permissions
   */
  static async getUserProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile, error } = await supabase
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
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return profile;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  /**
   * Check if user has specific permission
   */
  static async hasPermission(permission: string): Promise<boolean> {
    try {
      const profile = await this.getUserProfile();
      if (!profile) return false;

      // Check if permission is in user's permissions object
      if (profile.permissions && profile.permissions[permission]) {
        return true;
      }

      // Import role permissions and check against role
      const { ROLE_PERMISSIONS } = await import('@/types/agricultural');
      const rolePermissions = ROLE_PERMISSIONS[profile.role as keyof typeof ROLE_PERMISSIONS];
      
      return rolePermissions?.includes(permission) || false;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  /**
   * Check if user has specific role
   */
  static async hasRole(role: string): Promise<boolean> {
    try {
      const profile = await this.getUserProfile();
      return profile?.role === role;
    } catch (error) {
      console.error('Error checking role:', error);
      return false;
    }
  }

  /**
   * Update user's last login timestamp
   */
  static async updateLastLogin(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  }

  /**
   * Sign up new user with multi-tenant support
   */
  static async signUp(email: string, password: string, userData: {
    full_name: string;
    phone_number?: string;
    role: string;
    tenant_id: string;
    language_preference?: string;
  }) {
    try {
      // First, sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            phone_number: userData.phone_number
          }
        }
      });

      if (authError) {
        throw new Error(`Authentication error: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('User creation failed');
      }

      // Create profile record
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          tenant_id: userData.tenant_id,
          email: email,
          full_name: userData.full_name,
          phone_number: userData.phone_number,
          role: userData.role as any,
          language_preference: userData.language_preference || 'en',
          is_active: true
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Optionally delete the auth user if profile creation fails
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw new Error(`Profile creation error: ${profileError.message}`);
      }

      return { user: authData.user, profile: userData };
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  /**
   * Sign in user with enhanced error handling
   */
  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw new Error(`Sign in error: ${error.message}`);
      }

      // Update last login
      await this.updateLastLogin();

      return data;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  /**
   * Sign out user
   */
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(`Sign out error: ${error.message}`);
      }
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) {
        throw new Error(`Password reset error: ${error.message}`);
      }
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }

  /**
   * Update password
   */
  static async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw new Error(`Password update error: ${error.message}`);
      }
    } catch (error) {
      console.error('Password update error:', error);
      throw error;
    }
  }
}

// Database query helpers with tenant isolation
export class DatabaseService {
  
  /**
   * Get tenant-specific query builder
   */
  static async getTenantQuery<T>(tableName: string) {
    const tenantId = await AuthService.getTenantId();
    if (!tenantId) {
      throw new Error('User not authenticated or no tenant assigned');
    }

    return supabase
      .from(tableName)
      .select('*')
      .eq('tenant_id', tenantId);
  }

  /**
   * Insert data with automatic tenant_id
   */
  static async insertWithTenant(tableName: string, data: any) {
    const tenantId = await AuthService.getTenantId();
    if (!tenantId) {
      throw new Error('User not authenticated or no tenant assigned');
    }

    return supabase
      .from(tableName)
      .insert({ ...data, tenant_id: tenantId });
  }

  /**
   * Update data with tenant isolation
   */
  static async updateWithTenant(tableName: string, data: any, conditions: Record<string, any>) {
    const tenantId = await AuthService.getTenantId();
    if (!tenantId) {
      throw new Error('User not authenticated or no tenant assigned');
    }

    let query = supabase
      .from(tableName)
      .update(data)
      .eq('tenant_id', tenantId);

    // Apply additional conditions
    Object.entries(conditions).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    return query;
  }

  /**
   * Delete data with tenant isolation
   */
  static async deleteWithTenant(tableName: string, conditions: Record<string, any>) {
    const tenantId = await AuthService.getTenantId();
    if (!tenantId) {
      throw new Error('User not authenticated or no tenant assigned');
    }

    let query = supabase
      .from(tableName)
      .delete()
      .eq('tenant_id', tenantId);

    // Apply conditions
    Object.entries(conditions).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    return query;
  }
}

// Real-time subscription helpers
export class RealtimeService {
  
  /**
   * Subscribe to tenant-specific table changes
   */
  static subscribeTo(
    tableName: string, 
    callback: (payload: any) => void,
    filters?: Record<string, any>
  ) {
    const channel = supabase
      .channel(`${tableName}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
          ...filters
        },
        callback
      );

    return channel.subscribe();
  }

  /**
   * Subscribe to multiple tables
   */
  static subscribeToMultiple(
    subscriptions: Array<{
      table: string;
      callback: (payload: any) => void;
      filters?: Record<string, any>;
    }>
  ) {
    const channels = subscriptions.map(({ table, callback, filters }) => 
      this.subscribeTo(table, callback, filters)
    );

    return {
      unsubscribe: () => {
        channels.forEach(channel => {
          if (channel) supabase.removeChannel(channel);
        });
      }
    };
  }
}

// Error handling utility
export class SupabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'SupabaseError';
  }

  static fromSupabaseError(error: any): SupabaseError {
    return new SupabaseError(
      error.message || 'An unknown error occurred',
      error.code,
      error.details
    );
  }
}

// Export configured client and services
export default supabase;
